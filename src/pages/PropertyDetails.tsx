import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Property, ChatRoom } from '../types';
import { MapPin, IndianRupee, MessageSquare, Calendar, ShieldCheck, CheckCircle2, ChevronLeft, Star, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Property;
        setProperty({ id: docSnap.id, ...data } as Property);
        if (data.images?.length) setSelectedImage(data.images[0]);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const handleBooking = async () => {
    if (!user || !property) return navigate('/login');
    setBookingStatus('processing');
    try {
      await addDoc(collection(db, 'bookings'), {
        propertyId: property.id,
        ownerId: property.ownerId,
        userId: user.uid,
        userName: profile?.displayName || user.email,
        propertyTitle: property.title,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  const handleStartChat = async () => {
    if (!user || !property) return navigate('/login');
    try {
      // Find existing room
      const q = query(
        collection(db, 'chat_rooms'),
        where('participants', 'array-contains', user.uid)
      );
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants.includes(property.ownerId));
      
      if (existing) {
        navigate(`/chat/${existing.id}`);
      } else {
        const newRoom = await addDoc(collection(db, 'chat_rooms'), {
          participants: [user.uid, property.ownerId],
          participantNames: {
            [user.uid]: profile?.displayName || 'Guest',
            [property.ownerId]: 'Property Owner'
          },
          updatedAt: serverTimestamp()
        });
        navigate(`/chat/${newRoom.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-zinc-600 uppercase tracking-widest font-mono text-sm">Synchronizing Data...</div>;
  if (!property) return <div className="text-center py-20 text-zinc-500 italic uppercase tracking-widest">Listing not available.</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto mb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-brand transition-all font-bold uppercase tracking-widest text-xs group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to explore
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video rounded-[40px] overflow-hidden shadow-2xl relative border border-border bg-aside group cursor-zoom-in"
              onClick={() => setFullscreenImage(selectedImage)}
            >
              <img 
                src={selectedImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'} 
                alt={property.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg uppercase tracking-wide">VerifiedStay</span>
              </div>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 backdrop-blur-md p-3 rounded-2xl text-white">
                  <Maximize2 size={20} />
                </div>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {property.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all transform active:scale-95 ${
                    selectedImage === img ? 'border-brand scale-105 shadow-xl shadow-brand/20' : 'border-transparent opacity-50 hover:opacity-100 hover:border-zinc-700'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight uppercase">{property.title}</h1>
            <p className="flex items-center gap-2 text-zinc-500 text-lg">
              <MapPin size={20} className="text-brand" /> {property.location.address}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-border py-8">
            <div className="text-center space-y-1">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pricing</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2 text-white">
                <span className="text-brand">$</span> {property.price.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Per Month</p>
            </div>
            <div className="text-center space-y-1 border-x border-border">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Type</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2 text-brand uppercase tracking-tighter">{property.type}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Security</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1 text-emerald-500 uppercase tracking-widest">Verified</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-tight">
              <ShieldCheck className="text-brand" /> Description
            </h3>
            <p className="text-zinc-400 leading-relaxed text-base italic pr-8">
              "{property.description}"
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-tight">
              <CheckCircle2 className="text-brand" /> Amenities
            </h3>
            <div className="flex flex-wrap gap-3">
              {property.amenities?.map(a => (
                <span key={a} className="bg-surface border border-border px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand/50"></div> {a}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 pt-12 border-t border-border">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight italic">Reviews & Ratings</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span className="text-white text-sm font-bold">4.8</span>
                  <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">• 24 Reviews</span>
                </div>
              </div>
              <button className="text-xs font-bold text-brand uppercase tracking-widest hover:underline">Rate this stay</button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Alex Johnson', date: '2 months ago', text: 'Clean, quiet and very well maintained. The owner is very helpful.' },
                { name: 'Sarah Miller', date: '1 month ago', text: 'Great location and fast wifi. Perfect for work from home.' }
              ].map((rev, i) => (
                <div key={i} className="bg-surface p-6 rounded-3xl border border-border space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-header border border-border rounded-xl flex items-center justify-center text-zinc-600 font-bold uppercase">
                        {rev.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{rev.name}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(j => <Star key={j} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm italic leading-relaxed">"{rev.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-[40px] border border-border shadow-2xl p-8 sticky top-24 space-y-6 flex flex-col items-center">
            <div className="text-center space-y-2">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Instant Booking</div>
              <div className="text-4xl font-black text-brand flex items-center justify-center gap-px italic">
                <span className="text-xl">$</span> {property.price.toLocaleString()}
                <span className="text-[10px] font-bold text-zinc-600 ml-1 uppercase tracking-tighter">/mo</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={handleBooking}
                disabled={bookingStatus === 'success' || bookingStatus === 'processing'}
                className="w-full bg-brand text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
              >
                {bookingStatus === 'success' ? (
                  <> <CheckCircle2 size={18} /> Request Sent</>
                ) : bookingStatus === 'processing' ? (
                  'Processing...'
                ) : (
                  <> <Calendar size={18} /> Request to Book</>
                )}
              </button>
              
              <button 
                onClick={handleStartChat}
                className="w-full bg-[#1A1A20] border border-border text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:border-brand transition-all active:scale-95 shadow-lg"
              >
                <MessageSquare size={18} /> Chat with Owner
              </button>
            </div>

            <div className="bg-header border border-border p-6 rounded-3xl w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Verified</h4>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Stay Certified</p>
                </div>
              </div>
              <ul className="text-[10px] text-zinc-500 space-y-2 uppercase font-bold tracking-widest">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div> Refundable deposit
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div> 24/7 Support
                </li>
              </ul>
            </div>
            
            {bookingStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm font-medium"
              >
                Booking request has been sent to the owner! You can see updates in your dashboard.
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-xl"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-8 right-8 text-white p-3 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={fullscreenImage} 
              className="max-w-full max-h-full rounded-3xl shadow-2xl border border-zinc-800"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
