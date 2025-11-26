import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import {
  Loader2,
  CheckCircle2,
  BarChart3,
  Calendar,
  ChevronDown,
  Info,
  RefreshCw,
} from "lucide-react";
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
  const state = (location.state as {
    service?: string;
    cardId?: ClassificationType;
    category?: string;
  }) || null;

  const classificationType: ClassificationType = state?.cardId ?? "stable-high";

  // basic data load / stepper state
  const [dataLoaded, setDataLoaded] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const load = async () => {
      await ensureDataLoaded();
      setTimeout(() => {
        setAvailableServices([...serviceNames]);
        setDataLoaded(true);
        setCurrentStep(2);
      }, 120);
    };
    load();
  }, []);

  const defaultService = availableServices.length > 0 ? availableServices[0] : "";
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    if (dataLoaded && availableServices.length > 0) {
      if (state?.service && availableServices.includes(state.service)) {
        setSelectedService(state.service);
      } else {
        setSelectedService(defaultService);
      }
    }
  }, [dataLoaded, availableServices, state?.service, defaultService]);

  // forecast flow
  const [loading, setLoading] = useState(false);
  const [showPanels, setShowPanels] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // instructions visibility (hidden by default)
  const [showInstructions, setShowInstructions] = useState(false);

  // FORM FIELDS (2-column layout)
  const [reservationQty, setReservationQty] = useState<number | "">(750000);
  const [currentReservationStart, setCurrentReservationStart] = useState<string | null>("2024-11-18");
  const [nextReservationStart, setNextReservationStart] = useState<string | null>("2025-11-18");
  const [reservationDurationDays, setReservationDurationDays] = useState<number | "">(365);
  const [reservationDiscount, setReservationDiscount] = useState<number | "">(30);
  const [vmCostPerUnit, setVmCostPerUnit] = useState<number | "">(1.0);
  const [anomalyDetectionMethod, setAnomalyDetectionMethod] = useState<string>("Isolation Forest");
  const [contaminationRate, setContaminationRate] = useState<number | "">(0.10);
  const [enableAnomaly, setEnableAnomaly] = useState<boolean>(true);

  // validation state: errors object; and showErrors flag to avoid showing errors before user tries to submit
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // date input refs so chevron opens picker (showPicker if supported)
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  const openDatePicker = (ref: HTMLInputElement | null) => {
    if (!ref) return;
    const anyRef = ref as any;
    if (typeof anyRef.showPicker === "function") {
      try {
        anyRef.showPicker();
        return;
      } catch {}
    }
    ref.focus();
  };

  // stepper helpers
  const steps = useMemo(
    () => [
      { id: 1, name: "Data Loaded", status: currentStep > 1 ? "complete" : currentStep === 1 ? "current" : "upcoming" },
      { id: 2, name: "Eligibility Check", status: currentStep > 2 ? "complete" : currentStep === 2 ? "current" : "upcoming" },
      { id: 3, name: "Generate Forecast", status: currentStep > 3 ? "complete" : currentStep === 3 ? "current" : "upcoming" },
      { id: 4, name: "View Predictions", status: currentStep > 4 ? "complete" : currentStep === 4 ? "current" : "upcoming" },
    ],
    [currentStep]
  );

  // service data + derived values (unchanged)
  const serviceData: ServiceData | null = useMemo(() => {
    if (!selectedService || !availableServices.includes(selectedService)) {
      return getServiceData(defaultService) as ServiceData;
    }
    return getServiceData(selectedService) as ServiceData;
  }, [selectedService, defaultService, availableServices]);

  const dataSummary = useMemo(() => {
    if (!selectedService) return { totalDataPoints: 0, dateRange: "N/A", averageUsage: 0, maxUsage: 0, minUsage: 0 };
    return calculateDataSummary(selectedService, classificationType);
  }, [selectedService, classificationType]);

  const modelInfo = useMemo(() => {
    if (!selectedService) return getModelInfo("");
    return getModelInfo(selectedService);
  }, [selectedService]);

  const reservationInfo = getReservationInfo();

  // normalize forecast arrays (unchanged)
  const addDays = (iso: string, days: number) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const normalizedForecast = useMemo(() => {
    if (!serviceData) return { historicalX: [], historicalY: [], predictedX: [], predictedY: [] };
    const { timestamps, actual, predicted } = serviceData.forecastData;
    const historicalX: string[] = [];
    const historicalY: number[] = [];
    timestamps.forEach((ts, idx) => {
      const v = actual[idx];
      if (v !== null && v !== undefined) {
        historicalX.push(ts);
        historicalY.push(v);
      }
    });
    let predictedX: string[] = [];
    let predictedY: number[] = [];
    if (predicted.length === timestamps.length) {
      predicted.forEach((v, idx) => {
        if (v !== null && v !== undefined) {
          predictedX.push(timestamps[idx]);
          predictedY.push(v);
        }
      });
    } else if (predicted.length > 0) {
      const anchor = timestamps[timestamps.length - 1] || addDays(new Date().toISOString().slice(0, 10), -1);
      predicted.forEach((v, idx) => {
        if (v !== null && v !== undefined) {
          predictedX.push(addDays(anchor, idx + 1));
          predictedY.push(v);
        }
      });
    }
    return { historicalX, historicalY, predictedX, predictedY };
  }, [serviceData]);

  // rolling series unchanged
  const rollingSeries = useMemo(() => {
    if (!serviceData?.rollingAverage) return [] as Array<{ name: string; x: string[]; y: number[]; style: any }>;
    const { rollingAverage } = serviceData;
    const baseTimestamps: string[] = rollingAverage.timestamps || [];
    return Object.keys(rollingAverage)
      .filter(k => k !== "timestamps")
      .map(key => {
        const arr: any[] = rollingAverage[key] || [];
        const x = baseTimestamps.slice(0, arr.length);
        const y = arr.filter(v => v !== null && v !== undefined);
        const colorMap: Record<string, string> = { daily: "#6366F1", roll_7: "#F59E0B", roll_10: "#EC4899", roll_30: "#10B981" };
        return { name: key, x, y, style: { color: colorMap[key] || "#888", dash: key.startsWith("roll") ? "dot" : "solid" } };
      });
  }, [serviceData]);

  const [activeRollingKeys, setActiveRollingKeys] = useState<string[]>([]);
  useEffect(() => {
    if (currentStep === 4) setActiveRollingKeys(rollingSeries.map(s => s.name));
    else setActiveRollingKeys([]);
  }, [rollingSeries, currentStep]);

  const toggleRollingKey = (key: string) => {
    setActiveRollingKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  // ---------- Validation ----------
  const validateForm = useCallback(() => {
    const e: Record<string, string> = {};
    if (!selectedService) e.selectedService = "VM Meter Group is required.";
    if (reservationQty === "" || Number(reservationQty) <= 0) e.reservationQty = "Enter a positive reservation quantity.";
    if (!currentReservationStart) e.currentReservationStart = "Select current reservation start date.";
    if (!nextReservationStart) e.nextReservationStart = "Select next reservation start date.";
    if (currentReservationStart && nextReservationStart) {
      const s = new Date(currentReservationStart);
      const n = new Date(nextReservationStart);
      if (n < s) e.nextReservationStart = "Next start date must be the same or after current start date.";
    }
    if (reservationDurationDays === "" || Number(reservationDurationDays) <= 0) e.reservationDurationDays = "Enter a valid duration (days).";
    if (reservationDiscount === "" || Number(reservationDiscount) < 0) e.reservationDiscount = "Enter a valid discount percentage.";
    if (vmCostPerUnit === "" || Number(vmCostPerUnit) < 0) e.vmCostPerUnit = "Enter a valid VM cost per unit.";
    if (contaminationRate === "" || Number(contaminationRate) < 0 || Number(contaminationRate) > 1) e.contaminationRate = "Enter contamination rate between 0.0 and 1.0.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [
    selectedService,
    reservationQty,
    currentReservationStart,
    nextReservationStart,
    reservationDurationDays,
    reservationDiscount,
    vmCostPerUnit,
    contaminationRate,
  ]);

  // Attempt generate: show validation errors only after first click
  const handleGenerate = useCallback(async () => {
    setShowErrors(true);
    const ok = validateForm();
    if (!ok) {
      // focus first invalid field
      if (errors.selectedService || !selectedService) {
        // select control focus not trivial — leave toast
      } else if (errors.currentReservationStart || !currentReservationStart) {
        startRef.current?.focus();
      } else if (errors.nextReservationStart || !nextReservationStart) {
        endRef.current?.focus();
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    // proceed with generating forecast
    setLoading(true);
    setCurrentStep(3);
    try {
      // If backend expects new fields, pass them here
      await getForecast(selectedService || defaultService, 15);
      setShowPanels(true);
      setCurrentStep(4);
      toast.success("Forecast generated successfully");
    } catch (err) {
      toast.error("Failed to generate forecast");
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  }, [validateForm, errors, selectedService, defaultService, currentReservationStart, nextReservationStart]);

  const handleReset = () => {
    setReservationQty("");
    setCurrentReservationStart(null);
    setNextReservationStart(null);
    setReservationDurationDays("");
    setReservationDiscount("");
    setVmCostPerUnit("");
    setAnomalyDetectionMethod("Isolation Forest");
    setContaminationRate("");
    setEnableAnomaly(true);
    setErrors({});
    setShowErrors(false);
    setShowPanels(false);
    toast?.success?.("Configuration reset");
  };

  // input classes
  const base = "w-full rounded-md border px-3 py-2 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const err = "border-destructive focus:ring-destructive/30";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">VM Forecasting</h1>
        <p className="text-muted-foreground mt-1">AI-powered cost predictions using XGBoost</p>
      </div>

      {/* ---------- COMPACT STEP BAR (replacement) ---------- */}
      {/* This card is intentionally minimal (no extra top padding) so there's no gap under the title */}
      <Card className="shadow-none border-transparent bg-transparent">
        <CardContent className="p-0">
          <nav aria-label="Progress" className="w-full">
            <ol className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const status = step.status;
                const clickable = status === "complete" || status === "current";
                return (
                  <li key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => { if (clickable) setCurrentStep(step.id); }}
                      aria-current={status === "current" ? "step" : undefined}
                      aria-disabled={!clickable}
                      className={`flex flex-col items-center text-center focus:outline-none ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-colors
                        ${status === 'complete' ? 'bg-success border-success' : ''}
                        ${status === 'current' ? 'bg-primary border-primary shadow-md' : ''}
                        ${status === 'upcoming' ? 'bg-muted border-muted' : ''}`}>
                        {status === 'complete' ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-sm font-semibold text-white">{step.id}</span>
                        )}
                      </div>
                      <span className="mt-2 text-xs font-medium text-muted-foreground max-w-[140px]">{step.name}</span>
                    </button>

                    {/* connector line except after last */}
                    {idx < steps.length - 1 && (
                      <div className={`h-[2px] w-12 mx-3 transition-colors ${status === 'complete' ? 'bg-success' : 'bg-muted'}`} />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
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

      {/* Controls card: Title left, controls pinned top-right inside card */}
      <Card className="relative">
        {/* CardHeader contains just the title (left) */}
        <CardHeader className="items-start">
          <div className="min-w-0">
            <CardTitle className="text-2xl">Analysis Configuration</CardTitle>
          </div>
        </CardHeader>

        {/* ABSOLUTE controls pinned to top-right corner of the card */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Model Performance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Model Performance Comparison</DialogTitle>
              </DialogHeader>
              {serviceData && (
                <ModelPerformanceTable data={(serviceData.modelPerformance || []).map(mp => ({
                  model: mp.model || mp.name || "Model",
                  RMSE: mp.RMSE || 0,
                  MAE: mp.MAE || 0,
                  MAPE: mp.MAPE || 0,
                }))} />
              )}
            </DialogContent>
          </Dialog>

          <button
            onClick={() => setShowInstructions(s => !s)}
            className="rounded-full p-2 hover:bg-muted/40 transition"
            title="Instructions"
            aria-label="Toggle instructions"
          >
            <Info className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* CardContent has extra top padding so absolute controls don't overlap content */}
        <CardContent className="pt-5">
          {/* Instructions panel only visible when user clicks the icon */}
          {showInstructions && (
            <div className="mb-4 p-4 rounded-md bg-gradient-to-r from-primary/6 to-accent/6 border border-border/60">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Instructions</p>
                  <ol className="mt-2 text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Select a VM meter group.</li>
                    <li>Fill reservation and anomaly detection fields.</li>
                    <li>Use the calendar or chevron to pick dates.</li>
                    <li>Click Generate Forecast (required fields validated).</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TWO-COLUMN FORM: ensure vm meter group included in fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column fields */}
            <div className="space-y-4">
              {/* VM Meter Group (part of left column) */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">VM Meter Group</label>
                <Select
                  value={selectedService}
                  onValueChange={(val) => {
                    if (availableServices.includes(val)) {
                      setSelectedService(val);
                      setShowPanels(false);
                      if (currentStep === 4 || currentStep === 3) setCurrentStep(2);
                    }
                  }}
                >
                  <SelectTrigger className={`w-full bg-card ${showErrors && errors.selectedService ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select VM Meter Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {availableServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {showErrors && errors.selectedService && <div className="text-xs text-destructive mt-1">{errors.selectedService}</div>}
              </div>

              {/* Current Reservation Start Date */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Current Reservation Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    ref={startRef}
                    type="date"
                    value={currentReservationStart ?? ""}
                    onChange={(e) => setCurrentReservationStart(e.target.value || null)}
                    className={`${base} pl-10 pr-10 ${showErrors && errors.currentReservationStart ? err : ""}`}
                    aria-label="Current reservation start"
                  />
                  <button type="button" onClick={() => openDatePicker(startRef.current)} className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </button>
                </div>
                {showErrors && errors.currentReservationStart && <div className="text-xs text-destructive mt-1">{errors.currentReservationStart}</div>}
              </div>

              {/* Anomaly Detection Method */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Anomaly Detection Method</label>
                <Select value={anomalyDetectionMethod} onValueChange={v => setAnomalyDetectionMethod(v)}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="Isolation Forest">Isolation Forest</SelectItem>
                    <SelectItem value="Z-Score">Z-Score</SelectItem>
                    <SelectItem value="IQR">IQR</SelectItem>
                    <SelectItem value="Combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contamination Rate */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Contamination Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={contaminationRate === "" ? "" : contaminationRate}
                  onChange={(e) => setContaminationRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${base} ${showErrors && errors.contaminationRate ? err : ""}`}
                  placeholder="e.g. 0.10"
                />
                {showErrors && errors.contaminationRate && <div className="text-xs text-destructive mt-1">{errors.contaminationRate}</div>}
              </div>

              {/* Enable anomaly checkbox */}
              <div className="flex items-center gap-3">
                <input id="enableAnomaly" type="checkbox" checked={enableAnomaly} onChange={e => setEnableAnomaly(e.target.checked)} className="h-4 w-4 rounded" />
                <label htmlFor="enableAnomaly" className="text-sm">Enable Anomaly Detection</label>
              </div>
            </div>

            {/* Right column fields (arranged vertically; buttons at bottom-right) */}
            <div className="space-y-4 flex flex-col">
              {/* Current Reservation Quantity */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Current Reservation Quantity</label>
                <input
                  type="number"
                  value={reservationQty === "" ? "" : reservationQty}
                  onChange={(e) => setReservationQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${base} ${showErrors && errors.reservationQty ? err : ""}`}
                  placeholder="e.g. 750000"
                />
                {showErrors && errors.reservationQty && <div className="text-xs text-destructive mt-1">{errors.reservationQty}</div>}
              </div>

              {/* Reservation Duration */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Reservation Duration (Days)</label>
                <input
                  type="number"
                  value={reservationDurationDays === "" ? "" : reservationDurationDays}
                  onChange={(e) => setReservationDurationDays(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${base} ${showErrors && errors.reservationDurationDays ? err : ""}`}
                  placeholder="e.g. 364"
                />
                {showErrors && errors.reservationDurationDays && <div className="text-xs text-destructive mt-1">{errors.reservationDurationDays}</div>}
              </div>

              {/* Next Reservation Start Date */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Next Reservation Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    ref={endRef}
                    type="date"
                    value={nextReservationStart ?? ""}
                    onChange={(e) => setNextReservationStart(e.target.value || null)}
                    className={`${base} pl-10 pr-10 ${showErrors && errors.nextReservationStart ? err : ""}`}
                    aria-label="Next reservation start"
                  />
                  <button type="button" onClick={() => openDatePicker(endRef.current)} className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </button>
                </div>
                {showErrors && errors.nextReservationStart && <div className="text-xs text-destructive mt-1">{errors.nextReservationStart}</div>}
              </div>

              {/* Reservation Discount */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Reservation Discount (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={reservationDiscount === "" ? "" : reservationDiscount}
                  onChange={(e) => setReservationDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${base} ${showErrors && errors.reservationDiscount ? err : ""}`}
                  placeholder="e.g. 30"
                />
                {showErrors && errors.reservationDiscount && <div className="text-xs text-destructive mt-1">{errors.reservationDiscount}</div>}
              </div>

              {/* Azure VM Cost per Unit */}
              <div>
                <label className="text-sm font-medium block mb-2 text-muted-foreground">Azure VM Cost per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  value={vmCostPerUnit === "" ? "" : vmCostPerUnit}
                  onChange={(e) => setVmCostPerUnit(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${base} ${showErrors && errors.vmCostPerUnit ? err : ""}`}
                  placeholder="e.g. 1.0"
                />
                {showErrors && errors.vmCostPerUnit && <div className="text-xs text-destructive mt-1">{errors.vmCostPerUnit}</div>}
              </div>

              {/* Bottom-right: buttons (Generate + Reset icon) */}
              <div className="mt-auto flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-md p-2 hover:bg-muted/40 transition flex items-center justify-center"
                  title="Reset"
                >
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </button>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`py-2 px-6 ${loading ? "bg-muted/60 cursor-not-allowed" : "bg-accent hover:bg-accent/90"}`}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> : null}
                  Generate Forecast
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligible message below the card */}
      <div>
        <div className="p-3 rounded-md bg-muted/60 flex items-start gap-4">
          <Badge className="bg-success text-white rounded-full">Eligible</Badge>
          <div className="text-sm text-foreground">All services meet forecasting criteria. Proceed to generate a forecast.</div>
        </div>
      </div>

      {/* Chart card (unchanged) */}
      <Card>
        <CardHeader>
          <CardTitle>{`Usage Forecast for ${selectedService || defaultService} (Best Model: ${serviceData?.bestModel.name || "N/A"})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceData ? (
            <div className="w-full space-y-10">
              {(() => {
                const { historicalX, historicalY, predictedX, predictedY } = normalizedForecast;
                const lastHistoricalX = historicalX[historicalX.length - 1];
                const lastHistoricalY = historicalY[historicalY.length - 1];
                const firstPredictedX = predictedX[0];
                const bridgeTrace = lastHistoricalX && firstPredictedX ? {
                  x: [lastHistoricalX, firstPredictedX],
                  y: [lastHistoricalY, lastHistoricalY],
                  name: "Bridge Forecast",
                  type: "scatter" as const,
                  mode: "lines+markers" as const,
                  line: { color: "#FF4500", width: 3, dash: "dash" as const },
                  marker: { size: 8, color: "#FF4500", symbol: "circle", line: { width: 2, color: "#FFFFFF" } },
                  showlegend: true,
                  hovertemplate: "<b>Bridge Forecast</b><br>Value: %{y}<br>Date: %{x}<extra></extra>"
                } : null;
                if (currentStep < 4) {
                  return <div className="h-[500px] flex items-center justify-center text-muted-foreground">{currentStep === 3 ? "Generating forecast..." : "Generate a forecast to view predictions."}</div>;
                }
                return (
                  <Plot
                    data={[
                      {
                        x: historicalX,
                        y: historicalY,
                        name: "Historical Usage",
                        type: "scatter",
                        mode: "lines+markers",
                        line: { color: "#3B82F6", width: 2 },
                        marker: { size: 4 },
                      },
                      ...(bridgeTrace ? [bridgeTrace] : []),
                      {
                        x: predictedX,
                        y: predictedY,
                        name: "Next Reservation Forecast",
                        type: "scatter",
                        mode: "lines",
                        line: { color: "#10b981", width: 2, dash: "dot" },
                        showlegend: true,
                      },
                    ]}
                    layout={{
                      height: 500,
                      margin: { l: 80, r: 40, t: 50, b: 80 },
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                      xaxis: { showgrid: true, gridcolor: "#333", color: "#888", title: "Date", type: "date" },
                      yaxis: { showgrid: true, gridcolor: "#333", color: "#888", title: "Daily DBCU Usage", tickmode: "auto" },
                      legend: { x: 0.5, y: -0.15, orientation: "h", xanchor: "center", bgcolor: "rgba(0,0,0,0.1)", bordercolor: "#333", borderwidth: 1, font: { size: 14 }, tracegroupgap: 4 },
                      hovermode: "x unified",
                    }}
                    config={{ displayModeBar: true, displaylogo: false }}
                    className="w-full"
                  />
                );
              })()}

              {/* Rolling averages */}
              {currentStep === 4 && rollingSeries.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {rollingSeries.map(s => (
                      <div key={s.name} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRollingKey(s.name)}
                          onDoubleClick={() => setActiveRollingKeys([s.name])}
                          className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-2 transition-colors ${activeRollingKeys.includes(s.name) ? "bg-primary/10 border-primary text-primary" : "bg-muted border-border text-muted-foreground"}`}
                        >
                          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.style.color }} />
                          {s.name === "daily" ? "Daily" : s.name.replace("roll_", "Roll ")}
                        </button>
                      </div>
                    ))}
                    {activeRollingKeys.length === 1 && (
                      <button type="button" onClick={() => setActiveRollingKeys(rollingSeries.map(s => s.name))} className="px-3 py-1 rounded-md text-xs font-medium border bg-accent/10 border-accent text-accent">Show All</button>
                    )}
                  </div>
                  <Plot
                    data={rollingSeries.filter(s => activeRollingKeys.includes(s.name)).map(s => ({
                      x: s.x,
                      y: s.y,
                      name: s.name === "daily" ? "Daily Usage" : s.name.replace("roll_", "Roll ") + " Avg",
                      type: "scatter",
                      mode: "lines",
                      line: { color: s.style.color, width: s.name === "roll_10" ? 3 : 2, dash: s.style.dash },
                    }))}
                    layout={{
                      title: "Rolling / Smoothed Usage Series",
                      height: 450,
                      margin: { l: 80, r: 40, t: 60, b: 60 },
                      paper_bgcolor: "transparent", plot_bgcolor: "transparent",
                      xaxis: { showgrid: true, gridcolor: "#333", color: "#888", title: "Date", type: "date" },
                      yaxis: { showgrid: true, gridcolor: "#333", color: "#888", title: "Usage" },
                      legend: { orientation: "h", x: 0.5, y: -0.2, xanchor: "center" },
                      hovermode: "x unified",
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
