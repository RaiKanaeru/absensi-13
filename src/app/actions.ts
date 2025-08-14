'use server';

import { predictiveAttendanceAlert } from '@/ai/flows/predictive-attendance-alert';
import type { PredictiveAttendanceAlertOutput } from '@/ai/flows/predictive-attendance-alert';
import { reportsAPI } from '@/lib/api';

export type FormState = {
  message: string;
  data: PredictiveAttendanceAlertOutput | null;
  error: boolean;
};

export async function runPredictiveAttendanceAlert(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const studentId = formData.get('studentId') as string;

  if (!studentId) {
    return {
      message: 'Siswa harus dipilih.',
      data: null,
      error: true,
    };
  }

  try {
    // Ambil rekap bulanan siswa sebagai input awal untuk AI (sumber nyata dari API)
    const now = new Date();
    const month = String(now.getMonth() + 1);
    const year = String(now.getFullYear());
    // Kita butuh classId untuk siswa agar bisa panggil /reports/class/:classId → sederhana: ambil dari kelas pertama saja
    // Idealnya ada endpoint histori khusus per siswa; ini sementara agar tidak pakai mock.
    const clsRes = await reportsAPI.classReport(1 as any, month, year).catch(()=>null);
    const students = (clsRes?.data?.data?.students || []) as Array<any>;
    const picked = students.find((s:any) => String(s.id) === String(studentId));
    const attendanceData = JSON.stringify(picked ? [{ date: `${year}-${month}-01`, status: Number(picked.persentase_tidak_hadir) > 0 ? 'Alpa' : 'Hadir' }] : []);

    const result = await predictiveAttendanceAlert({ studentId, attendanceData });

    if (result.alert) {
      return {
        message: 'Analisis Selesai',
        data: result,
        error: false,
      };
    } else {
       return {
        message: 'Analisis Selesai',
        data: result,
        error: false,
      };
    }
  } catch (e) {
    console.error(e);
    return {
      message: 'Terjadi kesalahan saat menganalisis data.',
      data: null,
      error: true,
    };
  }
}
