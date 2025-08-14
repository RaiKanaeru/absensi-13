'use client';

import axios from 'axios';

// One-port setup: same-origin API under /api
const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

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
  login: (payload: { username: string; password: string }) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
};

export const classesAPI = {
  list: () => api.get('/classes'),
  detail: (id: number|string) => api.get(`/classes/${id}`),
  students: (id: number|string) => api.get(`/classes/${id}/students`),
};

export const attendanceAPI = {
  teacherToday: (teacherId: number|string) => api.get(`/attendance/teacher/${teacherId}/today`),
  schedule: (scheduleId: number|string, date: string) => api.get(`/attendance/schedule/${scheduleId}`, { params: { date } }),
  record: (data: any) => api.post('/attendance/record', data),
};

export const reportsAPI = {
  classReport: (classId: number|string, month: string, year: string) => api.get(`/reports/class/${classId}`, { params: { month, year } }),
  exportUrl: (classId: number|string, month: string, year: string) => {
    const u = new URL(`${API_BASE_URL}/reports/export`, window.location.origin);
    u.searchParams.set('classId', String(classId));
    u.searchParams.set('month', month);
    u.searchParams.set('year', year);
    return u.toString();
  }
};

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data: { username: string; password: string; role: string }) => api.post('/users', data),
  update: (id: number|string, data: { username: string; password?: string; role: string }) => api.put(`/users/${id}`, data),
  delete: (id: number|string) => api.delete(`/users/${id}`),
};