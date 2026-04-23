import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, Star, IndianRupee, Search, Filter, Utensils, Wrench, Home as HomeIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'PG' | 'Room' | 'Flat'>('All');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), where('status', '==', 'available'), limit(20));
        const querySnapshot = await getDocs(q);
        const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
        setProperties(props);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-[40px] overflow-hidden flex items-center justify-center text-center px-6">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          alt="Home Hero" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-semibold text-white tracking-tight"
          >
            Find Your Perfect <span className="text-brand">Space.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-300"
          >
            Premium rooms, PGs, and apartments with all-in-one services for urban nomads.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex bg-surface-bright rounded-2xl p-1.5 border border-border max-w-lg mx-auto shadow-2xl"
          >
            <div className="flex-grow flex items-center px-4 gap-2 text-zinc-500">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search properties, food, services..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white py-3 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm">
              Explore
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight uppercase italic underline decoration-brand/30 underline-offset-8">Available Properties</h2>
              <p className="text-zinc-500 text-sm mt-3 uppercase tracking-widest font-bold">Discover verified spaces in prime urban locations</p>
            </div>
            
            {/* Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              <div className="p-2 bg-brand/10 text-brand rounded-lg mr-1 border border-brand/20">
                <Filter size={16} />
              </div>
              {['All', 'PG', 'Room', 'Flat'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    filterType === type 
                      ? 'bg-brand text-white border-brand shadow-xl shadow-blue-900/40 transform scale-105' 
                      : 'bg-aside text-zinc-600 hover:text-zinc-300 border-border hover:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button className="text-[10px] text-brand font-black hover:underline decoration-brand/30 underline-offset-4 transition-all uppercase tracking-widest">
            View all properties
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] rounded-3xl bg-surface animate-pulse border border-border"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-[40px] border border-border">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
              <HomeIcon size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No properties found</h3>
            <p className="text-zinc-500 text-sm">Check back later for new listings!</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-24 bg-surface rounded-[40px] border border-border">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">No match found</h3>
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mt-1">Try adjusting your filters or search term</p>
            <button 
              onClick={() => { setFilterType('All'); setSearchTerm(''); }}
              className="mt-6 text-brand text-xs font-black uppercase tracking-widest hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop, idx) => (
              <motion.div 
                key={prop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/property/${prop.id}`} className="group block h-full">
                  <div className="bg-surface rounded-3xl overflow-hidden border border-border hover:border-zinc-700 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1 shadow-lg shadow-black/40">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      <img 
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'} 
                        alt={prop.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          Verified
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white tracking-tight line-clamp-1 text-lg group-hover:text-brand transition-colors uppercase">{prop.title}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{prop.type} • Private Space</p>
                        </div>
                        <div className="text-brand font-bold text-xl">
                          <IndianRupee size={16} className="inline mr-px" />{prop.price.toLocaleString()}
                          <span className="text-[10px] text-zinc-600 font-normal">/mo</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <MapPin size={12} className="text-zinc-600" /> {prop.location.address}
                      </div>

                      <button className="w-full mt-2 bg-zinc-800 text-zinc-300 py-3 rounded-xl text-sm font-medium hover:bg-brand hover:text-white transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Services Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/food-plans" className="bg-[#14141A] border border-border rounded-[40px] p-12 text-white space-y-6 relative overflow-hidden group block">
          <div className="relative z-10 space-y-4">
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
              <Utensils size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Food Plans</h3>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs leading-relaxed">Delicious, home-cooked meals delivered daily. Active subscriptions starting from $40/mo.</p>
            </div>
            <button className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm">
              View Plans
            </button>
          </div>
          <Utensils className="absolute -bottom-10 -right-10 w-64 h-64 text-zinc-800/10 group-hover:scale-110 transition-transform duration-700" />
        </Link>
        
        <Link to="/appliances" className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-12 text-white space-y-6 relative overflow-hidden group shadow-2xl shadow-blue-900/20 block border border-white/10 hover:border-white/30 transition-all">
          <div className="relative z-10 space-y-4">
            <div className="p-4 bg-white/20 backdrop-blur rounded-2xl w-fit">
              <Wrench size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Need Appliances?</h3>
              <p className="text-blue-100 text-sm mt-2 max-w-xs leading-relaxed">Rent fridges, TVs & more at 0% deposit. Move in today with complete comfort.</p>
            </div>
            <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all text-sm">
              Browse Store
            </button>
          </div>
          <Wrench className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 group-hover:scale-110 transition-transform duration-700" />
        </Link>
      </section>
    </div>
  );
}
