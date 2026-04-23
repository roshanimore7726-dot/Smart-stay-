import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking, Property, FoodPlan, Appliance, HomeService } from '../types';
import { LayoutDashboard, Home, Utensils, Wrench, Users, Plus, Check, X, RefreshCw, Trash2, Zap, Star, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddModal from '../components/AddModal';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<any>({
    bookings: [],
    myProperties: [],
    propertyRequests: [],
    foodPlans: [],
    foodSubscriptions: [],
    appliances: [],
    applianceRentals: [],
    homeServices: [],
    serviceBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState<any>(null); // 'property' | 'food' etc

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const results: any = {};
      
      if (profile.role === 'user') {
        const qB = query(collection(db, 'bookings'), where('userId', '==', profile.uid));
        const snapB = await getDocs(qB);
        results.bookings = snapB.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qF = query(collection(db, 'food_subscriptions'), where('userId', '==', profile.uid));
        const snapF = await getDocs(qF);
        results.foodSubscriptions = snapF.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qA = query(collection(db, 'appliance_rentals'), where('userId', '==', profile.uid));
        const snapA = await getDocs(qA);
        results.applianceRentals = snapA.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qS = query(collection(db, 'service_bookings'), where('userId', '==', profile.uid));
        const snapS = await getDocs(qS);
        results.serviceBookings = snapS.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      } else if (profile.role === 'owner') {
        const qProps = query(collection(db, 'properties'), where('ownerId', '==', profile.uid));
        const snapProps = await getDocs(qProps);
        results.myProperties = snapProps.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qBookings = query(collection(db, 'bookings'), where('ownerId', '==', profile.uid));
        const snapBookings = await getDocs(qBookings);
        results.propertyRequests = snapBookings.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else if (profile.role === 'vendor') {
        const qF = query(collection(db, 'food_plans'), where('vendorId', '==', profile.uid));
        const snapF = await getDocs(qF);
        results.foodPlans = snapF.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qFs = query(collection(db, 'food_subscriptions'), where('vendorId', '==', profile.uid));
        const snapFs = await getDocs(qFs);
        results.foodSubscriptions = snapFs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qA = query(collection(db, 'appliances'), where('vendorId', '==', profile.uid));
        const snapA = await getDocs(qA);
        results.appliances = snapA.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qAr = query(collection(db, 'appliance_rentals'), where('vendorId', '==', profile.uid));
        const snapAr = await getDocs(qAr);
        results.applianceRentals = snapAr.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qS = query(collection(db, 'home_services'), where('vendorId', '==', profile.uid));
        const snapS = await getDocs(qS);
        results.homeServices = snapS.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qSb = query(collection(db, 'service_bookings'), where('vendorId', '==', profile.uid));
        const snapSb = await getDocs(qSb);
        results.serviceBookings = snapSb.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else if (profile.role === 'admin') {
        const qU = query(collection(db, 'users'));
        const snapU = await getDocs(qU);
        results.allUsers = snapU.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const qB = query(collection(db, 'bookings'));
        const snapB = await getDocs(qB);
        results.allBookings = snapB.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      setData(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (collectionName: string, id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, collectionName, id), { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const seedData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Mock Properties
      const props = [
        {
          ownerId: user.uid,
          title: "Luxury Studio in Midtown",
          type: "Flat",
          price: 15000,
          description: "High-end studio with modern amenities and great city view.",
          location: { address: "123 Midtown Street, Downtown", lat: 0, lng: 0 },
          amenities: ["WiFi", "AC", "Laundry", "Gym"],
          status: "available",
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"]
        },
        {
          ownerId: user.uid,
          title: "Cozy PG for Students",
          type: "PG",
          price: 8000,
          description: "Safe and affordable PG with shared rooms and healthy food.",
          location: { address: "45 Academic Row, University Area", lat: 0, lng: 0 },
          amenities: ["WiFi", "Meals", "Library"],
          status: "available",
          images: ["https://images.unsplash.com/photo-1555854817-5b2260d50c50?w=1200"]
        }
      ];

      for (const p of props) {
        await addDoc(collection(db, 'properties'), { ...p, createdAt: serverTimestamp() });
      }

      // Mock Food Plans
      const foodPlans = [
        { vendorId: user.uid, name: "Premium North Indian", frequency: "monthly", price: 3500, description: "Authentic Ghar ka khana. 2 times a day.", status: "available" },
        { vendorId: user.uid, name: "Student Budget Thali", frequency: "monthly", price: 2200, description: "Simple and nutritious meals. Lunch & Dinner.", status: "available" }
      ];
      for (const f of foodPlans) await addDoc(collection(db, 'food_plans'), { ...f, createdAt: serverTimestamp() });

      // Mock Appliances
      const appliances = [
        { vendorId: user.uid, name: "Samsung Double Door Fridge", type: "fridge", monthlyRent: 450, status: "available" },
        { vendorId: user.uid, name: "Whirlpool Washing Machine", type: "washing machine", monthlyRent: 350, status: "available" }
      ];
      for (const a of appliances) await addDoc(collection(db, 'appliances'), { ...a, createdAt: serverTimestamp() });

      // Mock Services
      const services = [
        { vendorId: user.uid, name: "Deep Home Cleaning", category: "Cleaning", price: 999, status: "available" },
        { vendorId: user.uid, name: "Appliance Repair", category: "Maintenance", price: 499, status: "available" }
      ];
      for (const s of services) await addDoc(collection(db, 'home_services'), { ...s, createdAt: serverTimestamp() });

      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-bounce text-indigo-600 font-bold">SmartStay Dashboard Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="bg-aside rounded-3xl p-6 shadow-xl border border-border flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-900/20 uppercase">
            {profile?.displayName?.[0] || profile?.email?.[0] || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">{profile?.displayName || 'Welcome'}</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{profile?.role}</p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
        >
          <LayoutDashboard size={20} /> Overview
        </button>

        {profile?.role === 'owner' && (
          <button 
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'properties' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
          >
            <Home size={20} /> My Properties
          </button>
        )}

        {(profile?.role === 'owner' || profile?.role === 'user') && (
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
          >
            <Check size={20} /> Bookings
          </button>
        )}

        {profile?.role === 'vendor' && (
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('food')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'food' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
            >
              <Utensils size={20} /> Food Plans
            </button>
            <button 
              onClick={() => setActiveTab('appliances')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'appliances' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
            >
              <Zap size={20} /> Appliances
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'services' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
            >
              <Wrench size={20} /> Home Services
            </button>
          </div>
        )}

        {profile?.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
          >
            <Users size={20} /> Manage Users
          </button>
        )}

        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-brand text-white shadow-xl shadow-blue-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface border border-transparent'}`}
        >
          <Settings size={20} /> Settings
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                <p className="text-zinc-500 text-sm">Welcome to your SmartStay management hub.</p>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="p-3 bg-header border border-border rounded-2xl text-zinc-500 hover:text-brand hover:border-brand transition-all"
              >
                <RefreshCw size={20} />
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl shadow-black/40 space-y-2 group hover:border-zinc-700 transition-all">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Active Bookings</p>
                <p className="text-4xl font-black text-white">{data.bookings?.length || data.propertyRequests?.length || 0}</p>
              </div>
              <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl shadow-black/40 space-y-2 group hover:border-zinc-700 transition-all">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Total Earned</p>
                <p className="text-4xl font-black text-emerald-400 flex items-baseline gap-1"><span className="text-xl font-bold italic">$</span> 0</p>
              </div>
              <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl shadow-black/40 space-y-2 group hover:border-zinc-700 transition-all">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Profile Stats</p>
                <p className="text-4xl font-black text-brand flex items-baseline gap-1">100<span className="text-xl">%</span></p>
              </div>
            </div>

            {profile?.role === 'owner' && data.myProperties.length === 0 && (
              <div className="bg-header border border-border rounded-[40px] p-12 text-center space-y-6 shadow-2xl">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">List Your Properties</h3>
                  <p className="text-zinc-500 max-w-md mx-auto text-sm">You haven't added any properties yet. Start by seeding some dummy data or add your own listings.</p>
                </div>
                <div className="flex justify-center gap-4">
                  <button onClick={seedData} className="bg-brand text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40">
                    <Plus size={20} /> Seed Demo Data
                  </button>
                  <button className="bg-zinc-800 border border-zinc-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-all">
                    Add New Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Bookings</h2>
            <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
              <table className="w-full text-left font-sans">
                <thead className="bg-header border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Property</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(profile?.role === 'owner' ? data.propertyRequests : data.bookings).map((b: any) => (
                    <tr key={b.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-bold text-white text-base">{b.propertyTitle}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{b.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-lg ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          b.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-zinc-500 font-mono">
                        {new Date(b.createdAt?.seconds * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-6 text-right space-x-2">
                        {profile?.role === 'owner' && b.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus('bookings', b.id, 'approved')}
                              className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-900/20"
                            >
                              <Check size={20} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus('bookings', b.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/20"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="p-2 text-zinc-700 cursor-not-allowed"
                            disabled
                          >
                            <X size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(profile?.role === 'owner' ? data.propertyRequests : data.bookings).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 italic font-mono text-sm uppercase">No pending requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {profile?.role === 'user' && (
              <div className="space-y-6 pt-12">
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic underline decoration-brand/30 underline-offset-8">My Active Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Food */}
                  <div className="bg-surface p-6 rounded-[32px] border border-border space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Utensils size={18} /></div>
                      <h3 className="font-bold text-white text-sm uppercase tracking-tight">Food Subscriptions</h3>
                    </div>
                    {data.foodSubscriptions.map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center bg-aside p-4 rounded-2xl border border-border">
                        <span className="text-xs text-white font-medium">{s.planName}</span>
                        <span className="px-2 py-0.5 bg-brand text-white text-[9px] font-black uppercase rounded shadow-lg shadow-blue-900/20">{s.status}</span>
                      </div>
                    ))}
                    {data.foodSubscriptions.length === 0 && <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest text-center py-4">No active plans</p>}
                  </div>

                  {/* Appliances */}
                  <div className="bg-surface p-6 rounded-[32px] border border-border space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Zap size={18} /></div>
                      <h3 className="font-bold text-white text-sm uppercase tracking-tight">Appliance Rentals</h3>
                    </div>
                    {data.applianceRentals.map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center bg-aside p-4 rounded-2xl border border-border">
                        <span className="text-xs text-white font-medium">{s.itemName}</span>
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded shadow-lg shadow-emerald-900/20">{s.status}</span>
                      </div>
                    ))}
                    {data.applianceRentals.length === 0 && <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest text-center py-4">No active rentals</p>}
                  </div>

                  {/* Home Services */}
                  <div className="bg-surface p-6 rounded-[32px] border border-border space-y-4 md:col-span-2 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Wrench size={18} /></div>
                      <h3 className="font-bold text-white text-sm uppercase tracking-tight">Recent Service Bookings</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.serviceBookings.map((s: any) => (
                        <div key={s.id} className="flex justify-between items-center bg-aside p-4 rounded-2xl border border-border">
                          <div className="space-y-1">
                            <p className="text-xs text-white font-medium">{s.serviceName}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase">{new Date(s.scheduledDate?.seconds * 1000).toLocaleDateString()}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded shadow-lg shadow-orange-900/20">{s.status}</span>
                        </div>
                      ))}
                    </div>
                    {data.serviceBookings.length === 0 && <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest text-center py-4">No recent bookings</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight text-left">My Listings</h2>
              <button 
                onClick={() => setShowAddModal('property')}
                className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/40 hover:scale-105 transition-all outline-none"
              >
                <Plus size={20} /> New Listing
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {data.myProperties.map((p: any) => (
                <div key={p.id} className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl group hover:border-zinc-700 transition-all">
                  <div className="h-48 overflow-hidden relative">
                    <img src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 flex gap-2">
                       <span className={`backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                         p.status === 'available' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-zinc-500/20 text-zinc-500 border-zinc-500/30'
                       }`}>{p.status === 'available' ? 'Active' : 'Hidden'}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-lg uppercase tracking-tight line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium mt-1">{p.location.address}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-4">
                       <span className="font-black text-brand text-xl tracking-tighter italic">${p.price}</span>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => handleUpdateStatus('properties', p.id, p.status === 'available' ? 'hidden' : 'available')}
                           className={`p-2 transition-all ${p.status === 'available' ? 'text-zinc-600 hover:text-orange-500' : 'text-orange-500 hover:text-brand'}`}
                           title={p.status === 'available' ? 'Hide Listing' : 'Show Listing'}
                         >
                           <RefreshCw size={18} />
                         </button>
                         <button 
                           onClick={() => handleDelete('properties', p.id)}
                           className="p-2 text-zinc-600 hover:text-red-500 transition-all"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              {data.myProperties.length === 0 && (
                <div className="col-span-full py-20 bg-header border border-dashed border-border rounded-[40px] text-center text-zinc-600 italic font-mono uppercase text-sm">
                  No properties listed yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">My Food Plans</h2>
              <button 
                onClick={() => setShowAddModal('food')}
                className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/40 hover:scale-105 transition-all text-xs uppercase tracking-widest"
              >
                <Plus size={16} /> New Plan
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.foodPlans.map((f: any) => (
                <div key={f.id} className="bg-surface p-8 rounded-3xl border border-border space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <h3 className="font-bold text-white uppercase tracking-tight">{f.name}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        f.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'
                      }`}>{f.status}</span>
                    </div>
                    <span className="text-brand font-black italic">${f.price}</span>
                  </div>
                  <p className="text-xs text-zinc-500 text-left">{f.description}</p>
                  <div className="h-px bg-border w-full"></div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-zinc-600">{f.frequency} SUB</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleUpdateStatus('food_plans', f.id, f.status === 'available' ? 'hidden' : 'available')}
                        className="text-brand hover:underline"
                      >
                        Toggle Status
                      </button>
                      <button 
                        onClick={() => handleDelete('food_plans', f.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-12 py-4 border-b border-border uppercase">Active Subscribers</h2>
            <div className="bg-surface rounded-3xl border border-border overflow-hidden">
               <table className="w-full">
                  <thead className="bg-[#1A1A20]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Customer</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Plan</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Status</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.foodSubscriptions.map((s: any) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="p-4 font-bold text-white text-sm">{s.userName}</td>
                        <td className="p-4 text-zinc-500 text-xs">{s.planName}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                            s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                            s.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                            'bg-brand/10 text-brand'
                          }`}>{s.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          {s.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateStatus('food_subscriptions', s.id, 'approved')} className="p-1.5 hover:text-emerald-500 transition-colors"><Check size={16} /></button>
                              <button onClick={() => handleUpdateStatus('food_subscriptions', s.id, 'rejected')} className="p-1.5 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'appliances' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Inventory</h2>
              <button 
                onClick={() => setShowAddModal('appliance')}
                className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/40 hover:scale-105 transition-all text-xs uppercase tracking-widest"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {data.appliances.map((a: any) => (
                <div key={a.id} className="bg-surface p-6 rounded-3xl border border-border space-y-4 shadow-xl text-center group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-aside rounded-2xl flex items-center justify-center mx-auto text-brand border border-border">
                      <Zap size={24} />
                    </div>
                    <button 
                      onClick={() => handleDelete('appliances', a.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase">{a.name}</h3>
                  <div className="text-brand font-black">${a.monthlyRent}/mo</div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight mt-12 py-4 border-b border-border uppercase">Rental Requests</h2>
            <div className="bg-surface rounded-3xl border border-border overflow-hidden">
               <table className="w-full">
                  <thead className="bg-[#1A1A20]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Customer</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Item</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Status</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applianceRentals.map((r: any) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-4 font-bold text-white text-sm">{r.userName}</td>
                        <td className="p-4 text-zinc-500 text-xs">{r.itemName}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                            r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                            r.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                            'bg-brand/10 text-brand'
                          }`}>{r.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          {r.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateStatus('appliance_rentals', r.id, 'approved')} className="p-1.5 hover:text-emerald-500 transition-colors"><Check size={16} /></button>
                              <button onClick={() => handleUpdateStatus('appliance_rentals', r.id, 'rejected')} className="p-1.5 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Upcoming Service Tasks</h2>
              <button 
                onClick={() => setShowAddModal('service')}
                className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/40 hover:scale-105 transition-all text-xs uppercase tracking-widest"
              >
                <Plus size={16} /> Register Service
              </button>
            </div>
            <div className="bg-surface rounded-3xl border border-border overflow-hidden">
               <table className="w-full">
                  <thead className="bg-[#1A1A20]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Customer</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Service</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Date</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Status</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.serviceBookings.map((s: any) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="p-4 font-bold text-white text-sm">{s.userName}</td>
                        <td className="p-4 text-zinc-500 text-xs">{s.serviceName}</td>
                        <td className="p-4 text-zinc-600 text-[10px] font-bold">{new Date(s.scheduledDate?.seconds * 1000).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                            s.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                            s.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                            'bg-orange-500/10 text-orange-500'
                          }`}>{s.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          {s.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateStatus('service_bookings', s.id, 'approved')} className="p-1.5 hover:text-emerald-500 transition-colors"><Check size={16} /></button>
                              <button onClick={() => handleUpdateStatus('service_bookings', s.id, 'rejected')} className="p-1.5 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.serviceBookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-zinc-600 italic uppercase font-bold text-xs tracking-widest">No pending service requests</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="space-y-6 text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic italic">Global User Registry</h2>
            <div className="bg-surface rounded-3xl border border-border overflow-hidden">
               <table className="w-full">
                  <thead className="bg-[#1A1A20]">
                    <tr>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">User</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Email</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-left">Role</th>
                      <th className="p-4 text-xs font-bold text-zinc-600 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allUsers?.map((u: any) => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="p-4 font-bold text-white text-sm">{u.displayName || 'Unnamed User'}</td>
                        <td className="p-4 text-zinc-500 text-xs">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-brand/10 text-brand rounded text-[9px] font-bold uppercase">{u.role}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-red-500 text-[10px] font-bold uppercase hover:underline">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 text-left">
            <div>
              <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight">Account Settings</h2>
              <p className="text-zinc-500 text-sm mt-2">Manage your public profile and preferences</p>
            </div>

            <div className="bg-surface rounded-[40px] border border-border p-10 space-y-8 shadow-2xl">
               <div className="flex flex-col md:flex-row gap-8 items-center md:items-start pb-8 border-b border-border">
                  <div className="w-32 h-32 bg-brand rounded-[32px] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/20 border-4 border-aside overflow-hidden">
                    {profile?.photoURL ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover" /> : (profile?.displayName?.[0] || 'U')}
                  </div>
                  <div className="space-y-4 flex-grow">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Display Name</label>
                        <input 
                           defaultValue={profile?.displayName}
                           placeholder="Full Name"
                           className="w-full bg-aside border border-border rounded-2xl px-6 py-4 text-white focus:border-brand outline-none transition-all"
                           id="displayName"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Profile Photo URL</label>
                        <input 
                           defaultValue={profile?.photoURL}
                           placeholder="https://..."
                           className="w-full bg-aside border border-border rounded-2xl px-6 py-4 text-white focus:border-brand outline-none transition-all text-xs"
                           id="photoURL"
                        />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Email Address</label>
                    <div className="w-full bg-aside border border-border rounded-2xl px-6 py-4 text-zinc-500 text-sm cursor-not-allowed">
                       {profile?.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Account Type</label>
                    <div className="w-full bg-brand/10 border border-brand/20 rounded-2xl px-6 py-4 text-brand text-xs font-bold uppercase tracking-widest">
                       {profile?.role} Verified
                    </div>
                  </div>
               </div>

               <div className="pt-6">
                  <button 
                    onClick={async () => {
                      const name = (document.getElementById('displayName') as HTMLInputElement).value;
                      const photo = (document.getElementById('photoURL') as HTMLInputElement).value;
                      if (!user) return;
                      await updateDoc(doc(db, 'users', user.uid), { displayName: name, photoURL: photo });
                      alert('Profile refreshed successfully!');
                      window.location.reload(); // Simple refresh for profile update
                    }}
                    className="bg-brand text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/40"
                  >
                    Save Changes
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>

      <AddModal 
        isOpen={!!showAddModal}
        type={showAddModal}
        onClose={() => setShowAddModal(null)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
