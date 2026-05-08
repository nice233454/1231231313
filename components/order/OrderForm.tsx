'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  getWarehouses,
  getOrganizations,
  getPayboxes,
  getPriceTypes,
  createSale,
  Warehouse,
  Organization,
  Paybox,
  PriceType,
  Contragent,
  CartItem,
} from '@/lib/tablecrm';
import { CustomerSearch } from './CustomerSearch';
import { OrderParams } from './OrderParams';
import { ProductSearch } from './ProductSearch';
import {
  ShoppingCart,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

interface Props {
  token: string;
  onLogout: () => void;
}

interface StatusMsg {
  type: 'success' | 'error';
  text: string;
}

export function OrderForm({ token, onLogout }: Props) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [payboxes, setPayboxes] = useState<Paybox[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [customer, setCustomer] = useState<Contragent | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedPaybox, setSelectedPaybox] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [comment, setComment] = useState('');

  const [creating, setCreating] = useState<'sale' | 'conducted' | null>(null);
  const [status, setStatus] = useState<StatusMsg | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    setLoadError('');
    try {
      const [wh, org, pb, pt] = await Promise.all([
        getWarehouses(token),
        getOrganizations(token),
        getPayboxes(token),
        getPriceTypes(token),
      ]);
      setWarehouses(wh);
      setOrganizations(org);
      setPayboxes(pb);
      setPriceTypes(pt);

      // Set defaults if available
      if (org.length === 1) setSelectedOrg(String(org[0].id));
      if (wh.length === 1) setSelectedWarehouse(String(wh[0].id));
    } catch {
      setLoadError('Ошибка загрузки данных. Проверьте токен.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const canSubmit = selectedOrg && cart.length > 0;

  const handleCreate = async (conducted: boolean) => {
    if (!canSubmit) return;
    setCreating(conducted ? 'conducted' : 'sale');
    setStatus(null);

    const payload = {
      operation: 'Заказ' as const,
      organization: parseInt(selectedOrg),
      ...(selectedWarehouse && { warehouse: parseInt(selectedWarehouse) }),
      ...(selectedPaybox && { paybox: parseInt(selectedPaybox) }),
      ...(customer && { contragent: customer.id }),
      ...(comment && { comment }),
      status: conducted,
      goods: cart.map((c) => ({
        nomenclature: c.nomenclature.id,
        nomenclature_name: c.nomenclature.name,
        price: c.price,
        quantity: c.quantity,
        discount: c.discount,
        ...(c.price_type_id && { price_type: c.price_type_id }),
      })),
    };

    try {
      await createSale(token, payload, conducted);
      setStatus({
        type: 'success',
        text: conducted
          ? 'Продажа создана и проведена успешно!'
          : 'Заказ успешно создан!',
      });
      // Reset form
      setCart([]);
      setCustomer(null);
      setComment('');
      setSelectedOrg('');
      setSelectedPaybox('');
      setSelectedWarehouse('');
      setSelectedPriceType('');
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ошибка создания заказа.',
      });
    } finally {
      setCreating(null);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-1">Ошибка загрузки</p>
          <p className="text-slate-500 text-sm mb-4">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={loadData} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Повторить
            </Button>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Сменить токен
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-blue-600 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">Новый заказ</span>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-blue-200 hover:text-white transition-colors p-1"
              title="Сменить токен"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Status */}
        {status && (
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
              status.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{status.text}</p>
          </div>
        )}

        {/* Customer */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <CustomerSearch token={token} selected={customer} onSelect={setCustomer} />
        </section>

        {/* Parameters */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Параметры продажи</h2>
          </div>
          <OrderParams
            organizations={organizations}
            payboxes={payboxes}
            warehouses={warehouses}
            priceTypes={priceTypes}
            selectedOrg={selectedOrg}
            selectedPaybox={selectedPaybox}
            selectedWarehouse={selectedWarehouse}
            selectedPriceType={selectedPriceType}
            onOrgChange={setSelectedOrg}
            onPayboxChange={setSelectedPaybox}
            onWarehouseChange={setSelectedWarehouse}
            onPriceTypeChange={(v) => {
              setSelectedPriceType(v);
              // Update price_type_id in cart items
              setCart((prev) =>
                prev.map((c) => ({ ...c, price_type_id: parseInt(v) }))
              );
            }}
          />
        </section>

        {/* Products */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Товары</h2>
          </div>
          <ProductSearch
            token={token}
            cart={cart}
            priceTypeId={selectedPriceType ? parseInt(selectedPriceType) : null}
            onCartChange={setCart}
          />
        </section>

        {/* Comment */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <Label className="font-semibold text-slate-800">Комментарий</Label>
          </div>
          <Textarea
            placeholder="Введите комментарий к заказу..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none text-sm"
            rows={3}
          />
        </section>

        {/* Validation hint */}
        {!canSubmit && (
          <div className="text-center py-2 text-sm text-slate-400">
            {!selectedOrg && !cart.length
              ? 'Выберите организацию и добавьте товары'
              : !selectedOrg
              ? 'Выберите организацию'
              : 'Добавьте хотя бы один товар'}
          </div>
        )}
      </div>

      {/* Sticky action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 space-y-2 z-20">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
          onClick={() => handleCreate(false)}
          disabled={!canSubmit || creating !== null}
        >
          {creating === 'sale' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Создание...</>
          ) : (
            'Создать продажу'
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 h-12 text-base font-medium"
          onClick={() => handleCreate(true)}
          disabled={!canSubmit || creating !== null}
        >
          {creating === 'conducted' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Проведение...</>
          ) : (
            'Создать и провести'
          )}
        </Button>
      </div>
    </div>
  );
}
