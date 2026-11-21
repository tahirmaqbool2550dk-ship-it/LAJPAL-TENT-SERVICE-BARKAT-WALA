import React from 'react';
import {
  Plus,
  Trash2,
  Save,
  FilePlus2,
  Printer,
  Download,
  Archive,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Bill, BillItem, TENT_CATALOG_PRESETS, TentPresetItem } from '../types/bill';
import {
  calculateBillTotals,
  calculateItemTotal,
  createId,
  formatCurrency,
} from '../utils/billing';

interface BillEditorProps {
  bill: Bill;
  isEditingSaved: boolean;
  isExportingPdf: boolean;
  statusMessage: {
    type: 'success' | 'error';
    text: string;
  } | null;
  printBlockedHint?: boolean;
  onChangeBill: (updated: Bill) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onSaveBill: () => void;
  onNewBill: () => void;
  onPrintBill: () => void;
  onDownloadPdf: () => void;
  onViewHistory: () => void;
}

export const BillEditor: React.FC<BillEditorProps> = ({
  bill,
  isEditingSaved,
  isExportingPdf,
  statusMessage,
  printBlockedHint = false,
  onChangeBill,
  onAddItem,
  onRemoveItem,
  onSaveBill,
  onNewBill,
  onPrintBill,
  onDownloadPdf,
  onViewHistory,
}) => {
  const totals = calculateBillTotals(bill.items, bill.receivedAmount);

  const handleFieldChange = (
    field: 'billNumber' | 'date' | 'customerName' | 'mobileNumber' | 'eventDate' | 'eventVenue',
    value: string
  ) => {
    onChangeBill({
      ...bill,
      [field]: value,
    });
  };

  const handleItemChange = (
    itemId: string,
    field: keyof BillItem,
    rawValue: string
  ) => {
    const nextItems = bill.items.map((item) => {
      if (item.id !== itemId) return item;
      if (field === 'name') {
        return { ...item, name: rawValue };
      }
      if (rawValue === '') {
        return { ...item, [field]: '' };
      }
      const parsed = Number(rawValue);
      if (!Number.isFinite(parsed) || parsed < 0) return item;
      return { ...item, [field]: parsed };
    });

    onChangeBill({
      ...bill,
      items: nextItems,
    });
  };

  const handleReceivedChange = (rawValue: string) => {
    if (rawValue === '') {
      onChangeBill({ ...bill, receivedAmount: '' });
      return;
    }
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onChangeBill({ ...bill, receivedAmount: parsed });
  };

  const handleQuickAddPreset = (preset: TentPresetItem) => {
    const emptyRowIndex = bill.items.findIndex(
      (item) => item.name.trim() === '' && (item.rate === '' || item.rate === 0)
    );

    if (emptyRowIndex !== -1) {
      const updatedItems = bill.items.map((item, idx) =>
        idx === emptyRowIndex
          ? {
              ...item,
              name: preset.name,
              quantity: item.quantity === '' || item.quantity === 0 ? 1 : item.quantity,
              rate: preset.defaultRate,
            }
          : item
      );
      onChangeBill({ ...bill, items: updatedItems });
      return;
    }

    onChangeBill({
      ...bill,
      items: [
        ...bill.items,
        {
          id: createId(),
          name: preset.name,
          quantity: 1,
          rate: preset.defaultRate,
        },
      ],
    });
  };

  return (
    <section
      className="no-print rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
      aria-label="بل فارم ایڈیٹر"
    >
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-urdu text-2xl font-bold text-[#0B1F3A]">
            {isEditingSaved ? 'محفوظ شدہ بل میں ترمیم' : 'نیا کرایہ بل تیار کریں'}
          </h2>
          <p className="font-urdu text-sm text-slate-600">
            گاہک کی تفصیلات اور ٹینٹ کے سامان کی تعداد و ریٹ درج کریں
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewBill}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <FilePlus2 className="h-4 w-4 text-[#0B1F3A]" aria-hidden="true" />
            <span className="font-urdu">نیا بل بنائیں</span>
          </button>

          <button
            type="button"
            onClick={onViewHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Archive className="h-4 w-4 text-[#0F6B43]" aria-hidden="true" />
            <span className="font-urdu">محفوظ شدہ بل دیکھیں</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {statusMessage && (
        <div
          role="status"
          className={`mt-4 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-urdu ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Customer & Event Information — Exact 6-Row Order */}
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-200">
        {/* 1. گاہک کا نام */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-white px-4 py-2.5">
          <label
            htmlFor="customerName"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            گاہک کا نام:
          </label>
          <div className="sm:col-span-8">
            <input
              id="customerName"
              type="text"
              value={bill.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              placeholder="مثال: حاجی محمد اکرم"
              className="font-urdu w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        {/* 2. موبائل نمبر */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-slate-50/70 px-4 py-2.5">
          <label
            htmlFor="mobileNumber"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            موبائل نمبر:
          </label>
          <div className="sm:col-span-8">
            <input
              id="mobileNumber"
              type="tel"
              dir="ltr"
              value={bill.mobileNumber}
              onChange={(e) => handleFieldChange('mobileNumber', e.target.value)}
              placeholder="0300-1234567"
              className="font-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-right text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        {/* 3. تاریخ */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-white px-4 py-2.5">
          <label
            htmlFor="billDate"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            تاریخ:
          </label>
          <div className="sm:col-span-8">
            <input
              id="billDate"
              type="date"
              dir="ltr"
              value={bill.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className="font-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        {/* 4. تقریب کی تاریخ */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-slate-50/70 px-4 py-2.5">
          <label
            htmlFor="eventDate"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            تقریب کی تاریخ:
          </label>
          <div className="sm:col-span-8">
            <input
              id="eventDate"
              type="date"
              dir="ltr"
              value={bill.eventDate}
              onChange={(e) => handleFieldChange('eventDate', e.target.value)}
              className="font-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        {/* 5. تقریب کا مقام */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-white px-4 py-2.5">
          <label
            htmlFor="eventVenue"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            تقریب کا مقام:
          </label>
          <div className="sm:col-span-8">
            <input
              id="eventVenue"
              type="text"
              value={bill.eventVenue}
              onChange={(e) => handleFieldChange('eventVenue', e.target.value)}
              placeholder="مثال: برکت والا، نزد مین بازار"
              className="font-urdu w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>

        {/* 6. بل نمبر */}
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 bg-slate-50/70 px-4 py-2.5">
          <label
            htmlFor="billNumber"
            className="sm:col-span-4 font-urdu text-base font-bold text-[#0B1F3A]"
          >
            بل نمبر:
          </label>
          <div className="sm:col-span-8">
            <input
              id="billNumber"
              type="text"
              dir="ltr"
              value={bill.billNumber}
              onChange={(e) => handleFieldChange('billNumber', e.target.value)}
              placeholder="LTS-1001"
              className="font-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-right text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Tent Inventory Presets (Strictly Tent/Canopy/Chairs/Tables/Carpets - No Lighting, No Sofas) */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <h3 className="font-urdu text-base font-bold text-[#0B1F3A]">
            ٹینٹ سامان فوری شامل کریں (کلک کریں):
          </h3>
          <span className="font-urdu text-xs text-slate-500">
            آپ نیچے ٹیبل میں اپنی مرضی کا سامان اور ریٹ بھی لکھ سکتے ہیں
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TENT_CATALOG_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleQuickAddPreset(preset)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-urdu text-slate-800 transition-colors hover:border-[#0F6B43] hover:bg-emerald-50 hover:text-[#0F6B43] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-[#0F6B43]" aria-hidden="true" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Items Table */}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-urdu text-xl font-bold text-[#0B1F3A]">سامان کی تفصیل</h3>
          <span className="font-urdu text-sm text-slate-600">
            کل آئٹمز:{' '}
            <span dir="ltr" className="font-num font-bold text-slate-900">
              {bill.items.length}
            </span>
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[620px] border-collapse text-right">
            <thead>
              <tr className="bg-[#0B1F3A] text-white">
                <th className="px-3 py-2.5 font-urdu text-sm font-bold text-center w-12">#</th>
                <th className="px-3 py-2.5 font-urdu text-sm font-bold">سامان کا نام</th>
                <th className="px-3 py-2.5 font-urdu text-sm font-bold text-center w-28">تعداد</th>
                <th className="px-3 py-2.5 font-urdu text-sm font-bold text-center w-36">
                  فی آئٹم ریٹ
                </th>
                <th className="px-3 py-2.5 font-urdu text-sm font-bold text-left w-36">
                  کل رقم
                </th>
                <th className="px-3 py-2.5 font-urdu text-sm font-bold text-center w-28">
                  حذف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {bill.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <p className="font-urdu text-base text-slate-600 mb-3">
                      ابھی بل میں کوئی آئٹم شامل نہیں ہے۔
                    </p>
                    <button
                      type="button"
                      onClick={onAddItem}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0F6B43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c5636] font-urdu"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      نیا آئٹم شامل کریں
                    </button>
                  </td>
                </tr>
              ) : (
                bill.items.map((item, idx) => {
                  const rowTotal = calculateItemTotal(item.quantity, item.rate);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 text-center font-num text-sm font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                          placeholder="سامان کا نام لکھیں..."
                          aria-label={`آئٹم ${idx + 1} کا نام`}
                          className="font-urdu w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          dir="ltr"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          placeholder="0"
                          aria-label={`آئٹم ${idx + 1} کی تعداد`}
                          className="font-num w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-center text-sm font-semibold text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          dir="ltr"
                          min="0"
                          step="any"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                          placeholder="0"
                          aria-label={`آئٹم ${idx + 1} کا ریٹ`}
                          className="font-num w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-center text-sm font-semibold text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
                        />
                      </td>
                      <td
                        dir="ltr"
                        className="px-3 py-2 text-left font-num text-sm font-bold text-[#0B1F3A]"
                      >
                        {formatCurrency(rowTotal)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 whitespace-nowrap"
                          title="آئٹم حذف کریں"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-urdu">حذف</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-2 rounded-lg border border-[#0F6B43] bg-emerald-50 px-4 py-2 text-sm font-bold text-[#0F6B43] transition-colors hover:bg-emerald-100 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-urdu">نیا آئٹم شامل کریں</span>
          </button>

          {bill.items.length > 0 && (
            <button
              type="button"
              onClick={() => onRemoveItem(bill.items[bill.items.length - 1].id)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-urdu">آئٹم حذف کریں</span>
            </button>
          )}
        </div>
      </div>

      {/* Automatic Calculations & Payment Input */}
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <label
            htmlFor="receivedAmount"
            className="block font-urdu text-base font-bold text-[#0F6B43] mb-1.5"
          >
            وصول شدہ رقم (روپے)
          </label>
          <input
            id="receivedAmount"
            type="number"
            dir="ltr"
            min="0"
            step="any"
            value={bill.receivedAmount}
            onChange={(e) => handleReceivedChange(e.target.value)}
            placeholder="0"
            className="font-num w-full rounded-lg border-2 border-[#0F6B43]/40 bg-emerald-50/40 px-4 py-2.5 text-lg font-bold text-[#0F6B43] focus:border-[#0F6B43] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-7 grid grid-cols-3 divide-x divide-x-reverse divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
          <div className="px-3 py-3 text-center">
            <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">کل بل</p>
            <p dir="ltr" className="font-num text-base sm:text-lg font-extrabold text-[#0B1F3A] mt-0.5">
              {formatCurrency(totals.grandTotal)}
            </p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">وصول شدہ رقم</p>
            <p dir="ltr" className="font-num text-base sm:text-lg font-extrabold text-[#0F6B43] mt-0.5">
              {formatCurrency(totals.receivedAmount)}
            </p>
          </div>
          <div
            className={`px-3 py-3 text-center ${
              totals.remainingBalance > 0 ? 'bg-amber-50' : 'bg-emerald-50'
            }`}
          >
            <p className="font-urdu text-xs sm:text-sm font-bold text-slate-700">بقایا رقم</p>
            <p
              dir="ltr"
              className={`font-num text-base sm:text-lg font-extrabold mt-0.5 ${
                totals.remainingBalance > 0 ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {formatCurrency(totals.remainingBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onSaveBill}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F6B43] px-5 py-2.5 text-sm sm:text-base font-bold text-white shadow-sm transition-colors hover:bg-[#0c5636] whitespace-nowrap shrink-0"
        >
          <Save className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-urdu">بل محفوظ کریں</span>
        </button>

        <button
          type="button"
          onClick={onPrintBill}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm sm:text-base font-bold text-white shadow-sm transition-colors hover:bg-[#133158] whitespace-nowrap shrink-0"
        >
          <Printer className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-urdu">بل پرنٹ کریں</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isExportingPdf}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C89B3C] px-5 py-2.5 text-sm sm:text-base font-bold text-[#0B1F3A] shadow-sm transition-colors hover:bg-[#d9ad4d] disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          {isExportingPdf ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-urdu">
            {isExportingPdf ? 'PDF بن رہی ہے...' : 'PDF ڈاؤن لوڈ کریں'}
          </span>
        </button>
      </div>

      {printBlockedHint && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 font-urdu text-sm text-amber-950"
        >
          پیش نظارہ ونڈو میں براؤزر نے خودکار پرنٹ ڈائیلاگ روکا ہے — براہِ کرم کی بورڈ سے{' '}
          <span dir="ltr" className="font-num font-bold">
            Ctrl + P
          </span>{' '}
          دبائیں۔
        </p>
      )}
    </section>
  );
};
