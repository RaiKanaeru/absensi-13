"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

const chartData = [
  { date: "2023-10-01", Hadir: 20, Izin: 2, Sakit: 1, Alpa: 0 },
  { date: "2023-10-02", Hadir: 22, Izin: 1, Sakit: 0, Alpa: 0 },
  { date: "2023-10-03", Hadir: 19, Izin: 0, Sakit: 2, Alpa: 2 },
  { date: "2023-10-04", Hadir: 23, Izin: 0, Sakit: 0, Alpa: 0 },
  { date: "2023-10-05", Hadir: 21, Izin: 1, Sakit: 1, Alpa: 0 },
  { date: "2023-10-06", Hadir: 20, Izin: 2, Sakit: 0, Alpa: 1 },
  { date: "2023-10-07", Hadir: 22, Izin: 0, Sakit: 1, Alpa: 0 },
];

const months = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan Absensi</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select defaultValue="1">
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Kelas 10A</SelectItem>
              <SelectItem value="2">Kelas 10B</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="10">
            <SelectTrigger>
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>Terapkan Filter</Button>
          <Button className="gap-1" variant="outline">
            <Download className="h-4 w-4" />
            Download Laporan (Excel)
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kehadiran Mingguan</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey="Hadir"
                fill="hsl(var(--primary))"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Izin"
                fill="hsl(var(--accent))"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="Sakit" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Alpa"
                fill="hsl(var(--destructive))"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
