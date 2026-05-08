'use client';

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { searchContragents, Contragent } from '@/lib/tablecrm';
import { Phone, Search, X, User, Loader2 } from 'lucide-react';

interface Props {
  token: string;
  selected: Contragent | null;
  onSelect: (contragent: Contragent | null) => void;
}

export function CustomerSearch({ token, selected, onSelect }: Props) {
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<Contragent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (value: string) => {
      if (value.length < 3) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchContragents(token, value);
        setResults(data);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 500);
  };

  const handleSelect = (c: Contragent) => {
    onSelect(c);
    setPhone('');
    setResults([]);
    setSearched(false);
  };

  const handleClear = () => {
    onSelect(null);
    setPhone('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        <Label className="font-semibold text-slate-800">Клиент</Label>
      </div>

      {selected ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div>
            <p className="font-medium text-slate-900 text-sm">{selected.name}</p>
            {selected.phone && (
              <p className="text-xs text-slate-500 mt-0.5">{selected.phone}</p>
            )}
          </div>
          <button onClick={handleClear} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="tel"
              placeholder="Введите телефон для поиска..."
              value={phone}
              onChange={handleChange}
              className="pl-9 pr-9"
            />
            {loading ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            ) : phone ? (
              <button
                onClick={() => { setPhone(''); setResults([]); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            )}
          </div>

          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                  {c.phone && <p className="text-xs text-slate-500 mt-0.5">{c.phone}</p>}
                </button>
              ))}
            </div>
          )}

          {searched && results.length === 0 && !loading && (
            <div className="mt-2 text-center py-3 text-sm text-slate-400 bg-slate-50 rounded-xl">
              Клиенты не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
}
