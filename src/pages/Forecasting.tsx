import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Plot from "react-plotly.js";
import { CategorySelector } from "@/components/CategorySelector";
import { ClassificationCard } from "@/components/ClassificationCard";
import {
  ClassificationCategory,
  ClassificationType,
  classificationCards,
  servicesByCategory,
  generateMockChartData,
  getEligibilityStats,
} from "@/lib/classificationData";

export default function Forecasting() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { category?: ClassificationCategory; cardId?: ClassificationType; service?: string } | null;

  const [selectedCategory, setSelectedCategory] = useState<ClassificationCategory>(state?.category || 'Analytics');
  const [highlightedCard, setHighlightedCard] = useState<ClassificationType | null>(state?.cardId || null);
  const [selectedService, setSelectedService] = useState<string>(state?.service || '');
  const [chartData, setChartData] = useState<any[]>([]);

  const services = servicesByCategory[selectedCategory];
  const stats = getEligibilityStats(selectedCategory);

  useEffect(() => {
    if (highlightedCard && selectedService) {
      const data = generateMockChartData(selectedService, highlightedCard);
      setChartData(data);
    }
  }, [highlightedCard, selectedService]);

  const handleCardView = (cardId: ClassificationType, service: string) => {
    setHighlightedCard(cardId);
    setSelectedService(service);
  };

  const handleCategoryChange = (category: ClassificationCategory) => {
    setSelectedCategory(category);
    // Reset to first card's first service when category changes
    const newServices = servicesByCategory[category];
    const firstCard = classificationCards[0];
    setHighlightedCard(firstCard.id);
    setSelectedService(newServices[firstCard.id][0] || '');
  };

  const currentCard = classificationCards.find(c => c.id === highlightedCard);
  const isEligible = highlightedCard === 'stable-high' || highlightedCard === 'high-spend';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/azure-vm')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Forecasting</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered cost predictions for {selectedService || 'selected service'}
        </p>
      </div>

      {/* Category Selector */}
      <CategorySelector selected={selectedCategory} onSelect={handleCategoryChange} />

      {/* Classification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {classificationCards.map((card) => (
          <ClassificationCard
            key={card.id}
            card={card}
            services={services[card.id]}
            category={selectedCategory}
            onView={handleCardView}
            selectedService={card.id === highlightedCard ? selectedService : undefined}
            isHighlighted={card.id === highlightedCard}
          />
        ))}
      </div>

      {/* Main Forecasting Chart */}
      <Card>
        <CardContent className="pt-6">
          {currentCard && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">
                {currentCard.shortLabel} - {selectedService}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentCard.fullLabel}
              </p>
            </div>
          )}

          <div className="relative h-[500px]">
            <Plot
              data={[
                {
                  x: chartData.map(d => d.month),
                  y: chartData.map(d => d.cost),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Historical',
                  line: {
                    color: currentCard?.color || 'hsl(264, 89%, 62%)',
                    width: 3,
                    shape: 'spline',
                  },
                  marker: {
                    size: 8,
                    color: currentCard?.color || 'hsl(264, 89%, 62%)',
                  },
                  hovertemplate: '<b>%{x}</b><br>€%{y:,.0f}<extra></extra>',
                },
                // Forecast data (sample - last 3 months extended)
                ...(isEligible && chartData.length > 0 ? [{
                  x: ['Oct 2025', 'Nov 2025', 'Dec 2025'],
                  y: [
                    chartData[chartData.length - 1].cost * 1.02,
                    chartData[chartData.length - 1].cost * 1.04,
                    chartData[chartData.length - 1].cost * 1.06,
                  ],
                  type: 'scatter' as const,
                  mode: 'lines+markers' as const,
                  name: 'Forecast',
                  line: {
                    color: 'hsl(160, 84%, 45%)',
                    width: 3,
                    dash: 'dash',
                    shape: 'spline' as const,
                  },
                  marker: {
                    size: 8,
                    color: 'hsl(160, 84%, 45%)',
                    symbol: 'diamond',
                  },
                  hovertemplate: '<b>%{x}</b><br>€%{y:,.0f} (forecast)<extra></extra>',
                }] : []),
              ]}
              layout={{
                height: 500,
                margin: { l: 70, r: 40, t: 20, b: 60 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: "Inter, sans-serif" },
                xaxis: {
                  showgrid: false,
                  color: 'hsl(240, 4%, 46%)',
                  title: 'Month',
                  titlefont: { size: 14 },
                },
                yaxis: {
                  showgrid: true,
                  gridcolor: 'hsl(240, 6%, 92%)',
                  gridwidth: 1,
                  color: 'hsl(240, 4%, 46%)',
                  title: 'Cost (€)',
                  titlefont: { size: 14 },
                  tickprefix: '€',
                  tickformat: ',.0f',
                },
                legend: { 
                  x: 0, 
                  y: 1.1, 
                  orientation: 'h',
                  bgcolor: 'transparent',
                },
                hovermode: 'x unified',
              }}
              config={{ displayModeBar: true, displaylogo: false }}
              className="w-full"
            />
          </div>

          {!isEligible && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="font-semibold text-destructive">Not Eligible for Forecasting</p>
              <p className="text-sm text-muted-foreground mt-1">
                This classification does not meet the criteria for cost forecasting. Consider services in "Stable High Spend" or "High Spend" categories.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Eligibility Breakdown - {selectedCategory}</h3>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="relative h-[300px]">
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
                      size: 11, 
                      color: '#fff',
                      weight: 600,
                      family: "Inter, sans-serif"
                    },
                    hovertemplate: '<b>%{label}</b><br>%{value} services (%{percent})<extra></extra>',
                    hole: 0.45,
                  },
                ]}
                layout={{
                  height: 300,
                  margin: { l: 10, r: 10, t: 10, b: 10 },
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
