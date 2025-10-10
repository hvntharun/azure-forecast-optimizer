import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
import { checkEligibility, getForecast } from "@/lib/mockApi";
import Plot from "react-plotly.js";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateMockChartData, ClassificationType } from "@/lib/classificationData";

const steps = [
  { id: 1, name: "Data Loaded", status: "complete" },
  { id: 2, name: "Eligibility Check", status: "current" },
  { id: 3, name: "Generate Forecast", status: "upcoming" },
  { id: 4, name: "View Predictions", status: "upcoming" },
];

export default function Forecasting() {
  const location = useLocation();
  const state = location.state as { cardId?: ClassificationType; service?: string } | null;

  const [selectedMeter, setSelectedMeter] = useState(state?.service || "DSv5 Series");
  const [eligibility, setEligibility] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [chartData, setChartData] = useState<any[]>([]);

  // If coming from Dashboard with card selection, generate chart data
  useEffect(() => {
    if (state?.cardId && state?.service) {
      const data = generateMockChartData(state.service, state.cardId);
      setChartData(data);
      setSelectedMeter(state.service);
    }
  }, [state]);

  const handleCheckEligibility = async () => {
    setLoading(true);
    try {
      const result = await checkEligibility(selectedMeter);
      setEligibility(result);
      setCurrentStep(3);
      toast.success("Eligibility check complete");
    } catch (error) {
      toast.error("Failed to check eligibility");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    if (!eligibility || !eligibility.status.startsWith("Eligible")) {
      toast.error("This meter category is not eligible for forecasting");
      return;
    }

    setLoading(true);
    try {
      const result = await getForecast(selectedMeter, 15);
      setForecast(result);
      setCurrentStep(4);
      toast.success("Forecast generated successfully");
    } catch (error) {
      toast.error("Failed to generate forecast");
    } finally {
      setLoading(false);
    }
  };

  const isEligible = eligibility?.status.startsWith("Eligible");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Forecasting</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered cost predictions using XGBoost
        </p>
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
                      currentStep > step.id
                        ? "bg-success border-success"
                        : currentStep === step.id
                        ? "bg-primary border-primary"
                        : "bg-muted border-muted"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {step.id}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium">{step.name}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 ${
                      currentStep > step.id ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.cardId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Category
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">Analytics</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Classification Type
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium text-sm">
                    {state.cardId === 'stable-high' && 'Stable High Spend (>12K)'}
                    {state.cardId === 'high-spend' && 'High Spend (>20K)'}
                    {state.cardId === 'unstable' && 'Unstable/Erratic (>12K)'}
                    {state.cardId === 'low-spend' && 'Low Spend (<12K)'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Selected Service
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedMeter}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCheckEligibility}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Check Eligibility
            </Button>
            <Button
              onClick={handleGenerateForecast}
              disabled={loading || !isEligible}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Generate Forecast
            </Button>
          </div>

          {eligibility && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Badge
                className={
                  isEligible
                    ? "bg-success text-white"
                    : "bg-destructive text-white"
                }
              >
                {eligibility.status}
              </Badge>
              <div className="flex-1 text-sm text-muted-foreground">
                <strong>Total Cost:</strong> €{eligibility.total.toLocaleString()} | 
                <strong> Variance:</strong> {eligibility.variance}% | 
                <strong> Trend:</strong> {eligibility.trend}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMeter} - Cost Analysis & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: chartData.length > 0 ? chartData.map(d => d.month) : [],
                y: chartData.length > 0 ? chartData.map(d => d.cost) : [],
                name: "Historical",
                type: "scatter",
                mode: "lines+markers",
                line: { color: "hsl(264, 89%, 62%)", width: 3 },
                marker: { size: 8 },
              },
              ...(forecast
                ? [
                    {
                      x: forecast.map((f: any) => f.date),
                      y: forecast.map((f: any) => f.predicted),
                      name: "Forecast",
                      type: "scatter",
                      mode: "lines",
                      line: { color: "#10B981", width: 3, dash: "dash" },
                    },
                    {
                      x: forecast.map((f: any) => f.date),
                      y: forecast.map((f: any) => f.upper),
                      type: "scatter",
                      mode: "lines",
                      line: { width: 0 },
                      showlegend: false,
                      hoverinfo: "skip",
                    },
                    {
                      x: forecast.map((f: any) => f.date),
                      y: forecast.map((f: any) => f.lower),
                      type: "scatter",
                      mode: "lines",
                      fill: "tonexty",
                      fillcolor: "rgba(16, 185, 129, 0.2)",
                      line: { width: 0 },
                      name: "Confidence Interval",
                    },
                  ]
                : []),
            ]}
            layout={{
              height: 500,
              margin: { l: 60, r: 40, t: 20, b: 60 },
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              xaxis: {
                showgrid: false,
                color: "#888",
                title: "Date",
              },
              yaxis: {
                showgrid: true,
                gridcolor: "#333",
                color: "#888",
                title: "Cost (€)",
              },
              legend: { x: 0, y: 1.1, orientation: "h" },
              hovermode: "x unified",
            }}
            config={{ displayModeBar: true, displaylogo: false }}
            className="w-full"
          />

          {!isEligible && eligibility && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Not Eligible for Forecasting</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This meter category does not meet the criteria. Consider stabilizing usage patterns or increasing monthly spend.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
