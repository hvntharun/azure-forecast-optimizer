import { motion } from "framer-motion";
import { Upload, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { mockHistoricalData } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";
import Plot from "react-plotly.js";

export default function DataManagement() {
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        toast.success("Data uploaded successfully!", {
          description: `${file.name} processed with ${mockHistoricalData.length} records`,
        });
      }, 2000);
    }
  };

  const filteredData = mockHistoricalData.filter(
    d =>
      d.meterSubCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.date.includes(searchTerm)
  );

  const getEligibilityBadge = (category: string, cost: number) => {
    if (cost >= 20000) {
      return (
        <Badge className="bg-success/10 text-success border border-success/20 font-medium px-3 py-1">
          Eligible &gt;€20K
        </Badge>
      );
    } else if (cost >= 12000) {
      return (
        <Badge className="bg-success/10 text-success border border-success/20 font-medium px-3 py-1">
          Eligible &gt;€12K
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-muted text-muted-foreground border border-border font-medium px-3 py-1">
          Review Needed
        </Badge>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground mt-1">Upload and analyze Azure cost data</p>
      </div>

      {/* Upload Section */}
      <Card style={{ boxShadow: 'var(--shadow-md)' }}>
        <CardHeader>
          <CardTitle>Upload CSV Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-2 border-dashed border-primary/40 rounded-2xl p-16 text-center hover:border-primary transition-all duration-300 hover:bg-primary/5 group">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>
                <Upload className="relative h-16 w-16 mx-auto text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Drag & drop your CSV file here
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                or click to browse • Supports .csv files up to 50MB
              </p>
              <Button
                className="btn-hover bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 font-medium px-8"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? "Processing..." : "Upload & Analyze"}
              </Button>
            </label>
          </div>
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing data...</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card style={{ boxShadow: 'var(--shadow-md)' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historical Data</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Table className="table-zebra">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Meter Category</TableHead>
                  <TableHead className="text-right font-semibold">Quantity</TableHead>
                  <TableHead className="text-right font-semibold">Total Cost</TableHead>
                  <TableHead className="font-semibold">Eligibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 10).map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold">{row.date}</TableCell>
                    <TableCell className="font-medium">{row.meterSubCategory}</TableCell>
                    <TableCell className="text-right font-medium">{row.totalQuantity}</TableCell>
                    <TableCell className="text-right text-primary font-bold text-base">
                      €{row.totalCost.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getEligibilityBadge(row.meterSubCategory, row.totalCost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing 10 of {filteredData.length} records</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                x: mockHistoricalData.filter(d => d.meterSubCategory === 'DSv5 Series').map(d => d.date),
                y: mockHistoricalData.filter(d => d.meterSubCategory === 'DSv5 Series').map(d => d.totalCost),
                name: 'DSv5 Series',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#000099', width: 3 },
              },
              {
                x: mockHistoricalData.filter(d => d.meterSubCategory === 'BSv5 Series').map(d => d.date),
                y: mockHistoricalData.filter(d => d.meterSubCategory === 'BSv5 Series').map(d => d.totalCost),
                name: 'BSv5 Series',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#FF0000', width: 3 },
              },
            ]}
            layout={{
              height: 300,
              margin: { l: 60, r: 40, t: 20, b: 60 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              xaxis: { showgrid: false, color: '#888', title: 'Date' },
              yaxis: { showgrid: true, gridcolor: '#333', color: '#888', title: 'Cost (€)' },
              legend: { x: 0, y: 1.1, orientation: 'h' },
            }}
            config={{ displayModeBar: true }}
            className="w-full"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
