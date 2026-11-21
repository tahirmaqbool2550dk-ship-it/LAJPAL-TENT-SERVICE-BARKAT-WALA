import React, { useState } from 'react';
import { FilePlus2, Archive, Printer, HelpCircle } from 'lucide-react';
import { ActiveTab } from '../types/bill';

interface BusinessHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedBillsCount: number;
  onOpenPrintGuide: () => void;
}

interface PhotoCardProps {
  src: string;
  alt: string;
  caption: string;
}

const TentPhotoCard: React.FC<PhotoCardProps> = ({ src, alt, caption }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#C89B3C]/40 bg-[#071529] aspect-video">
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#102C4E] to-[#0F6B43]/40 p-4 text-center">
          <span className="font-urdu text-sm text-[#C89B3C]">{caption}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
        <p className="font-urdu text-xs text-white/95 truncate">{caption}</p>
      </div>
    </div>
  );
};

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({
  activeTab,
  onTabChange,
  savedBillsCount,
  onOpenPrintGuide,
}) => {
  return (
    <header className="no-print bg-[#0B1F3A] text-white border-b-4 border-[#C89B3C]">
      <div className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Main Brand + Tent Showcase Split */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* Brand Identity & Direct Contact Actions */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/15 pb-3">
              <div>
                <h1 className="font-urdu text-3xl sm:text-4xl font-bold text-[#F5D076] leading-relaxed">
                  لجپال ٹینٹ سروس برکت والا
                </h1>
                <p
                  dir="ltr"
                  className="font-latin text-lg sm:text-2xl font-extrabold tracking-wider text-white uppercase mt-0.5 text-right"
                >
                  LAJPAL TENT SERVICE BARKAT WALA
                </p>
              </div>
            </div>

            <p className="font-urdu text-base sm:text-lg text-slate-200 max-w-2xl">
              شادی بیاہ، ولیمہ، محافل اور ہر قسم کی تقریبات کے لیے معیاری ٹینٹ، شامیانہ، مارکی، کرسیاں، میزیں اور قالین کی مکمل سروس
            </p>

            {/* Clean Contact Details */}
            <div
              dir="ltr"
              className="flex flex-col items-end gap-2 pt-2 text-right"
            >
              <p className="font-latin text-base sm:text-lg font-semibold tracking-wide text-[#F5D076]">
                Maqbool Ahmad:{' '}
                <span className="font-num font-bold text-white">0301-3927492</span>
              </p>
              <p className="inline-flex items-center gap-2 font-latin text-base sm:text-lg font-semibold tracking-wide text-[#F5D076]">
                <svg
                  viewBox="0 0 32 32"
                  className="h-5 w-5 shrink-0"
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
                  <span className="font-num font-bold text-white">0305-6359218</span>
                </span>
              </p>
            </div>
          </div>

          {/* Realistic Pakistani Tent Service Photographs */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <TentPhotoCard
              src="/src/assets/images/pakistani_tent_canopy_1795234895117.jpg"
              alt="لجپال ٹینٹ سروس برکت والا کا خوبصورت شامیانہ اور تقریب کا انتظام"
              caption="شامیانہ اور لان ٹینٹ سیٹ اپ"
            />
            <TentPhotoCard
              src="/src/assets/images/marquee_tent_interior_1795234895605.jpg"
              alt="شادی و تقریبات کے لیے مارکی ٹینٹ، میز اور کرسیوں کا انتظام"
              caption="مارکی ٹینٹ اور بیٹھنے کا انتظام"
            />
          </div>
        </div>

        {/* Workspace Navigation & Paper Format Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
          <nav className="flex items-center gap-2" aria-label="مین نیویگیشن">
            <button
              type="button"
              onClick={() => onTabChange('editor')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'editor'
                  ? 'bg-white text-[#0B1F3A] shadow-sm'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FilePlus2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-urdu">بل بنائیں / ایڈیٹر</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'bg-white text-[#0B1F3A] shadow-sm'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Archive className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-urdu">محفوظ شدہ بل دیکھیں</span>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <span dir="ltr" className="font-num text-xs sm:text-sm font-bold">
                {savedBillsCount}
              </span>
            </button>
          </nav>

          {/* Single A4 (210 x 297 mm) Paper Format Indicator & Printer Guide */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-urdu whitespace-nowrap">
              <Printer className="h-4 w-4 text-[#C89B3C]" aria-hidden="true" />
              پرنٹ سائز:
            </span>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#071529] px-3 py-1.5 border border-white/15">
              <span dir="ltr" className="font-latin text-xs sm:text-sm font-bold text-[#F5D076]">
                A4 (210 × 297 mm)
              </span>
              <span className="font-urdu text-xs sm:text-sm font-semibold text-white">
                (مکمل بل — 1 صفحہ)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenPrintGuide}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/20 whitespace-nowrap shrink-0"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#F5D076]" aria-hidden="true" />
              <span className="font-urdu">پرنٹر سیٹنگز ہدایات</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
