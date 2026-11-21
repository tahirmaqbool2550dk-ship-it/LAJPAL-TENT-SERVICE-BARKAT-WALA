import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Printer, Download } from 'lucide-react';
import { ActiveTab, Bill, PaperSize } from './types/bill';
import {
  createBlankBill,
  createEmptyItem,
  loadBillsFromStorage,
  saveBillsToStorage,
} from './utils/billing';
import { downloadInvoicePdf } from './utils/pdfExport';
import { BusinessHeader } from './components/BusinessHeader';
import { BillEditor } from './components/BillEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { SavedBillsHistory } from './components/SavedBillsHistory';
import { ConfirmModal } from './components/ConfirmModal';
import { FitMetrics, PrintSheet5x7, PrintSheet5x7Handle } from './components/PrintSheet5x7';
import { PrintInstructionsModal } from './components/PrintInstructionsModal';

export default function App() {
  const [savedBills, setSavedBills] = useState<Bill[]>(() => loadBillsFromStorage());
  const [currentBill, setCurrentBill] = useState<Bill>(() =>
    createBlankBill(loadBillsFromStorage())
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const paperSize: PaperSize = '5x7';
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [printBlockedHint, setPrintBlockedHint] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [showPrintGuide, setShowPrintGuide] = useState(false);
  const [fitMetrics, setFitMetrics] = useState<FitMetrics>({ tier: 0, scale: 1 });

  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const printSheetRef = useRef<HTMLDivElement | null>(null);
  const printControllerRef = useRef<PrintSheet5x7Handle | null>(null);

  const isEditingSaved = savedBills.some((b) => b.id === currentBill.id);

  // Sync @page CSS rule for exact 5in x 7in portrait single-page physical printing
  useEffect(() => {
    const styleId = 'dynamic-print-page-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = '@page { size: 5in 7in; margin: 0; }';
  }, []);

  // Preload Jameel Noori Nastaleeq font as soon as the app mounts
  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    void document.fonts.load('400 16px "Jameel Noori Nastaleeq"');
    void document.fonts.load('700 16px "Jameel Noori Nastaleeq"');
  }, []);

  // Auto-dismiss transient inline status banners after 4.5 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const handleAddItem = () => {
    setCurrentBill((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentBill((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleSaveBill = (): boolean => {
    const trimmedNumber = currentBill.billNumber.trim();
    if (!trimmedNumber) {
      setStatusMessage({
        type: 'error',
        text: 'براہ کرم بل محفوظ کرنے سے پہلے بل نمبر درج کریں۔',
      });
      return false;
    }

    const duplicateNumber = savedBills.find(
      (b) =>
        b.id !== currentBill.id &&
        b.billNumber.trim().toUpperCase() === trimmedNumber.toUpperCase()
    );

    if (duplicateNumber) {
      setStatusMessage({
        type: 'error',
        text: `بل نمبر "${trimmedNumber}" پہلے سے موجود ہے۔ براہ کرم نیا بل نمبر درج کریں۔`,
      });
      return false;
    }

    const nowIso = new Date().toISOString();
    const billToStore: Bill = {
      ...currentBill,
      billNumber: trimmedNumber,
      updatedAt: nowIso,
    };

    const exists = savedBills.some((b) => b.id === billToStore.id);
    const nextBills = exists
      ? savedBills.map((b) => (b.id === billToStore.id ? billToStore : b))
      : [billToStore, ...savedBills];

    const saved = saveBillsToStorage(nextBills);
    if (!saved) {
      setStatusMessage({
        type: 'error',
        text: 'براؤزر اسٹوریج میں بل محفوظ کرنے میں مسئلہ پیش آیا۔',
      });
      return false;
    }

    setSavedBills(nextBills);
    setCurrentBill(billToStore);
    setStatusMessage({
      type: 'success',
      text: exists
        ? `بل نمبر ${billToStore.billNumber} کامیابی سے اپ ڈیٹ اور محفوظ ہو گیا۔`
        : `نیا بل نمبر ${billToStore.billNumber} کامیابی سے محفوظ ہو گیا۔`,
    });
    return true;
  };

  const handleNewBill = () => {
    const fresh = createBlankBill(savedBills);
    setCurrentBill(fresh);
    setActiveTab('editor');
    setStatusMessage({
      type: 'success',
      text: `نیا بل نمبر ${fresh.billNumber} تیار ہے۔`,
    });
  };

  /**
   * Direct Print handler: invokes window.print() synchronously from the user's click.
   * Never triggers PDF generation, popups, iframes, or new windows.
   */
  const runDirectPrint = () => {
    printControllerRef.current?.fitNow();

    let beforePrintFired = false;
    const handleBeforePrint = () => {
      beforePrintFired = true;
    };

    window.addEventListener('beforeprint', handleBeforePrint, { once: true });
    window.print();

    window.setTimeout(() => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      setPrintBlockedHint(!beforePrintFired);
    }, 300);
  };

  const handlePrintCurrentBill = () => {
    if (activeTab !== 'editor') {
      flushSync(() => {
        setActiveTab('editor');
      });
    }
    runDirectPrint();
  };

  const handleDownloadPdfForCurrent = async () => {
    const target = printSheetRef.current;
    if (!target) return;
    printControllerRef.current?.fitNow();
    setIsExportingPdf(true);
    try {
      await downloadInvoicePdf(target, currentBill.billNumber, paperSize);
      setStatusMessage({
        type: 'success',
        text: `بل نمبر ${currentBill.billNumber} کی 5×7 انچ PDF کامیابی سے ڈاؤن لوڈ ہو گئی۔`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'PDF بنانے میں دشواری پیش آئی۔ براہ کرم پرنٹ بٹن سے Save as PDF آزمائیں۔',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleEditSavedBill = (bill: Bill) => {
    // Deep clone items so editing does not mutate savedBills until explicitly saved
    setCurrentBill({
      ...bill,
      items: bill.items.map((item) => ({ ...item })),
    });
    setActiveTab('editor');
    setStatusMessage({
      type: 'success',
      text: `بل نمبر ${bill.billNumber} ترمیم کے لیے کھول دیا گیا ہے۔`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintSavedBill = (bill: Bill) => {
    flushSync(() => {
      setCurrentBill({
        ...bill,
        items: bill.items.map((item) => ({ ...item })),
      });
      setActiveTab('editor');
    });
    runDirectPrint();
  };

  const handleDownloadSavedBillPdf = (bill: Bill) => {
    flushSync(() => {
      setCurrentBill({
        ...bill,
        items: bill.items.map((item) => ({ ...item })),
      });
      setActiveTab('editor');
    });
    window.requestAnimationFrame(() => {
      window.setTimeout(async () => {
        const target = printSheetRef.current;
        if (!target) return;
        printControllerRef.current?.fitNow();
        setIsExportingPdf(true);
        try {
          await downloadInvoicePdf(target, bill.billNumber, paperSize);
          setStatusMessage({
            type: 'success',
            text: `بل نمبر ${bill.billNumber} کی 5×7 انچ PDF کامیابی سے ڈاؤن لوڈ ہو گئی۔`,
          });
        } catch {
          setStatusMessage({
            type: 'error',
            text: 'PDF بنانے میں دشواری پیش آئی۔',
          });
        } finally {
          setIsExportingPdf(false);
        }
      }, 150);
    });
  };

  const handleConfirmDeleteBill = () => {
    if (!billToDelete) return;
    const nextBills = savedBills.filter((b) => b.id !== billToDelete.id);
    saveBillsToStorage(nextBills);
    setSavedBills(nextBills);

    if (currentBill.id === billToDelete.id) {
      setCurrentBill(createBlankBill(nextBills));
    }

    setStatusMessage({
      type: 'success',
      text: `بل نمبر ${billToDelete.billNumber} ریکارڈ سے حذف کر دیا گیا۔`,
    });
    setBillToDelete(null);
  };

  return (
    <div className="print-app-shell min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <BusinessHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedBillsCount={savedBills.length}
        onOpenPrintGuide={() => setShowPrintGuide(true)}
      />

      <main className="no-print print-main mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'editor' ? (
          <div className="print-editor-grid grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
            {/* Left/Right in RTL: Bill Editor Form */}
            <div className="no-print xl:col-span-6">
              <BillEditor
                bill={currentBill}
                isEditingSaved={isEditingSaved}
                isExportingPdf={isExportingPdf}
                statusMessage={statusMessage}
                printBlockedHint={printBlockedHint}
                onChangeBill={setCurrentBill}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onSaveBill={handleSaveBill}
                onNewBill={handleNewBill}
                onPrintBill={handlePrintCurrentBill}
                onDownloadPdf={handleDownloadPdfForCurrent}
                onViewHistory={() => setActiveTab('history')}
              />
            </div>

            {/* Live Computerized Invoice Preview */}
            <div className="xl:col-span-6">
              <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-urdu text-base font-bold text-[#0B1F3A]">
                    اصل بل کا لائیو پیش نظارہ
                  </span>
                  <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-[#0F6B43]">
                    <span dir="ltr" className="font-num font-bold">5 × 7 in</span>{' '}
                    <span className="font-urdu">
                      · 1 صفحہ ({Math.round(fitMetrics.scale * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintCurrentBill}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#133158] whitespace-nowrap"
                  >
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-urdu">پرنٹ</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdfForCurrent}
                    disabled={isExportingPdf}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#C89B3C] px-3 py-1.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#d9ad4d] disabled:opacity-60 whitespace-nowrap"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span dir="ltr" className="font-latin font-bold">PDF</span>
                  </button>
                </div>
              </div>

              <InvoicePreview
                bill={currentBill}
                paperSize={paperSize}
                invoiceRef={invoiceRef}
              />
            </div>
          </div>
        ) : (
          <SavedBillsHistory
            bills={savedBills}
            activeBillId={currentBill.id}
            onEditBill={handleEditSavedBill}
            onPrintBill={handlePrintSavedBill}
            onDownloadBillPdf={handleDownloadSavedBillPdf}
            onRequestDeleteBill={setBillToDelete}
            onCreateNewBill={handleNewBill}
          />
        )}
      </main>

      {/* Dedicated Fitted 5x7 Inch Single-Page Print & PDF Sheet */}
      <PrintSheet5x7
        bill={currentBill}
        sheetRef={printSheetRef}
        controllerRef={printControllerRef}
        onFitChange={setFitMetrics}
      />

      <footer className="no-print border-t border-slate-200 bg-white py-4 text-center">
        <div className="mx-auto max-w-[1360px] px-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
          <span className="font-urdu font-semibold text-[#0B1F3A]">
            لجپال ٹینٹ سروس برکت والا — کمپیوٹرائزڈ بلنگ سسٹم
          </span>
          <div className="flex items-center gap-3">
            <a href="tel:03013927492" className="hover:text-[#0B1F3A] font-num" dir="ltr">
              0301-3927492
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://wa.me/923056359218"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0F6B43] font-num"
              dir="ltr"
            >
              WhatsApp: 0305-6359218
            </a>
          </div>
        </div>
      </footer>

      <ConfirmModal
        isOpen={billToDelete !== null}
        title="بل حذف کرنے کی تصدیق"
        message={
          billToDelete
            ? `کیا آپ واقعی بل نمبر "${billToDelete.billNumber}" (${
                billToDelete.customerName.trim() || 'بغیر نام گاہک'
              }) کو ہمیشہ کے لیے حذف کرنا چاہتے ہیں؟`
            : ''
        }
        confirmLabel="جی ہاں، حذف کریں"
        cancelLabel="منسوخ کریں"
        variant="danger"
        onConfirm={handleConfirmDeleteBill}
        onCancel={() => setBillToDelete(null)}
      />

      <PrintInstructionsModal
        isOpen={showPrintGuide}
        onClose={() => setShowPrintGuide(false)}
        onPrintNow={handlePrintCurrentBill}
      />
    </div>
  );
}
