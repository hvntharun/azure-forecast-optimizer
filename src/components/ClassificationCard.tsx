import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Eye, 
  EyeOff,
  BarChart3,
  Filter,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Plot from 'react-plotly.js';
import { 
  loadEligibilityData, 
  getSeriesFromData, 
  calculateSeriesStats,
  filterDataBySeries,
  EligibilityData,
  SeriesStats 
} from '@/lib/eligibilityDataLoader';
import { ClassificationCategory, ClassificationType } from '@/lib/classificationData';

interface ClassificationCardProps {
  card: {
    id: ClassificationType;
    title: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    eligibilityStatus: 'eligible' | 'not-eligible' | 'conditional';
  };
  category: ClassificationCategory;
  onView: (cardId: ClassificationType, service: string) => void;
  isSelected: boolean;
  onClick: () => void;
  onSeriesSelectionChange?: (cardId: ClassificationType, selectedSeries: string[]) => void;
  initialSelectedSeries?: string[];
}

export const ClassificationCard: React.FC<ClassificationCardProps> = ({
  card,
  category,
  onView,
  isSelected,
  onClick,
  onSeriesSelectionChange,
  initialSelectedSeries,
}) => {
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [seriesStats, setSeriesStats] = useState<SeriesStats[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [allSeries, setAllSeries] = useState<string[]>([]);
  const [showSeriesFilter, setShowSeriesFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts or card changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadEligibilityData(card.id);
        setEligibilityData(data);
        
        const stats = calculateSeriesStats(data);
        setSeriesStats(stats);
        
        const visibleSeries = stats.filter(stat => stat.isVisible).map(stat => stat.name);
        const initial = initialSelectedSeries && initialSelectedSeries.length > 0
          ? initialSelectedSeries.filter(s => visibleSeries.includes(s))
          : visibleSeries;
        setSelectedSeries(initial);
        setAllSeries(getSeriesFromData(data));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading eligibility data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [card.id, initialSelectedSeries]);

  // Notify parent component of series selection changes
  useEffect(() => {
    if (onSeriesSelectionChange) {
      onSeriesSelectionChange(card.id, selectedSeries);
    }
  }, [selectedSeries, card.id, onSeriesSelectionChange]);

  const handleSeriesToggle = (seriesName: string, checked: boolean) => {
    setSelectedSeries(prev => 
      checked 
        ? [...prev, seriesName]
        : prev.filter(name => name !== seriesName)
    );
  };

  const handleSelectAllSeries = () => {
    const allSeries = seriesStats.map(stat => stat.name);
    setSelectedSeries(allSeries);
  };

  const handleDeselectAllSeries = () => {
    setSelectedSeries([]);
  };

  const getFilteredPlotData = () => {
    if (!eligibilityData) return [];
    const filtered = filterDataBySeries(eligibilityData, selectedSeries);
    return filtered.data;
  };

  const getTotalCost = () => {
    return seriesStats
      .filter(stat => selectedSeries.includes(stat.name))
      .reduce((sum, stat) => sum + stat.totalCost, 0);
  };

  const getAverageCost = () => {
    const filteredStats = seriesStats.filter(stat => selectedSeries.includes(stat.name));
    if (filteredStats.length === 0) return 0;
    
    const totalCost = filteredStats.reduce((sum, stat) => sum + stat.totalCost, 0);
    const totalDataPoints = filteredStats.reduce((sum, stat) => sum + stat.dataPoints, 0);
    
    return totalDataPoints > 0 ? totalCost / totalDataPoints : 0;
  };

  const CardIcon = card.icon;

  if (loading) {
    return (
      <Card className="min-h-[420px] border border-border bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading {card.title}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[420px] border border-destructive/20 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm text-destructive">Failed to load data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={`min-h-[420px] cursor-pointer transition-all duration-300 border ${
          isSelected 
            ? `border-2 ${card.color.replace('text-', 'border-')} shadow-lg ring-2 ring-opacity-20` 
            : 'border-border hover:border-primary/30 hover:shadow-lg'
        } bg-card overflow-hidden group`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.bgColor} transition-all duration-300 group-hover:scale-110`}>
                <CardIcon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold leading-tight">{card.title}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`text-xs mt-1 ${
                    card.eligibilityStatus === 'eligible' 
                      ? 'border-success/20 text-success bg-success/10' 
                      : card.eligibilityStatus === 'not-eligible'
                      ? 'border-destructive/20 text-destructive bg-destructive/10'
                      : 'border-warning/20 text-warning bg-warning/10'
                  }`}
                >
                  {card.eligibilityStatus === 'eligible' 
                    ? 'Eligible' 
                    : card.eligibilityStatus === 'not-eligible'
                    ? 'Not Eligible'
                    : 'Conditional'
                  }
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowSeriesFilter(!showSeriesFilter);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4">
          {/* Series Filter Panel */}
          <AnimatePresence>
            {showSeriesFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg p-3 bg-muted/30 space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Series Filter</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllSeries();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeselectAllSeries();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      None
                    </Button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {allSeries.map((series) => (
                    <div key={series} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${card.id}-${series}`}
                        checked={selectedSeries.includes(series)}
                        onCheckedChange={(checked) => {
                          handleSeriesToggle(series, !!checked);
                        }}
                        className="h-3 w-3"
                      />
                      <label 
                        htmlFor={`${card.id}-${series}`}
                        className="text-xs truncate flex-1 cursor-pointer select-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {series}
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mini Chart */}
          <div className="h-32 -mx-2">
            <Plot
              data={getFilteredPlotData()}
              layout={{
                ...eligibilityData?.layout,
                height: 128,
                margin: { l: 40, r: 20, t: 20, b: 30 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { 
                  size: 9, 
                  family: "Inter, sans-serif",
                  color: 'hsl(var(--foreground))'
                },
                xaxis: {
                  ...eligibilityData?.layout.xaxis,
                  showgrid: false,
                  showticklabels: false,
                  zeroline: false,
                },
                yaxis: {
                  ...eligibilityData?.layout.yaxis,
                  showgrid: true,
                  gridcolor: 'rgba(148, 163, 184, 0.1)',
                  showticklabels: true,
                  tickfont: { size: 8 },
                  zeroline: false,
                },
                showlegend: false,
                hovermode: 'x unified',
              }}
              config={{ 
                displayModeBar: false, 
                responsive: true,
                staticPlot: false,
              }}
              className="w-full h-full"
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-success" />
                <span className="text-muted-foreground">Total Cost</span>
              </div>
              <p className="font-semibold text-foreground">
                €{getTotalCost().toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Avg Cost</span>
              </div>
              <p className="font-semibold text-foreground">
                €{getAverageCost().toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-accent-foreground" />
                <span className="text-muted-foreground">Series</span>
              </div>
              <p className="font-semibold text-foreground">
                {selectedSeries.length}/{seriesStats.length}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {getTotalCost() > getAverageCost() * seriesStats.length ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className="text-muted-foreground">Trend</span>
              </div>
              <p className="font-semibold text-foreground">
                {getTotalCost() > getAverageCost() * seriesStats.length ? 'Rising' : 'Declining'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onView(card.id, selectedSeries[0] || seriesStats[0]?.name || '');
            }}
            size="sm"
            className="w-full mt-3 h-8 text-xs group/btn"
            variant="outline"
          >
            <Eye className="h-3 w-3 mr-2" />
            View Details
            <ArrowRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
