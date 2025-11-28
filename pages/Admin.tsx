
import React, { useState, useRef } from 'react';
import { useData } from '../store';
import { Page, Service, BlogPost, User, Role, SoilAnalysisRecord, Testimonial } from '../types';
import { 
  Plus, Trash2, Layout, Users, BookOpen, Phone, Briefcase, 
  Lock, User as UserIcon, ChevronDown, ChevronUp, ChevronLeft, 
  Globe, Save, BarChart3, MessageCircle, FlaskConical, LogOut,
  Shield, X, Eye, Flower2, Megaphone, CloudSun, Wind, Droplets, Mail,
  Sparkles, Image as ImageIcon, Database, Download, Upload as UploadIcon, FileText
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
    if (confirm('Delete this service?')) {
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
    if (confirm("Delete this user?")) {
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
     if(confirm('Delete review?')) {
        updateData({ testimonials: data.testimonials.filter(t => t.id !== id) });
     }
  };

  // --- Blog Logic ---
  const startEditingPost = (post: BlogPost) => setEditingPostId(post.id);
  const createNewPost = () => {
    const newPost: BlogPost = {
      id: Date.now(),
      title: "Untitled Post",
      slug: "untitled-post",
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
  const deletePost = (id: number) => {
    if(confirm("Delete post?")) {
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
            // It's a legacy flat record, treat as English
            return record as any; 
        }
        return record[lang] || record['en'];
    };

    const recordContent = viewSoilRecord ? getContent(viewSoilRecord, recordLang) : null;
    const isPlantMode = viewSoilRecord?.mode === 'plant';

    return (
    <div className="space-y-6">
      {/* Modal for viewing detailed record */}
      {viewSoilRecord && recordContent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={() => setViewSoilRecord(null)}></div>
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95">
              <div className="sticky top-0 bg-white border-b border-earth-100 p-4 flex justify-between items-center z-20">
                 <div className="flex items-center space-x-4">
                    <h3 className="font-bold text-xl text-brand-900">Analysis Details</h3>
                    <div className="flex bg-earth-100 rounded-lg p-1">
                        <button onClick={() => setRecordLang('en')} className={`px-2 py-1 text-xs font-bold rounded ${recordLang === 'en' ? 'bg-white shadow-sm' : 'text-earth-500'}`}>EN</button>
                        <button onClick={() => setRecordLang('hi')} className={`px-2 py-1 text-xs font-bold rounded ${recordLang === 'hi' ? 'bg-white shadow-sm' : 'text-earth-500'}`}>HI</button>
                    </div>
                 </div>
                 <button onClick={() => setViewSoilRecord(null)} className="p-2 hover:bg-earth-100 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="flex justify-between items-start bg-brand-50 p-4 rounded-xl">
                   <div>
                      <span className="text-xs text-brand-600 uppercase font-bold">
                        {isPlantMode ? 'Diagnosis' : 'Soil Type'}
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-brand-900">{recordContent.type}</h2>
                   </div>
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${viewSoilRecord.score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {viewSoilRecord.score}
                   </div>
                 </div>
                 
                 <div>
                    <h4 className="font-bold text-earth-800 mb-2">Summary</h4>
                    <p className="text-earth-600 leading-relaxed border-l-4 border-brand-200 pl-4">{recordContent.summary}</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                       <h5 className="font-bold text-red-800 text-sm mb-2">
                           {isPlantMode ? 'Symptoms' : 'Issues'}
                       </h5>
                       <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {recordContent.issues?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                       </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                       <h5 className="font-bold text-green-800 text-sm mb-2">
                           {isPlantMode ? 'Treatments' : 'Fixes'}
                       </h5>
                       <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                          {recordContent.fixes?.map((f: string, idx: number) => <li key={idx}>{f}</li>)}
                       </ul>
                    </div>
                 </div>
                 
                 <div>
                    <h4 className="font-bold text-earth-800 mb-2">
                        {isPlantMode ? 'Prevention / Care' : 'Recommended Crops'}
                    </h4>
                    <div className="flex flex-col gap-2">
                       {recordContent.crops?.map((c: string, idx: number) => (
                         <div key={idx} className="px-4 py-2 bg-brand-50 text-brand-900 rounded-lg text-sm border border-brand-100">
                           {c}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="text-xs text-earth-400 text-center pt-4 border-t border-earth-100">
                    ID: {viewSoilRecord.id} • Date: {viewSoilRecord.date}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h3 className="text-xl font-bold text-brand-900">Lab History</h3>
             <p className="text-earth-600 text-sm">Recent automated tests performed by users.</p>
           </div>
           <div className="flex items-center gap-4">
             <button 
                onClick={exportSoilHistory}
                className="bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors"
             >
                <Download className="w-4 h-4 mr-2" /> Export CSV
             </button>
             <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">{data.soilLabHistory?.length || 0}</div>
                <div className="text-xs text-earth-500 uppercase font-bold">Total Tests</div>
             </div>
           </div>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-earth-50 border-b border-earth-200">
               <tr>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Mode</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Date</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Result (EN)</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Score</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-earth-100">
               {(data.soilLabHistory || []).map(record => {
                 // Safe access for table view
                 const displayType = record.en ? record.en.type : (record as any).type;
                 return (
                    <tr key={record.id} className="hover:bg-earth-50 transition-colors">
                        <td className="px-4 py-4">
                            {record.mode === 'plant' 
                                ? <span title="Plant Doctor"><Flower2 className="w-5 h-5 text-green-600" /></span>
                                : <span title="Soil Lab"><FlaskConical className="w-5 h-5 text-brand-600" /></span>
                            }
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-earth-600">{record.date}</td>
                        <td className="px-4 py-4 text-sm font-medium text-brand-900 max-w-xs truncate">{displayType}</td>
                        <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.score > 70 ? 'bg-green-100 text-green-700' : record.score > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {record.score}/100
                            </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                            <button onClick={() => { setViewSoilRecord(record); setRecordLang('en'); }} className="text-brand-600 hover:text-brand-800 font-bold text-sm flex items-center justify-end w-full">
                                <Eye className="w-4 h-4 mr-1" /> Report
                            </button>
                        </td>
                    </tr>
                 );
               })}
               {(data.soilLabHistory || []).length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-earth-400">No records found.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  )};

  const renderBlogEditor = () => {
    if (editingPostId === null) {
      // List View
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-brand-900">All Posts ({data.blog.length})</h3>
            <button onClick={createNewPost} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-earth-50 border-b border-earth-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Author</th>
                  <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {data.blog.map(post => (
                  <tr key={post.id} className="hover:bg-earth-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-900">{post.title}</td>
                    <td className="px-6 py-4 text-earth-600 text-sm">{post.author}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => startEditingPost(post)} className="text-brand-600 hover:text-brand-800 font-medium mr-4">Edit</button>
                      <button onClick={() => deletePost(post.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      // Edit View
      const post = data.blog.find(b => b.id === editingPostId);
      if (!post) return <div>Post not found</div>;

      const updatePost = (field: string, value: any) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, [field]: value } : b);
        updateData({ blog: updated });
      };
      const updateSEO = (field: string, value: string) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, seo: { ...b.seo, [field]: value } } : b);
        updateData({ blog: updated });
      };

      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center mb-6">
            <button onClick={() => setEditingPostId(null)} className="flex items-center text-earth-500 hover:text-brand-600 mr-4 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back to List
            </button>
            <h2 className="text-xl font-bold text-brand-900 flex-1">Editing: {post.title}</h2>
            <div className="flex space-x-3">
              <button 
                onClick={() => updatePost('status', post.status === 'published' ? 'draft' : 'published')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
              >
                {post.status === 'published' ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* AI Generator */}
              <div className="bg-gradient-to-r from-brand-900 to-brand-700 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                <Sparkles className="absolute right-0 top-0 w-32 h-32 text-white/10" />
                <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-300"/> AI Blog Writer</h3>
                <p className="text-brand-100 text-sm mb-4 relative z-10">Describe a topic and let Gemini write the full article for you.</p>
                <div className="flex gap-2 relative z-10">
                   <input 
                    value={aiPrompt} 
                    onChange={e => setAiPrompt(e.target.value)} 
                    placeholder="E.g. The benefits of crop rotation for small farms..." 
                    className="flex-1 px-4 py-2 rounded-lg text-brand-900 focus:outline-none"
                    onKeyPress={e => e.key === 'Enter' && generateAIPost(post.id)}
                   />
                   <button 
                    onClick={() => generateAIPost(post.id)}
                    disabled={isGenerating}
                    className="bg-white text-brand-900 px-4 py-2 rounded-lg font-bold hover:bg-brand-50 disabled:opacity-50"
                   >
                     {isGenerating ? 'Writing...' : 'Generate'}
                   </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <label className="block text-sm font-bold text-earth-700 mb-2">Title</label>
                <input value={post.title} onChange={(e) => updatePost('title', e.target.value)} className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                
                {/* Visual Editor Toolbar Mockup */}
                <div className="mt-6 border border-earth-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                  <div className="bg-earth-50 border-b border-earth-300 p-2 flex gap-2">
                     <button className="p-1.5 hover:bg-white rounded text-earth-600" title="Bold"><strong className="font-serif">B</strong></button>
                     <button className="p-1.5 hover:bg-white rounded text-earth-600" title="Italic"><em className="font-serif">I</em></button>
                     <div className="w-px bg-earth-300 h-6 mx-1"></div>
                     <button className="p-1.5 hover:bg-white rounded text-earth-600 text-xs font-bold" title="H2">H2</button>
                     <button className="p-1.5 hover:bg-white rounded text-earth-600 text-xs font-bold" title="H3">H3</button>
                     <div className="w-px bg-earth-300 h-6 mx-1"></div>
                     <button className="p-1.5 hover:bg-white rounded text-earth-600 text-xs flex items-center" title="Image"><ImageIcon className="w-4 h-4" /></button>
                  </div>
                  <textarea 
                    value={post.content} 
                    onChange={(e) => updatePost('content', e.target.value)} 
                    rows={15} 
                    className="w-full p-4 border-none outline-none font-mono text-sm resize-none" 
                    placeholder="Write your story using Markdown..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-earth-700 mb-2">Excerpt</label>
                  <textarea value={post.excerpt} onChange={(e) => updatePost('excerpt', e.target.value)} rows={3} className="w-full p-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <div className="flex items-center mb-4 text-brand-700"><Globe className="w-5 h-5 mr-2" /><h3 className="font-bold">SEO & Metadata</h3></div>
                <div className="bg-earth-50 p-4 rounded-lg mb-6 border border-earth-200">
                  <label className="block text-xs font-bold text-earth-500 uppercase mb-2">Google Preview</label>
                  <div className="bg-white p-4 rounded shadow-sm">
                     <div className="text-[#1a0dab] text-xl font-medium truncate">{post.seo.metaTitle || post.title}</div>
                     <div className="text-sm text-earth-700 mt-1 line-clamp-2">{post.seo.metaDescription || post.excerpt}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <input value={post.seo.metaTitle} onChange={(e) => updateSEO('metaTitle', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" placeholder="SEO Title" />
                  <input value={post.slug} onChange={(e) => updatePost('slug', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" placeholder="URL Slug" />
                  <textarea value={post.seo.metaDescription} onChange={(e) => updateSEO('metaDescription', e.target.value)} rows={3} className="w-full px-4 py-2 border border-earth-300 rounded-lg" placeholder="Meta Description" />
                  <input value={post.seo.keywords} onChange={(e) => updateSEO('keywords', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" placeholder="Keywords (comma separated)" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-200">
                <h3 className="font-bold text-brand-900 mb-4">Featured Image</h3>
                <div className="mb-4 rounded-lg overflow-hidden bg-earth-100 h-40 flex items-center justify-center relative group cursor-pointer" onClick={() => blogImageInputRef.current?.click()}>
                    {post.imageUrl ? (
                        <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post Header" />
                    ) : (
                        <div className="text-earth-400 flex flex-col items-center">
                            <UploadIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs">Click to upload</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadIcon className="text-white w-8 h-8" />
                    </div>
                </div>
                <input type="file" ref={blogImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleBlogImageUpload(e, post.id)} />
                <input value={post.imageUrl} onChange={(e) => updatePost('imageUrl', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded text-xs" placeholder="Or paste image URL" />
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-200">
                 <h3 className="font-bold text-brand-900 mb-4">Post Settings</h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-earth-500 mb-1">Author</label>
                        <input value={post.author} onChange={(e) => updatePost('author', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-earth-500 mb-1">Category</label>
                        <input value={post.category} onChange={(e) => updatePost('category', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-earth-500 mb-1">Date</label>
                        <input value={post.date} onChange={(e) => updatePost('date', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded text-sm" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-earth-50 font-sans">
      <SEO title="Admin Dashboard" description="Manage content and users." />
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-brand-100 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-brand-800">
           <h2 className="text-2xl font-serif font-bold text-white flex items-center">
              <Shield className="mr-2" /> Admin
           </h2>
           <p className="text-xs text-brand-400 mt-1">Logged in as <span className="text-white font-bold">{currentUser.username}</span></p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {hasPermission('dashboard') && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-brand-800 text-white shadow-md' : 'hover:bg-brand-800/50'}`}
              >
                <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
              </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Content</div>
          
          {hasPermission('home') && (
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Layout className="w-5 h-5 mr-3" /> Home Page
            </button>
          )}
          {hasPermission('about') && (
            <button onClick={() => setActiveTab('about')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'about' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Users className="w-5 h-5 mr-3" /> About Us
            </button>
          )}
          {hasPermission('services') && (
            <button onClick={() => setActiveTab('services')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Briefcase className="w-5 h-5 mr-3" /> Services
            </button>
          )}
          {hasPermission('blog') && (
            <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'blog' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <BookOpen className="w-5 h-5 mr-3" /> Blog
            </button>
          )}
           {hasPermission('contact') && (
            <button onClick={() => setActiveTab('contact')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'contact' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Phone className="w-5 h-5 mr-3" /> Contact Info
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Data</div>
          
           {hasPermission('soil-lab') && (
            <button onClick={() => setActiveTab('soil-lab')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'soil-lab' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <FlaskConical className="w-5 h-5 mr-3" /> Soil Lab
            </button>
          )}
           {hasPermission('marketing') && (
            <button onClick={() => setActiveTab('marketing')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'marketing' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Megaphone className="w-5 h-5 mr-3" /> Marketing
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">System</div>

          {hasPermission('users') && (
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Users className="w-5 h-5 mr-3" /> Users
            </button>
          )}
           {hasPermission('settings') && (
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-brand-800 text-white' : 'hover:bg-brand-800/50'}`}>
              <Database className="w-5 h-5 mr-3" /> Settings & Data
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-brand-800">
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-brand-300 hover:text-white transition-colors">
              <LogOut className="w-5 h-5 mr-3" /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-earth-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
           <h1 className="text-xl font-bold text-brand-900 capitalize flex items-center">
              {activeTab ? activeTab.replace('-', ' ') : 'Dashboard'}
           </h1>
           <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate(Page.HOME)}
                className="text-sm font-medium text-brand-600 hover:text-brand-800 mr-4"
              >
                View Live Site
              </button>
              <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                 {currentUser.username[0].toUpperCase()}
              </div>
           </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {activeTab === 'dashboard' && hasPermission('dashboard') && renderDashboard()}

           {activeTab === 'marketing' && hasPermission('marketing') && renderMarketingTab()}
           
           {activeTab === 'soil-lab' && hasPermission('soil-lab') && renderSoilLabTab()}

           {activeTab === 'home' && hasPermission('home') && (
              <div className="max-w-4xl space-y-8 animate-in fade-in">
                 <AccordionSection title="Hero Section" defaultOpen>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-earth-700 mb-1">Hero Title</label>
                            <input value={data.home.heroTitle} onChange={(e) => updateHome('heroTitle', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-earth-700 mb-1">Subtitle</label>
                            <textarea value={data.home.heroSubtitle} onChange={(e) => updateHome('heroSubtitle', e.target.value)} rows={3} className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-earth-700 mb-1">Background Image URL</label>
                            <input value={data.home.heroImage} onChange={(e) => updateHome('heroImage', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                        </div>
                    </div>
                 </AccordionSection>

                 <AccordionSection title="Features Grid">
                    {data.home.features.map((feature, idx) => (
                        <div key={idx} className="mb-6 p-4 bg-earth-50 rounded-lg border border-earth-200">
                            <h4 className="font-bold text-sm text-brand-600 mb-3 uppercase">Feature {idx + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={feature.title} onChange={(e) => updateHomeFeature(idx, 'title', e.target.value)} className="px-3 py-2 border rounded" placeholder="Title" />
                                <select value={feature.iconName} onChange={(e) => updateHomeFeature(idx, 'iconName', e.target.value)} className="px-3 py-2 border rounded">
                                    <option value="Leaf">Leaf</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Users">Users</option>
                                </select>
                                <textarea value={feature.desc} onChange={(e) => updateHomeFeature(idx, 'desc', e.target.value)} className="md:col-span-2 px-3 py-2 border rounded" rows={2} placeholder="Description" />
                            </div>
                        </div>
                    ))}
                 </AccordionSection>
                 
                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 flex items-center">
                        <Save className="w-5 h-5 mr-2" /> Save Changes
                    </button>
                 </div>
              </div>
           )}

           {activeTab === 'about' && hasPermission('about') && (
              <div className="max-w-4xl space-y-8 animate-in fade-in">
                 <AccordionSection title="Our Story" defaultOpen>
                    <div className="space-y-4">
                        <input value={data.about.heroTitle} onChange={(e) => updateAbout('heroTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold text-lg mb-2" placeholder="Page Title" />
                        <textarea value={data.about.intro} onChange={(e) => updateAbout('intro', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} placeholder="Intro text" />
                        <div className="border-t border-earth-200 pt-4 mt-4">
                            <label className="block text-sm font-bold text-earth-700 mb-1">Main Story Content</label>
                            <textarea value={data.about.story} onChange={(e) => updateAbout('story', e.target.value)} className="w-full px-4 py-2 border rounded-lg h-64" />
                        </div>
                    </div>
                 </AccordionSection>

                 <AccordionSection title="Team Members">
                    {data.about.team.map((member) => (
                        <div key={member.id} className="flex gap-4 mb-6 p-4 bg-earth-50 rounded-lg border border-earth-200 items-start">
                            <img src={member.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={member.name} />
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={member.name} onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)} className="px-3 py-2 border rounded" placeholder="Name" />
                                    <input value={member.role} onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)} className="px-3 py-2 border rounded" placeholder="Role" />
                                </div>
                                <textarea value={member.bio} onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)} className="w-full px-3 py-2 border rounded" rows={2} placeholder="Bio" />
                            </div>
                        </div>
                    ))}
                 </AccordionSection>
                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 flex items-center">
                        <Save className="w-5 h-5 mr-2" /> Save Changes
                    </button>
                 </div>
              </div>
           )}

           {activeTab === 'services' && hasPermission('services') && (
              <div className="max-w-4xl space-y-6 animate-in fade-in">
                 <div className="flex justify-end mb-4">
                    <button onClick={addService} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center font-bold text-sm shadow-sm hover:bg-brand-700">
                        <Plus className="w-4 h-4 mr-2" /> Add New Service
                    </button>
                 </div>
                 
                 {data.servicesPage.items.map((service) => (
                    <div key={service.id} className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={service.title} onChange={(e) => updateService(service.id, 'title', e.target.value)} className="px-4 py-2 border rounded font-bold text-lg" placeholder="Service Title" />
                                <input value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} className="px-4 py-2 border rounded text-brand-600 font-bold" placeholder="Price" />
                            </div>
                            <button onClick={() => deleteService(service.id)} className="ml-4 text-red-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Short Description</label>
                                <textarea value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} className="w-full px-4 py-2 border rounded" rows={2} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Full Details (Modal Content)</label>
                                <textarea value={service.details || ''} onChange={(e) => updateService(service.id, 'details', e.target.value)} className="w-full px-4 py-2 border rounded font-mono text-sm" rows={4} placeholder="Enter detailed description here..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Icon Name (Lucide React)</label>
                                <select value={service.iconName} onChange={(e) => updateService(service.id, 'iconName', e.target.value)} className="px-4 py-2 border rounded w-full md:w-auto">
                                    <option value="Sprout">Sprout</option>
                                    <option value="ShoppingBasket">ShoppingBasket</option>
                                    <option value="GraduationCap">GraduationCap</option>
                                    <option value="Leaf">Leaf</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>
                        </div>
                    </div>
                 ))}
                 <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 flex items-center">
                        <Save className="w-5 h-5 mr-2" /> Save Changes
                    </button>
                 </div>
              </div>
           )}

           {activeTab === 'blog' && hasPermission('blog') && renderBlogEditor()}

           {activeTab === 'contact' && hasPermission('contact') && (
              <div className="max-w-2xl bg-white p-8 rounded-xl border border-earth-200 shadow-sm animate-in fade-in">
                 <h3 className="text-xl font-bold text-brand-900 mb-6">Contact Information</h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">Email Address</label>
                        <input value={data.contact.email} onChange={(e) => updateContact('email', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">Phone Number</label>
                        <input value={data.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">Street Address</label>
                        <input value={data.contact.address} onChange={(e) => updateContact('address', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">City, State, Zip</label>
                        <input value={data.contact.city} onChange={(e) => updateContact('city', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">Opening Hours</label>
                        <input value={data.contact.hours} onChange={(e) => updateContact('hours', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1">Google Maps Embed URL</label>
                        <input value={data.contact.mapUrl} onChange={(e) => updateContact('mapUrl', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg text-sm text-earth-600" />
                        <p className="text-xs text-earth-500 mt-1">Paste the "src" attribute from the Google Maps Embed iframe.</p>
                    </div>
                 </div>
                 <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 flex items-center">
                        <Save className="w-5 h-5 mr-2" /> Save Info
                    </button>
                 </div>
              </div>
           )}

           {activeTab === 'users' && hasPermission('users') && (
              <div className="max-w-4xl animate-in fade-in">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 mb-8">
                    <h3 className="font-bold text-brand-900 mb-4">Add New User</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                       <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Username</label>
                          <input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-3 py-2 border rounded" />
                       </div>
                       <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Password</label>
                          <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border rounded" />
                       </div>
                       <div className="w-full md:w-48">
                          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Role</label>
                          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="w-full px-3 py-2 border rounded bg-white">
                             <option value="editor">Editor</option>
                             <option value="manager">Manager</option>
                             <option value="admin">Admin</option>
                          </select>
                       </div>
                       <button onClick={addUser} className="bg-brand-600 text-white px-6 py-2 rounded font-bold hover:bg-brand-700 w-full md:w-auto h-10">Add User</button>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-earth-50 border-b border-earth-200">
                          <tr>
                             <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Username</th>
                             <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Role</th>
                             <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-earth-100">
                          {data.users.map(user => (
                             <tr key={user.id}>
                                <td className="px-6 py-4 font-medium text-brand-900">
                                   {user.username} 
                                   {user.id === currentUser.id && <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">(You)</span>}
                                </td>
                                <td className="px-6 py-4 capitalize text-earth-600">{user.role}</td>
                                <td className="px-6 py-4 text-right">
                                   <button 
                                     onClick={() => deleteUser(user.id)} 
                                     className={`text-red-400 hover:text-red-600 ${user.id === currentUser.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                     disabled={user.id === currentUser.id}
                                   >
                                      <Trash2 className="w-5 h-5" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {activeTab === 'settings' && hasPermission('settings') && (
               <div className="max-w-2xl animate-in fade-in space-y-8">
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                       <div className="flex items-center mb-4">
                           <Database className="w-6 h-6 text-brand-600 mr-2" />
                           <h3 className="text-xl font-bold text-brand-900">Data Management</h3>
                       </div>
                       <p className="text-earth-600 text-sm mb-6">
                           Backup your entire website content (Posts, Users, Settings) or restore from a previous backup.
                       </p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <button 
                               onClick={exportDatabase}
                               className="flex flex-col items-center justify-center p-6 border-2 border-brand-100 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all group"
                           >
                               <Download className="w-8 h-8 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
                               <span className="font-bold text-brand-900">Export Backup</span>
                               <span className="text-xs text-earth-500 mt-1">Download JSON</span>
                           </button>

                           <div 
                               onClick={() => dbFileInputRef.current?.click()}
                               className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-earth-300 rounded-xl hover:bg-earth-50 hover:border-brand-400 transition-all cursor-pointer group"
                           >
                               <UploadIcon className="w-8 h-8 text-earth-400 mb-2 group-hover:text-brand-500 transition-colors" />
                               <span className="font-bold text-earth-700 group-hover:text-brand-900">Import Backup</span>
                               <span className="text-xs text-earth-500 mt-1">Restore JSON File</span>
                               <input type="file" ref={dbFileInputRef} onChange={importDatabase} className="hidden" accept=".json" />
                           </div>
                       </div>
                   </div>

                   <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                       <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
                       <p className="text-sm text-red-700 mb-4">Irreversibly clear all data and reset to factory defaults.</p>
                       <button 
                           onClick={() => { if(confirm('Are you sure? This cannot be undone.')) resetData(); }}
                           className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white transition-colors"
                       >
                           Reset All Data
                       </button>
                   </div>
               </div>
           )}
        </div>
      </main>
    </div>
  );
};
