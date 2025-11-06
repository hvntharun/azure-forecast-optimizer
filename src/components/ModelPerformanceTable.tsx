import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Award } from "lucide-react";
import { memo } from "react";

interface ModelPerformance {
  model: string;
  RMSE: number;
  MAE: number;
  MAPE: number;
}

interface ModelPerformanceTableProps {
  data: ModelPerformance[];
}

export const ModelPerformanceTable = memo(function ModelPerformanceTable({ data }: ModelPerformanceTableProps) {
  // Sort by RMSE (lower is better)
  const sortedData = [...data].sort((a, b) => a.RMSE - b.RMSE);
  
  // Find the best model (lowest RMSE)
  const bestModel = sortedData[0];

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Model Performance Comparison</CardTitle>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {data.length} Models
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Best Model Highlight */}
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-success" />
              <span className="text-sm font-semibold text-success">Best Performing Model</span>
            </div>
            <div className="text-lg font-bold text-success">{bestModel.model}</div>
            <div className="text-sm text-success/80">
              RMSE: {bestModel.RMSE.toFixed(2)} | MAE: {bestModel.MAE.toFixed(2)} | MAPE: {bestModel.MAPE.toFixed(2)}%
            </div>
          </div>

          {/* Performance Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold text-center">RMSE</TableHead>
                  <TableHead className="font-semibold text-center">MAE</TableHead>
                  <TableHead className="font-semibold text-center">MAPE (%)</TableHead>
                  <TableHead className="font-semibold text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((model, index) => {
                  const isBest = index === 0;
                  const rmseScore = model.RMSE <= 20 ? 'excellent' : model.RMSE <= 50 ? 'good' : model.RMSE <= 100 ? 'fair' : 'poor';
                  const mapeScore = model.MAPE <= 1 ? 'excellent' : model.MAPE <= 5 ? 'good' : model.MAPE <= 10 ? 'fair' : 'poor';
                  
                  return (
                    <TableRow key={model.model} className={isBest ? 'bg-success/5' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isBest ? (
                            <Award className="h-4 w-4 text-success" />
                          ) : (
                            <span className="text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {isBest ? (
                          <span className="text-success font-semibold">{model.model}</span>
                        ) : (
                          model.model
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${
                            rmseScore === 'excellent' ? 'bg-success/10 text-success border-success/20' :
                            rmseScore === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            rmseScore === 'fair' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {model.RMSE.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${
                            rmseScore === 'excellent' ? 'bg-success/10 text-success border-success/20' :
                            rmseScore === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            rmseScore === 'fair' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {model.MAE.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${
                            mapeScore === 'excellent' ? 'bg-success/10 text-success border-success/20' :
                            mapeScore === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            mapeScore === 'fair' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {model.MAPE.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {rmseScore === 'poor' ? (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          ) : (
                            <TrendingUp className={`h-4 w-4 ${
                              rmseScore === 'excellent' ? 'text-success' :
                              rmseScore === 'good' ? 'text-blue-600' :
                              rmseScore === 'fair' ? 'text-warning' :
                              'text-destructive'
                            }`} />
                          )}
                          <span className={`text-xs font-medium ${
                            rmseScore === 'excellent' ? 'text-success' :
                            rmseScore === 'good' ? 'text-blue-600' :
                            rmseScore === 'fair' ? 'text-warning' :
                            'text-destructive'
                          }`}>
                            {rmseScore.charAt(0).toUpperCase() + rmseScore.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Performance Legend */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Fair</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>Poor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
