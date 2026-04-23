import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FoodPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Check, ArrowRight, ShieldCheck, Clock, Star } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function FoodService() {
  const [plans, setPlans] = useState<FoodPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<FoodPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const q = query(collection(db, 'food_plans'));
        const querySnapshot = await getDocs(q);
        setPlans(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodPlan)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: FoodPlan) => {
    if (!user) return navigate('/login');
    setSelectedPlan(plan);
  };

  const confirmSubscription = async () => {
    if (!user || !selectedPlan) return;
    try {
      await addDoc(collection(db, 'food_subscriptions'), {
        planId: selectedPlan.id,
        vendorId: selectedPlan.vendorId,
        userId: user.uid,
        userName: user.displayName || user.email,
        planName: selectedPlan.name,
        status: 'pending',
        startDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      alert('Subscription request sent successfully!');
      setSelectedPlan(null);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#14141A] to-[#0A0A0C] rounded-[40px] p-12 md:p-20 border border-border overflow-hidden relative group">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-brand/20">
            <Utensils size={14} /> Nutrition Simplified
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase italic">
            Fuel Your <span className="text-brand">Lifestyle.</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Premium home-style mess and tiffin services for students and professionals. Fresh, hygienic, and delivered on time.
          </p>
        </div>
        <Utensils className="absolute -bottom-20 -right-20 w-96 h-96 text-brand/5 group-hover:scale-110 transition-transform duration-1000" />
      </section>

      {/* Plans Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Available Plans</h2>
            <p className="text-zinc-600 text-sm font-bold tracking-widest uppercase mt-1">Choose your frequency</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-[32px] bg-surface animate-pulse border border-border"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface border border-border rounded-[32px] p-8 flex flex-col space-y-6 hover:border-brand/40 transition-all group relative overflow-hidden"
              >
                {plan.frequency === 'monthly' && (
                  <div className="absolute top-0 right-0 bg-brand text-white text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.2em] rounded-bl-2xl">
                    Popular
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-brand transition-colors">{plan.name}</h3>
                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{plan.frequency} Subscription</p>
                </div>

                <div className="text-4xl font-black text-white italic tracking-tighter">
                  <span className="text-brand text-2xl">$</span>{plan.price}
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-widest ml-1">/ {plan.frequency}</span>
                </div>

                <div className="space-y-4 flex-grow">
                  <p className="text-zinc-500 text-sm leading-relaxed">{plan.description}</p>
                  <ul className="space-y-3">
                    {['Zero delivery fee', 'Daily fresh preparation', 'Cancel anytime'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-zinc-400 font-bold uppercase tracking-tight">
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5">
                          <Check size={12} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleSubscribe(plan)}
                  className="w-full bg-[#1A1A20] border border-border text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand hover:border-brand transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                >
                  Subscribe Now <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-full py-32 bg-header rounded-[40px] border border-dashed border-zinc-800 text-center text-zinc-600 uppercase font-bold tracking-widest">
                No active food plans in your area.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border">
        {[
          { icon: ShieldCheck, title: 'Hygiene First', desc: 'FSSAI certified vendors with regular audits.' },
          { icon: Clock, title: 'Timely Delivery', desc: 'Predictable delivery slots for lunch & dinner.' },
          { icon: Star, title: 'Customizable', desc: 'Specify preferences and avoid what you dont like.' },
        ].map((item, i) => (
          <div key={i} className="space-y-4 p-8 bg-aside border border-border rounded-3xl">
            <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-brand border border-border shadow-xl">
              <item.icon size={24} />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h4>
            <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-header border border-border rounded-[40px] p-10 max-w-lg w-full shadow-[0_0_100px_rgba(37,99,235,0.1)] space-y-8"
            >
              <div className="text-center space-y-2">
                <Utensils size={40} className="text-brand mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white uppercase italic tracking-tight">Confirm Plan</h3>
                <p className="text-zinc-500 text-sm">You are subscribing to {selectedPlan.name}</p>
              </div>

              <div className="bg-aside p-6 rounded-3xl border border-border flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Amount</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">${selectedPlan.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Frequency</p>
                  <p className="text-brand font-bold uppercase tracking-widest px-3 py-1 bg-brand/10 border border-brand/20 rounded-lg text-xs">{selectedPlan.frequency}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                >
                  Proceed to Payment
                </button>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-full bg-transparent text-zinc-500 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedPlan && (
        <PaymentModal 
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={confirmSubscription}
          amount={selectedPlan.price}
          itemName={selectedPlan.name}
        />
      )}
    </div>
  );
}
