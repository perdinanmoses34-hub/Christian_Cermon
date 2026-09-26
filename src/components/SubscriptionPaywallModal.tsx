import React from 'react';
import { Lock, Crown, CheckCircle2, MessageCircle, X, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { PaymentInfo } from '../types/sermon';

interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  paymentInfo: PaymentInfo;
  userEmail?: string;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({
  isOpen,
  onClose,
  featureName,
  paymentInfo,
  userEmail = '',
}) => {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Shalom Admin Christian Sermon Builder,\n\nSaya ingin berlangganan paket Premium untuk membuka fitur "${featureName}".\nAkun Email: ${userEmail}\n\nMohon info aktivasi dan konfirmasi pembayaran. Terima kasih!`
    );
    window.open(`https://wa.me/${paymentInfo.whatsappContact.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-6 sm:p-7 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-900/40">
            <Crown className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Fitur Khusus Berlangganan
          </div>

          <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-white">
            Buka Akses: {featureName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Menu ini dikunci oleh Administrator untuk pengguna Premium. Tingkatkan akun Anda untuk menikmati seluruh fasilitas pelayanan khotbah tanpa batas.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Benefit items */}
          <div className="space-y-2.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Keuntungan Berlangganan Premium:
            </h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Download file presentasi PowerPoint (.PPTX) asli tanpa batas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Akses penuh seluruh tafsiran eksegesis para pakar kredibel</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bantuan AI Sermon Assistant tanpa batas revisi di Editor Khotbah</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Akses perbandingan Alkitab lengkap hingga bahasa daerah Tolaki</span>
              </li>
            </ul>
          </div>

          {/* Pricing & Bank Info */}
          <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Biaya Berlangganan</span>
                <p className="text-base font-bold text-slate-900">{paymentInfo.monthlyPrice}</p>
              </div>
              <span className="text-xs text-amber-900 font-semibold bg-amber-200/80 px-2.5 py-1 rounded-lg">
                Atau {paymentInfo.yearlyPrice}
              </span>
            </div>

            <div className="pt-2 border-t border-amber-200/70 text-xs space-y-1">
              <p className="text-slate-600">Transfer ke Rekening Resmi:</p>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-800" />
                {paymentInfo.bankName} — <strong>{paymentInfo.accountNumber}</strong>
              </p>
              <p className="text-slate-600">a.n. <strong>{paymentInfo.accountHolder}</strong></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi / Aktifkan via WhatsApp Admin</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
