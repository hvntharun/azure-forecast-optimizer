import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Plot from "react-plotly.js";
import { ClassificationCard as CardType, ClassificationType, ClassificationCategory, generateMockChartData } from "@/lib/classificationData";

interface ClassificationCardProps {
  card: CardType;
  services: string[];
  category: ClassificationCategory;
  onView: (cardId: ClassificationType, service: string) => void;
  selectedService?: string;
  isHighlighted?: boolean;
}

export function ClassificationCard({ 
  card, 
  services, 
  category,
  onView, 
  selectedService,
  isHighlighted = false 
}: ClassificationCardProps) {
  const [service, setService] = useState(selectedService || services[0] || '');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (service) {
      const data = generateMockChartData(service, card.id);
      setChartData(data);
    }
  }, [service, card.id]);

  useEffect(() => {
    if (selectedService && services.includes(selectedService)) {
      setService(selectedService);
    } else if (services.length > 0) {
      setService(services[0]);
    }
  }, [selectedService, services]);

  const isEligible = card.id === 'stable-high' || card.id === 'high-spend';

  return (
    <Card className={`card-hover ${isHighlighted ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-lg cursor-help">{card.shortLabel}</CardTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{card.fullLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-auto h-8 px-2">
              {service && <span className="text-xs">{service}</span>}
            </SelectTrigger>
            <SelectContent className="glass-effect max-h-[300px] bg-background z-50">
              <SelectItem value="All MeterGroups">All MeterGroups</SelectItem>
              {services.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge className={`${card.badgeClass} border font-semibold mt-2 w-fit`}>
          {isEligible ? 'Eligible' : 'Not Eligible'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Mini Chart */}
        <div className="h-[120px] -mx-2">
          <Plot
            data={[
              {
                x: chartData.map(d => d.month),
                y: chartData.map(d => d.cost),
                type: 'scatter',
                mode: 'lines',
                fill: 'tozeroy',
                fillcolor: `${card.color}20`,
                line: {
                  color: card.color,
                  width: 2,
                  shape: 'spline',
                },
                hovertemplate: '<b>%{x}</b><br>€%{y:,.0f}<extra></extra>',
              },
            ]}
            layout={{
              height: 120,
              margin: { l: 45, r: 10, t: 5, b: 30 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { family: "Inter, sans-serif", size: 10 },
              xaxis: {
                showgrid: false,
                color: 'hsl(240, 4%, 46%)',
                tickfont: { size: 9 },
                tickangle: -45,
              },
              yaxis: {
                showgrid: true,
                gridcolor: 'hsl(240, 6%, 92%)',
                gridwidth: 1,
                color: 'hsl(240, 4%, 46%)',
                tickfont: { size: 9 },
                tickprefix: '€',
                tickformat: ',.0f',
              },
              hovermode: 'x unified',
            }}
            config={{ displayModeBar: false, responsive: true }}
            className="w-full"
          />
        </div>

        {/* View Button */}
        <Button
          onClick={() => onView(card.id, service)}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium"
          size="sm"
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
}
