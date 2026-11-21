import React, { useState } from 'react';
import { Bill, PaperSize } from '../types/bill';
import {
  calculateBillTotals,
  calculateItemTotal,
  formatCurrency,
  formatDisplayDate,
} from '../utils/billing';

interface InvoicePreviewProps {
  bill: Bill;
  paperSize: PaperSize;
  invoiceRef?: React.RefObject<HTMLDivElement | null>;
}

const InvoiceHeaderPhoto: React.FC<{
  src: string;
  alt: string;
  compact: boolean;
}> = ({ src, alt, compact }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded border ${compact ? 'h-16 sm:h-20' : 'h-24 sm:h-28'}`}
      style={{ borderColor: '#C89B3C', backgroundColor: '#071529' }}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-2 text-center font-urdu text-xs"
          style={{ color: '#F5D076' }}
        >
          {alt}
        </div>
      )}
    </div>
  );
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  bill,
  paperSize,
  invoiceRef,
}) => {
  const totals = calculateBillTotals(bill.items, bill.receivedAmount);
  const isCompact = paperSize === 'half-a4';

  return (
    <div
      id="printable-invoice"
      ref={invoiceRef}
      dir="rtl"
      className={`bg-white text-slate-900 border border-slate-300 mx-auto shadow-sm ${
        isCompact
          ? 'paper-half-a4 max-w-[560px] p-4 sm:p-5'
          : 'paper-a4 max-w-[820px] p-5 sm:p-8'
      }`}
      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* Letterhead Header */}
      <div
        className={`border-b-2 pb-3 ${isCompact ? 'mb-3' : 'mb-5 pb-4'}`}
        style={{ borderColor: '#0B1F3A' }}
      >
        <div
          className={`rounded-md text-center ${isCompact ? 'px-3 py-2.5' : 'px-4 py-3.5'}`}
          style={{
            backgroundColor: '#0B1F3A',
            color: '#ffffff',
            borderBottom: '3px solid #C89B3C',
          }}
        >
          {/* Top Tent & Marquee Photographs */}
          <div className={`grid grid-cols-2 ${isCompact ? 'gap-2 mb-2' : 'gap-3 mb-3'}`}>
            <InvoiceHeaderPhoto
              src="/src/assets/images/pakistani_tent_canopy_1795234895117.jpg"
              alt="لجپال ٹینٹ سروس برکت والا - شامیانہ اور ٹینٹ انتظام"
              compact={isCompact}
            />
            <InvoiceHeaderPhoto
              src="/src/assets/images/marquee_tent_interior_1795234895605.jpg"
              alt="لجپال ٹینٹ سروس برکت والا - مارکی ٹینٹ اور تقریب کا انتظام"
              compact={isCompact}
            />
          </div>

          <p
            dir="ltr"
            className={`font-latin font-extrabold tracking-wide uppercase ${
              isCompact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
            }`}
            style={{ color: '#F5D076' }}
          >
            LAJPAL TENT SERVICE BARKAT WALA
          </p>
          <h2
            className={`font-urdu font-bold mt-0.5 ${
              isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
            }`}
            style={{ color: '#ffffff' }}
          >
            لجپال ٹینٹ سروس برکت والا
          </h2>

          {/* Exact Urdu Service Description */}
          <p
            dir="rtl"
            className={`font-urdu mt-1 mx-auto leading-relaxed ${
              isCompact ? 'text-xs' : 'text-sm sm:text-base'
            }`}
            style={{ color: '#e2e8f0' }}
          >
            شادی بیاہ، ولیمہ، محافل اور ہر قسم کی تقریبات کے لیے معیاری ٹینٹ، شامیانہ، مارکی، کرسیاں، میزیں اور قالین کی مکمل سروس
          </p>

          {/* Exact Contact Details (Plain text + Green WhatsApp Icon, No Buttons) */}
          <div
            dir="ltr"
            className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-center gap-x-5 gap-y-1 ${
              isCompact ? 'text-xs' : 'text-sm'
            }`}
            style={{ borderColor: 'rgba(255,255,255,0.18)' }}
          >
            <p className="font-latin font-semibold tracking-wide" style={{ color: '#F5D076' }}>
              Maqbool Ahmad:{' '}
              <span className="font-num font-bold" style={{ color: '#ffffff' }}>
                0301-3927492
              </span>
            </p>
            <p className="inline-flex items-center justify-center gap-1.5 font-latin font-semibold tracking-wide" style={{ color: '#F5D076' }}>
              <svg
                viewBox="0 0 32 32"
                className={isCompact ? 'h-4 w-4 shrink-0' : 'h-4.5 w-4.5 shrink-0'}
                aria-label="WhatsApp"
                role="img"
              >
                <circle cx="16" cy="16" r="16" fill="#25D366" />
                <path
                  fill="#FFFFFF"
                  d="M23.5 19.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"
                />
              </svg>
              <span>
                Tahir Maqbool:{' '}
                <span className="font-num font-bold" style={{ color: '#ffffff' }}>
                  0305-6359218
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span
            className={`font-urdu font-bold ${isCompact ? 'text-base' : 'text-lg'}`}
            style={{ color: '#0B1F3A' }}
          >
            کمپیوٹرائزڈ کرایہ بل / انوائس
          </span>
          <span className="font-urdu text-xs sm:text-sm" style={{ color: '#475569' }}>
            کاغذ کا سائز: {isCompact ? 'نصف A4' : 'A4'}
          </span>
        </div>
      </div>

      {/* Bill & Customer Information — Exact 6-Row Order */}
      <div
        className={`flex flex-col border rounded-md overflow-hidden ${
          isCompact ? 'text-xs sm:text-sm mb-3' : 'text-sm sm:text-base mb-5'
        }`}
        style={{ borderColor: '#cbd5e1' }}
      >
        {/* 1. گاہک کا نام */}
        <div
          className={`flex items-center justify-between gap-4 border-b px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            گاہک کا نام:
          </span>
          <span className="font-urdu font-semibold text-left truncate" style={{ color: '#0f172a' }}>
            {bill.customerName.trim() || '—'}
          </span>
        </div>

        {/* 2. موبائل نمبر */}
        <div
          className={`flex items-center justify-between gap-4 border-b px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            موبائل نمبر:
          </span>
          <span dir="ltr" className="font-num font-semibold" style={{ color: '#0f172a' }}>
            {bill.mobileNumber.trim() || '—'}
          </span>
        </div>

        {/* 3. تاریخ */}
        <div
          className={`flex items-center justify-between gap-4 border-b px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            تاریخ:
          </span>
          <span dir="ltr" className="font-num font-semibold" style={{ color: '#0f172a' }}>
            {formatDisplayDate(bill.date)}
          </span>
        </div>

        {/* 4. تقریب کی تاریخ */}
        <div
          className={`flex items-center justify-between gap-4 border-b px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            تقریب کی تاریخ:
          </span>
          <span dir="ltr" className="font-num font-semibold" style={{ color: '#0f172a' }}>
            {formatDisplayDate(bill.eventDate)}
          </span>
        </div>

        {/* 5. تقریب کا مقام */}
        <div
          className={`flex items-center justify-between gap-4 border-b px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            تقریب کا مقام:
          </span>
          <span className="font-urdu font-semibold text-left truncate" style={{ color: '#0f172a' }}>
            {bill.eventVenue.trim() || '—'}
          </span>
        </div>

        {/* 6. بل نمبر */}
        <div
          className={`flex items-center justify-between gap-4 px-3 ${
            isCompact ? 'py-1.5' : 'py-2'
          }`}
          style={{ backgroundColor: '#ffffff' }}
        >
          <span className="font-urdu font-bold shrink-0" style={{ color: '#0B1F3A' }}>
            بل نمبر:
          </span>
          <span dir="ltr" className="font-num font-bold" style={{ color: '#0B1F3A' }}>
            {bill.billNumber || '—'}
          </span>
        </div>
      </div>

      {/* Itemized Tent Rental Table */}
      <div className={isCompact ? 'mb-3' : 'mb-5'}>
        <table
          className="w-full border-collapse border"
          style={{ borderColor: '#94a3b8' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#0B1F3A', color: '#ffffff' }}>
              <th
                className={`border font-urdu font-bold text-center ${
                  isCompact ? 'px-2 py-1.5 text-xs w-10' : 'px-3 py-2 text-sm w-12'
                }`}
                style={{ borderColor: '#1e3a5f' }}
              >
                نمبر
              </th>
              <th
                className={`border font-urdu font-bold text-right ${
                  isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                }`}
                style={{ borderColor: '#1e3a5f' }}
              >
                سامان کا نام
              </th>
              <th
                className={`border font-urdu font-bold text-center ${
                  isCompact ? 'px-2 py-1.5 text-xs w-16' : 'px-3 py-2 text-sm w-20'
                }`}
                style={{ borderColor: '#1e3a5f' }}
              >
                تعداد
              </th>
              <th
                className={`border font-urdu font-bold text-left ${
                  isCompact ? 'px-2 py-1.5 text-xs w-24' : 'px-3 py-2 text-sm w-28'
                }`}
                style={{ borderColor: '#1e3a5f' }}
              >
                فی آئٹم ریٹ
              </th>
              <th
                className={`border font-urdu font-bold text-left ${
                  isCompact ? 'px-2 py-1.5 text-xs w-24' : 'px-3 py-2 text-sm w-32'
                }`}
                style={{ borderColor: '#1e3a5f' }}
              >
                کل رقم
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border px-3 py-4 text-center font-urdu text-sm"
                  style={{ borderColor: '#cbd5e1', color: '#64748b' }}
                >
                  کوئی سامان درج نہیں کیا گیا
                </td>
              </tr>
            ) : (
              bill.items.map((item, idx) => {
                const lineTotal = calculateItemTotal(item.quantity, item.rate);
                const qtyDisplay = item.quantity === '' ? 0 : item.quantity;
                const rateDisplay = item.rate === '' ? 0 : item.rate;
                return (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td
                      className={`border text-center font-num ${
                        isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                      }`}
                      style={{ borderColor: '#cbd5e1', color: '#475569' }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className={`border font-urdu text-right ${
                        isCompact ? 'px-2 py-1.5 text-xs sm:text-sm' : 'px-3 py-2 text-sm sm:text-base'
                      }`}
                      style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                    >
                      {item.name.trim() || '—'}
                    </td>
                    <td
                      dir="ltr"
                      className={`border text-center font-num font-semibold ${
                        isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                      }`}
                      style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                    >
                      {qtyDisplay}
                    </td>
                    <td
                      dir="ltr"
                      className={`border text-left font-num ${
                        isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                      }`}
                      style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                    >
                      {formatCurrency(Number(rateDisplay))}
                    </td>
                    <td
                      dir="ltr"
                      className={`border text-left font-num font-bold ${
                        isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                      }`}
                      style={{ borderColor: '#cbd5e1', color: '#0B1F3A' }}
                    >
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className={`flex justify-end ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <div
          className={`w-full border rounded-md overflow-hidden ${
            isCompact ? 'max-w-[260px] text-xs sm:text-sm' : 'max-w-[320px] text-sm sm:text-base'
          }`}
          style={{ borderColor: '#94a3b8' }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
          >
            <span className="font-urdu font-bold" style={{ color: '#0B1F3A' }}>
              کل بل:
            </span>
            <span dir="ltr" className="font-num font-bold" style={{ color: '#0B1F3A' }}>
              Rs. {formatCurrency(totals.grandTotal)}
            </span>
          </div>

          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
          >
            <span className="font-urdu font-bold" style={{ color: '#0F6B43' }}>
              وصول شدہ رقم:
            </span>
            <span dir="ltr" className="font-num font-bold" style={{ color: '#0F6B43' }}>
              Rs. {formatCurrency(totals.receivedAmount)}
            </span>
          </div>

          <div
            className="flex items-center justify-between px-3 py-2.5"
            style={{
              backgroundColor: totals.remainingBalance > 0 ? '#FEF3C7' : '#ECFDF5',
              borderTop: '2px solid #0B1F3A',
            }}
          >
            <span
              className="font-urdu font-bold"
              style={{
                color: totals.remainingBalance > 0 ? '#92400E' : '#065F46',
              }}
            >
              بقایا رقم:
            </span>
            <span
              dir="ltr"
              className={`font-num font-extrabold ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}
              style={{
                color: totals.remainingBalance > 0 ? '#92400E' : '#065F46',
              }}
            >
              Rs. {formatCurrency(totals.remainingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer & Official Green Business Stamp */}
      <div
        className={`flex flex-wrap items-end justify-between gap-4 border-t pt-4 ${
          isCompact ? 'mt-3' : 'mt-6'
        }`}
        style={{ borderColor: '#cbd5e1' }}
      >
        {/* Thank You Note & Signature */}
        <div className="flex flex-col gap-3">
          <p
            className={`font-urdu font-bold ${isCompact ? 'text-base' : 'text-lg sm:text-xl'}`}
            style={{ color: '#0B1F3A' }}
          >
            آپ کے اعتماد کا شکریہ!
          </p>
          <div className="pt-2">
            <div
              className="w-40 border-b border-dashed mb-1"
              style={{ borderColor: '#64748b' }}
            />
            <span className="font-urdu text-xs" style={{ color: '#475569' }}>
              دستخط / مہر انچارج
            </span>
          </div>
        </div>

        {/* Official Green Business Stamp */}
        <div
          className={`urdu-official-stamp rounded-lg text-center ${
            isCompact ? 'px-3.5 py-2' : 'px-5 py-2.5'
          }`}
          style={{
            borderColor: '#0F6B43',
            color: '#0F6B43',
            backgroundColor: '#F0FDF4',
          }}
        >
          <p className={`font-urdu font-bold leading-relaxed ${isCompact ? 'text-sm' : 'text-base'}`}>
            لجپال ٹینٹ سروس
          </p>
          <p className={`font-urdu font-bold leading-relaxed ${isCompact ? 'text-xs' : 'text-sm'}`}>
            برکت والا
          </p>
          <p className={`font-urdu font-semibold mt-0.5 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
            رابطہ نمبر:{' '}
            <span dir="ltr" className="font-num font-bold">
              0301-3927492
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Important Rental Terms & Conditions */}
      <div
        dir="rtl"
        className={`rounded-md border text-right ${
          isCompact ? 'mt-3 px-3 py-2' : 'mt-5 px-4 py-3'
        }`}
        style={{
          borderColor: '#0B1F3A',
          backgroundColor: '#f8fafc',
        }}
      >
        <h3
          className={`font-urdu font-bold border-b pb-1 ${
            isCompact ? 'text-sm mb-1.5' : 'text-base sm:text-lg mb-2'
          }`}
          style={{ color: '#0B1F3A', borderColor: '#cbd5e1' }}
        >
          ضروری ہدایات و شرائط
        </h3>
        <ol
          className={`font-urdu space-y-1 leading-relaxed ${
            isCompact ? 'text-xs' : 'text-sm sm:text-base'
          }`}
          style={{ color: '#0f172a' }}
        >
          <li>1. سامان گم یا کم ہونے کی صورت میں کلائنٹ خود ذمہ دار ہوگا۔</li>
          <li>2. سامان پروگرام ختم ہونے کے فوراً بعد واپس کرنا ہوگا، بصورتِ دیگر اگلے دن کا کرایہ بھی وصول کیا جائے گا۔</li>
        </ol>
      </div>
    </div>
  );
};
