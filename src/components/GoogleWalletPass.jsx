import React from 'react';
import { Wallet, Check, Download, ShieldCheck, QrCode, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import './GoogleWalletPass.css';

const GoogleWalletPass = ({ user }) => {
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(true);
    // Real-world: This would call the Google Wallet API to issue a pass
    setTimeout(() => {
      // Success feedback handled via button state
    }, 1000);
  };

  return (
    <div className="wallet-integration card border-glass p-4 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h4 className="font-bold flex items-center gap-2">
            <CreditCard size={16} className="text-blue-400" />
            Digital Event Pass
          </h4>
          <p className="text-[10px] text-secondary">Powered by Google Wallet API</p>
        </div>
        <div className="wallet-badge flex items-center gap-1 bg-green-500/10 text-green-400 text-[9px] px-2 py-0.5 rounded-full border border-green-500/20">
          <ShieldCheck size={10} />
          Verified
        </div>
      </div>

      <div className="wallet-pass-preview mt-4">
        <motion.div 
          className="pass-card bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-xl p-4 shadow-2xl"
          whileHover={{ y: -5, rotateX: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="pass-top border-b border-white/5 pb-3 mb-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-[9px] font-bold tracking-[0.2em] text-white/40">MEETFLOW AI 2026</span>
              <div className="w-8 h-5 bg-white/5 rounded flex items-center justify-center">
                <Wallet size={12} className="text-white/30" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[8px] uppercase tracking-widest text-white/40">Attendee Profile</p>
              <h3 className="text-base font-bold text-white tracking-tight">{user?.name || 'Attendee Name'}</h3>
              <p className="text-[10px] text-blue-400 font-medium">{user?.role || 'Developer'}</p>
            </div>
          </div>
          <div className="pass-bottom">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[7px] uppercase text-white/30 mb-0.5">Access Level</p>
                <p className="text-[10px] font-bold text-white">VIP Full Access</p>
              </div>
              <div className="qr-container bg-white p-1 rounded-lg">
                <QrCode size={42} className="text-[#0f172a]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="wallet-action-container mt-6">
        <button 
          className={`google-wallet-btn w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold transition-all ${
            isSaved 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-black text-white border border-white/10 hover:bg-[#111] active:scale-[0.98]'
          }`}
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? (
            <><Check size={18} /> Pass Saved to Wallet</>
          ) : (
            <>
              <div className="google-wallet-icon flex items-center">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M45.12,24.5c0-1.56-0.14-3.06-0.4-4.5H24v8.51h11.84c-0.51,2.75-2.06,5.08-4.39,6.64v5.52h7.11C42.71,36.76,45.12,31.1,45.12,24.5z"/>
                  <path fill="#34A853" d="M24,46c5.94,0,10.92-1.97,14.56-5.33l-7.11-5.52c-1.97,1.32-4.49,2.1-7.45,2.1c-5.73,0-10.58-3.87-12.31-9.07H4.34v5.7C7.96,41.07,15.4,46,24,46z"/>
                  <path fill="#FBBC05" d="M11.69,28.18C11.25,26.86,11,25.45,11,24s0.25-2.86,0.69-4.18v-5.7H4.34C2.85,17.09,2,20.45,2,24c0,3.55,0.85,6.91,2.34,9.88L11.69,28.18z"/>
                  <path fill="#EA4335" d="M24,10.75c3.23,0,6.13,1.11,8.41,3.29l6.31-6.31C34.9,4.18,29.93,2,24,2C15.4,2,7.96,6.93,4.34,14.12l7.35,5.7C13.42,14.62,18.27,10.75,24,10.75z"/>
                </svg>
              </div>
              Save to Google Wallet
            </>
          )}
        </button>
        <p className="text-[9px] text-center text-white/40 mt-3 font-medium">
          Fast-track entry & smart networking enabled.
        </p>
      </div>
    </div>
  );
};

export default GoogleWalletPass;
