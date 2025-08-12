'use server';

import { predictiveAttendanceAlert } from '@/ai/flows/predictive-attendance-alert';
import type { PredictiveAttendanceAlertOutput } from '@/ai/flows/predictive-attendance-alert';
import { historicalAttendance } from '@/lib/data';

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
    const studentAttendance = historicalAttendance.filter(
      (att) => att.studentId === studentId
    );
    
    const attendanceData = JSON.stringify(studentAttendance.map(att => ({ date: att.sessionId.split('-')[2], status: att.status })));

    const result = await predictiveAttendanceAlert({
      studentId,
      attendanceData,
    });

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
