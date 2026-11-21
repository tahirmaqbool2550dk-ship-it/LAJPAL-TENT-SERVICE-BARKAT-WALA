import { Bill, BillItem, BillTotals } from '../types/bill';

const STORAGE_KEY = 'lajpal_tent_service_bills_v1';

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toSafeNumber(value: number | string | '' | undefined | null): number {
  if (value === '' || value === undefined || value === null) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

export function calculateItemTotal(quantity: number | '', rate: number | ''): number {
  const q = toSafeNumber(quantity);
  const r = toSafeNumber(rate);
  return Math.round(q * r * 100) / 100;
}

export function calculateBillTotals(items: BillItem[], receivedAmount: number | ''): BillTotals {
  const grandTotal = items.reduce((sum, item) => {
    return Math.round((sum + calculateItemTotal(item.quantity, item.rate)) * 100) / 100;
  }, 0);

  const safeReceived = toSafeNumber(receivedAmount);
  const remainingBalance = Math.round((grandTotal - safeReceived) * 100) / 100;

  return {
    grandTotal,
    receivedAmount: safeReceived,
    remainingBalance,
  };
}

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-PK', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${formatted}` : formatted;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function generateNextBillNumber(savedBills: Bill[]): string {
  let maxNumber = 1000;
  const existingSet = new Set<string>();

  for (const bill of savedBills) {
    const clean = bill.billNumber.trim();
    existingSet.add(clean.toUpperCase());
    const match = clean.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  let candidateNum = maxNumber + 1;
  let candidate = `LTS-${candidateNum}`;
  while (existingSet.has(candidate.toUpperCase())) {
    candidateNum += 1;
    candidate = `LTS-${candidateNum}`;
  }

  return candidate;
}

export function createEmptyItem(): BillItem {
  return {
    id: createId(),
    name: '',
    quantity: 1,
    rate: '',
  };
}

export function createBlankBill(savedBills: Bill[]): Bill {
  const nowIso = new Date().toISOString();
  const today = getTodayISO();
  return {
    id: createId(),
    billNumber: generateNextBillNumber(savedBills),
    date: today,
    customerName: '',
    mobileNumber: '',
    eventDate: today,
    eventVenue: '',
    items: [createEmptyItem()],
    receivedAmount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function loadBillsFromStorage(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bill =>
        b &&
        typeof b.id === 'string' &&
        typeof b.billNumber === 'string' &&
        Array.isArray(b.items)
    );
  } catch {
    return [];
  }
}

export function saveBillsToStorage(bills: Bill[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    return true;
  } catch {
    return false;
  }
}
