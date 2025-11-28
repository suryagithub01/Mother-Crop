
import React, { useState, useEffect, useRef } from 'react';
import { Page, ChatMessage } from '../types';
import { Menu, X, Leaf, Instagram, Facebook, Twitter, MessageSquare, Send, Sparkles, Sprout, Lock, FlaskConical, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../store';

// --- SEO Component ---
export const SEO: React.FC<{title: string, description: string}> = ({title, description}) => {
    useEffect(() => {
        document.title = title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description);
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = description;
            document.head.appendChild(meta);
        }
    }, [title, description]);
    return null;
}

// --- Toast Notification Component ---
export const ToastContainer = () => {
  const { notifications } = useData();

  return (
    <div className="fixed top-24 right-6 z-[60] flex flex-col space-y-3 pointer-events-none">
      {notifications.map(note => (
        <div 
          key={note.id} 
          className={`
            pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-full
            flex items-center p-4 rounded-lg shadow-lg border max-w-sm w-full
            ${note.type === 'success' ? 'bg-white border-l-4 border-l-green-500 text-earth-800' : ''}
            ${note.type === 'error' ? 'bg-white border-l-4 border-l-red-500 text-earth-800' : ''}
            ${note.type === 'info' ? 'bg-white border-l-4 border-l-blue-500 text-earth-800' : ''}
          `}
        >
          <div className="flex-shrink-0 mr-3">
             {note.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
             {note.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
             {note.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          </div>
          <p className="text-sm font-medium">{note.message}</p>
        </div>
      ))}
    </div>
  );
}

// --- Header Component ---
interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', page: Page.HOME },
    { label: 'About Us', page: Page.ABOUT },
    { label: 'Services', page: Page.SERVICES },
    { label: 'Soil Lab', page: Page.SOIL_ANALYSIS },
    { label: 'Blog', page: Page.BLOG },
    { label: 'Contact', page: Page.CONTACT },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4 border-b border-earth-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate(Page.HOME)}
          >
            <div className="bg-brand-600 p-2 rounded-lg group-hover:bg-brand-700 transition-colors shadow-sm">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-brand-900 tracking-tight font-serif">Mothercrop</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-medium transition-colors duration-200 flex items-center ${
                  activePage === item.page ? 'text-brand-700' : 'text-earth-600 hover:text-brand-600'
                }`}
              >
                {item.label === 'Soil Lab' && <FlaskConical className="w-4 h-4 mr-1.5" />}
                {item.label}
                {activePage === item.page && (
                   <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full transform scale-x-100 transition-transform"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-earth-800 hover:text-brand-700"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-earth-200 animate-in slide-in-from-top-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.page);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  activePage === item.page
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-earth-800 hover:bg-earth-100'
                }`}
              >
                 {item.label === 'Soil Lab' && <FlaskConical className="w-4 h-4 mr-2" />}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate(Page.ADMIN);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-earth-800 hover:bg-earth-100 flex items-center"
            >
              <Lock className="w-4 h-4 mr-2" /> Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// --- Footer Component ---
interface FooterProps {
  onNavigate?: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { addSubscriber, showNotification } = useData();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      showNotification('Please enter a valid email.', 'error');
      return;
    }
    addSubscriber(email);
    showNotification('Subscribed successfully!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-brand-900 text-brand-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-1.5 bg-brand-800 rounded">
                 <Leaf className="h-5 w-5 text-brand-300" />
              </div>
              <span className="ml-2 text-xl font-bold text-white font-serif">Mothercrop</span>
            </div>
            <p className="text-brand-200 text-sm leading-relaxed">
              Cultivating a sustainable future through organic farming practices. 
              Fresh from our soil to your table.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-serif font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-brand-200">
              <li><button onClick={() => onNavigate && onNavigate(Page.ABOUT)} className="hover:text-white transition-colors">Our Story</button></li>
              <li><button onClick={() => onNavigate && onNavigate(Page.SERVICES)} className="hover:text-white transition-colors">Seasonal Produce</button></li>
              <li><button onClick={() => onNavigate && onNavigate(Page.SOIL_ANALYSIS)} className="hover:text-white transition-colors flex items-center"><FlaskConical className="w-3 h-3 mr-1"/> AI Soil Lab</button></li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate(Page.ADMIN)} 
                  className="hover:text-white transition-colors text-left flex items-center"
                >
                  <Lock className="w-3 h-3 mr-1" /> Staff Login
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-serif font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-brand-200">
              <li>123 Harvest Lane</li>
              <li>Green Valley, CA 90210</li>
              <li>hello@mothercrop.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-serif font-bold mb-4">Newsletter</h3>
            <div className="flex flex-col space-y-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="px-4 py-2 bg-brand-800/50 border border-brand-700 rounded focus:outline-none focus:border-brand-500 text-white placeholder-brand-400 text-sm"
              />
              <button 
                onClick={handleSubscribe}
                className="px-4 py-2 bg-brand-500 text-white font-medium rounded hover:bg-brand-400 transition-colors text-sm shadow-lg shadow-brand-900/50"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-400 text-sm mb-4 md:mb-0 flex items-center">
            © {new Date().getFullYear()} Mothercrop. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Instagram className="h-5 w-5 text-brand-400 hover:text-white cursor-pointer transition-colors" />
            <Facebook className="h-5 w-5 text-brand-400 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="h-5 w-5 text-brand-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- AI Assistant Widget ---
export const AiAssistant: React.FC = () => {
  const { saveChatSession } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Mothercrop's AI farming assistant. Ask me anything about organic farming or our produce!", timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
        setSessionId('session-' + Date.now());
        initialized.current = true;
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Save user message immediately
    saveChatSession(sessionId, updatedMessages);

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
         const errorMsg: ChatMessage = { role: 'model', text: "I'm currently resting (API Key missing). Please try again later.", timestamp: new Date().toLocaleTimeString() };
         const finalMessages = [...updatedMessages, errorMsg];
         setMessages(finalMessages);
         saveChatSession(sessionId, finalMessages);
         setIsLoading(false);
         return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputValue,
        config: {
          systemInstruction: "You are an expert organic farming assistant for Mothercrop. Answer questions about sustainable agriculture, vegetables, soil health, and organic practices. Keep answers concise and friendly."
        }
      });
      
      const responseText = response.text;
      if (responseText) {
        const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        const finalMessages = [...updatedMessages, modelMsg];
        setMessages(finalMessages);
        saveChatSession(sessionId, finalMessages);
      }
    } catch (error) {
      console.error("AI Error", error);
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I had trouble digging up that answer. Try asking something else!", timestamp: new Date().toLocaleTimeString() };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveChatSession(sessionId, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-brand-100 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right">
          <div className="bg-brand-700 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-medium">Organic Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-brand-100 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-earth-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-sm' 
                    : 'bg-white text-earth-800 shadow-sm border border-earth-100 rounded-bl-sm'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-brand-200' : 'text-earth-400'}`}>{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white text-earth-800 rounded-2xl p-3 shadow-sm border border-earth-100 rounded-bl-sm flex items-center space-x-2">
                   <Sprout className="h-4 w-4 animate-bounce text-brand-500" />
                   <span className="text-xs text-earth-500">Cultivating answer...</span>
                 </div>
               </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-earth-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about our crops..."
                className="flex-1 bg-earth-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-brand-800 rotate-90' : 'bg-brand-600'} hover:bg-brand-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};
