'use client';

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor untuk menambahkan Authorization header dari localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const attendanceAPI = {
  teacherToday: (teacherId: number | string) => api.get(`/attendance/teacher/${teacherId}/today`),
  getScheduleAttendance: (scheduleId: number | string, date: string) =>
    api.get(`/attendance/schedule/${scheduleId}`, { params: { date } }),
  record: (payload: { schedule_id: number | string; attendance_date: string; records: Array<{ student_id: number; status: 'Hadir'|'Sakit'|'Izin'|'Alpa'|'Dispen' }> }) =>
    api.post('/attendance/record', payload),
};

export const classesAPI = {
  list: () => api.get('/classes'),
  students: (classId: number | string) => api.get(`/classes/${classId}/students`),
};

export const reportsAPI = {
  classReport: (classId: number | string, month: string, year: string) =>
    api.get(`/reports/class/${classId}`, { params: { month, year } }),
  exportExcelUrl: (classId: number | string, month: string, year: string) => {
    const url = new URL(`${API_BASE_URL}/reports/export`);
    url.searchParams.set('classId', String(classId));
    url.searchParams.set('month', month);
    url.searchParams.set('year', year);
    return url.toString();
  },
};

