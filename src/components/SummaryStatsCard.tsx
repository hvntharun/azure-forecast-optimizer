import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sigma, Activity, Minimize, Maximize, BarChart3 } from 'lucide-react';

interface SummaryStatsCardProps {
  stats?: {
    Mean?: number;
    Median?: number;
    Min?: number;
    Max?: number;
    StdDev?: number;
    IQR?: number;
    CV?: number;
  };
}

export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  if (!stats) return null;
  const fmt = (v?: number) => (v === undefined || v === null ? '—' : v.toFixed(2));
  return (
    <Card className='card-hover h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <CardTitle className='text-lg'>Summary Stats</CardTitle>
        </div>
        <Badge className='bg-primary/10 text-primary border-primary/20 w-fit'>Distribution</Badge>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>Mean:</span> {fmt(stats.Mean)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>Median:</span> {fmt(stats.Median)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>Min:</span> {fmt(stats.Min)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>Max:</span> {fmt(stats.Max)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>Std Dev:</span> {fmt(stats.StdDev)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>IQR:</span> {fmt(stats.IQR)}</div>
          <div className='p-2 rounded-md bg-muted/40'><span className='font-medium'>CV:</span> {fmt(stats.CV)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
