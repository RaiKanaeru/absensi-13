'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PredictiveAlertCard } from '@/components/predictive-alert-card';
import { historicalAttendance, classes } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';


const reportData = historicalAttendance.reduce((acc, curr) => {
  const date = new Date(curr.sessionId.split('-')[2]).toLocaleDateString('en-CA');
  const existing = acc.find(item => item.date === date);
  if (existing) {
    existing[curr.status] = (existing[curr.status] || 0) + 1;
  } else {
    acc.push({ date, Hadir: 0, Izin: 0, Sakit: 0, Alfa: 0, [curr.status]: 1 });
  }
  return acc;
}, [] as Array<{ date: string; Hadir: number; Izin: number; Sakit: number; Alfa: number }>).slice(0, 7).reverse();

const months = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export default function ReportsPage() {
  return (
    <Tabs defaultValue="reports" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reports">Laporan Absensi</TabsTrigger>
        <TabsTrigger value="predictive">Peringatan Prediktif (AI)</TabsTrigger>
      </TabsList>
      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button>Terapkan Filter</Button>
             <Button className="gap-1">
              <Download className="h-4 w-4" />
              Download Laporan (Excel)
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Kehadiran Mingguan</CardTitle>
            <CardDescription>
              Visualisasi data kehadiran selama 7 hari terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={reportData}>
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
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar dataKey="Hadir" fill="hsl(var(--primary))" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Izin" fill="hsl(var(--accent))" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sakit" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Alfa" fill="hsl(var(--destructive))" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="predictive" className="space-y-4">
        <PredictiveAlertCard />
      </TabsContent>
    </Tabs>
  );
}
