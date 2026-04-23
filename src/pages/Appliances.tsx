import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Appliance } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Smartphone, Tv, Wind, Check, ArrowRight, ShieldCheck, Zap, Repeat } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Appliances() {
  const [items, setItems] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<Appliance | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'appliances'));
        const querySnapshot = await getDocs(q);
        setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appliance)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleRent = async (item: Appliance) => {
    if (!user) return navigate('/login');
    setSelectedItem(item);
  };

  const confirmRental = async () => {
    if (!user || !selectedItem) return;
    try {
      await addDoc(collection(db, 'appliance_rentals'), {
        applianceId: selectedItem.id,
        vendorId: selectedItem.vendorId,
        userId: user.uid,
        userName: user.displayName || user.email,
        itemName: selectedItem.name,
        status: 'pending',
        rentalPeriod: 3, // Default 3 months
        startDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      alert('Rental request submitted!');
      setSelectedItem(null);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A1A20] to-[#0A0A0C] rounded-[40px] p-12 md:p-20 border border-border overflow-hidden relative group">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-brand/20">
            <Zap size={14} /> Smart Rentals
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase italic">
            Rent the <span className="text-brand">Comfort.</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Upgrade your living space without the heavy costs. High-quality appliances delivered and installed for free.
          </p>
        </div>
        <Wind className="absolute -bottom-20 -right-20 w-96 h-96 text-brand/5 group-hover:scale-110 transition-transform duration-1000" />
      </section>

      {/* Catalog */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Rental Store</h2>
            <p className="text-zinc-600 text-sm font-bold tracking-widest uppercase mt-1">Verified pre-owned & brand new</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 rounded-[32px] bg-surface animate-pulse border border-border"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface border border-border rounded-[32px] overflow-hidden group hover:border-brand/40 transition-all flex flex-col shadow-lg shadow-black/20"
              >
                <div className="aspect-square bg-aside flex items-center justify-center relative overflow-hidden">
                  <div className="text-zinc-700 group-hover:text-brand p-12 transition-all duration-700 group-hover:scale-110">
                    {item.type === 'fridge' ? <Wind size={80} /> : <Tv size={80} />}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-lg uppercase font-bold tracking-widest">In Stock</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 flex-grow">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white uppercase tracking-tight group-hover:text-brand transition-colors text-sm">{item.name}</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{item.type}</p>
                  </div>

                  <div className="text-2xl font-black text-white italic tracking-tighter">
                    <span className="text-brand text-sm">$</span>{item.monthlyRent}
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest ml-1">/mo</span>
                  </div>

                  <button 
                    onClick={() => handleRent(item)}
                    className="w-full bg-[#1A1A20] border border-border text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand hover:border-brand transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px]"
                  >
                    Rent Now <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-32 bg-header rounded-[40px] border border-dashed border-zinc-800 text-center text-zinc-600 uppercase font-bold tracking-widest">
                Browse our upcoming collection soon.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-border">
        {[
          { icon: Zap, title: 'Free Setup', desc: 'No installation hidden costs.' },
          { icon: ShieldCheck, title: 'Maintenance', desc: 'Complimentary on-call service.' },
          { icon: Repeat, title: 'Upgrade', desc: 'Swap for better models easily.' },
          { icon: ShieldCheck, title: '0 Deposit', desc: 'Pay as you stay monthly.' },
        ].map((item, i) => (
          <div key={i} className="space-y-3 p-6 bg-aside border border-border rounded-3xl group hover:bg-surface-bright transition-all">
            <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-brand border border-border shadow-lg group-hover:scale-110 transition-transform">
              <item.icon size={18} />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</h4>
            <p className="text-zinc-600 text-[10px] leading-relaxed uppercase tracking-widest font-bold">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Rental Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-header border border-border rounded-[40px] p-10 max-w-lg w-full shadow-[0_0_100px_rgba(37,99,235,0.1)] space-y-8 text-left"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-brand/10 text-brand rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-brand/20 shadow-2xl">
                  <Tv size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-tight">Confirm Rental</h3>
                <p className="text-zinc-500 text-sm">Renting {selectedItem.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-aside p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Monthly Rent</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">${selectedItem.monthlyRent}</p>
                </div>
                <div className="bg-aside p-4 rounded-2xl border border-border">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Minimum Term</p>
                  <p className="text-xl font-bold text-brand uppercase tracking-widest">3 Months</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-transparent text-zinc-500 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedItem && (
        <PaymentModal 
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={confirmRental}
          amount={selectedItem.monthlyRent}
          itemName={selectedItem.name}
        />
      )}
    </div>
  );
}
