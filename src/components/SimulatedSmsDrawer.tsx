import React from 'react';
import { Smartphone, Check, Copy, X, ShieldCheck } from 'lucide-react';
import type { ActiveOtpSession } from '../types';

interface SimulatedSmsDrawerProps {
  smsSession: ActiveOtpSession | null;
  onDismiss: () => void;
  onQuickFillOtp: (otpCode: string) => void;
}

export const SimulatedSmsDrawer: React.FC<SimulatedSmsDrawerProps> = ({
  smsSession,
  onDismiss,
  onQuickFillOtp,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!smsSession) return null;

  const handleCopyAndFill = () => {
    navigator.clipboard?.writeText(smsSession.otpCode).catch(() => {});
    setCopied(true);
    onQuickFillOtp(smsSession.otpCode);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm bg-slate-900 text-white border border-slate-700 rounded-xl shadow-xl p-5 transition-opacity duration-150">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-teal-300">SMS Inbox · {smsSession.patientName}</p>
            <p className="text-xs text-slate-400 font-mono tabular-nums">{smsSession.phoneNumber}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close SMS notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-3.5 space-y-2.5">
        <p className="text-xs text-slate-300 leading-relaxed">
          {smsSession.requestedByName} ({smsSession.hospitalName}) requested access using{' '}
          <span className="font-mono text-white">{smsSession.profileCodeUsed}</span>.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="block text-[11px] text-slate-400">SMS OTP</span>
            <span className="text-xl font-bold font-mono tabular-nums tracking-widest text-teal-400">
              {smsSession.otpCode}
            </span>
          </div>
          {smsSession.verified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <button
              onClick={handleCopyAndFill}
              className="px-3 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Filled
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Auto-Fill OTP
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
