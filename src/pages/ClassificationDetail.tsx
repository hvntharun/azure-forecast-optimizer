import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import Plot from "react-plotly.js";
import {
  ClassificationCategory,
  ClassificationType,
  classificationCards,
  servicesByCategory,
} from "@/lib/classificationData";
import { 
  loadEligibilityData,
  getSeriesFromData,
  filterDataBySeries,
  EligibilityData
} from '@/lib/eligibilityDataLoader';

export default function ClassificationDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    category?: ClassificationCategory;
    cardId?: ClassificationType;
    service?: string;
  } | null;

  const category = state?.category || 'Analytics';
  const cardId = state?.cardId || 'stable-high';
  const initialService = state?.service || '';

  const card = classificationCards.find(c => c.id === cardId);
  const services = servicesByCategory[category][cardId] || [];
  const [selectedService, setSelectedService] = useState(
    initialService || services[0] || ''
  );
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [allSeries, setAllSeries] = useState<string[]>([]);

  // If no card found or invalid state, redirect back
  useEffect(() => {
    if (!card) {
      navigate('/dashboard/azure-vm');
    }
  }, [card, navigate]);

  // Replace previous chartData effect: load full JSON traces for this classification type
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const data = await loadEligibilityData(cardId);
      if (cancelled) return;
      setEligibilityData(data);
      setAllSeries(getSeriesFromData(data));
      // Initialize selected series: if initialService matches a trace name use that, else all visible
      if (initialService && data.data.some(t => t.name === initialService)) {
        setSelectedSeries([initialService]);
        setSelectedService(initialService);
      } else {
        const visible = data.data.filter(t => t.visible).map(t => t.name);
        setSelectedSeries(visible);
        setSelectedService('All MeterGroups');
      }
    };
    run();
    return () => { cancelled = true; };
  }, [cardId, initialService]);

  // Build plot traces based on selectedSeries (empty or 'All MeterGroups' shows all visible)
  const getPlotTraces = () => {
    if (!eligibilityData) return [];
    if (selectedService === 'All MeterGroups' || selectedSeries.length === 0) {
      return eligibilityData.data.filter(t => t.visible);
    }
    return eligibilityData.data.filter(t => selectedSeries.includes(t.name));
  };

  if (!card) {
    return null;
  }

  const isEligible = cardId === 'stable-high' || cardId === 'high-spend';

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/azure-vm')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Card with Chart - Matching Dashboard Card Pattern */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{card.shortLabel}</CardTitle>
                {/* Replace badgeClass (not in interface) with dynamic styling based on eligibilityStatus */}
                <Badge className={`text-xs border font-semibold mt-2 w-fit ${
                  card.eligibilityStatus === 'eligible'
                    ? 'border-success/20 text-success bg-success/10'
                    : card.eligibilityStatus === 'not-eligible'
                    ? 'border-destructive/20 text-destructive bg-destructive/10'
                    : 'border-warning/20 text-warning bg-warning/10'
                }`}>
                  {isEligible ? 'Eligible' : 'Not Eligible'}
                </Badge>
              </div>
              <Select value={selectedService} onValueChange={(val) => {
                setSelectedService(val);
                if (val === 'All MeterGroups') {
                  // show all visible traces
                  if (eligibilityData) {
                    setSelectedSeries(eligibilityData.data.filter(t => t.visible).map(t => t.name));
                  }
                } else {
                  setSelectedSeries([val]);
                }
              }}>
                <SelectTrigger className="w-auto h-8 px-2 text-xs min-w-[140px]">
                  <SelectValue placeholder="Select Series">
                    {selectedService || 'Select Series'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass-effect max-h-[300px] bg-background z-50">
                  {/* <SelectItem value="All MeterGroups">All MeterGroups</SelectItem> */}
                  {allSeries.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Large Chart Area - Detailed Area Chart Style */}
            <div className="h-[500px] -mx-2">
              <Plot
                data={getPlotTraces()}
                layout={{
                  ...(eligibilityData?.layout || {}),
                  height: 500,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, sans-serif', size: 12, color: 'hsl(var(--foreground))' },
                  xaxis: {
                    ...(eligibilityData?.layout.xaxis || {}),
                    showgrid: true,
                    gridcolor: 'rgba(255,255,255,0.05)',
                    zeroline: false,
                    color: 'hsl(var(--foreground))',
                    tickfont: { size: 11 }
                  },
                  yaxis: {
                    ...(eligibilityData?.layout.yaxis || {}),
                    showgrid: true,
                    gridcolor: 'rgba(255,255,255,0.08)',
                    zeroline: false,
                    color: 'hsl(var(--foreground))',
                    tickfont: { size: 11 }
                  },
                  showlegend: true,
                  legend: {
                    bgcolor: 'transparent',
                    font: { size: 11, color: 'hsl(var(--foreground))' }
                  },
                  hovermode: 'x unified',
                  margin: { l: 70, r: 40, t: 40, b: 60 }
                }}
                config={{
                  displayModeBar: true,
                  responsive: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['pan2d','lasso2d','select2d'],
                  toImageButtonOptions: { format: 'png', filename: `${cardId}-detail-chart`, height: 500, width: 900, scale: 2 }
                }}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/forecast', { 
                  state: { 
                    service: selectedService === 'All MeterGroups' ? undefined : selectedService,
                    cardId: cardId,
                    category: category,
                    autoGenerate: true
                  } 
                })}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium"
                size="sm"
              >
                Generate Forecast
              </Button>
              <Button
                onClick={() => navigate('/dashboard/azure-vm')}
                variant="outline"
                className="flex-1 font-medium"
                size="sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}

