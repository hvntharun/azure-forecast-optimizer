import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, BarChart3 } from "lucide-react";

interface ModelInfoCardProps {
  modelData: {
    meter_group: string;
    best_model: string;
    model_type: string;
    validation_rmse: number;
    validation_mae: number;
    validation_mape: number;
  };
}

export function ModelInfoCard({ modelData }: ModelInfoCardProps) {
  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Model Information</CardTitle>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 w-fit">
          {modelData.model_type}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Model Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-xl font-bold text-primary">{modelData.best_model}</div>
            <div className="text-xs text-primary/80 mt-1">Best Model</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/10 border border-muted/20">
            <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm font-semibold">{modelData.model_type}</div>
            <div className="text-xs text-muted-foreground/80 mt-1">Type</div>
          </div>
        </div>
        
        {/* Validation Metrics */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Validation Metrics</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-xs text-destructive/80 font-medium mb-1">RMSE</div>
              <div className="text-lg font-bold text-destructive">{modelData.validation_rmse.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
              <div className="text-xs text-warning/80 font-medium mb-1">MAE</div>
              <div className="text-lg font-bold text-warning">{modelData.validation_mae.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-info/10 border border-info/20">
              <div className="text-xs text-info/80 font-medium mb-1">MAPE</div>
              <div className="text-lg font-bold text-info">{modelData.validation_mape.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
