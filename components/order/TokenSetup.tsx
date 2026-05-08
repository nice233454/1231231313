'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateToken } from '@/lib/tablecrm';
import { ShoppingCart, Lock, Loader2 } from 'lucide-react';

interface Props {
  onTokenSaved: (token: string) => void;
}

export function TokenSetup({ onTokenSaved }: Props) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      const valid = await validateToken(token.trim());
      if (valid) {
        localStorage.setItem('tablecrm_token', token.trim());
        onTokenSaved(token.trim());
      } else {
        setError('Неверный токен. Проверьте правильность токена и повторите попытку.');
      }
    } catch {
      setError('Ошибка подключения. Проверьте токен и интернет-соединение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TableCRM</h1>
          <p className="text-slate-500 mt-1 text-sm">Мобильная форма заказа</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Подключение к кассе</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-slate-700">API токен</Label>
              <Input
                id="token"
                type="text"
                placeholder="Вставьте ваш токен"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
                autoComplete="off"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !token.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                'Подключиться'
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Токен доступен в настройках кассы TableCRM
          </p>
        </div>
      </div>
    </div>
  );
}
