export type PaperSize = 'a4';

export type ActiveTab = 'editor' | 'history';

export interface BillItem {
  id: string;
  name: string;
  quantity: number | '';
  rate: number | '';
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  customerName: string;
  mobileNumber: string;
  eventDate: string;
  eventVenue: string;
  items: BillItem[];
  receivedAmount: number | '';
  createdAt: string;
  updatedAt: string;
}

export interface BillTotals {
  grandTotal: number;
  receivedAmount: number;
  remainingBalance: number;
}

export interface TentPresetItem {
  name: string;
  defaultRate: number;
}

/**
 * Strictly tent, canopy, seating (chairs only), tables, carpets, and catering hardware.
 * No lighting items and no sofa items are permitted anywhere in this catalog.
 */
export const TENT_CATALOG_PRESETS: TentPresetItem[] = [
  { name: 'شامیانہ / ٹینٹ (مکمل سیٹ)', defaultRate: 8000 },
  { name: 'مارکی ٹینٹ (واٹر پروف)', defaultRate: 25000 },
  { name: 'قناتیں (پردہ دیوار)', defaultRate: 1500 },
  { name: 'کرسیاں (وائٹ کور سمیت)', defaultRate: 80 },
  { name: 'سادہ پلاسٹک کرسیاں', defaultRate: 35 },
  { name: 'گول میز (میز پوش سمیت)', defaultRate: 600 },
  { name: 'کھانے کی لمبی میز (ٹیبل)', defaultRate: 500 },
  { name: 'قالین / کارپٹ (فی عدد)', defaultRate: 1200 },
  { name: 'ریڈ کارپٹ (راستہ)', defaultRate: 2000 },
  { name: 'سادہ اسٹیج پلیٹ فارم', defaultRate: 5000 },
  { name: 'کھانے کے برتن (مکمل سیٹ)', defaultRate: 3500 },
  { name: 'پیڈسٹل پنکھا', defaultRate: 700 },
];
