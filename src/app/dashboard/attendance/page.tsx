'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { sessions, classes, students } from '@/lib/data';
import type {
  StudentWithAttendance,
  AttendanceStatus,
} from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const attendanceStatuses: AttendanceStatus[] = [
  'Hadir',
  'Izin',
  'Sakit',
  'Alfa',
];

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id') || sessions[0].id;
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return <div>Sesi tidak ditemukan</div>;
  }

  const sessionClass = classes.find((c) => c.id === session.classId);
  const classStudents: StudentWithAttendance[] = students
    .filter((s) => s.classId === session.classId)
    .map((s) => ({
      ...s,
      attendanceStatus: attendance[s.id] || 'Hadir',
    }));

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const allPresent = classStudents.reduce(
      (acc, student) => {
        acc[student.id] = 'Hadir';
        return acc;
      },
      {} as Record<string, AttendanceStatus>
    );
    setAttendance(allPresent);
  };

  const getRowClass = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return 'bg-blue-50';
      case 'Alfa':
        return 'bg-red-50';
      case 'Sakit':
        return 'bg-yellow-50';
      case 'Izin':
        return 'bg-slate-50';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const handleSubmit = () => {
    toast({
      title: 'Absensi Tersimpan',
      description: `Absensi untuk kelas ${
        sessionClass?.name
      } pada tanggal ${new Date(session.date).toLocaleDateString(
        'id-ID'
      )} telah berhasil disimpan.`,
      variant: 'default',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Absensi: {sessionClass?.name}
          </h1>
          <p className="text-slate-500">
            Sesi &quot;{session.topic}&quot; pada{' '}
            {new Date(session.date).toLocaleDateString('id-ID', {
              dateStyle: 'long',
            })}
            .
          </p>
        </div>
        <Button variant="outline" onClick={markAllPresent}>
          Tandai Semua Hadir
        </Button>
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
              {classStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className={cn(
                    'border-b transition-colors',
                    getRowClass(attendance[student.id])
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={student.avatar}
                          alt={student.name}
                          data-ai-hint="student avatar"
                        />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-slate-800">
                        {student.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      value={attendance[student.id] || 'Hadir'}
                      onValueChange={(value) =>
                        handleStatusChange(student.id, value as AttendanceStatus)
                      }
                      className="flex justify-center gap-2 md:gap-4 flex-wrap"
                    >
                      {attendanceStatuses.map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={status}
                            id={`${student.id}-${status}`}
                          />
                          <Label htmlFor={`${student.id}-${status}`}>
                            {status}
                          </Label>
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
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Simpan Absensi</Button>
      </div>
    </div>
  );
}
