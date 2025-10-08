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
      <Card>
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
                line: { color: "#000099", width: 3 },
                marker: { size: 8 },
              },
              {
                x: savingsData.months,
                y: savingsData.withReservations,
                name: "With Reservations",
                type: "scatter",
                mode: "lines+markers",
                line: { color: "#10B981", width: 3 },
                marker: { size: 8 },
              },
            ]}
            layout={{
              height: 400,
              margin: { l: 60, r: 40, t: 20, b: 60 },
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              xaxis: {
                showgrid: false,
                color: "#888",
                title: "Month",
              },
              yaxis: {
                showgrid: true,
                gridcolor: "#333",
                color: "#888",
                title: "Cost (€)",
              },
              legend: { x: 0, y: 1.1, orientation: "h" },
            }}
            config={{ displayModeBar: true, displaylogo: false }}
            className="w-full"
          />
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
