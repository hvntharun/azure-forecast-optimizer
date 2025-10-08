import { motion } from "framer-motion";
import { DollarSign, TrendingUp, CheckCircle, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Plot from "react-plotly.js";
import { mockHistoricalData } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Prepare data for charts
  const dsvData = mockHistoricalData.filter(d => d.meterSubCategory === 'DSv5 Series');
  const bsvData = mockHistoricalData.filter(d => d.meterSubCategory === 'BSv5 Series');

  const eligibilityData = {
    labels: ['Eligible Stable', 'Eligible Decreasing', 'Not Eligible Erratic', 'Not Eligible Low'],
    values: [4, 2, 2, 2],
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Azure cloud cost insights and forecasting</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Hero Metrics */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-8 shadow-2xl gradient-mesh"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-card/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Total Spend</p>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">€50,000</h2>
            <p className="text-sm text-muted-foreground mt-2">Last 9 months</p>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-card/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Eligible Groups</p>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">4/10</h2>
            <p className="text-sm text-muted-foreground mt-2">Ready for forecasting</p>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-card/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Projected Savings</p>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-success to-accent bg-clip-text text-transparent">€10,000</h2>
            <p className="text-sm text-muted-foreground mt-2">Through reservations</p>
          </div>
        </div>
      </motion.div>

      {/* Meter Group Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <div style={{ boxShadow: 'var(--shadow-md)' }} className="card-hover">
            <ChartCard
              title="DSv5 Series"
              action={
                <Badge className="bg-success/10 text-success border border-success/20 font-semibold px-3 py-1">
                  Eligible Stable
                </Badge>
              }
            >
              <div className="relative h-[220px] -mx-2">
                <Plot
                  data={[
                    {
                      x: dsvData.map(d => d.date),
                      y: dsvData.map(d => d.totalCost),
                      type: 'scatter',
                      mode: 'lines',
                      fill: 'tozeroy',
                      fillcolor: 'rgba(132, 94, 247, 0.12)',
                      line: {
                        color: 'hsl(264, 89%, 62%)',
                        width: 3,
                        shape: 'spline',
                      },
                      hovertemplate: '<b>%{x}</b><br><b>€%{y:,.0f}</b><extra></extra>',
                    },
                  ]}
                  layout={{
                    height: 220,
                    margin: { l: 55, r: 20, t: 10, b: 40 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { family: "Inter, sans-serif" },
                    xaxis: {
                      showgrid: false,
                      color: 'hsl(240, 4%, 46%)',
                      tickfont: { size: 11 },
                    },
                    yaxis: {
                      showgrid: true,
                      gridcolor: 'hsl(240, 6%, 92%)',
                      gridwidth: 1,
                      color: 'hsl(240, 4%, 46%)',
                      tickfont: { size: 11 },
                      tickprefix: '€',
                      tickformat: ',.0f',
                    },
                    hovermode: 'x unified',
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  className="w-full"
                />
              </div>
              <div className="mt-3 p-3 rounded-xl bg-gradient-card border border-primary/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Avg Monthly</span>
                  <span className="font-bold text-primary">€15,200</span>
                </div>
              </div>
              <Button
                className="btn-hover w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium"
                onClick={() => navigate('/forecast')}
              >
                View Forecast
              </Button>
            </ChartCard>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div style={{ boxShadow: 'var(--shadow-md)' }} className="card-hover">
            <ChartCard
              title="BSv5 Series"
              action={
                <Badge className="bg-accent/10 text-accent border border-accent/20 font-semibold px-3 py-1">
                  Eligible Decreasing
                </Badge>
              }
            >
              <div className="relative h-[220px] -mx-2">
                <Plot
                  data={[
                    {
                      x: bsvData.map(d => d.date),
                      y: bsvData.map(d => d.totalCost),
                      type: 'scatter',
                      mode: 'lines',
                      fill: 'tozeroy',
                      fillcolor: 'rgba(74, 192, 215, 0.12)',
                      line: {
                        color: 'hsl(195, 85%, 55%)',
                        width: 3,
                        shape: 'spline',
                      },
                      hovertemplate: '<b>%{x}</b><br><b>€%{y:,.0f}</b><extra></extra>',
                    },
                  ]}
                  layout={{
                    height: 220,
                    margin: { l: 55, r: 20, t: 10, b: 40 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { family: "Inter, sans-serif" },
                    xaxis: {
                      showgrid: false,
                      color: 'hsl(240, 4%, 46%)',
                      tickfont: { size: 11 },
                    },
                    yaxis: {
                      showgrid: true,
                      gridcolor: 'hsl(240, 6%, 92%)',
                      gridwidth: 1,
                      color: 'hsl(240, 4%, 46%)',
                      tickfont: { size: 11 },
                      tickprefix: '€',
                      tickformat: ',.0f',
                    },
                    hovermode: 'x unified',
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  className="w-full"
                />
              </div>
              <div className="mt-3 p-3 rounded-xl bg-gradient-card border border-accent/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Avg Monthly</span>
                  <span className="font-bold text-accent">€22,400</span>
                </div>
              </div>
              <Button
                className="btn-hover w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium"
                onClick={() => navigate('/forecast')}
              >
                View Forecast
              </Button>
            </ChartCard>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div style={{ boxShadow: 'var(--shadow-md)' }} className="card-hover">
            <ChartCard title="Eligibility Breakdown">
              <div className="relative h-[220px]">
                <Plot
                  data={[
                    {
                      labels: eligibilityData.labels,
                      values: eligibilityData.values,
                      type: 'pie',
                      marker: {
                        colors: [
                          'hsl(160, 84%, 45%)',
                          'hsl(264, 89%, 62%)',
                          'hsl(0, 72%, 55%)',
                          'hsl(240, 4%, 46%)',
                        ],
                        line: { color: 'hsl(0, 0%, 100%)', width: 2 },
                      },
                      textinfo: 'label+percent',
                      textposition: 'inside',
                      textfont: { 
                        size: 12, 
                        color: '#fff',
                        weight: 600,
                        family: "Inter, sans-serif"
                      },
                      hovertemplate: '<b>%{label}</b><br>%{value} groups (%{percent})<extra></extra>',
                      hole: 0.4,
                    },
                  ]}
                  layout={{
                    height: 220,
                    margin: { l: 10, r: 10, t: 10, b: 10 },
                    paper_bgcolor: 'transparent',
                    showlegend: false,
                    font: { family: "Inter, sans-serif" },
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  className="w-full"
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                  <div className="text-xs text-success/80 font-medium mb-1">Eligible</div>
                  <div className="text-2xl font-bold text-success">6</div>
                  <div className="text-xs text-success/60 mt-1">60% of total</div>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="text-xs text-destructive/80 font-medium mb-1">Not Eligible</div>
                  <div className="text-2xl font-bold text-destructive">4</div>
                  <div className="text-xs text-destructive/60 mt-1">40% of total</div>
                </div>
              </div>
              <Button
                className="btn-hover w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-medium"
                onClick={() => navigate('/data')}
              >
                Analyze New Data
              </Button>
            </ChartCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
