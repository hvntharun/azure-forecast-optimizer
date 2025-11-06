import React from 'react';
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getForecast } from "@/lib/mockApi";
import Plot from "react-plotly.js";
import { toast } from "sonner";
import { Loader2, CheckCircle2, BarChart3 } from "lucide-react";
import { ModelPerformanceTable } from "@/components/ModelPerformanceTable";
import { ModelInfoCard } from "@/components/ModelInfoCard";
import { ReservationCard } from "@/components/ReservationCard";
import { DataSummaryCard } from "@/components/DataSummaryCard";
import { SummaryStatsCard } from "@/components/SummaryStatsCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  serviceNames,
  getServiceData,
  ensureDataLoaded,
} from "@/lib/forecastingData";
import {
  calculateDataSummary,
  getModelInfo,
  getReservationInfo,
} from "@/lib/classificationData";
import { ClassificationType } from "@/lib/classificationData";

interface ServiceData {
  forecastData: {
    timestamps: string[];
    actual: Array<number | null | undefined>;
    predicted: Array<number | null | undefined>;
  };
  bestModel: { name: string };
  modelPerformance: any[];
  rollingAverage?: {
    timestamps: string[];
    [key: string]: Array<number | null | undefined> | string[];
  };
  summaryStats?: any;
}

export default function Forecasting() {
  const location = useLocation();
  const state = location.state as { 
    service?: string;
    cardId?: ClassificationType;
    category?: string;
  } | null;

  const classificationType: ClassificationType = state?.cardId ?? 'stable-high';

  const [dataLoaded, setDataLoaded] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Stepper state: 1 Data Loaded, 2 Eligibility Check, 3 Generate Forecast, 4 View Predictions
  const [currentStep, setCurrentStep] = useState(1);

  // Load forecasting data on mount
  useEffect(() => {
    const loadData = async () => {
      await ensureDataLoaded();
      setTimeout(() => {
        setAvailableServices([...serviceNames]);
        setDataLoaded(true);
        setCurrentStep(2); // Data loaded -> move to Eligibility Check
      }, 100);
    };
    loadData();
  }, []);

  const defaultService = availableServices.length > 0 ? availableServices[0] : '';
  const [selectedService, setSelectedService] = useState('');

  // Once services loaded choose initial service
  useEffect(() => {
    if (dataLoaded && availableServices.length > 0) {
      if (state?.service && availableServices.includes(state.service)) {
        setSelectedService(state.service);
      } else {
        setSelectedService(defaultService);
      }
    }
  }, [dataLoaded, availableServices, state?.service, defaultService]);

  // Forecast result state
  const [loading, setLoading] = useState(false);
  const [showPanels, setShowPanels] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Dynamic step descriptors depending on currentStep
  const steps = useMemo(() => [
    { id: 1, name: "Data Loaded", status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming' },
    { id: 2, name: "Eligibility Check", status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'current' : 'upcoming' },
    { id: 3, name: "Generate Forecast", status: currentStep > 3 ? 'complete' : currentStep === 3 ? 'current' : 'upcoming' },
    { id: 4, name: "View Predictions", status: currentStep > 4 ? 'complete' : currentStep === 4 ? 'current' : 'upcoming' },
  ], [currentStep]);

  // Get service data (always from JSON) - fallback to default
  const serviceData: ServiceData | null = useMemo(() => {
    if (!selectedService || !availableServices.includes(selectedService)) {
      return getServiceData(defaultService) as ServiceData;
    }
    return getServiceData(selectedService) as ServiceData;
  }, [selectedService, defaultService, availableServices]);

  const dataSummary = useMemo(() => {
    if (!selectedService) {
      return { totalDataPoints: 0, dateRange: 'N/A', averageUsage: 0, maxUsage: 0, minUsage: 0 };
    }
    return calculateDataSummary(selectedService, classificationType);
  }, [selectedService, classificationType]);

  const modelInfo = useMemo(() => {
    if (!selectedService) return getModelInfo('');
    return getModelInfo(selectedService);
  }, [selectedService]);

  const reservationInfo = getReservationInfo();

  // Helper to generate ISO date strings adding days
  const addDays = (iso: string, days: number) => {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0,10);
  };

  // Normalize forecast arrays: handle mismatched lengths (predicted longer than timestamps)
  const normalizedForecast = useMemo(() => {
    if (!serviceData) return { historicalX: [], historicalY: [], predictedX: [], predictedY: [] };
    const { timestamps, actual, predicted } = serviceData.forecastData;
    const historicalX: string[] = []; const historicalY: number[] = [];
    timestamps.forEach((ts, idx) => {
      const v = actual[idx];
      if (v !== null && v !== undefined) { historicalX.push(ts); historicalY.push(v); }
    });
    let predictedX: string[] = []; let predictedY: number[] = [];
    // If predicted length matches timestamps length, align by index; else generate synthetic horizon
    if (predicted.length === timestamps.length) {
      predicted.forEach((v, idx) => { if (v !== null && v !== undefined) { predictedX.push(timestamps[idx]); predictedY.push(v); } });
    } else if (predicted.length > 0) {
      const anchor = timestamps[timestamps.length - 1] || addDays(new Date().toISOString().slice(0,10), -1);
      predicted.forEach((v, idx) => { if (v !== null && v !== undefined) { predictedX.push(addDays(anchor, idx + 1)); predictedY.push(v); } });
    }
    return { historicalX, historicalY, predictedX, predictedY };
  }, [serviceData]);

  // Extract rolling average series dynamically
  const rollingSeries = useMemo(() => {
    if (!serviceData?.rollingAverage) return [] as Array<{ name: string; x: string[]; y: number[]; style: any }>; 
    const { rollingAverage } = serviceData;
    const baseTimestamps: string[] = rollingAverage.timestamps || [];
    return Object.keys(rollingAverage)
      .filter(k => k !== 'timestamps')
      .map(key => {
        const arr: any[] = rollingAverage[key] || [];
        const x = baseTimestamps.slice(0, arr.length);
        const y = arr.filter(v => v !== null && v !== undefined);
        const colorMap: Record<string,string> = { daily: '#6366F1', roll_7: '#F59E0B', roll_10: '#EC4899', roll_30: '#10B981' };
        return { name: key, x, y, style: { color: colorMap[key] || '#888', dash: key.startsWith('roll') ? 'dot' : 'solid' } };
      });
  }, [serviceData]);

  // Track active (visible) rolling series for interactive filtering
  const [activeRollingKeys, setActiveRollingKeys] = useState<string[]>([]);
  useEffect(() => {
    if (currentStep === 4) {
      // Initialize with all series visible when forecast shown
      setActiveRollingKeys(rollingSeries.map(s => s.name));
    } else {
      setActiveRollingKeys([]);
    }
  }, [rollingSeries, currentStep]);

  const toggleRollingKey = (key: string) => {
    setActiveRollingKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const showOnlyRollingKey = (key: string) => {
    setActiveRollingKeys([key]);
  };

  const handleGenerateForecast = useCallback(async () => {
    if (!selectedService) return;
    setLoading(true);
    setCurrentStep(3);
    try {
      const result = await getForecast(selectedService, 15);
      // result retained if future logic needed
      setShowPanels(true);
      setCurrentStep(4);
      toast.success("Forecast generated successfully");
    } catch (e) {
      toast.error("Failed to generate forecast");
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Forecasting</h1>
        <p className="text-muted-foreground mt-1">AI-powered cost predictions using XGBoost</p>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step.status === 'complete'
                        ? "bg-success border-success"
                        : step.status === 'current'
                        ? "bg-primary border-primary"
                        : "bg-muted border-muted"
                    }`}
                  >
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-sm font-semibold text-white">{step.id}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium">{step.name}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 ${step.status === 'complete' ? 'bg-success' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Panels visible only after forecast generated */}
      {showPanels && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ModelInfoCard modelData={modelInfo} />
          <ReservationCard reservationData={reservationInfo} />
          <DataSummaryCard dataSummary={dataSummary} />
          <SummaryStatsCard stats={serviceData?.summaryStats} />
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Azure VM Services Forecast</CardTitle>
          <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Model Performance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Model Performance Comparison</DialogTitle>
              </DialogHeader>
              {serviceData && (
                <ModelPerformanceTable data={(serviceData.modelPerformance || []).map(mp => ({
                  model: mp.model || mp.name || 'Model',
                  RMSE: mp.RMSE || 0,
                  MAE: mp.MAE || 0,
                  MAPE: mp.MAPE || 0,
                }))} />
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Selected Service</label>
            <Select
              value={selectedService}
              onValueChange={(newService) => {
                if (availableServices.includes(newService)) {
                  setSelectedService(newService);
                  // Reset view panels when switching service unless forecast already generated for new service
                  setShowPanels(false);
                  // Keep step at 2 (Eligibility) until user generates a forecast again
                  if (currentStep === 4 || currentStep === 3) setCurrentStep(2);
                }
              }}
            >
              <SelectTrigger className="w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {availableServices.map((service) => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateForecast}
              disabled={loading || !selectedService || currentStep === 4}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Generate Forecast
            </Button>
          </div>

          {/* Eligibility always positive */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Badge className="bg-success text-white rounded-full">Eligible</Badge>
            <div className="text-sm text-foreground">All services meet forecasting criteria. Proceed to generate a forecast.</div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{`Usage Forecast for ${selectedService || defaultService} (Best Model: ${serviceData?.bestModel.name || 'N/A'})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceData ? (
            <div className="w-full space-y-10">
              {(() => {
                const { historicalX, historicalY, predictedX, predictedY } = normalizedForecast;
                const lastHistoricalX = historicalX[historicalX.length - 1];
                const lastHistoricalY = historicalY[historicalY.length - 1];
                const firstPredictedX = predictedX[0];
                const bridgeTrace = (lastHistoricalX && firstPredictedX) ? {
                  x: [lastHistoricalX, firstPredictedX],
                  y: [lastHistoricalY, lastHistoricalY],
                  name: 'Bridge Forecast',
                  type: 'scatter' as const,
                  mode: 'lines+markers' as const,
                  line: { color: '#FF4500', width: 3, dash: 'dash' as const },
                  marker: { size: 8, color: '#FF4500', symbol: 'circle', line: { width: 2, color: '#FFFFFF' } },
                  showlegend: true,
                  hovertemplate: '<b>Bridge Forecast</b><br>Value: %{y}<br>Date: %{x}<extra></extra>'
                } : null;
                if (currentStep < 4) {
                  return (
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                      {currentStep === 3 ? 'Generating forecast...' : 'Generate a forecast to view predictions.'}
                    </div>
                  );
                }
                return (
                  <Plot
                    data={[
                      {
                        x: historicalX,
                        y: historicalY,
                        name: 'Historical Usage',
                        type: 'scatter',
                        mode: 'lines+markers',
                        line: { color: '#3B82F6', width: 2 },
                        marker: { size: 4 },
                      },
                      ...(bridgeTrace ? [bridgeTrace] : []),
                      {
                        x: predictedX,
                        y: predictedY,
                        name: 'Next Reservation Forecast',
                        type: 'scatter',
                        mode: 'lines',
                        line: { color: '#10b981', width: 2, dash: 'dot' },
                        showlegend: true,
                      },
                    ]}
                    layout={{
                      height: 500,
                      margin: { l: 80, r: 40, t: 50, b: 80 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      xaxis: { showgrid: true, gridcolor: '#333', color: '#888', title: 'Date', type: 'date' },
                      yaxis: { showgrid: true, gridcolor: '#333', color: '#888', title: 'Daily DBCU Usage', tickmode: 'auto' },
                      legend: { x: 0.5, y: -0.15, orientation: 'h', xanchor: 'center', bgcolor: 'rgba(0,0,0,0.1)', bordercolor: '#333', borderwidth: 1, font: { size: 14 }, tracegroupgap: 4 },
                      hovermode: 'x unified',
                    }}
                    config={{ displayModeBar: true, displaylogo: false }}
                    className="w-full"
                  />
                );
              })()}

              {/* Rolling averages chart gated to post-forecast */}
              {currentStep === 4 && rollingSeries.length > 0 && (
                <div className="space-y-4">
                  {/* Interactive legend controls */}
                  <div className="flex flex-wrap gap-2">
                    {rollingSeries.map(s => (
                      <div key={s.name} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRollingKey(s.name)}
                          onDoubleClick={() => showOnlyRollingKey(s.name)}
                          className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-2 transition-colors ${activeRollingKeys.includes(s.name) ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}
                          title="Click to toggle, double-click to show only this series"
                        >
                          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.style.color }} />
                          {s.name === 'daily' ? 'Daily' : s.name.replace('roll_', 'Roll ')}
                        </button>
                      </div>
                    ))}
                    {activeRollingKeys.length === 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveRollingKeys(rollingSeries.map(s => s.name))}
                        className="px-3 py-1 rounded-md text-xs font-medium border bg-accent/10 border-accent text-accent"
                      >Show All</button>
                    )}
                  </div>
                  <Plot
                    data={rollingSeries.filter(s => activeRollingKeys.includes(s.name)).map(s => ({
                      x: s.x,
                      y: s.y,
                      name: s.name === 'daily' ? 'Daily Usage' : s.name.replace('roll_', 'Roll ') + ' Avg',
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: s.style.color, width: s.name === 'roll_10' ? 3 : 2, dash: s.style.dash },
                    }))}
                    layout={{
                      title: 'Rolling / Smoothed Usage Series',
                      height: 450,
                      margin: { l: 80, r: 40, t: 60, b: 60 },
                      paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                      xaxis: { showgrid: true, gridcolor: '#333', color: '#888', title: 'Date', type: 'date' },
                      yaxis: { showgrid: true, gridcolor: '#333', color: '#888', title: 'Usage' },
                      legend: { orientation: 'h', x: 0.5, y: -0.2, xanchor: 'center' },
                      hovermode: 'x unified',
                    }}
                    config={{ displayModeBar: true, displaylogo: false }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <p>No forecast data available for the selected service.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
