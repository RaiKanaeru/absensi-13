'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { classesAPI, reportsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';

export default function ReportsPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    classesAPI.list().then((res) => setClasses(res.data?.data || [])).catch(() => setClasses([]));
  }, []);

  const applyFilter = async () => {
    if (!selectedClass) {
      toast({ title: 'Pilih kelas terlebih dahulu', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await reportsAPI.classReport(selectedClass, month, year);
      setReport(res.data?.data || null);
    } catch (e: any) {
      toast({ title: 'Gagal memuat laporan', description: e.response?.data?.message || e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedClass) return;
    const url = reportsAPI.exportExcelUrl(selectedClass, month, year);
    // Sertakan token di header tidak bisa lewat link, jadi gunakan fetch blob
    const token = auth.token;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(async (res) => {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rekap_absensi_kelas_${selectedClass}_${month}_${year}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(() => toast({ title: 'Gagal mengunduh laporan', variant: 'destructive' }));
  };

  return (
    <Tabs defaultValue="reports" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reports">Laporan Absensi</TabsTrigger>
      </TabsList>
      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.class_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={applyFilter} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan Filter'}</Button>
            <Button className="gap-1" onClick={handleDownload} disabled={!report}>
              <Download className="h-4 w-4" />
              Download Laporan (Excel)
            </Button>
          </CardContent>
        </Card>

        {report && (
          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi Kelas {report.class.class_name} - {month}/{year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">Nama</th>
                      <th className="p-2">L/P</th>
                      <th className="p-2">S</th>
                      <th className="p-2">I</th>
                      <th className="p-2">A</th>
                      <th className="p-2">D</th>
                      <th className="p-2">Tidak Hadir (%)</th>
                      <th className="p-2">Hadir (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.students.map((s: any) => (
                      <tr key={s.id} className="border-b">
                        <td className="p-2 text-left">{s.full_name}</td>
                        <td className="p-2 text-center">{s.gender}</td>
                        <td className="p-2 text-center">{s.sakit}</td>
                        <td className="p-2 text-center">{s.izin}</td>
                        <td className="p-2 text-center">{s.alpa}</td>
                        <td className="p-2 text-center">{s.dispen}</td>
                        <td className="p-2 text-center">{s.persentase_tidak_hadir}%</td>
                        <td className="p-2 text-center">{s.persentase_hadir}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
