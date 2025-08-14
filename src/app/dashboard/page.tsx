"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookCopy,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Download,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendancePercentage: 0,
    totalSessions: 0,
    todaySchedule: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError('Gagal memuat data dashboard');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Selamat datang di Smart Attend, kelola absensi dengan mudah.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none">
          <div className="absolute inset-0 bg-primary/10 h-1 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-slate-800">{dashboardData.totalStudents.toLocaleString()}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Siswa aktif tahun ajaran berjalan
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none">
          <div className="absolute inset-0 bg-blue-500/10 h-1 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BookCopy className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-slate-800">{dashboardData.totalClasses}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Kelas aktif tahun ajaran berjalan
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none">
          <div className="absolute inset-0 bg-emerald-500/10 h-1 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kehadiran Hari Ini
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-slate-800">{dashboardData.attendancePercentage}%</div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Dari total siswa terjadwal hari ini
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none">
          <div className="absolute inset-0 bg-amber-500/10 h-1 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesi Hari Ini</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-slate-800">{dashboardData.totalSessions}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Sesi yang perlu diisi absensi
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-none shadow">
          <CardHeader className="flex flex-row items-center pb-2">
            <div className="grid gap-1">
              <CardTitle className="text-lg">Sesi Absensi Hari Ini</CardTitle>
              <CardDescription>
                Sesi yang perlu diisi absensi hari ini
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 bg-primary/10 text-primary hover:bg-primary/20">
              <Link href="/dashboard/attendance">
                Selengkapnya
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-primary/70 font-medium">Kelas</TableHead>
                  <TableHead className="text-primary/70 font-medium">Mata Pelajaran</TableHead>
                  <TableHead className="text-primary/70 font-medium">Waktu</TableHead>
                  <TableHead className="text-right text-primary/70 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3).fill(0).map((_, index) => (
                    <TableRow key={index} className="hover:bg-primary/5">
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : dashboardData.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                  dashboardData.todaySchedule.map((schedule, index) => (
                    <TableRow key={index} className="hover:bg-primary/5">
                      <TableCell>
                        <div className="font-medium">{schedule.class_name}</div>
                      </TableCell>
                      <TableCell>{schedule.subject_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${schedule.status === 'filled' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <span>
                            {new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {schedule.status === 'filled' ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Sudah Diisi
                          </Badge>
                        ) : (
                          <Link
                            href={`/dashboard/attendance?scheduleId=${schedule.schedule_id}&date=${new Date().toISOString().slice(0, 10)}`}
                          >
                            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5 hover:border-primary/30">
                              Isi Absensi
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      Tidak ada sesi absensi hari ini
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pengumuman</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Rapat Guru Bulanan
                </p>
                <p className="text-sm text-muted-foreground">
                  Rapat akan diadakan pada tanggal 20 Juli 2024.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
