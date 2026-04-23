import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HomeService } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Check, ArrowRight, ShieldCheck, Sparkles, Droplets, Scissors, LayoutGrid, Calendar } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function HomeServices() {
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<HomeService | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(collection(db, 'home_services'));
        const querySnapshot = await getDocs(q);
        setServices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomeService)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBook = async (service: HomeService) => {
    if (!user) return navigate('/login');
    setSelectedService(service);
  };

  const confirmBooking = async () => {
    if (!user || !selectedService) return;
    try {
      await addDoc(collection(db, 'service_bookings'), {
        serviceId: selectedService.id,
        vendorId: selectedService.vendorId,
        userId: user.uid,
        userName: user.displayName || user.email,
        serviceName: selectedService.name,
        status: 'pending',
        scheduledDate: new Date(Date.now() + 86400000), // Default to tomorrow
        createdAt: serverTimestamp()
      });
      alert('Service booking request confirmed!');
      setSelectedService(null);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D0D11] to-[#0A0A0C] rounded-[40px] p-12 md:p-20 border border-border overflow-hidden relative group">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-brand/20">
            <Sparkles size={14} /> Elite Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase italic">
            Housekeeping <span className="text-brand">Expertise.</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Professional cleaning, repair, and maintenance services at your doorstep. Verified experts, transparent pricing.
          </p>
        </div>
        <Droplets className="absolute -bottom-20 -right-20 w-96 h-96 text-brand/5 group-hover:scale-110 transition-transform duration-1000" />
      </section>

      {/* Services Grid */}
      <section className="space-y-12">
        {categories.length > 0 ? categories.map(cat => (
          <div key={cat} className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic underline decoration-brand/30 underline-offset-8">{cat}</h2>
              <div className="h-px bg-border flex-grow"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.filter(s => s.category === cat).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-surface border border-border rounded-[32px] p-8 space-y-6 hover:bg-[#14141A] hover:border-brand/40 transition-all group relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-aside rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-brand transition-colors border border-border shadow-xl">
                      {cat === 'Cleaning' ? <Droplets size={24} /> : <Wrench size={24} />}
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter">
                      <span className="text-brand text-sm">$</span>{service.price}
                      <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest ml-1">STARTING</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-brand transition-colors">{service.name}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Verified professionals with background checks completed.</p>
                  </div>

                  <button 
                    onClick={() => handleBook(service)}
                    className="w-full bg-[#1A1A20] border border-border text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand hover:border-brand transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Book Service <Check size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )) : (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-[32px] bg-surface animate-pulse border border-border"></div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-header rounded-[40px] border border-dashed border-zinc-800 text-zinc-600 uppercase font-bold tracking-widest">
              Marketplace loading soon...
            </div>
          )
        )}
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-header border border-border rounded-[40px] p-10 max-w-lg w-full shadow-[0_0_100px_rgba(37,99,235,0.1)] space-y-8"
            >
              <div className="text-center space-y-2">
                <Sparkles size={40} className="text-brand mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-tight">Confirm Booking</h3>
                <p className="text-zinc-500 text-sm">Service: {selectedService.name}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-aside p-6 rounded-3xl border border-border space-y-4">
                   <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Base Price</span>
                      <span className="text-xl font-black text-white italic tracking-tighter">${selectedService.price}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Schedule</span>
                      <span className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> Tomorrow 10:00 AM
                      </span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                >
                  Pay & Book Experts
                </button>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="w-full bg-transparent text-zinc-500 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedService && (
        <PaymentModal 
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={confirmBooking}
          amount={selectedService.price}
          itemName={selectedService.name}
        />
      )}
    </div>
  );
}
