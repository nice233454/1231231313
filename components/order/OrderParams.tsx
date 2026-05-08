'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Organization, Paybox, Warehouse, PriceType } from '@/lib/tablecrm';
import { Building2, Wallet, Warehouse as WarehouseIcon, Tag } from 'lucide-react';

interface Props {
  organizations: Organization[];
  payboxes: Paybox[];
  warehouses: Warehouse[];
  priceTypes: PriceType[];
  selectedOrg: string;
  selectedPaybox: string;
  selectedWarehouse: string;
  selectedPriceType: string;
  onOrgChange: (v: string) => void;
  onPayboxChange: (v: string) => void;
  onWarehouseChange: (v: string) => void;
  onPriceTypeChange: (v: string) => void;
}

const SelectField = ({
  label,
  icon: Icon,
  value,
  onValueChange,
  placeholder,
  items,
  getLabel,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  items: { id: number }[];
  getLabel: (item: { id: number }) => string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-blue-600" />
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
    </div>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {getLabel(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export function OrderParams({
  organizations,
  payboxes,
  warehouses,
  priceTypes,
  selectedOrg,
  selectedPaybox,
  selectedWarehouse,
  selectedPriceType,
  onOrgChange,
  onPayboxChange,
  onWarehouseChange,
  onPriceTypeChange,
}: Props) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Организация"
        icon={Building2}
        value={selectedOrg}
        onValueChange={onOrgChange}
        placeholder="Выберите организацию"
        items={organizations}
        getLabel={(o) => (o as Organization).short_name || (o as Organization).work_name || String(o.id)}
      />

      <SelectField
        label="Счёт"
        icon={Wallet}
        value={selectedPaybox}
        onValueChange={onPayboxChange}
        placeholder="Выберите счёт"
        items={payboxes}
        getLabel={(p) => {
          const pb = p as Paybox;
          return `${pb.name}${pb.balance !== undefined ? ` — ${pb.balance.toLocaleString('ru-RU')} ₽` : ''}`;
        }}
      />

      <SelectField
        label="Склад"
        icon={WarehouseIcon}
        value={selectedWarehouse}
        onValueChange={onWarehouseChange}
        placeholder="Выберите склад"
        items={warehouses}
        getLabel={(w) => (w as Warehouse).name}
      />

      <SelectField
        label="Тип цен"
        icon={Tag}
        value={selectedPriceType}
        onValueChange={onPriceTypeChange}
        placeholder="Выберите тип цен"
        items={priceTypes}
        getLabel={(pt) => (pt as PriceType).name}
      />
    </div>
  );
}
