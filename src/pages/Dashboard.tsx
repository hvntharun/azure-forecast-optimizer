import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Loader2,
  Database,
  Activity,
  Brain,
  FileText,
  PieChart,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";
import { CategorySelector } from "@/components/CategorySelector";
import { ClassificationCard } from "@/components/ClassificationCard";
import { useEligibility as useEligibilityCtx } from "../contexts/EligibilityContext";
import {
  ClassificationCategory,
  ClassificationType,
  classificationCards,
} from "@/lib/classificationData";
import {
  loadAllEligibilityData,
  getPieChartDataFromStats,
  calculateSeriesStats,
  getAggregatedStats,
  EligibilityData,
  SeriesStats,
  AggregatedStats
} from "@/lib/eligibilityDataLoader";

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

type LoadingStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
};

const getLoadingSteps = (modelName: string): LoadingStep[] => [
  {
    id: 1,
    title: 'Collecting VM Data',
    description: 'Gathering Azure VM usage and cost information...',
    icon: Database,
    duration: 1500,
  },
  {
    id: 2,
    title: 'Analyzing Spending Patterns',
    description: 'Evaluating cost trends and usage stability...',
    icon: Activity,
    duration: 1800,
  },
  {
    id: 3,
    title: 'Running ML Classification',
    description: `Processing with ${modelName} model...`,
    icon: Brain,
    duration: 2000,
  },
  {
    id: 4,
    title: 'Generating Reports',
    description: 'Creating visualizations and recommendations...',
    icon: FileText,
    duration: 1500,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<ClassificationType | null>(null);
  const [allEligibilityData, setAllEligibilityData] = useState<Record<ClassificationType, EligibilityData>>({} as Record<ClassificationType, EligibilityData>);
  const [cardSeriesSelections, setCardSeriesSelections] = useState<Record<ClassificationType, string[]>>({} as Record<ClassificationType, string[]>);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Inline date controls (shown in same row as model/category pills)
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  // refs to date inputs so chevron can trigger date picker
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  // Use global eligibility context
  const {
    state: { eligibilityChecked, selectedCategory, isLoading, currentStep },
    setEligibilityChecked,
    setSelectedCategory,
    setIsLoading,
    setCurrentStep,
    shouldShowResults,
    resetEligibilityState
  } = useEligibilityCtx();

  // Load all eligibility data when results should be shown
  useEffect(() => {
    if (shouldShowResults() && Object.keys(allEligibilityData).length === 0) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          // If you later want to pass startDate/endDate to the loader, modify loadAllEligibilityData accordingly
          const data = await loadAllEligibilityData();
          setAllEligibilityData(data);

          const stats = getAggregatedStats(data);
          setAggregatedStats(stats);

          // Initialize series selections for all cards
          const initialSelections: Record<ClassificationType, string[]> = {} as Record<ClassificationType, string[]>;
          Object.entries(data).forEach(([type, eligibilityData]) => {
            const cardType = type as ClassificationType;
            const seriesStats = calculateSeriesStats(eligibilityData);
            initialSelections[cardType] = seriesStats
              .filter(stat => stat.isVisible)
              .map(stat => stat.name);
          });
          setCardSeriesSelections(initialSelections);

        } catch (error) {
          console.error('Error loading eligibility data:', error);
        } finally {
          setDataLoading(false);
        }
      };

      loadData();
    }
  }, [shouldShowResults, allEligibilityData]);

  const handleRefresh = () => {
    setRefreshing(true);
    resetEligibilityState();
    setAllEligibilityData({} as Record<ClassificationType, EligibilityData>);
    setCardSeriesSelections({} as Record<ClassificationType, string[]>);
    setAggregatedStats(null);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Validate inputs and start analysis
  const handleCheckEligibility = () => {
    // reset errors
    setModelError(null);
    setDateError(null);

    let hasError = false;

    // model/category must be selected
    if (!selectedCategory) {
      setModelError('Please select a model.');
      hasError = true;
    }

    // both dates required
    if (!startDate || !endDate) {
      setDateError('Please select both start and end dates.');
      hasError = true;
    } else {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e < s) {
        setDateError('End date must be the same or after Start date.');
        hasError = true;
      }
    }

    if (hasError) {
      // don't start the loading sequence
      return;
    }

    // If validation passed, kick off the analysis
    setIsLoading(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isLoading) return;

    const steps = getLoadingSteps(selectedCategory);
    const stepIndex = currentStep;
    if (stepIndex >= steps.length) {
      setIsLoading(false);
      setEligibilityChecked(true);
      return;
    }

    const step = steps[stepIndex];
    const timer = setTimeout(() => {
      setCurrentStep(stepIndex + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [isLoading, currentStep, selectedCategory, setIsLoading, setCurrentStep, setEligibilityChecked]);

  const handleViewCard = (cardId: ClassificationType, service: string) => {
    navigate('/classification-detail', {
      state: {
        category: selectedCategory,
        cardId,
        service
      }
    });
  };

  // Handle series selection changes from cards
  const handleSeriesSelectionChange = (cardId: ClassificationType, selectedSeries: string[]) => {
    setCardSeriesSelections(prev => ({
      ...prev,
      [cardId]: selectedSeries
    }));
  };

  // Handle classification card click for filtering
  const handleCardClick = (cardId: ClassificationType) => {
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  // Get dynamic pie chart data based on current selections
  const getDynamicPieChartData = () => {
    if (!allEligibilityData || Object.keys(allEligibilityData).length === 0) {
      return {
        labels: [],
        values: [],
        colors: [],
        hoverData: []
      };
    }

    // If a specific card is selected, show that card's individual series distribution
    if (selectedCardId && allEligibilityData[selectedCardId]) {
      const eligibilityData = allEligibilityData[selectedCardId];
      const seriesStats = calculateSeriesStats(eligibilityData);
      const selectedSeries = cardSeriesSelections[selectedCardId] || [];

      return getPieChartDataFromStats(
        seriesStats,
        selectedSeries,
        seriesStats.map(() => {
          switch (selectedCardId) {
            case 'stable-high': return '#10B981'; // green
            case 'high-spend': return '#3B82F6'; // blue
            case 'unstable': return '#EF4444'; // red
            case 'low-spend': return '#F59E0B'; // amber
            default: return '#6B7280';
          }
        })
      );
    }

    // Aggregate by the four classification types (cards)
    const classificationOrder: ClassificationType[] = [
      'stable-high',
      'high-spend',
      'unstable',
      'low-spend'
    ];

    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];
    const hoverData: string[] = [];

    classificationOrder.forEach((type) => {
      const data = allEligibilityData[type];
      if (!data) return;
      const stats = calculateSeriesStats(data);
      const selectedSeries = cardSeriesSelections[type] || [];
      const filtered = selectedSeries.length > 0
        ? stats.filter(s => selectedSeries.includes(s.name))
        : stats.filter(s => s.isVisible);

      const totalCost = filtered.reduce((sum, s) => sum + s.totalCost, 0);
      const avgCost = filtered.length > 0 ? (totalCost / filtered.reduce((acc, s) => acc + s.dataPoints, 0)) : 0;

      labels.push(
        type === 'stable-high' ? 'Eligible - Stable High Spend'
          : type === 'high-spend' ? 'Eligible - High Spend Trending'
            : type === 'unstable' ? 'Not Eligible - Unstable Usage'
              : 'Not Eligible - Low Spend'
      );
      values.push(totalCost);
      colors.push(
        type === 'stable-high' ? '#10B981'
          : type === 'high-spend' ? '#3B82F6'
            : type === 'unstable' ? '#EF4444'
              : '#F59E0B'
      );
      hoverData.push(
        `Category: ${labels[labels.length - 1]}<br>` +
        `Series Count: ${filtered.length}<br>` +
        `Total Cost: €${totalCost.toLocaleString()}<br>` +
        `Avg Cost / Point: €${avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      );
    });

    return { labels, values, colors, hoverData };
  };

  const pieChartData = getDynamicPieChartData();

  // Reset selections when category changes
  useEffect(() => {
    setSelectedCardId(null);
    setAllEligibilityData({} as Record<ClassificationType, EligibilityData>);
    setCardSeriesSelections({} as Record<ClassificationType, string[]>);
    setAggregatedStats(null);
    // clear model error when user changes category
    setModelError(null);
  }, [selectedCategory]);

  const showResults = shouldShowResults() && !isLoading;
  const showPreEligibility = !showResults && !isLoading;

  // small helper to format date for display dd-mm-yyyy
  const formatDateDisplay = (isoDate: string | null) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // helper to open native picker when chevron clicked (showPicker supported in some browsers)
  const openDatePicker = (ref: HTMLInputElement | null) => {
    if (!ref) return;
    const anyRef = ref as any;
    if (typeof anyRef.showPicker === 'function') {
      try { anyRef.showPicker(); return; } catch { /* ignore */ }
    }
    ref.focus();
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 flex-1"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              Azure VMs Eligible for Reserved Instance Pricing
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-base text-muted-foreground">
                Azure cloud cost insights and forecasting
              </p>
              {showResults && aggregatedStats && (
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Analysis Complete
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <PieChart className="h-3 w-3 mr-1" />
                    {aggregatedStats.eligibilityRate.toFixed(1)}% Eligible
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    €{aggregatedStats.costSavingsPotential.toLocaleString()} Savings Potential
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="bg-background hover:bg-accent/50 border-border text-foreground rounded-lg px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ===== CATEGORY SELECTOR + INLINE DATES (keeps CategorySelector rendering intact) ===== */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between gap-4">
            {/* LEFT: render CategorySelector exactly as before (do not wrap it in another rounded pill) */}
            <div className="flex items-center">
              <CategorySelector selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            {/* RIGHT: inline date controls styled to match the pill row (sibling to selector) */}
            <div className="flex items-center">
              <div className="rounded-full bg-card/30 border border-border px-4 py-2 flex items-center gap-4 shadow-sm">
                {/* Start */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Start</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      ref={startRef}
                      id="startDate"
                      type="date"
                      value={startDate ?? ""}
                      onChange={(e) => {
                        setStartDate(e.target.value || null);
                        setDateError(null);
                      }}
                      className="pl-8 pr-8 py-1.5 rounded-md border border-transparent bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="Start date"
                    />
                    <button
                      type="button"
                      onClick={() => openDatePicker(startRef.current)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      aria-label="Open start date picker"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>
                  </div>
                </div>

                <div className="h-6 border-l border-border/40" />

                {/* End */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:inline">End</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      ref={endRef}
                      id="endDate"
                      type="date"
                      value={endDate ?? ""}
                      onChange={(e) => {
                        setEndDate(e.target.value || null);
                        setDateError(null);
                      }}
                      className="pl-8 pr-8 py-1.5 rounded-md border border-transparent bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label="End date"
                    />
                    <button
                      type="button"
                      onClick={() => openDatePicker(endRef.current)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      aria-label="Open end date picker"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>
                  </div>
                </div>

                {/* spacer */}
                <div className="w-2" />
              </div>
            </div>
          </div>

          {/* Inline errors */}
          <div className="mt-2 flex items-start gap-4">
            {modelError && <div className="text-xs text-destructive">{modelError}</div>}
            {dateError && <div className="text-xs text-destructive">{dateError}</div>}
          </div>
        </motion.div>
        {/* ===== END CATEGORY SELECTOR + INLINE DATES ===== */}

        {/* Loading steps (same as before) */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20"
              >
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-base font-semibold text-primary">Analyzing Your Azure VMs</span>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                This process typically takes a few seconds...
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getLoadingSteps(selectedCategory).map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep > index;
                const isCurrent = currentStep === index;
                const isPending = currentStep < index;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isCurrent ? 1.05 : 1
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`h-full transition-all duration-500 ${
                        isActive
                          ? 'bg-primary/5 border-primary/30 shadow-lg'
                          : isCurrent
                            ? 'bg-primary/10 border-primary/40 shadow-xl ring-2 ring-primary/20'
                            : 'bg-card/50 border-border/30 opacity-60'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`relative p-4 rounded-xl transition-all duration-500 ${
                            isActive
                              ? 'bg-primary/20'
                              : isCurrent
                                ? 'bg-primary/30 animate-pulse'
                                : 'bg-muted'
                          }`}>
                            {isPending ? (
                              <StepIcon className="h-6 w-6 text-muted-foreground" />
                            ) : isCurrent ? (
                              <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-6 w-6 text-success" />
                            )}
                            {isCurrent && (
                              <motion.div
                                className="absolute inset-0 rounded-xl border-2 border-primary"
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.1 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className={`font-semibold text-sm transition-colors ${
                              isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {step.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                          <div className="w-full">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  isActive ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-muted'
                                }`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: isActive ? '100%' : isCurrent ? '60%' : '0%'
                                }}
                                transition={{ duration: step.duration / 1000, ease: 'easeInOut' }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Pre-eligibility hero and model info (unchanged) */}
        {showPreEligibility && (
          <motion.div variants={item} className="space-y-10">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

              <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Cost Analysis</span>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Unlock Azure Cost Savings
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Discover which Azure VMs are eligible for Reserved Instance pricing. Our intelligent analysis identifies opportunities to optimize your cloud spending using advanced machine learning models.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button onClick={handleCheckEligibility} size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                    Check Eligibility Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* three cards (unchanged) */}
              <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Smart Classification</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">Automatically categorize VMs based on spending patterns, stability, and eligibility criteria using advanced ML algorithms.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Stable High</Badge>
                      <Badge variant="outline" className="text-xs">High Spend</Badge>
                      <Badge variant="outline" className="text-xs">Unstable</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <TrendingUp className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <CardTitle className="text-lg">Cost Forecasting</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">Get accurate predictions of future spending and identify optimal timing for Reserved Instance purchases with detailed forecasts.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span>ARIMA, Random Forest, XGBoost models</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                        <Shield className="h-5 w-5 text-success" />
                      </div>
                      <CardTitle className="text-lg">Savings Potential</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">Discover how much you can save with Reserved Instances. View detailed breakdowns and recommendations for each VM series.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span>Up to 72% savings with RI</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Model selection card (unchanged) */}
            <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Selected Analysis Model</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Choose from multiple machine learning models to analyze your Azure VM costs
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mt-4">
                    {selectedCategory === 'Analytics' && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">Analytics Model</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Comprehensive statistical analysis with trend detection</p>
                      </div>
                    )}
                    {['XGBoost', 'Random Forest', 'Decision Trees'].includes(selectedCategory) && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">{selectedCategory}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Supervised learning model for pattern recognition</p>
                      </div>
                    )}
                    {['KMeans', 'DBScan', 'Hierarchical'].includes(selectedCategory) && (
                      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-accent-foreground" />
                          <span className="font-semibold text-sm">{selectedCategory}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Unsupervised clustering for usage pattern discovery</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">What you'll get after analysis:</p>
                        <ul className="text-xs text-muted-foreground space-y-1.5 ml-4 list-disc">
                          <li>Eligibility classification for each VM series</li>
                          <li>Interactive charts and visualizations</li>
                          <li>Cost forecasting and savings projections</li>
                          <li>Reservation recommendations with timing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Results (unchanged) */}
        <AnimatePresence mode="wait">
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
              <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {classificationCards.map((card, index) => (
                    <motion.div key={card.id} variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 + (index * 0.05) }}>
                      <ClassificationCard card={card} category={selectedCategory} onView={handleViewCard} isSelected={selectedCardId === card.id} onClick={() => handleCardClick(card.id)} onSeriesSelectionChange={handleSeriesSelectionChange} />
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }} className="xl:col-span-1">
                  <Card className="h-full border border-border bg-card shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {selectedCardId ? 'Series Distribution' : 'Cost Distribution'}
                        </CardTitle>
                        {selectedCardId && <Button variant="ghost" size="sm" onClick={() => setSelectedCardId(null)} className="text-xs h-7">Clear Filter</Button>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedCardId ? `Series breakdown for ${classificationCards.find(c => c.id === selectedCardId)?.title}` : 'Interactive cost breakdown across all categories'}
                      </p>
                    </CardHeader>

                    <CardContent className="p-6 pt-0">
                      {dataLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Loading chart data...</p>
                          </div>
                        </div>
                      ) : pieChartData.labels.length > 0 ? (
                        <div className="space-y-4">
                          <div className="relative h-[280px] flex items-center justify-center">
                            <Plot
                              key={`dynamic-pie-${selectedCardId || 'all'}-${JSON.stringify(cardSeriesSelections)}`}
                              data={[
                                {
                                  labels: pieChartData.labels,
                                  values: pieChartData.values,
                                  type: 'pie',
                                  marker: {
                                    colors: pieChartData.colors,
                                    line: { color: 'hsl(var(--background))', width: 2 },
                                  },
                                  textinfo: 'label+percent',
                                  textposition: 'auto',
                                  textfont: {
                                    size: 10,
                                    color: 'hsl(var(--foreground))',
                                    family: "Inter, sans-serif"
                                  },
                                  hovertemplate: '<b>%{label}</b><br>' +
                                    'Cost: €%{value:,.0f}<br>' +
                                    '<i>%{percent}</i><br>' +
                                    '<extra></extra>',
                                  hole: 0.4,
                                },
                              ]}
                              layout={{
                                height: 280,
                                margin: { l: 10, r: 10, t: 10, b: 10 },
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                showlegend: false,
                                font: { family: "Inter, sans-serif" },
                                annotations: [{
                                  text: selectedCardId ? 'Series<br>Cost' : 'Total<br>Cost',
                                  x: 0.5,
                                  y: 0.5,
                                  font: { size: 12, color: 'hsl(var(--muted-foreground))' },
                                  showarrow: false,
                                }],
                              }}
                              config={{ displayModeBar: false, responsive: true }}
                              className="w-full"
                            />
                          </div>

                          <div className="max-h-32 overflow-y-auto space-y-2">
                            {pieChartData.labels.map((label, index) => (
                              <div key={label} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieChartData.colors[index] }} />
                                <span className="truncate flex-1">{label}</span>
                                <span className="font-medium text-muted-foreground">€{pieChartData.values[index]?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <PieChart className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">No data available for visualization</p>
                            <p className="text-xs text-muted-foreground">Try selecting different series or categories</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
