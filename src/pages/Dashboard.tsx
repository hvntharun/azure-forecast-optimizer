import { motion } from "framer-motion";
import { useState } from "react";
import { DollarSign, TrendingUp, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";
import { CategorySelector } from "@/components/CategorySelector";
import { ClassificationCard } from "@/components/ClassificationCard";
import {
  ClassificationCategory,
  ClassificationType,
  classificationCards,
  servicesByCategory,
  getEligibilityStats,
} from "@/lib/classificationData";

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
  const [selectedCategory, setSelectedCategory] = useState<ClassificationCategory>('Analytics');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleViewCard = (cardId: ClassificationType, service: string) => {
    navigate('/forecast', { 
      state: { 
        category: selectedCategory, 
        cardId, 
        service 
      } 
    });
  };

  const stats = getEligibilityStats(selectedCategory);
  const services = servicesByCategory[selectedCategory];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Azure cloud cost insights and forecasting</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Category Selector */}
      <motion.div variants={item}>
        <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
      </motion.div>

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
            <h2 className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {stats.eligible}/{stats.total}
            </h2>
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

      {/* Classification Cards and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Classification Cards in 2x2 grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {classificationCards.map((card) => (
            <motion.div key={card.id} variants={item}>
              <ClassificationCard
                card={card}
                services={services[card.id]}
                category={selectedCategory}
                onView={handleViewCard}
              />
            </motion.div>
          ))}
        </div>

        {/* Right side - Pie Chart */}
        <motion.div variants={item} className="lg:col-span-1">
          <div style={{ boxShadow: 'var(--shadow-md)' }} className="card-hover p-6 bg-card rounded-2xl border border-border h-full">
            <h3 className="text-xl font-bold mb-4">Eligibility Breakdown</h3>
            <div className="space-y-4">
              <div className="relative h-[280px]">
                <Plot
                  data={[
                    {
                      labels: classificationCards.map(c => c.shortLabel),
                      values: classificationCards.map(c => services[c.id].length),
                      type: 'pie',
                      marker: {
                        colors: classificationCards.map(c => c.color),
                        line: { color: 'hsl(0, 0%, 100%)', width: 2 },
                      },
                      textinfo: 'label+percent',
                      textposition: 'inside',
                      textfont: { 
                        size: 10, 
                        color: '#fff',
                        weight: 600,
                        family: "Inter, sans-serif"
                      },
                      hovertemplate: '<b>%{label}</b><br>%{value} services (%{percent})<extra></extra>',
                      hole: 0.45,
                    },
                  ]}
                  layout={{
                    height: 280,
                    margin: { l: 5, r: 5, t: 5, b: 5 },
                    paper_bgcolor: 'transparent',
                    showlegend: false,
                    font: { family: "Inter, sans-serif" },
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="text-xs text-success/80 font-medium mb-1">Eligible</div>
                  <div className="text-3xl font-bold text-success">{stats.eligible}</div>
                  <div className="text-xs text-success/60 mt-1">{stats.eligiblePercent}% of total</div>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="text-xs text-destructive/80 font-medium mb-1">Not Eligible</div>
                  <div className="text-3xl font-bold text-destructive">{stats.notEligible}</div>
                  <div className="text-xs text-destructive/60 mt-1">{stats.notEligiblePercent}% of total</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
