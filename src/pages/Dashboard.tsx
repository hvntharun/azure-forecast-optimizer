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
    colors: ['#10B981', '#10B981', '#FF0000', '#666666'],
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
        className="gradient-hero rounded-xl p-8 text-white shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Total Spend</p>
            </div>
            <h2 className="text-4xl font-bold">€50,000</h2>
            <p className="text-sm opacity-80 mt-1">Last 9 months</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Eligible Groups</p>
            </div>
            <h2 className="text-4xl font-bold">4/10</h2>
            <p className="text-sm opacity-80 mt-1">Ready for forecasting</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Projected Savings</p>
            </div>
            <h2 className="text-4xl font-bold">€10,000</h2>
            <p className="text-sm opacity-80 mt-1">Through reservations</p>
          </div>
        </div>
      </motion.div>

      {/* Meter Group Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <ChartCard
            title="DSv5 Series"
            action={
              <Badge className="bg-success text-success-foreground">
                Eligible Stable &gt;€12K
              </Badge>
            }
          >
            <Plot
              data={[
                {
                  x: dsvData.map(d => d.date),
                  y: dsvData.map(d => d.totalCost),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#000099', width: 2 },
                  marker: { size: 6 },
                },
              ]}
              layout={{
                height: 200,
                margin: { l: 40, r: 20, t: 10, b: 30 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { showgrid: false, color: '#888' },
                yaxis: { showgrid: true, gridcolor: '#333', color: '#888' },
              }}
              config={{ displayModeBar: false }}
              className="w-full"
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/forecast')}
            >
              View Forecast
            </Button>
          </ChartCard>
        </motion.div>

        <motion.div variants={item}>
          <ChartCard
            title="BSv5 Series"
            action={
              <Badge className="bg-success text-success-foreground">
                Eligible Decreasing &gt;€20K
              </Badge>
            }
          >
            <Plot
              data={[
                {
                  x: bsvData.map(d => d.date),
                  y: bsvData.map(d => d.totalCost),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#000099', width: 2 },
                  marker: { size: 6 },
                },
              ]}
              layout={{
                height: 200,
                margin: { l: 40, r: 20, t: 10, b: 30 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { showgrid: false, color: '#888' },
                yaxis: { showgrid: true, gridcolor: '#333', color: '#888' },
              }}
              config={{ displayModeBar: false }}
              className="w-full"
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/forecast')}
            >
              View Forecast
            </Button>
          </ChartCard>
        </motion.div>

        <motion.div variants={item}>
          <ChartCard title="Eligibility Breakdown">
            <Plot
              data={[
                {
                  labels: eligibilityData.labels,
                  values: eligibilityData.values,
                  type: 'pie',
                  marker: { colors: eligibilityData.colors },
                  textinfo: 'label+percent',
                  textposition: 'inside',
                },
              ]}
              layout={{
                height: 200,
                margin: { l: 0, r: 0, t: 0, b: 0 },
                paper_bgcolor: 'transparent',
                showlegend: false,
              }}
              config={{ displayModeBar: false }}
              className="w-full"
            />
            <Button
              className="w-full mt-4 bg-accent hover:bg-accent/90"
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
