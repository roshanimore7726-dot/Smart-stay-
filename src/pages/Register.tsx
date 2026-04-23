import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Home, Utensils, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (role: any) => {
    try {
      await login(role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 mb-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-header rounded-[40px] shadow-2xl border border-border p-10 text-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
        
        <div className="w-20 h-20 bg-brand/10 text-brand rounded-[32px] mx-auto flex items-center justify-center border border-brand/20 shadow-2xl shadow-blue-900/10">
          <Shield size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase italic underline decoration-brand/30 underline-offset-8">Create Account</h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-4">Join over 10,000+ happy residents</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Choose your journey</p>
          
          <button 
            onClick={() => handleRegister('user')}
            className="w-full flex items-center gap-4 p-5 rounded-3xl border border-border bg-[#14141A] hover:border-brand hover:bg-brand/5 transition-all group relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
              <Home size={24} />
            </div>
            <div className="text-left flex-grow">
              <h3 className="font-bold text-white text-xs uppercase tracking-tight">I am a Resident</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Finding my next home</p>
            </div>
            <ArrowRight size={16} className="text-zinc-800 group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => handleRegister('owner')}
            className="w-full flex items-center gap-4 p-5 rounded-3xl border border-border bg-[#14141A] hover:border-brand hover:bg-brand/5 transition-all group relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
              <Building2 size={24} />
            </div>
            <div className="text-left flex-grow">
              <h3 className="font-bold text-white text-xs uppercase tracking-tight">I am an Owner</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Listing my properties</p>
            </div>
            <ArrowRight size={16} className="text-zinc-800 group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => handleRegister('vendor')}
            className="w-full flex items-center gap-4 p-5 rounded-3xl border border-border bg-[#14141A] hover:border-brand hover:bg-brand/5 transition-all group relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
              <Utensils size={24} />
            </div>
            <div className="text-left flex-grow">
              <h3 className="font-bold text-white text-xs uppercase tracking-tight">I am a Vendor</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Providing expert services</p>
            </div>
            <ArrowRight size={16} className="text-zinc-800 group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="pt-6 space-y-4">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-brand hover:underline">Sign In here</Link>
          </p>
          <div className="h-px bg-border w-full"></div>
          <p className="text-[9px] text-zinc-700 leading-relaxed uppercase font-black tracking-widest opacity-60">
            Secure authentication via Google <br /> One-click integration
          </p>
        </div>
      </motion.div>
    </div>
  );
}
