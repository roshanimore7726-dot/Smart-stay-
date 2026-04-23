import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Home, Utensils, Building2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isBusy, setIsBusy] = React.useState(false);

  const handleLogin = async (role: any) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await login(role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Login failed. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 mb-20">
      <div className="bg-surface rounded-3xl shadow-2xl border border-border p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-brand rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to SmartStay</h1>
          <p className="text-zinc-500 mt-2 text-sm">Join our smart living community</p>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center mb-4">Select your role to continue</p>
          
          <button 
            onClick={() => handleLogin('user')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-[#1A1A20] hover:border-brand hover:bg-brand/5 transition-all group lg:p-5"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-brand group-hover:text-white transition-all">
              <Home size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white text-sm uppercase tracking-tight">Customer</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">I want to book rooms and rent appliances</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('owner')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-[#1A1A20] hover:border-brand hover:bg-brand/5 transition-all group lg:p-5"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-brand group-hover:text-white transition-all">
              <Building2 size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white text-sm uppercase tracking-tight">Property Owner</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">I want to list my rooms and manage bookings</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('vendor')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-[#1A1A20] hover:border-brand hover:bg-brand/5 transition-all group lg:p-5"
          >
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 group-hover:bg-brand group-hover:text-white transition-all">
              <Utensils size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white text-sm uppercase tracking-tight">Service Vendor</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">I provide food, rentals or home services</p>
            </div>
          </button>
        </div>

        <div className="pt-6 border-t border-border space-y-4">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">
            New to SmartStay? <Link to="/register" className="text-brand hover:underline">Create an account</Link>
          </p>
          <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-medium">
            By signing in, you agree to our Terms of Service <br /> and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
