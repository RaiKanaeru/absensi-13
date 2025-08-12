import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight, BookCopy, Users, Activity, ClipboardCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { students, classes, sessions } from '@/lib/data';

export default function DashboardPage() {
  const todaySessions = sessions.filter(
    (s) => s.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className='flex items-center text-emerald-500'><ArrowUp className="h-3 w-3" /> 10.2%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
               <span className='flex items-center text-emerald-500'><ArrowUp className="h-3 w-3" /> 2</span> dari tahun lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kehadiran Hari Ini
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
               <span className='flex items-center text-red-500'><ArrowDown className="h-3 w-3" /> 5.1%</span> dari kemarin
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesi Hari Ini</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">Sesi yang perlu diisi absensinya</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesi Absensi Hari Ini</CardTitle>
          <CardDescription>
            Daftar sesi kelas yang dijadwalkan hari ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelas</TableHead>
                <TableHead>Topik / Mata Pelajaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySessions.map((session) => {
                const sessionClass = classes.find(c => c.id === session.classId);
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{sessionClass?.name}</div>
                    </TableCell>
                    <TableCell>{session.topic}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/dashboard/attendance?session_id=${session.id}`}>
                        <Button variant="outline" size="sm">
                          Isi Absensi
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
               {todaySessions.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Tidak ada sesi absensi hari ini.
                    </TableCell>
                  </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
