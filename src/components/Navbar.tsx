import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, MessageSquare, User, LogOut, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Booking Approved', text: 'Your request for "Premium Studio" was approved.', time: '2h ago' },
    { id: 2, title: 'New Message', text: 'You have a message from Resident Life. ', time: '5h ago' }
  ];

  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        onClick={() => setIsMenuOpen(false)}
        className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors py-2 md:py-0"
      >
        Stays
      </Link>
      <Link 
        to="/food-plans" 
        onClick={() => setIsMenuOpen(false)}
        className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors py-2 md:py-0"
      >
        Food
      </Link>
      <Link 
        to="/appliances" 
        onClick={() => setIsMenuOpen(false)}
        className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors py-2 md:py-0"
      >
        Rentals
      </Link>
      <Link 
        to="/services" 
        onClick={() => setIsMenuOpen(false)}
        className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors py-2 md:py-0"
      >
        Services
      </Link>
    </>
  );

  return (
    <nav className="bg-header border-b border-border h-16 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="inline">SmartStay</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 hidden xs:inline">Urban</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex ml-8 items-center gap-6">
        <NavLinks />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-6">
        {user ? (
          <div className="flex items-center gap-2 md:gap-4 pl-0 md:pl-4 border-l-0 md:border-l border-border relative">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full ring-2 ring-header"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 bg-header border border-border rounded-3xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-4 bg-aside border-b border-border flex justify-between items-center">
                       <h4 className="text-xs font-bold text-white uppercase tracking-widest">Recent Activity</h4>
                       <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded font-black">2 NEW</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                       {notifications.map(n => (
                         <div key={n.id} className="p-4 border-b border-border hover:bg-surface transition-colors cursor-pointer space-y-1">
                            <p className="text-xs font-bold text-white">{n.title}</p>
                            <p className="text-[11px] text-zinc-500 leading-tight">{n.text}</p>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase">{n.time}</p>
                         </div>
                       ))}
                    </div>
                    <div className="p-3 text-center bg-aside">
                       <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">Clear all notifications</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/chat" className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors relative hidden sm:block">
              <MessageSquare size={20} />
            </Link>
            
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-brand group-hover:text-white transition-all overflow-hidden border border-border shrink-0">
                {profile?.photoURL ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
              </div>
              <span className="text-[10px] font-black uppercase text-zinc-500 hidden sm:block bg-aside px-2 py-1 rounded border border-border">
                {profile?.role || 'Guest'}
              </span>
            </Link>

            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors hidden sm:block"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              to="/login" 
              className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-4 py-2 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-brand text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hidden xs:block"
            >
              Join
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-header border-l border-border z-[60] p-8 lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Navigation</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500"><X size={20} /></button>
              </div>

              <div className="flex flex-col gap-6 mb-auto">
                <NavLinks />
                {user && (
                  <>
                    <Link 
                      to="/chat" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors pt-6 border-t border-border flex items-center gap-3"
                    >
                      <MessageSquare size={18} /> Messenger
                    </Link>
                    <button 
                      onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }}
                      className="text-sm font-medium text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-3"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                )}
              </div>

              {!user && (
                <div className="pt-8 border-t border-border space-y-4">
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full bg-brand text-white text-center py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
