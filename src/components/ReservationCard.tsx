import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CalendarDays, TrendingUp } from "lucide-react";

interface ReservationCardProps {
  reservationData: {
    next_reservation_start: string;
    next_reservation_end: string;
    reservation_duration_days: number;
    reservation_period: string;
  };
}

export function ReservationCard({ reservationData }: ReservationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-success" />
          <CardTitle className="text-lg">Reservation Details</CardTitle>
        </div>
        <Badge className="bg-success/10 text-success border-success/20 w-fit">
          Active Reservation
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Duration */}
        <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
          <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{reservationData.reservation_duration_days}</div>
          <div className="text-xs text-primary/80 mt-1">Total Days</div>
        </div>
        
        {/* Date Range */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Reservation Period</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-success/10 border border-success/20">
              <div className="text-xs text-success/80 font-medium mb-1">Start</div>
              <div className="text-xs font-bold text-success">{formatDate(reservationData.next_reservation_start)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-xs text-destructive/80 font-medium mb-1">End</div>
              <div className="text-xs font-bold text-destructive">{formatDate(reservationData.next_reservation_end)}</div>
            </div>
          </div>
        </div>

        {/* Full Period */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {reservationData.reservation_period}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
