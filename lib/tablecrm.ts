const BASE_URL = 'https://app.tablecrm.com/api/v1';

export interface Warehouse {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface Organization {
  id: number;
  short_name: string;
  full_name: string | null;
  work_name: string | null;
}

export interface Paybox {
  id: number;
  name: string;
  balance: number;
}

export interface PriceType {
  id: number;
  name: string;
}

export interface Contragent {
  id: number;
  name: string;
  phone: string | null;
  contragent_type: string;
}

export interface Nomenclature {
  id: number;
  name: string;
  code: string | null;
  unit_name: string | null;
}

export interface CartItem {
  nomenclature: Nomenclature;
  quantity: number;
  price: number;
  discount: number;
  price_type_id: number | null;
}

export interface SalePayload {
  operation: 'Заказ' | 'Реализация';
  organization: number;
  warehouse?: number;
  paybox?: number;
  contragent?: number;
  comment?: string;
  status?: boolean;
  goods: {
    nomenclature: number;
    nomenclature_name: string;
    price: number;
    quantity: number;
    discount: number;
    price_type?: number;
  }[];
}

async function apiFetch<T>(
  path: string,
  token: string,
  params: Record<string, string | number | boolean> = {},
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('token', token);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getWarehouses(token: string): Promise<Warehouse[]> {
  const data = await apiFetch<{ result: Warehouse[] }>('/warehouses/', token, { limit: 100 });
  return data.result;
}

export async function getOrganizations(token: string): Promise<Organization[]> {
  const data = await apiFetch<{ result: Organization[] }>('/organizations/', token, { limit: 100 });
  return data.result;
}

export async function getPayboxes(token: string): Promise<Paybox[]> {
  const data = await apiFetch<{ result: Paybox[] }>('/payboxes/', token, { limit: 100 });
  return data.result;
}

export async function getPriceTypes(token: string): Promise<PriceType[]> {
  const data = await apiFetch<{ result: PriceType[] }>('/price_types/', token, { limit: 100 });
  return data.result;
}

export async function searchContragents(token: string, phone: string): Promise<Contragent[]> {
  const data = await apiFetch<{ result: Contragent[] }>('/contragents/', token, { phone, limit: 10 });
  return data.result;
}

export async function searchNomenclature(token: string, name: string): Promise<Nomenclature[]> {
  const data = await apiFetch<{ result: Nomenclature[] }>('/nomenclature/', token, { name, limit: 20 });
  return data.result;
}

export async function createSale(
  token: string,
  payload: SalePayload,
  generateOut: boolean
): Promise<unknown> {
  return apiFetch('/docs_sales/', token, { generate_out: generateOut }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([payload]),
  });
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    await apiFetch('/organizations/', token, { limit: 1 });
    return true;
  } catch {
    return false;
  }
}
