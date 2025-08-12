import type { User, Student, Teacher, Class, Session, Attendance, AttendanceStatus } from '@/lib/definitions';

export const users: User[] = [
  { id: '1', name: 'Admin Sekolah', email: 'admin@sekolah.id', role: 'Admin', avatar: 'https://placehold.co/100x100' },
  { id: '2', name: 'Budi Hartono', email: 'budi.h@guru.id', role: 'Teacher', avatar: 'https://placehold.co/100x100' },
  { id: '3', name: 'Citra Lestari', email: 'citra.l@guru.id', role: 'Teacher', avatar: 'https://placehold.co/100x100' },
  { id: '4', name: 'Dewi Anggraini', email: 'dewi.a@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
  { id: '5', name: 'Eko Prasetyo', email: 'eko.p@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
  { id: '6', name: 'Fitriani', email: 'fitriani@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
  { id: '7', name: 'Gilang Ramadhan', email: 'gilang.r@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
  { id: '8', name: 'Hana Yulita', email: 'hana.y@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
  { id: '9', name: 'Indra Permana', email: 'indra.p@siswa.id', role: 'Student', avatar: 'https://placehold.co/100x100' },
];

export const teachers: Teacher[] = users.filter(u => u.role === 'Teacher') as Teacher[];

export const students: Student[] = users.filter(u => u.role === 'Student').map((u, i) => ({
  ...u,
  role: 'Student',
  classId: i % 2 === 0 ? '10A' : '10B',
})) as Student[];

export const classes: Class[] = [
  { id: '10A', name: 'Kelas 10-A (Matematika)', teacherId: '2' },
  { id: '10B', name: 'Kelas 10-B (Bahasa Indonesia)', teacherId: '3' },
];

export const sessions: Session[] = [
  { id: 's1', classId: '10A', date: new Date().toISOString().split('T')[0], topic: 'Aljabar Linear' },
  { id: 's2', classId: '10B', date: new Date().toISOString().split('T')[0], topic: 'Puisi Modern' },
  { id: 's3', classId: '10A', date: '2023-10-25', topic: 'Kalkulus' },
  { id: 's4', classId: '10B', date: '2023-10-25', topic: 'Analisis Prosa' },
];

const attendanceStatuses: AttendanceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Alfa'];

export const attendance: Attendance[] = students.flatMap(student => {
  return sessions.map((session, index) => {
    if (student.classId === session.classId) {
      return {
        id: `att-${student.id}-${session.id}`,
        sessionId: session.id,
        studentId: student.id,
        status: attendanceStatuses[(index + parseInt(student.id)) % attendanceStatuses.length],
      };
    }
    return null;
  }).filter(Boolean) as Attendance[];
});


// Generate more historical data for the predictive alert feature
const last30Days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i - 1);
  return d.toISOString().split('T')[0];
});

export const historicalAttendance: Attendance[] = [];

students.forEach(student => {
  last30Days.forEach((date, i) => {
    const session_id = `hist-${student.classId}-${date}`;
    // Simulate more absences for student 'Dewi Anggraini' (id: '4')
    const status = student.id === '4' 
      ? (i % 3 === 0 ? 'Alfa' : 'Hadir')
      : (i % 10 === 0 ? 'Alfa' : (i%10 === 1 ? 'Sakit' : 'Hadir'));
      
    historicalAttendance.push({
      id: `hist-att-${student.id}-${date}`,
      sessionId: session_id,
      studentId: student.id,
      status: status,
    });
  });
});
