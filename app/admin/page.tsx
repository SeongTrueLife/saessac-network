'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticate, isAuthenticated } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(password)) {
      router.replace('/admin/dashboard');
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mt-1">새싹 4기 네트워킹</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="비밀번호"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none text-center text-lg tracking-widest"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs text-center mt-2">
                비밀번호가 일치하지 않습니다
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}
