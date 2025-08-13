'use client';

export type LoggedInUser = {
  id: number;
  username: string;
  role: 'admin' | 'teacher';
  // optional extras for teacher
  nip?: string;
  full_name?: string;
};

export const auth = {
  get token() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  set token(value: string | null) {
    if (typeof window === 'undefined') return;
    if (value) localStorage.setItem('token', value);
    else localStorage.removeItem('token');
  },
  get user(): LoggedInUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as LoggedInUser : null;
  },
  set user(value: LoggedInUser | null) {
    if (typeof window === 'undefined') return;
    if (value) localStorage.setItem('user', JSON.stringify(value));
    else localStorage.removeItem('user');
  },
  logout() {
    this.token = null;
    this.user = null;
  }
};

