import React, { useMemo, useState } from 'react';
import {
  Search,
  Edit3,
  Printer,
  Download,
  Trash2,
  FilePlus2,
  X,
} from 'lucide-react';
import { Bill } from '../types/bill';
import {
  calculateBillTotals,
  formatCurrency,
  formatDisplayDate,
} from '../utils/billing';

interface SavedBillsHistoryProps {
  bills: Bill[];
  activeBillId: string;
  onEditBill: (bill: Bill) => void;
  onPrintBill: (bill: Bill) => void;
  onDownloadBillPdf: (bill: Bill) => void;
  onRequestDeleteBill: (bill: Bill) => void;
  onCreateNewBill: () => void;
}

export const SavedBillsHistory: React.FC<SavedBillsHistoryProps> = ({
  bills,
  activeBillId,
  onEditBill,
  onPrintBill,
  onDownloadBillPdf,
  onRequestDeleteBill,
  onCreateNewBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredBills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bills
      .filter((bill) => {
        if (dateFilter && bill.date !== dateFilter && bill.eventDate !== dateFilter) {
          return false;
        }
        if (!query) return true;
        return (
          bill.billNumber.toLowerCase().includes(query) ||
          bill.customerName.toLowerCase().includes(query) ||
          bill.mobileNumber.toLowerCase().includes(query) ||
          bill.eventVenue.toLowerCase().includes(query) ||
          bill.date.includes(query) ||
          formatDisplayDate(bill.date).includes(query)
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [bills, searchQuery, dateFilter]);

  const aggregateStats = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        const totals = calculateBillTotals(bill.items, bill.receivedAmount);
        acc.totalBilled += totals.grandTotal;
        acc.totalReceived += totals.receivedAmount;
        acc.totalRemaining += totals.remainingBalance;
        return acc;
      },
      { totalBilled: 0, totalReceived: 0, totalRemaining: 0 }
    );
  }, [filteredBills]);

  const hasActiveFilters = searchQuery.trim() !== '' || dateFilter !== '';

  return (
    <section
      className="no-print rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
      aria-label="محفوظ شدہ بلز کا ریکارڈ"
    >
      {/* Header & Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="font-urdu text-2xl font-bold text-[#0B1F3A]">
            محفوظ شدہ بلز کا ریکارڈ
          </h2>
          <p className="font-urdu text-sm text-slate-600">
            تمام بل براؤزر میں محفوظ ہیں — بل نمبر، گاہک کے نام یا تاریخ سے تلاش کریں
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewBill}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F6B43] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0c5636] whitespace-nowrap shrink-0"
        >
          <FilePlus2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-urdu">نیا بل بنائیں</span>
        </button>
      </div>

      {/* Aggregate Totals Strip */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
        <div className="px-4 py-3">
          <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">تعداد بلز</p>
          <p dir="ltr" className="font-num text-lg font-extrabold text-[#0B1F3A] mt-0.5 text-right">
            {filteredBills.length}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">مجموعی بلنگ</p>
          <p dir="ltr" className="font-num text-lg font-extrabold text-[#0B1F3A] mt-0.5 text-right">
            Rs. {formatCurrency(aggregateStats.totalBilled)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">کل وصول شدہ</p>
          <p dir="ltr" className="font-num text-lg font-extrabold text-[#0F6B43] mt-0.5 text-right">
            Rs. {formatCurrency(aggregateStats.totalReceived)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-urdu text-xs sm:text-sm font-bold text-slate-600">کل بقایا رقم</p>
          <p dir="ltr" className="font-num text-lg font-extrabold text-amber-800 mt-0.5 text-right">
            Rs. {formatCurrency(aggregateStats.totalRemaining)}
          </p>
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-7">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بل نمبر، گاہک کا نام، موبائل یا مقام تلاش کریں..."
            aria-label="بل تلاش کریں"
            className="font-urdu w-full rounded-lg border border-slate-300 bg-white pr-10 pl-3 py-2 text-base text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <input
            type="date"
            dir="ltr"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="تاریخ کے مطابق فلٹر"
            className="font-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 flex items-stretch">
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
            }}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 font-urdu whitespace-nowrap"
          >
            <X className="h-4 w-4 shrink-0" aria-hidden="true" />
            صاف کریں
          </button>
        </div>
      </div>

      {/* Bills Table / Empty State */}
      {bills.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="font-urdu text-xl font-bold text-slate-800">
            ابھی تک کوئی بل محفوظ نہیں کیا گیا
          </p>
          <p className="font-urdu text-sm text-slate-600 mt-1">
            نیا بل بنا کر &quot;بل محفوظ کریں&quot; بٹن دبائیں تاکہ ریکارڈ یہاں ظاہر ہو۔
          </p>
          <button
            type="button"
            onClick={onCreateNewBill}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#133158] font-urdu"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            پہلا بل بنائیں
          </button>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="font-urdu text-lg font-bold text-slate-800">
            آپ کی تلاش کے مطابق کوئی بل نہیں ملا
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 font-urdu"
          >
            تمام محفوظ شدہ بل دکھائیں
          </button>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-right">
            <thead>
              <tr className="bg-[#0B1F3A] text-white">
                <th className="px-3 py-3 font-urdu text-sm font-bold">بل نمبر</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold">تاریخ</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold">گاہک کا نام</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold">تقریب و مقام</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold text-left">کل بل</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold text-left">وصول شدہ</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold text-left">بقایا رقم</th>
                <th className="px-3 py-3 font-urdu text-sm font-bold text-center">عمل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredBills.map((bill) => {
                const totals = calculateBillTotals(bill.items, bill.receivedAmount);
                const isActive = bill.id === activeBillId;
                return (
                  <tr
                    key={bill.id}
                    className={`transition-colors hover:bg-slate-50 ${
                      isActive ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <span dir="ltr" className="font-num text-sm font-bold text-[#0B1F3A]">
                        {bill.billNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span dir="ltr" className="font-num text-sm text-slate-700">
                        {formatDisplayDate(bill.date)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-urdu text-base font-bold text-slate-900">
                        {bill.customerName.trim() || 'نام درج نہیں'}
                      </div>
                      {bill.mobileNumber.trim() && (
                        <div dir="ltr" className="font-num text-xs text-slate-500 text-right">
                          {bill.mobileNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
                        <span dir="ltr" className="font-num text-xs text-slate-600">
                          {formatDisplayDate(bill.eventDate)}
                        </span>
                        {bill.eventVenue.trim() && (
                          <>
                            <span className="text-slate-400" aria-hidden="true">·</span>
                            <span className="font-urdu truncate max-w-[180px]">
                              {bill.eventVenue}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td dir="ltr" className="px-3 py-3 text-left font-num text-sm font-bold text-[#0B1F3A]">
                      {formatCurrency(totals.grandTotal)}
                    </td>
                    <td dir="ltr" className="px-3 py-3 text-left font-num text-sm font-semibold text-[#0F6B43]">
                      {formatCurrency(totals.receivedAmount)}
                    </td>
                    <td
                      dir="ltr"
                      className={`px-3 py-3 text-left font-num text-sm font-bold ${
                        totals.remainingBalance > 0 ? 'text-amber-800' : 'text-emerald-800'
                      }`}
                    >
                      {formatCurrency(totals.remainingBalance)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditBill(bill)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-100 whitespace-nowrap"
                          title="کھولیں / ترمیم کریں"
                        >
                          <Edit3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-urdu">کھولیں</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrintBill(bill)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap"
                          title="بل پرنٹ کریں"
                        >
                          <Printer className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-urdu">پرنٹ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDownloadBillPdf(bill)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#C89B3C]/60 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-amber-100 whitespace-nowrap"
                          title="PDF ڈاؤن لوڈ کریں"
                        >
                          <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span dir="ltr" className="font-latin font-bold">PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRequestDeleteBill(bill)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 whitespace-nowrap"
                          title="بل حذف کریں"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="font-urdu">حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
