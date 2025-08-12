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
import { historicalAttendance } from '@/lib/data';
import type { AttendanceStatus } from '@/lib/definitions';

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
