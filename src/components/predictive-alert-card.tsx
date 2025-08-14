'use client';

import { useActionState, useFormStatus } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { runPredictiveAttendanceAlert, type FormState } from '@/app/actions';
import { useEffect, useState } from 'react';
import { classesAPI } from '@/lib/api';
import { AlertCircle, CheckCircle, Bot } from 'lucide-react';

const initialState: FormState = {
  message: '',
  data: null,
  error: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Menganalisis...' : 'Jalankan Analisis'}
    </Button>
  );
}

export function PredictiveAlertCard() {
  const [state, formAction, isPending] = useActionState(
    runPredictiveAttendanceAlert,
    initialState
  );
  const [students, setStudents] = useState<Array<{ id:number; full_name:string }>>([]);

  useEffect(() => {
    // Placeholder: sebaiknya ada endpoint /classes/:id/students atau /students?
    // Agar demo jalan tanpa pilih kelas, biarkan kosong jika belum ada kelas terpilih
    (async () => {
      try {
        const res = await classesAPI.list();
        const first = res.data?.data?.[0]?.id;
        if (first) {
          const s = await classesAPI.students(first);
          setStudents(s.data?.data || []);
        }
      } catch {}
    })();
  }, []);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Peringatan Absensi Prediktif
          </CardTitle>
          <CardDescription>
            Gunakan AI untuk menganalisis riwayat absensi siswa dan
            mengidentifikasi risiko penurunan kehadiran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="student">Pilih Siswa</Label>
            <Select name="studentId" required>
              <SelectTrigger id="student">
                <SelectValue placeholder="Pilih seorang siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <p className="text-sm text-muted-foreground mt-1">
              Contoh siswa dengan data anomali: Dewi Anggraini.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t px-6 py-4">
           <p className="text-sm text-muted-foreground">Didukung oleh AI</p>
          <SubmitButton />
        </CardFooter>
      </form>

      {state.message && (
        <div className="p-6 pt-0">
          <Alert variant={state.error || state.data?.alert ? 'destructive' : 'default'}>
            {state.error || state.data?.alert ? (
                <AlertCircle className="h-4 w-4" />
            ) : (
                <CheckCircle className="h-4 w-4" />
            )}
            
            <AlertTitle>
              {state.error ? 'Error' : `Hasil Analisis: ${state.data?.alert ? 'Peringatan Ditemukan' : 'Kehadiran Baik'}`}
            </AlertTitle>
            <AlertDescription>
              {state.data?.reason || state.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
