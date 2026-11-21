import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface PrintInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintNow: () => void;
}

export const PrintInstructionsModal: React.FC<PrintInstructionsModalProps> = ({
  isOpen,
  onClose,
  onPrintNow,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-guide-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Printer className="h-5 w-5 shrink-0 text-[#0B1F3A]" aria-hidden="true" />
            <h2 id="print-guide-title" className="font-urdu text-xl font-bold text-[#0B1F3A]">
              5 × 7 انچ پرنٹر سیٹنگز کی ہدایات
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بند کریں"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 font-urdu text-sm sm:text-base text-slate-700">
          <p className="font-semibold text-slate-900">
            بل ہمیشہ خودکار طریقے سے ایک صفحے (<span dir="ltr" className="font-num font-bold">5 × 7 in</span>) پر فٹ ہو کر پرنٹ ہوتا ہے۔ پرنٹ ڈائیلاگ میں یہ سیٹنگز منتخب کریں:
          </p>

          <ul className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#0F6B43]" aria-hidden="true" />
              <span>
                <strong>کاغذ کا سائز (<span dir="ltr" className="font-latin">Paper size</span>):</strong>{' '}
                پرنٹ ونڈو میں <span dir="ltr" className="font-latin font-bold">More settings</span> کھولیں اور{' '}
                <span dir="ltr" className="font-num font-bold">5 × 7 in</span> (یا{' '}
                <span dir="ltr" className="font-num font-bold">127 × 178 mm</span> /{' '}
                <span dir="ltr" className="font-latin font-bold">Custom 5×7</span>) منتخب کریں۔
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#0F6B43]" aria-hidden="true" />
              <span>
                <strong>ترتیب (<span dir="ltr" className="font-latin">Layout</span>):</strong>{' '}
                <span dir="ltr" className="font-latin font-bold">Portrait</span> منتخب رکھیں۔
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#0F6B43]" aria-hidden="true" />
              <span>
                <strong>حاشیہ (<span dir="ltr" className="font-latin">Margins</span>):</strong>{' '}
                <span dir="ltr" className="font-latin font-bold">None</span> یا{' '}
                <span dir="ltr" className="font-latin font-bold">Default</span> منتخب کریں (بل میں اندرونی مارجن پہلے سے شامل ہے)۔
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#0F6B43]" aria-hidden="true" />
              <span>
                <strong>پیمانہ (<span dir="ltr" className="font-latin">Scale</span>):</strong>{' '}
                <span dir="ltr" className="font-latin font-bold">Default / 100%</span> رکھیں، اور رنگین مہر کے لیے{' '}
                <span dir="ltr" className="font-latin font-bold">Background graphics</span> آن کریں۔
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 font-urdu whitespace-nowrap"
          >
            بند کریں
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPrintNow();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#133158] font-urdu whitespace-nowrap"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            ابھی پرنٹ کریں
          </button>
        </div>
      </div>
    </div>
  );
};
