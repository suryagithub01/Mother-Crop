
import React, { useState, useRef } from 'react';
import { useData } from '../store';
import { Page, Service, BlogPost, User, Role, SoilAnalysisRecord, Testimonial } from '../types';
import { 
  Plus, Trash2, Layout, Users, BookOpen, Phone, Briefcase, 
  Lock, User as UserIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Globe, Save, BarChart3, MessageCircle, FlaskConical, LogOut,
  Shield, X, Eye, Flower2, Megaphone, CloudSun, Wind, Droplets, Mail,
  Sparkles, Image as ImageIcon, Database, Download, Upload as UploadIcon, FileText, Search, CheckCircle, AlertTriangle
} from 'lucide-react';
import { SEO } from '../components/Layout';
import { GoogleGenAI } from "@google/genai";

interface AdminProps {
  onNavigate: (page: Page) => void;
}

type Tab = 'dashboard' | 'home' | 'about' | 'services' | 'blog' | 'contact' | 'users' | 'soil-lab' | 'marketing' | 'settings';

const AccordionSection = ({ title, children, defaultOpen = false }: { title: string, children?: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-earth-200 rounded-lg bg-white overflow-hidden mb-4 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center bg-earth-50 hover:bg-earth-100 transition-colors"
      >
        <span className="font-bold text-brand-900">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-earth-500" /> : <ChevronDown className="w-5 h-5 text-earth-500" />}
      </button>
      {isOpen && <div className="p-6 border-t border-earth-200">{children}</div>}
    </div>
  );
};

