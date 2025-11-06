import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, BarChart3, TrendingUp, Calendar } from "lucide-react";

interface DataSummaryCardProps {
  dataSummary: {
    totalDataPoints: number;
    dateRange: string;
    averageUsage: number;
    maxUsage: number;
    minUsage: number;
  };
}

export function DataSummaryCard({ dataSummary }: DataSummaryCardProps) {
  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-info" />
          <CardTitle className="text-lg">Data Summary</CardTitle>
        </div>
        <Badge className="bg-info/10 text-info border-info/20 w-fit">
          Historical Data
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Data Points */}
        <div className="text-center p-3 rounded-lg bg-info/10 border border-info/20">
          <BarChart3 className="h-6 w-6 text-info mx-auto mb-2" />
          <div className="text-2xl font-bold text-info">{dataSummary.totalDataPoints}</div>
          <div className="text-xs text-info/80 mt-1">Total Records</div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range</span>
          </div>
          <div className="p-2 rounded-lg bg-muted/10 border border-muted/20">
            <p className="text-xs font-medium text-muted-foreground text-center">{dataSummary.dateRange}</p>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Usage Statistics</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-success/10 border border-success/20">
              <div className="text-xs text-success/80 font-medium mb-1">Avg</div>
              <div className="text-sm font-bold text-success">{dataSummary.averageUsage.toFixed(1)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-xs text-destructive/80 font-medium mb-1">Max</div>
              <div className="text-sm font-bold text-destructive">{dataSummary.maxUsage.toFixed(1)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
              <div className="text-xs text-warning/80 font-medium mb-1">Min</div>
              <div className="text-sm font-bold text-warning">{dataSummary.minUsage.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
