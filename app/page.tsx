'use client';

import { useEffect, useState } from 'react';
import { TokenSetup } from '@/components/order/TokenSetup';
import { OrderForm } from '@/components/order/OrderForm';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tablecrm_token');
    if (saved) setToken(saved);
    setReady(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tablecrm_token');
    setToken(null);
  };

  if (!ready) return null;

  if (!token) {
    return <TokenSetup onTokenSaved={setToken} />;
  }

  return <OrderForm token={token} onLogout={handleLogout} />;
}