export const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
  const { data, updateData, showNotification, getFarmWeather, resetData } = useData();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Blog State
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogSearch, setBlogSearch] = useState('');
  const blogImageInputRef = useRef<HTMLInputElement>(null);

  // User Management State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'editor' as Role });

  // Chat Viewer State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Soil Lab Viewer State
  const [viewSoilRecord, setViewSoilRecord] = useState<SoilAnalysisRecord | null>(null);
  const [recordLang, setRecordLang] = useState<'en' | 'hi'>('en');

  // Testimonial State
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({ name: '', role: '', text: '', rating: 5 });

  // Database Management State
  const dbFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      // Set initial tab based on role
      if (user.role === 'admin' || user.role === 'manager') setActiveTab('dashboard');
      else if (user.role === 'editor') setActiveTab('blog');
      showNotification(`Welcome back, ${user.username}!`, 'success');
    } else {
      showNotification('Invalid credentials. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setActiveTab(null);
    showNotification('Logged out successfully.', 'info');
  };

  const hasPermission = (tab: Tab): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') return tab !== 'users' && tab !== 'settings';
    if (currentUser.role === 'editor') return tab === 'blog';
    return false;
  };

  // --- Helpers for updating nested state ---
  const updateHome = (field: string, value: any) => updateData({ home: { ...data.home, [field]: value } });
  const updateHomeFeature = (idx: number, field: string, value: any) => {
    const newFeatures = [...data.home.features];
    newFeatures[idx] = { ...newFeatures[idx], [field]: value };
    updateHome('features', newFeatures);
  };
  
  const updateAbout = (field: string, value: any) => updateData({ about: { ...data.about, [field]: value } });
  const updateTeamMember = (id: number, field: string, value: any) => {
    const newTeam = data.about.team.map(m => m.id === id ? { ...m, [field]: value } : m);
    updateAbout('team', newTeam);
  };

  const updateContact = (field: string, value: any) => updateData({ contact: { ...data.contact, [field]: value } });

  const handleSave = () => {
      showNotification('Changes saved successfully!', 'success');
  }

  // --- Service Logic ---
  const addService = () => {
    const newService: Service = {
      id: Date.now(),
      title: "New Service",
      description: "Description...",
      details: "Full details...",
      price: "$0.00",
      iconName: "Sprout"
    };
    updateData({ servicesPage: { ...data.servicesPage, items: [...data.servicesPage.items, newService] } });
    showNotification('Service added.', 'success');
  };

  const deleteService = (id: number) => {
    if (window.confirm('Delete this service?')) {
      updateData({ servicesPage: { ...data.servicesPage, items: data.servicesPage.items.filter(s => s.id !== id) } });
      showNotification('Service deleted.', 'info');
    }
  };

  const updateService = (id: number, field: string, value: any) => {
     const newItems = data.servicesPage.items.map(s => s.id === id ? { ...s, [field]: value } : s);
     updateData({ servicesPage: { ...data.servicesPage, items: newItems } });
  };

  // --- User Logic ---
  const addUser = () => {
    if (!newUser.username || !newUser.password) return showNotification('Username and password required', 'error');
    if (data.users.find(u => u.username === newUser.username)) return showNotification('Username already exists', 'error');
    
    const user: User = {
      id: Date.now(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role
    };
    updateData({ users: [...data.users, user] });
    setNewUser({ username: '', password: '', role: 'editor' });
    showNotification('User added successfully.', 'success');
  };

  const deleteUser = (id: number) => {
    if (id === currentUser?.id) return showNotification("You cannot delete yourself.", 'error');
    if (window.confirm("Delete this user?")) {
      updateData({ users: data.users.filter(u => u.id !== id) });
      showNotification('User deleted.', 'info');
    }
  };

  // --- Marketing Logic ---
  const addTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.text) return showNotification('Name and text required.', 'error');
    const t: Testimonial = {
       id: Date.now(),
       name: newTestimonial.name || '',
       role: newTestimonial.role || '',
       text: newTestimonial.text || '',
       rating: newTestimonial.rating || 5
    };
    updateData({ testimonials: [...data.testimonials, t] });
    setNewTestimonial({ name: '', role: '', text: '', rating: 5 });
    showNotification('Testimonial added.', 'success');
  };

  const deleteTestimonial = (id: number) => {
     if(window.confirm('Delete review?')) {
        updateData({ testimonials: data.testimonials.filter(t => t.id !== id) });
     }
  };

  // --- Blog Logic ---
  const startEditingPost = (post: BlogPost) => setEditingPostId(post.id);
  const createNewPost = () => {
    const newPost: BlogPost = {
      id: Date.now(),
      title: "Untitled Post",
      slug: "untitled-post-" + Date.now(),
      excerpt: "Summary...",
      content: "Start writing your story here...",
      date: new Date().toLocaleDateString(),
      author: currentUser?.username || 'Admin',
      category: "General",
      imageUrl: "https://picsum.photos/800/600",
      status: 'draft',
      seo: { metaTitle: "", metaDescription: "", keywords: "" }
    };
    updateData({ blog: [newPost, ...data.blog] });
    setEditingPostId(newPost.id);
    showNotification('New draft created.', 'success');
  };

  const deletePost = (id: number, e?: React.MouseEvent) => {
    // Stop propagation if event is passed (e.g. clicking delete in a clickable row)
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if(window.confirm("Delete post? This action cannot be undone.")) {
      updateData({ blog: data.blog.filter(b => b.id !== id) });
      if (editingPostId === id) setEditingPostId(null);
      showNotification('Post deleted.', 'info');
    }
  };

  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>, postId: number) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              const updated = data.blog.map(b => b.id === postId ? { ...b, imageUrl: base64 } : b);
              updateData({ blog: updated });
              showNotification('Image uploaded successfully', 'success');
          };
          reader.readAsDataURL(file);
      }
  };

  const calculateSeoScore = (post: BlogPost) => {
    let score = 0;
    const checks = [];

    // Title Length (30-60 chars)
    const titleLen = (post.seo.metaTitle || post.title).length;
    if (titleLen >= 30 && titleLen <= 60) {
        score += 25;
        checks.push({ label: "Title length optimal (30-60)", status: 'pass' });
    } else {
        checks.push({ label: `Title length: ${titleLen} (aim for 30-60)`, status: 'warn' });
    }

    // Desc Length (120-160 chars)
    const descLen = (post.seo.metaDescription || post.excerpt).length;
    if (descLen >= 120 && descLen <= 160) {
        score += 25;
        checks.push({ label: "Description length optimal (120-160)", status: 'pass' });
    } else {
        checks.push({ label: `Description length: ${descLen} (aim for 120-160)`, status: 'warn' });
    }

    // Keyword in Title
    const keywords = post.seo.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
    const titleLower = (post.seo.metaTitle || post.title).toLowerCase();
    const hasKeyword = keywords.length > 0 && keywords.some(k => titleLower.includes(k));
    
    if (hasKeyword) {
        score += 25;
        checks.push({ label: "Keyword found in title", status: 'pass' });
    } else if (keywords.length === 0) {
        checks.push({ label: "No keywords defined", status: 'fail' });
    } else {
        checks.push({ label: "Primary keyword missing from title", status: 'fail' });
    }

    // Content Length
    if (post.content.length > 300) {
        score += 25;
        checks.push({ label: "Content length good (>300 chars)", status: 'pass' });
    } else {
        checks.push({ label: "Content too short (thin content)", status: 'fail' });
    }

    return { score, checks };
  };

  const generateAIPost = async (postId: number) => {
      if (!aiPrompt) return showNotification('Please enter a topic', 'error');
      setIsGenerating(true);
      try {
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `Write a comprehensive, engaging blog post about: "${aiPrompt}". 
        The context is an Organic Farming website. 
        Return strictly valid JSON with these keys: 
        { "title": "string", "excerpt": "string", "content": "markdown string", "category": "string", "seoTitle": "string", "seoDesc": "string", "keywords": "comma separated string" }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const text = response.text;
        if (text) {
            const generated = JSON.parse(text);
            const updated = data.blog.map(b => b.id === postId ? {
                ...b,
                title: generated.title,
                excerpt: generated.excerpt,
                content: generated.content,
                category: generated.category,
                seo: {
                    metaTitle: generated.seoTitle,
                    metaDescription: generated.seoDesc,
                    keywords: generated.keywords
                }
            } : b);
            updateData({ blog: updated });
            showNotification('Blog post generated successfully!', 'success');
            setAiPrompt('');
        }
      } catch (error) {
          console.error(error);
          showNotification('AI Generation failed. Check API Key.', 'error');
      } finally {
          setIsGenerating(false);
      }
  };

  // --- Database Management Logic ---
  const exportDatabase = () => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mothercrop_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Database exported successfully.', 'success');
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const parsed = JSON.parse(event.target?.result as string);
                  // Basic validation
                  if (parsed.users && parsed.home) {
                      updateData(parsed);
                      showNotification('Database restored successfully!', 'success');
                  } else {
                      showNotification('Invalid backup file.', 'error');
                  }
              } catch (err) {
                  showNotification('Failed to parse backup file.', 'error');
              }
          };
          reader.readAsText(file);
      }
  };

  const exportSoilHistory = () => {
      // Define headers including detailed report fields
      const headers = ["ID", "Date", "Mode", "Score", "Type", "Summary", "Issues", "Fixes", "Recommendations"];
      
      // Helper function to escape special characters for CSV format (handle quotes and commas inside text)
      const escape = (text: any) => {
        if (text === null || text === undefined) return '""';
        return `"${String(text).replace(/"/g, '""')}"`;
      };

      const rows = data.soilLabHistory.map(r => {
          // Handle bilingual structure or legacy flat structure
          const content = r.en || (r as any);
          
          const issues = Array.isArray(content.issues) ? content.issues.join('; ') : content.issues;
          const fixes = Array.isArray(content.fixes) ? content.fixes.join('; ') : content.fixes;
          const crops = Array.isArray(content.crops) ? content.crops.join('; ') : content.crops;

          return [
              r.id,
              r.date,
              r.mode,
              r.score,
              content.type,
              content.summary,
              issues,
              fixes,
              crops
          ].map(escape).join(',');
      });
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(","), ...rows].join("\n");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mothercrop_soil_lab_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Report exported successfully.', 'success');
  };

  // --- LOGIN VIEW ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-800">
        <SEO title="Admin Portal - Mothercrop" description="Restricted access." />
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm bg-white/95">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-brand-100 p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-900">Admin Portal</h2>
            <p className="text-earth-500 mt-2">Secure access for Mothercrop staff</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-earth-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-earth-50 focus:bg-white"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-earth-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-earth-50 focus:bg-white"
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-brand-500/30">
              Login to Dashboard
            </button>
            
            <div className="text-center pt-4 border-t border-earth-100">
              <p className="text-xs text-earth-500 mb-3">
                Default Accounts: <br/>
                Admin: admin/admin <br/>
                Manager: manager/manager <br/>
                Editor: editor/editor
              </p>
              <button 
                type="button" 
                onClick={() => onNavigate(Page.HOME)}
                className="text-brand-600 text-sm hover:underline"
              >
                ← Back to Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDERERS ---

  const renderDashboard = () => {
    // Explicitly cast Object.values to number[] to avoid 'unknown' type errors
    const trafficValues = Object.values(data.trafficStats || {}) as number[];
    const totalViews = trafficValues.reduce((a, b) => a + b, 0);
    const maxViews = Math.max(...trafficValues, 1);
    const weather = getFarmWeather();

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-brand-900">Traffic & Engagement</h2>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live Updates Active</span>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-blue-100 text-sm uppercase mb-1">Farm Weather (Live)</h3>
                  <div className="flex items-center">
                     <span className="text-4xl font-bold mr-3">{weather.temp}°F</span>
                     <span className="text-xl font-medium">{weather.condition}</span>
                  </div>
               </div>
               <div className="flex space-x-6 text-center">
                  <div>
                     <CloudSun className="w-8 h-8 mx-auto mb-1 text-blue-200" />
                     <span className="text-xs font-bold">UV Index: High</span>
                  </div>
                  <div>
                     <Droplets className="w-8 h-8 mx-auto mb-1 text-blue-200" />
                     <span className="text-xs font-bold">{weather.humidity}% Hum</span>
                  </div>
                  <div>
                     <Wind className="w-8 h-8 mx-auto mb-1 text-blue-200" />
                     <span className="text-xs font-bold">{weather.windSpeed} mph</span>
                  </div>
               </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-earth-500 font-bold uppercase text-xs">Total Page Views</h3>
                        <BarChart3 className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="text-3xl font-bold text-brand-900">{totalViews}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-earth-500 font-bold uppercase text-xs">AI Conversations</h3>
                        <MessageCircle className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="text-3xl font-bold text-brand-900">{data.chatHistory?.length || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-earth-500 font-bold uppercase text-xs">Lab Analyses</h3>
                        <FlaskConical className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="text-3xl font-bold text-brand-900">{data.soilLabHistory?.length || 0}</div>
                </div>
            </div>

            {/* Traffic Stats */}
            <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                <h3 className="font-bold text-brand-900 mb-6">Traffic by Page</h3>
                <div className="space-y-4">
                    {Object.entries(data.trafficStats || {}).map(([page, count]) => {
                        const safeCount = count as number;
                        return (
                            <div key={page} className="flex items-center">
                                <div className="w-32 text-xs font-bold text-earth-500 uppercase">{page.replace('_', ' ')}</div>
                                <div className="flex-1 h-3 bg-earth-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${(safeCount / maxViews) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="w-12 text-right text-sm font-medium text-brand-900">{safeCount}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-earth-200 bg-earth-50">
                        <h3 className="font-bold text-brand-900">Recent AI Conversations</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {data.chatHistory?.map(session => (
                            <div 
                                key={session.id}
                                onClick={() => setSelectedChatId(session.id)}
                                className={`p-4 rounded-lg cursor-pointer mb-2 transition-colors ${selectedChatId === session.id ? 'bg-brand-50 border border-brand-200' : 'hover:bg-earth-50 border border-transparent'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-brand-600">{session.date}</span>
                                    <span className="text-xs text-earth-400 bg-earth-100 px-2 py-0.5 rounded-full">{session.messages.length} msgs</span>
                                </div>
                                <p className="text-sm text-earth-700 line-clamp-2">{session.preview}</p>
                            </div>
                        ))}
                        {(!data.chatHistory || data.chatHistory.length === 0) && (
                            <div className="p-8 text-center text-earth-400">No chat history yet.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 border-b border-earth-200 bg-earth-50 flex justify-between items-center">
                        <h3 className="font-bold text-brand-900">Transcript</h3>
                        {selectedChatId && <span className="text-xs text-earth-500 font-mono">{selectedChatId}</span>}
                    </div>
                    <div className="overflow-y-auto flex-1 p-6 space-y-4 bg-earth-50">
                        {selectedChatId ? (
                            data.chatHistory?.find(s => s.id === selectedChatId)?.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-600 text-white rounded-br-none' 
                                            : 'bg-white text-earth-800 shadow-sm border border-earth-200 rounded-bl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-earth-400' : 'text-earth-400'}`}>{msg.timestamp}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="h-full flex items-center justify-center text-earth-400">
                                 Select a conversation to view details
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderMarketingTab = () => (
      <div className="space-y-8 animate-in fade-in">
          {/* Newsletter Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="font-bold text-brand-900 text-lg">Newsletter Subscribers</h3>
                   <p className="text-sm text-earth-500">Manage your email list collected from the footer.</p>
                </div>
                <div className="text-3xl font-bold text-brand-600">{data.subscribers.length}</div>
             </div>
             <div className="bg-earth-50 rounded-lg p-4 h-64 overflow-y-auto">
                {data.subscribers.length === 0 ? (
                    <p className="text-earth-400 text-center py-10">No subscribers yet.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-earth-500 border-b border-earth-200">
                           <tr><th className="pb-2 pl-2">Email</th><th className="pb-2">Date Added</th></tr>
                        </thead>
                        <tbody className="divide-y divide-earth-200">
                           {data.subscribers.map(sub => (
                              <tr key={sub.id}>
                                 <td className="py-2 pl-2 font-medium text-earth-800">{sub.email}</td>
                                 <td className="py-2 text-earth-500">{sub.date}</td>
                              </tr>
                           ))}
                        </tbody>
                    </table>
                )}
             </div>
          </div>

          {/* Testimonial Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
             <h3 className="font-bold text-brand-900 text-lg mb-6">Manage Testimonials</h3>
             
             {/* Add New */}
             <div className="bg-earth-50 p-4 rounded-lg border border-earth-100 mb-6">
                <h4 className="text-sm font-bold text-brand-700 uppercase mb-3">Add New Review</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input 
                     placeholder="Customer Name" 
                     value={newTestimonial.name} 
                     onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
                     className="px-3 py-2 rounded border"
                   />
                   <input 
                     placeholder="Role (e.g. CSA Member)" 
                     value={newTestimonial.role} 
                     onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
                     className="px-3 py-2 rounded border"
                   />
                   <textarea 
                     placeholder="Review text..." 
                     value={newTestimonial.text} 
                     onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})}
                     className="px-3 py-2 rounded border md:col-span-2"
                     rows={2}
                   />
                   <div className="md:col-span-2 flex justify-between items-center">
                      <select 
                        value={newTestimonial.rating}
                        onChange={e => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
                        className="px-3 py-2 rounded border"
                      >
                         <option value="5">5 Stars</option>
                         <option value="4">4 Stars</option>
                         <option value="3">3 Stars</option>
                      </select>
                      <button onClick={addTestimonial} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700">Add Review</button>
                   </div>
                </div>
             </div>

             {/* List */}
             <div className="grid gap-4">
                {data.testimonials.map(t => (
                   <div key={t.id} className="border border-earth-200 p-4 rounded-lg flex justify-between items-start">
                      <div>
                         <div className="flex items-center space-x-2">
                            <span className="font-bold text-brand-900">{t.name}</span>
                            <span className="text-xs bg-brand-50 text-brand-600 px-2 rounded-full">{t.rating} ★</span>
                         </div>
                         <p className="text-xs text-earth-500 mb-1">{t.role}</p>
                         <p className="text-sm text-earth-700 italic">"{t.text}"</p>
                      </div>
                      <button onClick={() => deleteTestimonial(t.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                   </div>
                ))}
             </div>
          </div>
      </div>
  );

  const renderSoilLabTab = () => {
    // Helper to extract content safely based on language (defaulting to 'en' if 'hi' is missing/undefined in old records)
    const getContent = (record: SoilAnalysisRecord, lang: 'en' | 'hi') => {
        // Handle legacy records that might just have flat properties
        if (!record.en && !record.hi) {
            const rec = record as any;
            return {
                type: rec.type, summary: rec.summary, issues: rec.issues, fixes: rec.fixes, crops: rec.crops, fertilizer_plan: rec.fertilizer_plan
            };
        }
        return record[lang];
    };

    return (
        <div className="space-y-6 animate-in fade-in">
           <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-2xl font-bold text-brand-900">Soil Lab History</h2>
                  <p className="text-earth-500 text-sm">Review AI analyses performed by users.</p>
              </div>
              <button 
                onClick={exportSoilHistory}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" /> Export History (CSV)
              </button>
           </div>
           
           <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
               <table className="w-full text-left border-collapse">
                   <thead className="bg-earth-50 text-earth-500 text-xs uppercase font-bold">
                       <tr>
                           <th className="p-4 border-b border-earth-200">Date</th>
                           <th className="p-4 border-b border-earth-200">Mode</th>
                           <th className="p-4 border-b border-earth-200">Type</th>
                           <th className="p-4 border-b border-earth-200">Score</th>
                           <th className="p-4 border-b border-earth-200 text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-earth-100">
                       {data.soilLabHistory.map(record => {
                           const content = getContent(record, 'en');
                           return (
                               <tr key={record.id} className="hover:bg-brand-50/30 transition-colors">
                                   <td className="p-4 text-sm font-medium text-brand-900">{record.date}</td>
                                   <td className="p-4">
                                      {record.mode === 'plant' 
                                        ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><Flower2 className="w-3 h-3 mr-1"/> Plant</span>
                                        : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"><FlaskConical className="w-3 h-3 mr-1"/> Soil</span>
                                      }
                                   </td>
                                   <td className="p-4 text-sm text-earth-700 max-w-xs truncate">{content.type}</td>
                                   <td className="p-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${record.score > 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                           {record.score}/100
                                       </span>
                                   </td>
                                   <td className="p-4 text-right">
                                       <button 
                                           onClick={() => setViewSoilRecord(record)}
                                           className="text-brand-600 hover:text-brand-800 text-sm font-bold flex items-center justify-end w-full"
                                       >
                                           <Eye className="w-4 h-4 mr-1" /> View
                                       </button>
                                   </td>
                               </tr>
                           );
                       })}
                       {data.soilLabHistory.length === 0 && (
                           <tr>
                               <td colSpan={5} className="p-8 text-center text-earth-400">No records found.</td>
                           </tr>
                       )}
                   </tbody>
               </table>
           </div>

           {/* View Modal */}
           {viewSoilRecord && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                   <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                       <div className="p-6 border-b border-earth-100 flex justify-between items-center sticky top-0 bg-white z-10">
                           <div>
                               <h3 className="text-xl font-bold text-brand-900">Analysis Details</h3>
                               <p className="text-xs text-earth-500 font-mono mt-1">ID: {viewSoilRecord.id}</p>
                           </div>
                           <button onClick={() => setViewSoilRecord(null)} className="text-earth-400 hover:text-earth-600">
                               <X className="w-6 h-6" />
                           </button>
                       </div>
                       
                       <div className="p-6 space-y-6">
                           {/* Language Toggle for Bilingual Records */}
                           {viewSoilRecord.hi && (
                               <div className="flex justify-end">
                                   <div className="inline-flex bg-earth-100 rounded-lg p-1">
                                       <button 
                                           onClick={() => setRecordLang('en')}
                                           className={`px-3 py-1 text-xs font-bold rounded ${recordLang === 'en' ? 'bg-white shadow text-brand-700' : 'text-earth-500'}`}
                                       >
                                           English
                                       </button>
                                       <button 
                                           onClick={() => setRecordLang('hi')}
                                           className={`px-3 py-1 text-xs font-bold rounded ${recordLang === 'hi' ? 'bg-white shadow text-brand-700' : 'text-earth-500'}`}
                                       >
                                           Hindi
                                       </button>
                                   </div>
                               </div>
                           )}

                           {/* Content Display */}
                           {(() => {
                               const content = getContent(viewSoilRecord, recordLang);
                               return (
                                   <>
                                       <div className="grid grid-cols-2 gap-4">
                                           <div className="bg-brand-50 p-4 rounded-lg">
                                               <span className="text-xs font-bold text-brand-400 uppercase">Result Type</span>
                                               <div className="text-lg font-bold text-brand-900">{content.type}</div>
                                           </div>
                                           <div className="bg-brand-50 p-4 rounded-lg">
                                               <span className="text-xs font-bold text-brand-400 uppercase">Health Score</span>
                                               <div className="text-lg font-bold text-brand-900">{viewSoilRecord.score}/100</div>
                                           </div>
                                       </div>
                                       
                                       <div>
                                           <h4 className="font-bold text-brand-900 mb-2">Summary</h4>
                                           <p className="text-earth-700 text-sm leading-relaxed">{content.summary}</p>
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                               <h4 className="font-bold text-red-800 text-sm mb-2 uppercase">Issues Detected</h4>
                                               <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                                   {content.issues.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                               </ul>
                                           </div>
                                           <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                               <h4 className="font-bold text-green-800 text-sm mb-2 uppercase">Recommended Fixes</h4>
                                               <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                                                   {content.fixes.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                               </ul>
                                           </div>
                                       </div>

                                       <div>
                                           <h4 className="font-bold text-brand-900 mb-3">
                                               {viewSoilRecord.mode === 'plant' ? 'Prevention Tips' : 'Recommended Crops'}
                                           </h4>
                                           <div className="space-y-2">
                                               {content.crops.map((crop: string, i: number) => (
                                                   <div key={i} className="flex items-start text-sm text-brand-800 bg-earth-50 p-2 rounded border border-earth-100">
                                                       <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0 text-brand-500" />
                                                       {crop}
                                                   </div>
                                               ))}
                                           </div>
                                       </div>
                                       
                                       {/* Fertilizer Plan Table */}
                                       {viewSoilRecord.mode === 'soil' && content.fertilizer_plan && (
                                           <div className="mt-6">
                                               <h4 className="font-bold text-blue-900 mb-3">Fertilizer Plan</h4>
                                               <table className="w-full text-sm border-collapse border border-blue-100 rounded-lg overflow-hidden">
                                                   <thead className="bg-blue-50 text-blue-800">
                                                       <tr>
                                                           <th className="p-2 border border-blue-100 text-left">Item</th>
                                                           <th className="p-2 border border-blue-100 text-right">Qty</th>
                                                           <th className="p-2 border border-blue-100 text-left">Note</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody>
                                                       {content.fertilizer_plan.map((row: any, i: number) => (
                                                           <tr key={i}>
                                                               <td className="p-2 border border-blue-100 font-bold">{row.item}</td>
                                                               <td className="p-2 border border-blue-100 text-right font-mono">{row.quantity}</td>
                                                               <td className="p-2 border border-blue-100 text-earth-600 italic">{row.note}</td>
                                                           </tr>
                                                       ))}
                                                   </tbody>
                                               </table>
                                           </div>
                                       )}
                                   </>
                               );
                           })()}
                       </div>
                   </div>
               </div>
           )}
        </div>
    );
  };

  const renderBlogEditor = () => {
     const post = data.blog.find(b => b.id === editingPostId);
     if (!post) return null;
     
     const { score, checks } = calculateSeoScore(post);

     // Helper to update current post
     const updatePost = (field: string, value: any) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, [field]: value } : b);
        updateData({ blog: updated });
     };
     const updateSeo = (field: string, value: any) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, seo: { ...b.seo, [field]: value } } : b);
        updateData({ blog: updated });
     };

     return (
        <div className="animate-in slide-in-from-right duration-300 pb-20"> {/* pb-20 for spacing */}
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => setEditingPostId(null)} className="flex items-center text-earth-500 hover:text-brand-600 font-bold">
                 <ChevronLeft className="w-5 h-5 mr-1" /> Back to List
              </button>
              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.status}
                 </span>
                 <button 
                    onClick={() => updatePost('status', post.status === 'published' ? 'draft' : 'published')}
                    className="text-xs underline text-earth-500 hover:text-brand-600"
                 >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                 {/* Title & Image */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                    <label className="block text-xs font-bold text-earth-500 uppercase mb-2">Blog Title</label>
                    <input 
                       value={post.title} 
                       onChange={(e) => updatePost('title', e.target.value)}
                       className="w-full text-2xl font-serif font-bold text-brand-900 border-b border-earth-200 focus:border-brand-500 outline-none py-2 placeholder-brand-200"
                       placeholder="Enter title here..."
                    />
                    
                    <div className="mt-6">
                        <label className="block text-xs font-bold text-earth-500 uppercase mb-2">Featured Image</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-earth-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={post.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <input 
                                    value={post.imageUrl} 
                                    onChange={(e) => updatePost('imageUrl', e.target.value)}
                                    className="w-full text-sm border border-earth-200 rounded p-2 mb-2"
                                    placeholder="Image URL"
                                />
                                <div className="flex items-center">
                                    <span className="text-xs text-earth-400 mr-2">OR</span>
                                    <button 
                                        onClick={() => blogImageInputRef.current?.click()}
                                        className="text-xs bg-earth-100 hover:bg-earth-200 text-earth-700 px-3 py-1.5 rounded flex items-center"
                                    >
                                        <UploadIcon className="w-3 h-3 mr-1" /> Upload
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={blogImageInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleBlogImageUpload(e, post.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Content */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-earth-100 pb-4">
                       <label className="text-xs font-bold text-earth-500 uppercase">Content (Markdown Supported)</label>
                       
                       {/* AI Writer */}
                       <div className="flex items-center gap-2">
                          <input 
                             value={aiPrompt}
                             onChange={(e) => setAiPrompt(e.target.value)}
                             placeholder="Topic for AI..."
                             className="text-sm border border-earth-200 rounded px-2 py-1 w-40 focus:w-60 transition-all"
                          />
                          <button 
                             onClick={() => generateAIPost(post.id)}
                             disabled={isGenerating}
                             className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold flex items-center hover:bg-purple-200 disabled:opacity-50"
                          >
                             <Sparkles className="w-3 h-3 mr-1" /> 
                             {isGenerating ? 'Writing...' : 'Magic Write'}
                          </button>
                       </div>
                    </div>
                    <textarea 
                       value={post.content} 
                       onChange={(e) => updatePost('content', e.target.value)}
                       className="w-full flex-1 resize-none outline-none text-earth-800 leading-relaxed font-mono text-sm"
                       placeholder="# Heading&#10;&#10;Write your post content here..."
                    />
                 </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                 {/* Publish Actions */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 sticky top-4">
                    <h3 className="font-bold text-brand-900 mb-4">Publishing</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Author</label>
                            <input 
                                value={post.author} 
                                onChange={(e) => updatePost('author', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Category</label>
                            <input 
                                value={post.category} 
                                onChange={(e) => updatePost('category', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Publish Date</label>
                            <input 
                                value={post.date} 
                                onChange={(e) => updatePost('date', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-earth-100 mt-4">
                            <button 
                                onClick={() => {
                                    setEditingPostId(null);
                                    showNotification('Post updated successfully', 'success');
                                }}
                                className="w-full bg-brand-600 text-white font-bold py-2 rounded-lg hover:bg-brand-700 flex items-center justify-center mb-2"
                            >
                                <Save className="w-4 h-4 mr-2" /> Update Post
                            </button>
                            <button 
                                onClick={(e) => deletePost(post.id, e)}
                                className="w-full text-red-500 text-sm font-bold py-2 hover:bg-red-50 rounded-lg"
                                type="button"
                            >
                                Delete Post
                            </button>
                        </div>
                    </div>
                 </div>

                 {/* SEO Card */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-brand-900">SEO Analysis</h3>
                        <div className={`text-xl font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {score}/100
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1 flex justify-between">
                                Meta Title
                                <span className={`${post.seo.metaTitle.length > 60 ? 'text-red-500' : 'text-earth-400'}`}>{post.seo.metaTitle.length}/60</span>
                            </label>
                            <input 
                                value={post.seo.metaTitle} 
                                onChange={(e) => updateSeo('metaTitle', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                                placeholder="SEO Title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1 flex justify-between">
                                Meta Description
                                <span className={`${post.seo.metaDescription.length > 160 ? 'text-red-500' : 'text-earth-400'}`}>{post.seo.metaDescription.length}/160</span>
                            </label>
                            <textarea 
                                value={post.seo.metaDescription} 
                                onChange={(e) => updateSeo('metaDescription', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                                rows={3}
                                placeholder="Search engine description..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Keywords</label>
                            <input 
                                value={post.seo.keywords} 
                                onChange={(e) => updateSeo('keywords', e.target.value)}
                                className="w-full text-sm border border-earth-200 rounded p-2"
                                placeholder="organic, farming, soil..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {checks.map((check, i) => (
                            <div key={i} className="flex items-start text-xs">
                                {check.status === 'pass' && <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />}
                                {check.status === 'warn' && <AlertTriangle className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />}
                                {check.status === 'fail' && <X className="w-3 h-3 text-red-500 mr-2 flex-shrink-0 mt-0.5" />}
                                <span className="text-earth-600">{check.label}</span>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  };

  const renderBlogTab = () => {
    if (editingPostId) return renderBlogEditor();

    const filteredPosts = data.blog.filter(p => 
      p.title.toLowerCase().includes(blogSearch.toLowerCase())
    );

    return (
      <div className="animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-brand-900">Blog Management</h2>
           <button 
             onClick={createNewPost}
             className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center shadow-md"
           >
             <Plus className="w-5 h-5 mr-2" /> Add blog
           </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
           <div className="p-4 border-b border-earth-200 bg-earth-50">
              <div className="relative">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-earth-400" />
                 <input 
                    type="text" 
                    placeholder="Search blogs by title..." 
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                 />
              </div>
           </div>
           
           <table className="w-full text-left border-collapse">
              <thead className="bg-earth-50 text-earth-500 text-xs uppercase font-bold">
                 <tr>
                    <th className="p-4 border-b border-earth-200">Status</th>
                    <th className="p-4 border-b border-earth-200 w-1/2">Title</th>
                    <th className="p-4 border-b border-earth-200">Author</th>
                    <th className="p-4 border-b border-earth-200 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                 {filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-brand-50/30 transition-colors group">
                       <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                             {post.status}
                          </span>
                       </td>
                       <td className="p-4 font-bold text-brand-900 group-hover:text-brand-700 cursor-pointer" onClick={() => startEditingPost(post)}>
                          {post.title}
                       </td>
                       <td className="p-4 text-sm text-earth-600">{post.author}</td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end space-x-3">
                             <button 
                                onClick={(e) => { e.stopPropagation(); startEditingPost(post); }}
                                className="text-earth-500 hover:text-brand-600 font-bold text-sm"
                                type="button"
                             >
                                Edit
                             </button>
                             <button 
                                onClick={(e) => deletePost(post.id, e)}
                                className="text-red-400 hover:text-red-600 font-bold text-sm"
                                type="button"
                             >
                                Delete
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredPosts.length === 0 && (
                    <tr>
                       <td colSpan={4} className="p-8 text-center text-earth-400">No posts found.</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  const renderHomeTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-brand-900">Home Page Editor</h2>
            <button onClick={handleSave} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700 flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
          <AccordionSection title="Hero Section" defaultOpen={true}>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Hero Title</label>
                      <input value={data.home.heroTitle} onChange={(e) => updateHome('heroTitle', e.target.value)} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Subtitle</label>
                      <textarea value={data.home.heroSubtitle} onChange={(e) => updateHome('heroSubtitle', e.target.value)} className="w-full border p-2 rounded" rows={2} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Hero Image URL</label>
                      <input value={data.home.heroImage} onChange={(e) => updateHome('heroImage', e.target.value)} className="w-full border p-2 rounded" />
                  </div>
              </div>
          </AccordionSection>
          <AccordionSection title="Feature Highlights">
               {data.home.features.map((feature, i) => (
                   <div key={i} className="mb-6 p-4 bg-earth-50 rounded border border-earth-100">
                       <h4 className="font-bold text-xs uppercase text-brand-600 mb-2">Feature {i+1}</h4>
                       <div className="grid grid-cols-2 gap-4">
                           <input value={feature.title} onChange={(e) => updateHomeFeature(i, 'title', e.target.value)} className="border p-2 rounded" placeholder="Title" />
                           <select value={feature.iconName} onChange={(e) => updateHomeFeature(i, 'iconName', e.target.value)} className="border p-2 rounded">
                               <option value="Leaf">Leaf</option>
                               <option value="Truck">Truck</option>
                               <option value="Users">Users</option>
                           </select>
                           <textarea value={feature.desc} onChange={(e) => updateHomeFeature(i, 'desc', e.target.value)} className="border p-2 rounded col-span-2" rows={2} placeholder="Description" />
                       </div>
                   </div>
               ))}
          </AccordionSection>
          <AccordionSection title="Featured Section (Bottom)">
               <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Section Title</label>
                      <input value={data.home.featuredSection.title} onChange={(e) => updateHome('featuredSection', {...data.home.featuredSection, title: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Description</label>
                      <textarea value={data.home.featuredSection.description} onChange={(e) => updateHome('featuredSection', {...data.home.featuredSection, description: e.target.value})} className="w-full border p-2 rounded" rows={3} />
                  </div>
                   <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Image URL</label>
                      <input value={data.home.featuredSection.imageUrl} onChange={(e) => updateHome('featuredSection', {...data.home.featuredSection, imageUrl: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-earth-700 mb-1">Bullet Points (One per line)</label>
                      <textarea 
                        value={data.home.featuredSection.bullets.join('\n')} 
                        onChange={(e) => updateHome('featuredSection', {...data.home.featuredSection, bullets: e.target.value.split('\n')})} 
                        className="w-full border p-2 rounded" 
                        rows={4} 
                      />
                  </div>
               </div>
          </AccordionSection>
      </div>
  );

  const renderAboutTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-brand-900">About Us Editor</h2>
            <button onClick={handleSave} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700 flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
          <AccordionSection title="Story & Intro" defaultOpen={true}>
              <div className="space-y-4">
                  <input value={data.about.heroTitle} onChange={(e) => updateAbout('heroTitle', e.target.value)} className="w-full border p-2 rounded" placeholder="Hero Title" />
                  <textarea value={data.about.intro} onChange={(e) => updateAbout('intro', e.target.value)} className="w-full border p-2 rounded" rows={2} placeholder="Intro Text" />
                  <input value={data.about.storyTitle} onChange={(e) => updateAbout('storyTitle', e.target.value)} className="w-full border p-2 rounded" placeholder="Story Title" />
                  <textarea value={data.about.story} onChange={(e) => updateAbout('story', e.target.value)} className="w-full border p-2 rounded" rows={6} placeholder="Full Story" />
              </div>
          </AccordionSection>
          <AccordionSection title="Team Members">
              {data.about.team.map(member => (
                  <div key={member.id} className="mb-6 p-4 bg-earth-50 rounded border border-earth-100">
                      <div className="grid grid-cols-2 gap-4">
                          <input value={member.name} onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)} className="border p-2 rounded" placeholder="Name" />
                          <input value={member.role} onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)} className="border p-2 rounded" placeholder="Role" />
                          <textarea value={member.bio} onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)} className="border p-2 rounded col-span-2" rows={2} placeholder="Bio" />
                          <input value={member.imageUrl} onChange={(e) => updateTeamMember(member.id, 'imageUrl', e.target.value)} className="border p-2 rounded col-span-2" placeholder="Photo URL" />
                      </div>
                  </div>
              ))}
          </AccordionSection>
      </div>
  );

  const renderServicesTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-brand-900">Services Editor</h2>
            <button onClick={addService} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Add Service
            </button>
          </div>

          <AccordionSection title="Page Header">
               <div className="space-y-4">
                  <input value={data.servicesPage.heroTitle} onChange={(e) => updateData({servicesPage: {...data.servicesPage, heroTitle: e.target.value}})} className="w-full border p-2 rounded" placeholder="Page Title" />
                  <textarea value={data.servicesPage.intro} onChange={(e) => updateData({servicesPage: {...data.servicesPage, intro: e.target.value}})} className="w-full border p-2 rounded" rows={2} placeholder="Intro" />
               </div>
          </AccordionSection>
          
          <div className="grid gap-6">
              {data.servicesPage.items.map(service => (
                  <div key={service.id} className="bg-white p-6 rounded-lg shadow-sm border border-earth-200">
                      <div className="flex justify-between mb-4">
                          <h3 className="font-bold text-brand-900">Service #{service.id}</h3>
                          <button onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                      </div>
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <input value={service.title} onChange={(e) => updateService(service.id, 'title', e.target.value)} className="border p-2 rounded" placeholder="Service Name" />
                             <input value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} className="border p-2 rounded" placeholder="Price" />
                          </div>
                          <textarea value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} className="w-full border p-2 rounded" rows={2} placeholder="Short Description" />
                          <div>
                              <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Full Details (Modal Content)</label>
                              <textarea value={service.details} onChange={(e) => updateService(service.id, 'details', e.target.value)} className="w-full border p-2 rounded" rows={4} placeholder="Detailed description for the popup..." />
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <AccordionSection title="CSA Section (Bottom)">
               <div className="space-y-4">
                  <input value={data.servicesPage.csa.title} onChange={(e) => updateData({servicesPage: {...data.servicesPage, csa: {...data.servicesPage.csa, title: e.target.value}}})} className="w-full border p-2 rounded" placeholder="Title" />
                  <textarea value={data.servicesPage.csa.description} onChange={(e) => updateData({servicesPage: {...data.servicesPage, csa: {...data.servicesPage.csa, description: e.target.value}}})} className="w-full border p-2 rounded" rows={3} placeholder="Description" />
                  <textarea 
                    value={data.servicesPage.csa.features.join('\n')} 
                    onChange={(e) => updateData({servicesPage: {...data.servicesPage, csa: {...data.servicesPage.csa, features: e.target.value.split('\n')}}})} 
                    className="w-full border p-2 rounded" 
                    rows={4} 
                    placeholder="Features (one per line)"
                  />
               </div>
          </AccordionSection>
      </div>
  );

  const renderContactTab = () => (
      <div className="space-y-6 animate-in fade-in">
           <h2 className="text-2xl font-bold text-brand-900 mb-4">Contact Info</h2>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 space-y-4">
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">Email</label>
                   <input value={data.contact.email} onChange={(e) => updateContact('email', e.target.value)} className="w-full border p-2 rounded" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">Phone</label>
                   <input value={data.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} className="w-full border p-2 rounded" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">Address</label>
                   <input value={data.contact.address} onChange={(e) => updateContact('address', e.target.value)} className="w-full border p-2 rounded" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">City/State/Zip</label>
                   <input value={data.contact.city} onChange={(e) => updateContact('city', e.target.value)} className="w-full border p-2 rounded" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">Hours</label>
                   <input value={data.contact.hours} onChange={(e) => updateContact('hours', e.target.value)} className="w-full border p-2 rounded" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-earth-700 mb-1">Google Maps Embed URL</label>
                   <input value={data.contact.mapUrl} onChange={(e) => updateContact('mapUrl', e.target.value)} className="w-full border p-2 rounded text-sm text-earth-600 font-mono" />
                   <p className="text-xs text-earth-400 mt-1">Paste the 'src' link from a Google Maps Embed iframe.</p>
               </div>
               <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-2 rounded font-bold hover:bg-brand-700 mt-4">Save Contact Info</button>
           </div>
      </div>
  );

  const renderUsersTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-4">User Management</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 mb-8">
              <h3 className="font-bold text-brand-900 mb-4">Add New User</h3>
              <div className="flex gap-4 items-end">
                  <div className="flex-1">
                      <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Username</label>
                      <input value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div className="flex-1">
                      <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Password</label>
                      <input value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2 rounded" type="password" />
                  </div>
                  <div className="w-40">
                      <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Role</label>
                      <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})} className="w-full border p-2 rounded bg-white">
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="editor">Editor</option>
                      </select>
                  </div>
                  <button onClick={addUser} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700 h-[42px]">Add User</button>
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-earth-50 text-earth-500 text-xs uppercase">
                      <tr>
                          <th className="p-4">Username</th>
                          <th className="p-4">Role</th>
                          <th className="p-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                      {data.users.map(user => (
                          <tr key={user.id}>
                              <td className="p-4 font-bold text-brand-900">{user.username} {user.id === currentUser?.id && '(You)'}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                      user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                  }`}>
                                      {user.role}
                                  </span>
                              </td>
                              <td className="p-4 text-right">
                                  {user.id !== currentUser?.id && (
                                      <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-600 font-bold text-sm">Delete</button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderSettingsTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-4">System Settings</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
              <h3 className="font-bold text-brand-900 mb-2 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-brand-600" /> 
                  Data Management
              </h3>
              <p className="text-earth-600 text-sm mb-6">Backup your entire website data or restore from a previous file.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-earth-200 rounded-lg bg-earth-50">
                      <h4 className="font-bold text-brand-800 text-sm mb-2">Export Data (Backup)</h4>
                      <p className="text-xs text-earth-500 mb-4">Download a JSON file containing all pages, users, and blogs.</p>
                      <button 
                        onClick={exportDatabase}
                        className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center hover:bg-brand-700"
                      >
                          <Download className="w-4 h-4 mr-2" /> Download Backup
                      </button>
                  </div>

                  <div className="p-4 border border-earth-200 rounded-lg bg-earth-50">
                      <h4 className="font-bold text-brand-800 text-sm mb-2">Import Data (Restore)</h4>
                      <p className="text-xs text-earth-500 mb-4">Upload a valid backup JSON file to restore your site.</p>
                      <div className="flex items-center">
                          <button 
                            onClick={() => dbFileInputRef.current?.click()}
                            className="bg-earth-200 text-earth-800 px-4 py-2 rounded text-sm font-bold flex items-center hover:bg-earth-300 mr-2"
                          >
                              <UploadIcon className="w-4 h-4 mr-2" /> Upload File
                          </button>
                          <input 
                              type="file" 
                              ref={dbFileInputRef} 
                              className="hidden" 
                              accept=".json" 
                              onChange={importDatabase}
                          />
                      </div>
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-earth-100">
                  <h4 className="font-bold text-red-700 text-sm mb-2">Danger Zone</h4>
                  <button 
                    onClick={() => {
                        if(window.confirm("Are you sure? This will delete ALL data and reset the app to default.")) {
                            resetData();
                            showNotification('System reset to factory defaults.', 'info');
                        }
                    }}
                    className="border border-red-200 text-red-600 px-4 py-2 rounded text-sm font-bold hover:bg-red-50 flex items-center"
                  >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Factory Reset
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-earth-50 font-sans">
      <SEO title="Admin Dashboard - Mothercrop" description="Manage your website content." />
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex-shrink-0 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-brand-800">
          <div className="flex items-center space-x-2 text-2xl font-serif font-bold cursor-pointer" onClick={() => onNavigate(Page.HOME)}>
             <Shield className="w-8 h-8 text-brand-400" />
             <span>Admin</span>
          </div>
          <p className="text-xs text-brand-300 mt-2">Logged in as <span className="font-bold text-white">{currentUser.username}</span></p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {hasPermission('dashboard') && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Content</div>
          
          {hasPermission('home') && (
            <button 
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Layout className="w-5 h-5 mr-3" /> Home Page
            </button>
          )}
          {hasPermission('about') && (
            <button 
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Users className="w-5 h-5 mr-3" /> About Us
            </button>
          )}
          {hasPermission('services') && (
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Briefcase className="w-5 h-5 mr-3" /> Services
            </button>
          )}
          {hasPermission('blog') && (
            <button 
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'blog' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <BookOpen className="w-5 h-5 mr-3" /> Blog
            </button>
          )}
          {hasPermission('contact') && (
            <button 
              onClick={() => setActiveTab('contact')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contact' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Phone className="w-5 h-5 mr-3" /> Contact Info
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Data</div>
          
          {hasPermission('soil-lab') && (
             <button 
               onClick={() => setActiveTab('soil-lab')}
               className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'soil-lab' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
             >
               <FlaskConical className="w-5 h-5 mr-3" /> Soil Lab
             </button>
          )}

          {hasPermission('marketing') && (
             <button 
               onClick={() => setActiveTab('marketing')}
               className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'marketing' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
             >
               <Megaphone className="w-5 h-5 mr-3" /> Marketing
             </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">System</div>
          
          {hasPermission('users') && (
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Users className="w-5 h-5 mr-3" /> Users
            </button>
          )}

          {hasPermission('settings') && (
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}
            >
              <Database className="w-5 h-5 mr-3" /> Settings
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-brand-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-brand-300 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
         {/* Top Bar */}
         <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-earth-100">
             <h1 className="text-xl font-serif font-bold text-brand-900">
                 {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'Dashboard'}
             </h1>
             <button 
                onClick={() => onNavigate(Page.HOME)}
                className="text-earth-600 hover:text-brand-600 font-medium text-sm flex items-center"
             >
                 View Live Site <span className="ml-2 w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold">{currentUser.username[0].toUpperCase()}</span>
             </button>
         </div>

         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'home' && renderHomeTab()}
         {activeTab === 'about' && renderAboutTab()}
         {activeTab === 'services' && renderServicesTab()}
         {activeTab === 'blog' && renderBlogTab()}
         {activeTab === 'contact' && renderContactTab()}
         {activeTab === 'users' && renderUsersTab()}
         {activeTab === 'soil-lab' && renderSoilLabTab()}
         {activeTab === 'marketing' && renderMarketingTab()}
         {activeTab === 'settings' && renderSettingsTab()}
      </main>
    </div>
  );
};
