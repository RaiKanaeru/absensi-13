export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  avatar: string;
};

export type Student = User & {
  role: 'Student';
  classId: string;
};

export type Teacher = User & {
  role: 'Teacher';
};

export type Class = {
  id: string;
  name: string;
  teacherId: string;
};

export type Session = {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  topic: string;
};

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export type Attendance = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
};

export type StudentWithAttendance = Student & {
  attendanceStatus?: AttendanceStatus;
};
