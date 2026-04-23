import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, MessageSquare, User, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, title: 'Booking Approved', text: 'Your request for "Premium Studio" was approved.', time: '2h ago' },
    { id: 2, title: 'New Message', text: 'You have a message from Resident Life. ', time: '5h ago' }
  ];

  return (
    <nav className="bg-header border-b border-border h-16 flex items-center px-6 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="hidden sm:inline">SmartStay</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">Urban</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors">Stays</Link>
        <Link to="/food-plans" className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors">Food</Link>
        <Link to="/appliances" className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors">Rentals</Link>
        <Link to="/services" className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors">Services</Link>
        
        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-border relative">
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

            <Link to="/chat" className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors relative">
              <MessageSquare size={20} />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-brand group-hover:text-white transition-all overflow-hidden border border-border">
                {profile?.photoURL ? <img src={profile.photoURL} alt="" /> : <User size={18} />}
              </div>
              <span className="text-sm font-medium text-zinc-300 hidden sm:block">
                {profile?.role || 'Guest'}
              </span>
            </Link>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
