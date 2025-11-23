import React, { useState } from 'react';
import { Page } from '../types';
import { Menu, X, Leaf, Instagram, Facebook, Twitter, MessageSquare, Send, Sparkles, Sprout, Lock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Header Component ---
interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', page: Page.HOME },
    { label: 'About Us', page: Page.ABOUT },
    { label: 'Services', page: Page.SERVICES },
    { label: 'Blog', page: Page.BLOG },
    { label: 'Contact', page: Page.CONTACT },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-earth-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate(Page.HOME)}
          >
            <div className="bg-brand-700 p-2 rounded-lg group-hover:bg-brand-800 transition-colors">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-brand-900 tracking-tight">Mothercrop</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-brand-700 ${
                  activePage === item.page ? 'text-brand-700 border-b-2 border-brand-500' : 'text-earth-800'
                }`}
              >
                {item.label}
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
        <div className="md:hidden bg-white border-b border-earth-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.page);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activePage === item.page
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-earth-800 hover:bg-earth-100'
                }`}
              >
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
  return (
    <footer className="bg-brand-900 text-brand-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Leaf className="h-6 w-6 text-brand-500" />
              <span className="ml-2 text-xl font-bold text-white">Mothercrop</span>
            </div>
            <p className="text-brand-100 text-sm leading-relaxed">
              Cultivating a sustainable future through organic farming practices. 
              Fresh from our soil to your table.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-serif font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-brand-100">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seasonal Produce</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
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
            <ul className="space-y-2 text-sm text-brand-100">
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
                placeholder="Enter your email" 
                className="px-4 py-2 bg-brand-800 border border-brand-700 rounded focus:outline-none focus:border-brand-500 text-white placeholder-brand-400 text-sm"
              />
              <button className="px-4 py-2 bg-brand-500 text-white font-medium rounded hover:bg-brand-600 transition-colors text-sm">
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm Mothercrop's AI farming assistant. Ask me anything about organic farming or our produce!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
         setMessages(prev => [...prev, { role: 'model', text: "I'm currently resting (API Key missing). Please try again later." }]);
         setIsLoading(false);
         return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: "You are an expert organic farming assistant for Mothercrop. Answer questions about sustainable agriculture, vegetables, soil health, and organic practices. Keep answers concise and friendly."
        }
      });
      
      const responseText = response.text;
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error("AI Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had trouble digging up that answer. Try asking something else!" }]);
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
          
          <div className="h-80 overflow-y-auto p-4 bg-earth-100 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-none' 
                    : 'bg-white text-earth-800 shadow-sm border border-earth-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white text-earth-800 rounded-lg p-3 shadow-sm border border-earth-200 rounded-bl-none flex items-center space-x-2">
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
                className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-brand-800' : 'bg-brand-600'} hover:bg-brand-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};