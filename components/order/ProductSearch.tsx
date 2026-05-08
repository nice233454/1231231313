'use client';

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchNomenclature, Nomenclature, CartItem } from '@/lib/tablecrm';
import { Search, Plus, Package, X, Loader2, Minus, Trash2 } from 'lucide-react';

interface Props {
  token: string;
  cart: CartItem[];
  priceTypeId: number | null;
  onCartChange: (cart: CartItem[]) => void;
}

export function ProductSearch({ token, cart, priceTypeId, onCartChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Nomenclature[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (value: string) => {
      if (value.length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchNomenclature(token, value);
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

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const addToCart = (item: Nomenclature) => {
    const existing = cart.find((c) => c.nomenclature.id === item.id);
    if (existing) {
      onCartChange(
        cart.map((c) =>
          c.nomenclature.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      onCartChange([
        ...cart,
        { nomenclature: item, quantity: 1, price: 0, discount: 0, price_type_id: priceTypeId },
      ]);
    }
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const updateQuantity = (id: number, delta: number) => {
    onCartChange(
      cart
        .map((c) => (c.nomenclature.id === id ? { ...c, quantity: Math.max(0.1, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const updatePrice = (id: number, price: string) => {
    const parsed = parseFloat(price);
    onCartChange(
      cart.map((c) => (c.nomenclature.id === id ? { ...c, price: isNaN(parsed) ? 0 : parsed } : c))
    );
  };

  const updateDiscount = (id: number, discount: string) => {
    const parsed = parseFloat(discount);
    onCartChange(
      cart.map((c) => (c.nomenclature.id === id ? { ...c, discount: isNaN(parsed) ? 0 : parsed } : c))
    );
  };

  const removeFromCart = (id: number) => {
    onCartChange(cart.filter((c) => c.nomenclature.id !== id));
  };

  const total = cart.reduce((sum, c) => {
    const linePrice = c.price * c.quantity;
    const discountAmount = c.discount > 0 ? (linePrice * c.discount) / 100 : 0;
    return sum + linePrice - discountAmount;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Поиск товара..."
            value={query}
            onChange={handleQueryChange}
            className="pl-9 pr-9"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          ) : query ? (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.code && `Код: ${item.code}`}
                      {item.unit_name && ` · ${item.unit_name}`}
                    </p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className="mt-2 text-center py-4 text-sm text-slate-400 bg-slate-50 rounded-xl">
            Товары не найдены
          </div>
        )}
      </div>

      {/* Cart */}
      {cart.length > 0 ? (
        <div className="space-y-2">
          {cart.map((item) => {
            const linePrice = item.price * item.quantity;
            const discountAmount = item.discount > 0 ? (linePrice * item.discount) / 100 : 0;
            const lineFinal = linePrice - discountAmount;

            return (
              <div
                key={item.nomenclature.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-900 text-sm truncate">{item.nomenclature.name}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.nomenclature.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Цена</p>
                    <Input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updatePrice(item.nomenclature.id, e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm px-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Скидка %</p>
                    <Input
                      type="number"
                      value={item.discount || ''}
                      onChange={(e) => updateDiscount(item.nomenclature.id, e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm px-2"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Кол-во</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.nomenclature.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-center w-6 flex-shrink-0">
                        {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.nomenclature.id, 1)}
                        className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <p className="text-sm font-semibold text-slate-900">
                    {lineFinal.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    {item.discount > 0 && (
                      <span className="text-xs font-normal text-slate-400 ml-1 line-through">
                        {linePrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center justify-between bg-blue-600 rounded-xl px-4 py-3 mt-3">
            <span className="text-white font-medium">Итого</span>
            <span className="text-white font-bold text-lg">
              {total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Товары не добавлены</p>
          <p className="text-xs mt-1">Используйте поиск выше</p>
        </div>
      )}
    </div>
  );
}
