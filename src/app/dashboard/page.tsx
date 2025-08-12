import {
  Card,
  CardContent,
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  BookCopy,
  Activity,
  ClipboardCheck,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { students, classes, sessions } from '@/lib/data';

export default function DashboardPage() {
  const todaySessions = sessions.filter(
    (s) => s.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat Datang Kembali!
        </h1>
        <p className="text-slate-500">
          Berikut adalah ringkasan aktivitas Anda hari ini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">
              Total Siswa
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{students.length}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="flex items-center text-emerald-500">
                <ArrowUp className="h-3 w-3" /> 10.2%
              </span>{' '}
              dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">
              Total Kelas
            </CardTitle>
            <BookCopy className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{classes.length}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="flex items-center text-emerald-500">
                <ArrowUp className="h-3 w-3" /> 2
              </span>{' '}
              dari tahun lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">
              Kehadiran Hari Ini
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">92.5%</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="flex items-center text-red-500">
                <ArrowDown className="h-3 w-3" /> 5.1%
              </span>{' '}
              dari kemarin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500">
              Sesi Hari Ini
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{todaySessions.length}</div>
            <p className="text-xs text-slate-500">
              Sesi yang perlu diisi absensinya
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Sesi Absensi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Kelas</TableHead>
                <TableHead className="font-semibold">
                  Topik / Mata Pelajaran
                </TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySessions.map((session) => {
                const sessionClass = classes.find(
                  (c) => c.id === session.classId
                );
                return (
                  <TableRow key={session.id} className="border-b hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-slate-800">{sessionClass?.name}</div>
                    </TableCell>
                    <TableCell className="text-slate-500">{session.topic}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/attendance?session_id=${session.id}`}
                      >
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
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-slate-500"
                  >
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
