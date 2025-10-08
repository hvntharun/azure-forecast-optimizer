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
      return <Badge className="bg-success">Eligible &gt;€20K</Badge>;
    } else if (cost >= 12000) {
      return <Badge className="bg-success">Eligible &gt;€12K</Badge>;
    } else {
      return <Badge variant="secondary">Review Needed</Badge>;
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
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-primary/50 rounded-xl p-12 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">
                Drag & drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload & Analyze"}
              </Button>
            </label>
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent animate-pulse w-3/4" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historical Data</CardTitle>
            <div className="flex gap-2">
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
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Meter Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Eligibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 10).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.meterSubCategory}</TableCell>
                    <TableCell className="text-right">{row.totalQuantity}</TableCell>
                    <TableCell className="text-right text-primary font-semibold">
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
