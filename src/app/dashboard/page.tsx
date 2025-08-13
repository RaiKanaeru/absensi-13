'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookCopy, Activity, ClipboardCheck } from 'lucide-react';
import { attendanceAPI, classesAPI } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function DashboardPage() {
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.user;
    if (u?.role === 'teacher') {
      attendanceAPI.teacherToday(u.id)
        .then((res) => setTodaySchedules(res.data?.data || []))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang!</h1>
        <p className="text-slate-500">Ringkasan aktivitas hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">Sesi Hari Ini</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{todaySchedules.length}</div>
            <p className="text-xs text-slate-500">Sesi yang perlu diisi absensinya</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Sesi Absensi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Kelas</TableHead>
                <TableHead className="font-semibold">Mata Pelajaran</TableHead>
                <TableHead className="font-semibold">Waktu</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-slate-500">Memuat...</TableCell>
                </TableRow>
              )}
              {!loading && todaySchedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.class_name}</TableCell>
                  <TableCell>{s.subject_name}</TableCell>
                  <TableCell>{s.start_time} - {s.end_time}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/attendance?schedule_id=${s.id}`}>
                      <Button variant="outline" size="sm">Isi Absensi</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && todaySchedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-slate-500">Tidak ada sesi absensi hari ini.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
