import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, onSnapshot, orderBy, limit, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import socket from '../lib/socket';
import { ChatRoom, Message } from '../types';
import { Send, User as UserIcon, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'chat_rooms'),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snap) => {
        const roomList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom));
        setRooms(roomList);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (roomId) {
      const q = query(
        collection(db, 'chat_rooms', roomId, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(100)
      );
      
      const unsubscribe = onSnapshot(q, (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        setMessages(msgs);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

      const fetchRoom = async () => {
        const d = await getDoc(doc(db, 'chat_rooms', roomId));
        if (d.exists()) setActiveRoom({ id: d.id, ...d.data() } as ChatRoom);
      };
      fetchRoom();

      socket.emit('join_room', roomId);

      return unsubscribe;
    } else {
      setActiveRoom(null);
      setMessages([]);
    }
  }, [roomId]);

  useEffect(() => {
    const handleReceive = (data: any) => {
      if (data.roomId === roomId && data.senderId !== user?.uid) {
        // Optimistically we already got from Firestore snapshot, but Socket can trigger UI cues
      }
    };
    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message'); };
  }, [roomId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId) return;

    const msgData = {
      roomId,
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp()
    };

    setNewMessage('');

    try {
      await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), msgData);
      socket.emit('send_message', { ...msgData, createdAt: new Date() });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center font-bold text-indigo-600 animate-pulse">Initializing Secure Chat...</div>;

  return (
    <div className="bg-surface rounded-[40px] shadow-2xl border border-border overflow-hidden h-[calc(100vh-14rem)] flex">
      {/* Sidebar - Room List */}
      <div className={`w-full md:w-80 border-r border-border bg-aside flex flex-col ${roomId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-border bg-header">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Messages</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {rooms.map(room => (
            <button 
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all border ${room.id === roomId ? 'bg-brand text-white shadow-xl shadow-blue-900/30 border-brand' : 'bg-[#1A1A20]/50 border-transparent hover:bg-zinc-800/30 hover:border-zinc-700'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${room.id === roomId ? 'bg-white/20' : 'bg-brand/10 text-brand'}`}>
                <UserIcon size={20} />
              </div>
              <div className="text-left flex-grow truncate">
                <div className="font-bold text-sm truncate uppercase tracking-tight">
                  {Object.values(room.participantNames).find(name => name !== profile?.displayName) || 'Partner'}
                </div>
                <div className={`text-[10px] truncate opacity-60 mt-0.5 ${room.id === roomId ? 'text-white' : 'text-zinc-500'}`}>
                  {room.lastMessage || 'Start a conversation...'}
                </div>
              </div>
            </button>
          ))}
          {rooms.length === 0 && (
            <div className="text-center py-20 text-zinc-600 italic text-xs uppercase tracking-widest font-mono">No conversations</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-surface-bright/30 ${!roomId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!roomId ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-aside rounded-[40px] flex items-center justify-center text-zinc-700 mx-auto border border-border shadow-2xl">
              <MessageSquare size={48} />
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Select a secure channel to chat</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 bg-header border-b border-border flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/chat')} className="md:hidden p-2 text-zinc-500 hover:text-brand">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold shadow-xl shadow-blue-900/20">
                  {activeRoom?.participantNames[Object.keys(activeRoom.participantNames).find(id => id !== user?.uid) || '']?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-tight uppercase text-sm">
                    {Object.values(activeRoom?.participantNames || {}).find(name => name !== profile?.displayName) || 'Partner'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></span>
                    <span className="text-[10px] uppercase font-bold text-emerald-500/80 tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-zinc-600 hover:text-brand transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] p-4 rounded-[28px] shadow-xl text-sm leading-relaxed ${
                      msg.senderId === user?.uid 
                        ? 'bg-brand text-white rounded-tr-none shadow-blue-900/20' 
                        : 'bg-[#1A1A20] text-zinc-300 rounded-tl-none border border-border'
                    }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${msg.senderId === user?.uid ? 'text-blue-100/60' : 'text-zinc-600'}`}>
                        {msg.createdAt && new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-6 bg-header border-t border-border">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-grow bg-[#1A1A20] border border-border text-white text-sm px-6 py-4 rounded-2xl focus:outline-none focus:border-brand transition-all placeholder:text-zinc-700"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-brand text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/30 disabled:opacity-50 disabled:grayscale active:scale-95 flex items-center justify-center aspect-square"
                >
                  <Send size={24} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
