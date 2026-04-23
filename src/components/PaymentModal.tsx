import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, Wallet, Smartphone, ChevronRight, CheckCircle2, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  itemName: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, itemName }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-header border border-border rounded-[40px] max-w-sm w-full overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)]"
          >
            {step === 'method' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                     <Lock size={12} className="text-emerald-500" /> Secure Checkout
                   </div>
                   <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                </div>

                <div className="text-left space-y-1">
                  <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Paying for</p>
                  <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">{itemName}</h3>
                  <p className="text-3xl font-black text-brand italic tracking-tighter">${amount}</p>
                </div>

                <div className="space-y-3">
                   {[
                     { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                     { id: 'upi', name: 'UPI (GPay / PhonePe)', icon: Smartphone },
                     { id: 'wallet', name: 'Digital Wallet', icon: Wallet },
                   ].map((method) => (
                     <button 
                       key={method.id}
                       onClick={handlePay}
                       className="w-full bg-aside border border-border p-5 rounded-2xl flex items-center justify-between group hover:border-brand transition-all active:scale-95"
                     >
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-brand transition-colors">
                           <method.icon size={20} />
                         </div>
                         <span className="text-sm font-bold text-zinc-300 group-hover:text-white">{method.name}</span>
                       </div>
                       <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-all" />
                     </button>
                   ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                   <ShieldCheck size={14} className="text-emerald-500" />
                   <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">PCI-DSS Compliant Gateway</span>
                </div>
              </div>
            )}

            {step === 'processing' && (
               <div className="p-20 text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto text-brand shadow-[0_0_40px_rgba(37,99,235,0.3)]"></div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white uppercase italic tracking-tight">Authorizing...</p>
                    <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Connecting to bank servers</p>
                  </div>
               </div>
            )}

            {step === 'success' && (
               <div className="p-20 text-center space-y-6 bg-emerald-500/5">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white uppercase italic tracking-tight">Payment Success</p>
                    <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Transaction ID: SB-99238423</p>
                  </div>
               </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
