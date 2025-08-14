'use client';

export type LoggedUser = {
  id: number;
  username: string;
  role: 'admin' | 'guru' | 'wali_kelas' | 'siswa' | 'teacher';
  full_name?: string;
  nip?: string;
};

export const auth = {
  get token() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  set token(v: string | null) {
    if (typeof window === 'undefined') return;
    if (v) localStorage.setItem('token', v); else localStorage.removeItem('token');
  },
  get user(): LoggedUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as LoggedUser : null;
  },
  set user(v: LoggedUser | null) {
    if (typeof window === 'undefined') return;
    if (v) localStorage.setItem('user', JSON.stringify(v)); else localStorage.removeItem('user');
  },
  logout() {
    this.token = null;
    this.user = null;
  }
};
