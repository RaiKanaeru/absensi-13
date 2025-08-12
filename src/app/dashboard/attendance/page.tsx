'use client';

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
import type { StudentWithAttendance, AttendanceStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

const attendanceStatuses: AttendanceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Alfa'];

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id') || sessions[0].id;

  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return <div>Sesi tidak ditemukan</div>;
  }
  
  const sessionClass = classes.find((c) => c.id === session.classId);
  const classStudents: StudentWithAttendance[] = students.filter(
    (s) => s.classId === session.classId
  );

  const handleSubmit = () => {
    toast({
      title: "Absensi Tersimpan",
      description: `Absensi untuk kelas ${sessionClass?.name} pada tanggal ${session.date} telah berhasil disimpan.`,
      variant: "default",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Absensi Kelas: {sessionClass?.name}</CardTitle>
        <CardDescription>
          Pilih status kehadiran untuk setiap siswa pada sesi &quot;{session.topic}&quot; tanggal {new Date(session.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead className="text-center">Status Kehadiran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="student avatar" />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      defaultValue="Hadir"
                      className="flex justify-center gap-2 md:gap-4"
                    >
                      {attendanceStatuses.map(status => (
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
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSubmit}>Simpan Absensi</Button>
      </CardFooter>
    </Card>
  );
}
