import { motion } from "framer-motion";
import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { mockReservations } from "@/lib/mockData";
import { generateReservationCSV } from "@/lib/mockApi";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Reservations() {
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<any>(null);
  const [discount, setDiscount] = useState(32);

  const handleGenerate = async (reservation: any) => {
    setCurrentReservation(reservation);
    setShowModal(true);
  };

  const handleDownload = async () => {
    const csv = await generateReservationCSV(currentReservation);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservation_${currentReservation.group}.csv`;
    a.click();
    toast.success("Reservation CSV downloaded");
    setShowModal(false);
  };

  const handleGenerateAll = () => {
    const selectedReservations = mockReservations.filter((_, idx) =>
      selected.includes(idx)
    );
    if (selectedReservations.length === 0) {
      toast.error("Please select at least one reservation");
      return;
    }
    toast.success(`Generated ${selectedReservations.length} reservation CSVs`);
  };

  const toggleSelection = (idx: number) => {
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const calculatedSavings = currentReservation
    ? (currentReservation.projected * discount) / 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage Azure reservation recommendations
          </p>
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={selected.length === 0}
          className="bg-accent hover:bg-accent/90"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Selected ({selected.length})
        </Button>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eligible Meter Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selected.length === mockReservations.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelected(mockReservations.map((_, idx) => idx));
                        } else {
                          setSelected([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Meter Group</TableHead>
                  <TableHead>Eligibility Reason</TableHead>
                  <TableHead className="text-right">Projected Cost</TableHead>
                  <TableHead className="text-right">Rec. Hours</TableHead>
                  <TableHead className="text-right">Est. Savings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReservations.map((res, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(idx)}
                        onCheckedChange={() => toggleSelection(idx)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{res.group}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">
                        {res.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-primary font-semibold">
                      €{res.projected.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {res.hours.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-success font-semibold">
                      {res.savings}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => handleGenerate(res)}
                      >
                        Generate CSV
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <FileDown className="h-4 w-4" />
                  <span>DSv5 Series - Generated 2025-10-01</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-7">
                  <p className="text-sm">
                    <strong>File:</strong> reservation_DSv5_Series.csv
                  </p>
                  <p className="text-sm">
                    <strong>Savings:</strong> €4,800 (32%)
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Again
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <FileDown className="h-4 w-4" />
                  <span>BSv5 Series - Generated 2025-09-28</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-7">
                  <p className="text-sm">
                    <strong>File:</strong> reservation_BSv5_Series.csv
                  </p>
                  <p className="text-sm">
                    <strong>Savings:</strong> €5,600 (28%)
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Again
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <pre>
                {currentReservation &&
                  `Resource,ForecastedQty,Term,Savings\n${currentReservation.group},${currentReservation.hours},1Y,${currentReservation.savings}%`}
              </pre>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Discount Percentage (%)
                </label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>

              <div className="p-4 bg-success/10 border border-success rounded-lg">
                <p className="text-sm text-success font-semibold">
                  Estimated Savings: €{calculatedSavings.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
