import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Plot from "react-plotly.js";
import { toast } from "sonner";

export default function Reports() {
  const handleExportPDF = () => {
    toast.success("PDF report generated", {
      description: "Downloading Azure_Forecast_Report.pdf",
    });
  };

  const handleExportCSV = () => {
    toast.success("CSV report generated", {
      description: "Downloading forecast_summary.csv",
    });
  };

  const savingsData = {
    months: ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26"],
    historical: [8500, 8700, 8900, 9100, 9300, 9500],
    withReservations: [5700, 5900, 6000, 6200, 6400, 6500],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Export insights and documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Savings Chart */}
      <Card className="card-hover" style={{ boxShadow: 'var(--shadow-md)' }}>
        <CardHeader>
          <CardTitle>Projected Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: savingsData.months,
                y: savingsData.historical,
                name: "Without Reservations",
                type: "scatter",
                mode: "lines+markers",
                line: { 
                  color: "hsl(264, 89%, 62%)", 
                  width: 3,
                  shape: "spline"
                },
                marker: { 
                  size: 10,
                  color: "hsl(264, 89%, 62%)",
                  line: { width: 2, color: "#fff" }
                },
                fill: "none",
              },
              {
                x: savingsData.months,
                y: savingsData.withReservations,
                name: "With Reservations",
                type: "scatter",
                mode: "lines+markers",
                line: { 
                  color: "hsl(160, 84%, 45%)", 
                  width: 3,
                  shape: "spline"
                },
                marker: { 
                  size: 10,
                  color: "hsl(160, 84%, 45%)",
                  line: { width: 2, color: "#fff" }
                },
                fill: "tonexty",
                fillcolor: "rgba(16, 185, 129, 0.1)",
              },
            ]}
            layout={{
              height: 450,
              margin: { l: 70, r: 40, t: 20, b: 70 },
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: {
                family: "Inter, sans-serif",
                size: 13,
                color: "hsl(240, 10%, 46%)"
              },
              xaxis: {
                showgrid: false,
                color: "hsl(240, 10%, 46%)",
                title: {
                  text: "Month",
                  font: { size: 14, weight: 600 }
                },
                tickfont: { size: 12 }
              },
              yaxis: {
                showgrid: true,
                gridcolor: "hsl(240, 6%, 92%)",
                gridwidth: 1,
                color: "hsl(240, 10%, 46%)",
                title: {
                  text: "Cost (€)",
                  font: { size: 14, weight: 600 }
                },
                tickfont: { size: 12 },
                tickformat: "€,.0f"
              },
              legend: { 
                x: 0.02, 
                y: 1.15, 
                orientation: "h",
                font: { size: 13, weight: 500 }
              },
              hovermode: "x unified",
            }}
            config={{ 
              displayModeBar: true, 
              displaylogo: false,
              responsive: true 
            }}
            className="w-full"
          />
          
          {/* Insights Card */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-success/10 to-accent/10 border border-success/20">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Projected Annual Savings: €36,000</h4>
                <p className="text-sm text-muted-foreground">
                  Implementing reservations across eligible resources could reduce costs by ~32% year-over-year. 
                  Consider scaling D5v5 and B5v5 series for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-primary font-semibold">
                Eligibility Rules
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <div className="p-3 bg-success/10 rounded">
                  <p className="font-semibold text-success">Eligible Stable &gt;€12K</p>
                  <p className="text-muted-foreground mt-1">
                    Total cost ≥ €12,000 with variance &lt; 15% and stable trend
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded">
                  <p className="font-semibold text-success">Eligible Decreasing &gt;€20K</p>
                  <p className="text-muted-foreground mt-1">
                    Total cost ≥ €20,000 with clear decreasing trend
                  </p>
                </div>
                <div className="p-3 bg-destructive/10 rounded">
                  <p className="font-semibold text-destructive">Not Eligible Erratic &gt;€12K</p>
                  <p className="text-muted-foreground mt-1">
                    Total cost ≥ €12,000 but variance &gt; 30% (unpredictable)
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="font-semibold">Not Eligible Low &lt;€12K</p>
                  <p className="text-muted-foreground mt-1">
                    Total cost &lt; €12,000 - insufficient data for reliable forecast
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-primary font-semibold">
                Forecasting Methodology
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p>
                  Our forecasting engine uses <strong>XGBoost</strong> (Extreme Gradient Boosting)
                  models trained on Databricks clusters with the following features:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Historical usage patterns (9+ months of data)</li>
                  <li>Seasonal trends and cyclical patterns</li>
                  <li>Resource category-specific characteristics</li>
                  <li>85% confidence intervals for predictions</li>
                  <li>15-month forecast horizon from October 2025</li>
                </ul>
                <p className="mt-3 p-3 bg-primary/10 rounded">
                  <strong>Model Accuracy:</strong> Average MAPE (Mean Absolute Percentage Error)
                  of 7.2% across all eligible meter categories
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-primary font-semibold">
                Business Requirements (BRD Summary)
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p>
                  <strong>Objective:</strong> Optimize Azure cloud spend through automated
                  reservation recommendations based on predictive analytics
                </p>
                <div className="mt-3 space-y-2">
                  <div className="p-3 bg-card rounded border">
                    <p className="font-semibold">Key Features</p>
                    <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                      <li>CSV data ingestion for historical cost analysis</li>
                      <li>4-tier eligibility classification system</li>
                      <li>Machine learning-based cost forecasting</li>
                      <li>Automated reservation CSV generation</li>
                      <li>Savings calculation with custom discount inputs</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-card rounded border">
                    <p className="font-semibold">Expected Outcomes</p>
                    <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                      <li>20-35% cost reduction through reservations</li>
                      <li>Improved budget predictability</li>
                      <li>Data-driven procurement decisions</li>
                      <li>Reduced manual analysis time by 80%</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
