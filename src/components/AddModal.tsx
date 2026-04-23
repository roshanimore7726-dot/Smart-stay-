import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'property' | 'food' | 'appliance' | 'service';
}

export default function AddModal({ isOpen, onClose, onSuccess, type }: AddModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const coll = type === 'property' ? 'properties' : 
                   type === 'food' ? 'food_plans' :
                   type === 'appliance' ? 'appliances' : 'home_services';
      
      const payload = {
        ...formData,
        vendorId: user.uid, // or ownerId
        ownerId: user.uid,
        status: type === 'property' ? 'available' : 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Specific formatting for properties
      if (type === 'property') {
        payload.location = { address: formData.address || 'Urban Prime' };
        payload.price = Number(formData.price || 0);
        payload.images = [formData.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];
        payload.amenities = formData.amenities?.split(',').map((s: string) => s.trim()) || ['WiFi', 'Kitchen'];
      }

      await addDoc(collection(db, coll), payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    property: { title: 'New Property Listing', icon: Plus },
    food: { title: 'Add Subscription Plan', icon: Plus },
    appliance: { title: 'Lisr New Appliance', icon: Plus },
    service: { title: 'Register Service', icon: Plus }
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-header border border-border rounded-[40px] max-w-xl w-full overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-aside">
               <div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">{config.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Fill in the details below</p>
               </div>
               <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Name / Title</label>
                   <input 
                     required
                     className="w-full bg-surface border border-border rounded-2xl px-5 py-3 text-sm text-white focus:border-brand outline-none transition-all"
                     placeholder="e.g. Luxury Single Room"
                     onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Price / Monthly Rent</label>
                   <input 
                     required
                     type="number"
                     className="w-full bg-surface border border-border rounded-2xl px-5 py-3 text-sm text-white focus:border-brand outline-none transition-all"
                     placeholder="0.00"
                     onChange={e => setFormData({...formData, price: e.target.value, monthlyRent: e.target.value})}
                   />
                </div>
                {type === 'property' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Type</label>
                    <select 
                      className="w-full bg-surface border border-border rounded-2xl px-5 py-3 text-sm text-white focus:border-brand outline-none transition-all"
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="PG">PG</option>
                      <option value="Room">Room</option>
                      <option value="Flat">Flat</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Description</label>
                   <textarea 
                     required
                     className="w-full bg-surface border border-border rounded-2xl px-5 py-3 text-sm text-white focus:border-brand outline-none transition-all h-24 resize-none"
                     placeholder="Tell users more about this offering..."
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Image URL</label>
                   <div className="flex gap-2">
                     <div className="bg-surface border border-border rounded-2xl px-4 py-3 text-zinc-600">
                       <ImageIcon size={18} />
                     </div>
                     <input 
                       className="flex-grow bg-surface border border-border rounded-2xl px-5 py-3 text-sm text-white focus:border-brand outline-none transition-all"
                       placeholder="https://images.unsplash.com/..."
                       onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                     />
                   </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : <><Save size={18} /> Publish Details</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
