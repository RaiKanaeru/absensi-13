'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { attendanceAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';

const attendanceStatuses = ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Dispen'] as const;

type AttendanceStatus = typeof attendanceStatuses[number];

type StudentRow = { id: number; nis: string; full_name: string; gender: 'L'|'P'; status?: AttendanceStatus | null };

type ScheduleInfo = { id: number; class_id: number; subject_id: number; class_name?: string; subject_name?: string };

function AttendanceClient() {
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('schedule_id');
  const { toast } = useToast();

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!scheduleId) return;
    setLoading(true);
    attendanceAPI.getScheduleAttendance(scheduleId, date)
      .then((res) => {
        const data = res.data?.data;
        setSchedule(data?.schedule || null);
        setStudents((data?.students || []).map((s: any) => ({
          id: s.id,
          nis: s.nis,
          full_name: s.full_name,
          gender: s.gender,
          status: s.status || 'Hadir',
        })));
      })
      .catch(() => {
        toast({ title: 'Gagal memuat data absensi', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [scheduleId, date, toast]);

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  };

  const markAllPresent = () => setStudents((prev) => prev.map((s) => ({ ...s, status: 'Hadir' })));

  const handleSave = async () => {
    if (!scheduleId) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({ student_id: s.id, status: (s.status || 'Hadir') as AttendanceStatus }));
      await attendanceAPI.record({ schedule_id: scheduleId, attendance_date: date, records: records as any });
      toast({ title: 'Absensi berhasil disimpan' });
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan absensi', description: e.response?.data?.message || e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getRowClass = (status?: AttendanceStatus | null) => {
    switch (status) {
      case 'Hadir':
        return 'bg-blue-50';
      case 'Alpa':
        return 'bg-red-50';
      case 'Sakit':
        return 'bg-yellow-50';
      case 'Izin':
        return 'bg-slate-50';
      case 'Dispen':
        return 'bg-emerald-50';
      default:
        return 'hover:bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Absensi: {schedule?.class_name || '-'}</h1>
          <p className="text-slate-500">Tanggal {new Date(date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>Tandai Semua Hadir</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Absensi'}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead className="text-center w-[400px]">Status Kehadiran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24 text-slate-500">Memuat...</TableCell>
                </TableRow>
              )}
              {!loading && students.map((student) => (
                <TableRow key={student.id} className={cn('border-b transition-colors', getRowClass(student.status))}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name)}`} alt={student.full_name} />
                        <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-slate-800">{student.full_name} <span className="text-xs text-slate-500 ml-2">({student.nis})</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RadioGroup value={student.status || 'Hadir'} onValueChange={(v) => setStatus(student.id, v as AttendanceStatus)} className="flex justify-center gap-2 md:gap-4 flex-wrap">
                      {attendanceStatuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <RadioGroupItem value={status} id={`${student.id}-${status}`} />
                          <Label htmlFor={`${student.id}-${status}`}>{status}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="text-center p-6">Memuat...</div>}>
      <AttendanceClient />
    </Suspense>
  );
}
