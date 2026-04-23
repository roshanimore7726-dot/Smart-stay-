import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! I am your SmartStay AI guide. How can I help you find your perfect home or service today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are SmartStay AI, a helpful assistant for a multi-service platform in India. You help users find PGs, rooms, flats, food subscriptions, appliance rentals, and home services. Be professional, concise, and helpful. Recommend specific categories if users are unsure.",
        },
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that. How else can I help?";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 z-[90] hover:scale-110 active:scale-95 transition-all group"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-96 max-h-[600px] h-[80vh] bg-header border border-border rounded-[40px] shadow-[0_0_100px_rgba(37,99,235,0.2)] z-[100] flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-aside border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
                   <Bot size={24} />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-tight">SmartStay AI</h3>
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Always Online</p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${
                     m.role === 'user' 
                     ? 'bg-brand text-white rounded-tr-none' 
                     : 'bg-aside border border-border text-zinc-300 rounded-tl-none'
                   }`}>
                     {m.text}
                   </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start">
                   <div className="bg-aside border border-border p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                     <Loader2 size={16} className="animate-spin text-brand" />
                     <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Thinking...</span>
                   </div>
                 </div>
               )}
            </div>

            <div className="p-6 bg-aside border-t border-border">
              <div className="bg-surface rounded-2xl border border-zinc-800 p-2 flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-white text-sm px-4"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
