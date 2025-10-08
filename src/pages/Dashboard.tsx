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
    colors: ['hsl(160, 84%, 39%)', 'hsl(250, 95%, 60%)', 'hsl(0, 84%, 60%)', 'hsl(240, 5%, 65%)'],
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
        <motion.div variants={item} className="card-hover">
          <ChartCard
            title="DSv5 Series"
            action={
              <Badge className="bg-success/20 text-success border-success/30 font-semibold">
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
                    fillcolor: 'rgba(139, 92, 246, 0.1)',
                    line: {
                      color: 'hsl(250, 95%, 60%)',
                      width: 3,
                      shape: 'spline',
                    },
                    hovertemplate: '<b>%{x}</b><br>€%{y:,.0f}<extra></extra>',
                  },
                ]}
                layout={{
                  height: 220,
                  margin: { l: 50, r: 20, t: 10, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  xaxis: {
                    showgrid: false,
                    color: 'hsl(240, 5%, 65%)',
                    tickfont: { size: 10 },
                  },
                  yaxis: {
                    showgrid: true,
                    gridcolor: 'hsl(240, 10%, 18%)',
                    color: 'hsl(240, 5%, 65%)',
                    tickfont: { size: 10 },
                    tickprefix: '€',
                  },
                  hovermode: 'x unified',
                }}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
              />
            </div>
            <div className="mt-2 p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Monthly</span>
                <span className="font-semibold text-primary">€15,200</span>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20"
              onClick={() => navigate('/forecast')}
            >
              View Forecast
            </Button>
          </ChartCard>
        </motion.div>

        <motion.div variants={item} className="card-hover">
          <ChartCard
            title="BSv5 Series"
            action={
              <Badge className="bg-accent/20 text-accent border-accent/30 font-semibold">
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
                    fillcolor: 'rgba(0, 186, 255, 0.1)',
                    line: {
                      color: 'hsl(195, 100%, 50%)',
                      width: 3,
                      shape: 'spline',
                    },
                    hovertemplate: '<b>%{x}</b><br>€%{y:,.0f}<extra></extra>',
                  },
                ]}
                layout={{
                  height: 220,
                  margin: { l: 50, r: 20, t: 10, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  xaxis: {
                    showgrid: false,
                    color: 'hsl(240, 5%, 65%)',
                    tickfont: { size: 10 },
                  },
                  yaxis: {
                    showgrid: true,
                    gridcolor: 'hsl(240, 10%, 18%)',
                    color: 'hsl(240, 5%, 65%)',
                    tickfont: { size: 10 },
                    tickprefix: '€',
                  },
                  hovermode: 'x unified',
                }}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
              />
            </div>
            <div className="mt-2 p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Monthly</span>
                <span className="font-semibold text-accent">€22,400</span>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20"
              onClick={() => navigate('/forecast')}
            >
              View Forecast
            </Button>
          </ChartCard>
        </motion.div>

        <motion.div variants={item} className="card-hover">
          <ChartCard title="Eligibility Breakdown">
            <div className="relative h-[220px]">
              <Plot
                data={[
                  {
                    labels: eligibilityData.labels,
                    values: eligibilityData.values,
                    type: 'pie',
                    marker: {
                      colors: eligibilityData.colors,
                      line: { color: 'hsl(240, 10%, 8%)', width: 2 },
                    },
                    textinfo: 'label+percent',
                    textposition: 'inside',
                    textfont: { size: 11, color: '#fff' },
                    hovertemplate: '<b>%{label}</b><br>%{value} groups (%{percent})<extra></extra>',
                  },
                ]}
                layout={{
                  height: 220,
                  margin: { l: 0, r: 0, t: 0, b: 0 },
                  paper_bgcolor: 'transparent',
                  showlegend: false,
                }}
                config={{ displayModeBar: false, responsive: true }}
                className="w-full"
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-success/20 border border-success/30">
                <div className="text-xs text-success/80">Eligible</div>
                <div className="text-lg font-bold text-success">6</div>
              </div>
              <div className="p-2 rounded-lg bg-destructive/20 border border-destructive/30">
                <div className="text-xs text-destructive/80">Not Eligible</div>
                <div className="text-lg font-bold text-destructive">4</div>
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
              onClick={() => navigate('/data')}
            >
              Analyze New Data
            </Button>
          </ChartCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
