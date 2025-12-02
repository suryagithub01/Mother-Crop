
import React, { useState, useRef } from 'react';
import { useData } from '../store';
import { Page, Service, BlogPost, User, Role, SoilAnalysisRecord, Testimonial, KnowledgeResource } from '../types';
import { 
  Plus, Trash2, Layout, Users, BookOpen, Phone, Briefcase, 
  Lock, User as UserIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Globe, Save, BarChart3, MessageCircle, FlaskConical, LogOut,
  Shield, X, Eye, Flower2, Megaphone, CloudSun, Wind, Droplets, Mail,
  Sparkles, Image as ImageIcon, Database, Download, Upload as UploadIcon, FileText, Search, CheckCircle, AlertTriangle,
  GraduationCap, RotateCcw, AlertOctagon, PlayCircle, RefreshCw
} from 'lucide-react';
import { SEO } from '../components/Layout';
import { GoogleGenAI } from "@google/genai";

interface AdminProps {
  onNavigate: (page: Page) => void;
}

type Tab = 'dashboard' | 'home' | 'about' | 'services' | 'blog' | 'knowledge' | 'contact' | 'users' | 'soil-lab' | 'marketing' | 'settings';

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
  const [blogFilter, setBlogFilter] = useState<'active' | 'trash'>('active');
  const blogImageInputRef = useRef<HTMLInputElement>(null);

  // Knowledge Hub State
  const [newResource, setNewResource] = useState<Partial<KnowledgeResource>>({ type: 'video' });

  // User Management State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'editor' as Role });

  // Soil Lab Viewer State
  const [viewSoilRecord, setViewSoilRecord] = useState<SoilAnalysisRecord | null>(null);

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

  // --- Blog Logic & Trash ---
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
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Soft Delete: Move to Trash
    const updated = data.blog.map(b => 
        b.id === id ? { ...b, status: 'trash' as const, deletedAt: new Date().toISOString() } : b
    );
    updateData({ blog: updated });
    if (editingPostId === id) setEditingPostId(null);
    showNotification('Post moved to Trash.', 'info');
  };

  const restorePost = (id: number, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); }
    const updated = data.blog.map(b => 
        b.id === id ? { ...b, status: 'draft' as const, deletedAt: undefined } : b
    );
    updateData({ blog: updated });
    showNotification('Post restored to Drafts.', 'success');
  };

  const permanentlyDeletePost = (id: number, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); }
    if(window.confirm("Permanently delete this post? This cannot be undone.")) {
        updateData({ blog: data.blog.filter(b => b.id !== id) });
        showNotification('Post permanently deleted.', 'info');
    }
  };

  const emptyTrash = () => {
      if(window.confirm("Permanently delete all items in trash?")) {
          const kept = data.blog.filter(b => b.status !== 'trash');
          updateData({ blog: kept });
          showNotification('Trash emptied.', 'success');
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

  // --- Knowledge Hub Logic ---
  const addKnowledgeResource = () => {
      if(!newResource.title) return showNotification('Title required', 'error');
      const res: KnowledgeResource = {
          id: Date.now(),
          title: newResource.title,
          type: newResource.type || 'video',
          category: newResource.category || 'General',
          description: newResource.description || '',
          url: newResource.url || '#',
          thumbnail: newResource.thumbnail || '',
          durationOrSize: newResource.durationOrSize || ''
      };
      updateData({ knowledgeResources: [res, ...data.knowledgeResources] });
      setNewResource({ type: 'video' });
      showNotification('Resource added', 'success');
  };

  const deleteResource = (id: number) => {
      if(window.confirm('Delete this resource?')) {
          updateData({ knowledgeResources: data.knowledgeResources.filter(r => r.id !== id) });
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
      const headers = ["ID", "Date", "Mode", "Score", "Type", "Summary", "Issues", "Fixes", "Recommendations"];
      const escape = (text: any) => {
        if (text === null || text === undefined) return '""';
        return `"${String(text).replace(/"/g, '""')}"`;
      };
      const rows = data.soilLabHistory.map(r => {
          const content = r.en || (r as any);
          const issues = Array.isArray(content.issues) ? content.issues.join('; ') : content.issues;
          const fixes = Array.isArray(content.fixes) ? content.fixes.join('; ') : content.fixes;
          const crops = Array.isArray(content.crops) ? content.crops.join('; ') : content.crops;
          return [r.id, r.date, r.mode, r.score, content.type, content.summary, issues, fixes, crops].map(escape).join(',');
      });
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `mothercrop_soil_lab_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Report exported successfully.', 'success');
  };

  // --- RENDERERS ---

  const renderDashboard = () => {
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-earth-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="bg-brand-100 p-3 rounded-lg text-brand-600"><Users className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                   </div>
                   <h3 className="text-3xl font-bold text-brand-900 mb-1">{totalViews}</h3>
                   <p className="text-xs text-earth-500 font-medium uppercase">Total Page Views</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-earth-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="bg-brand-100 p-3 rounded-lg text-brand-600"><MessageCircle className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+5%</span>
                   </div>
                   <h3 className="text-3xl font-bold text-brand-900 mb-1">{data.chatHistory.length}</h3>
                   <p className="text-xs text-earth-500 font-medium uppercase">AI Chats</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-earth-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="bg-brand-100 p-3 rounded-lg text-brand-600"><FlaskConical className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+28%</span>
                   </div>
                   <h3 className="text-3xl font-bold text-brand-900 mb-1">{data.soilLabHistory.length}</h3>
                   <p className="text-xs text-earth-500 font-medium uppercase">Lab Analyses</p>
                </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                     <h3 className="font-bold text-brand-900 mb-6">Page Popularity</h3>
                     <div className="space-y-4">
                         {Object.entries(data.trafficStats || {}).map(([page, count]) => (
                             <div key={page}>
                                 <div className="flex justify-between text-sm mb-1">
                                     <span className="font-medium text-earth-700">{page}</span>
                                     <span className="text-earth-500">{count} views</span>
                                 </div>
                                 <div className="w-full bg-earth-100 rounded-full h-2">
                                     <div 
                                        className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${((count as number) / maxViews) * 100}%` }}
                                     ></div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm flex flex-col">
                     <h3 className="font-bold text-brand-900 mb-4">Recent Activity</h3>
                     <div className="flex-1 overflow-y-auto space-y-4 max-h-80 pr-2">
                         {data.soilLabHistory.slice(0, 5).map(record => (
                             <div key={record.id} className="flex items-start p-3 bg-earth-50 rounded-lg">
                                 <div className={`p-2 rounded-full mr-3 ${record.mode === 'soil' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                     {record.mode === 'soil' ? <FlaskConical className="w-4 h-4" /> : <Flower2 className="w-4 h-4" />}
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-brand-900">{record.mode === 'soil' ? 'Soil Analysis' : 'Plant Diagnosis'}</p>
                                     <p className="text-xs text-earth-500">{record.date}</p>
                                     <span className="text-[10px] bg-white border border-earth-200 px-1.5 py-0.5 rounded text-earth-600 mt-1 inline-block">Score: {record.score}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
  };

  const renderHomeTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Home Page Management</h2>
        <AccordionSection title="Hero Section" defaultOpen>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">Hero Title</label>
                    <input value={data.home.heroTitle} onChange={(e) => updateHome('heroTitle', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">Hero Subtitle</label>
                    <textarea value={data.home.heroSubtitle} onChange={(e) => updateHome('heroSubtitle', e.target.value)} className="w-full border p-2 rounded h-20" />
                </div>
            </div>
        </AccordionSection>
        <AccordionSection title="Features">
            {data.home.features.map((feature, idx) => (
                <div key={idx} className="mb-4 p-4 border rounded bg-earth-50">
                    <input value={feature.title} onChange={(e) => updateHomeFeature(idx, 'title', e.target.value)} className="w-full border p-2 rounded mb-2 font-bold" />
                    <textarea value={feature.desc} onChange={(e) => updateHomeFeature(idx, 'desc', e.target.value)} className="w-full border p-2 rounded" />
                </div>
            ))}
        </AccordionSection>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">About Page Management</h2>
        <AccordionSection title="Our Story" defaultOpen>
            <textarea value={data.about.story} onChange={(e) => updateAbout('story', e.target.value)} className="w-full border p-2 rounded h-64" />
        </AccordionSection>
        <AccordionSection title="Team Members">
            <div className="grid gap-4">
                {data.about.team.map(member => (
                    <div key={member.id} className="border p-4 rounded bg-earth-50">
                        <input value={member.name} onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)} className="w-full border p-2 rounded mb-2 font-bold" />
                        <input value={member.role} onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)} className="w-full border p-2 rounded mb-2 text-sm" />
                        <textarea value={member.bio} onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)} className="w-full border p-2 rounded text-sm" />
                    </div>
                ))}
            </div>
        </AccordionSection>
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-900">Services Management</h2>
            <button onClick={addService} className="bg-brand-600 text-white px-4 py-2 rounded flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Add Service
            </button>
        </div>
        <div className="grid gap-6">
            {data.servicesPage.items.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm relative">
                    <button onClick={() => deleteService(service.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-earth-500 mb-1">Title</label>
                            <input value={service.title} onChange={(e) => updateService(service.id, 'title', e.target.value)} className="w-full border p-2 rounded font-bold text-lg" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-earth-500 mb-1">Price</label>
                            <input value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs font-bold uppercase text-earth-500 mb-1">Short Description</label>
                             <input value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs font-bold uppercase text-earth-500 mb-1">Full Details</label>
                             <textarea value={service.details} onChange={(e) => updateService(service.id, 'details', e.target.value)} className="w-full border p-2 rounded h-32" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderBlogTab = () => {
    if (editingPostId) return renderBlogEditor();

    const filteredPosts = data.blog.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(blogSearch.toLowerCase());
        const matchesStatus = blogFilter === 'trash' ? p.status === 'trash' : p.status !== 'trash';
        return matchesSearch && matchesStatus;
    });

    const trashCount = data.blog.filter(p => p.status === 'trash').length;

    return (
      <div className="animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-brand-900">Blog Management</h2>
           <button onClick={createNewPost} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center shadow-md">
             <Plus className="w-5 h-5 mr-2" /> Add blog
           </button>
        </div>

        <div className="flex space-x-4 mb-4 border-b border-earth-200">
            <button onClick={() => setBlogFilter('active')} className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors ${blogFilter === 'active' ? 'border-brand-600 text-brand-600' : 'border-transparent text-earth-500 hover:text-earth-700'}`}>
                All Posts ({data.blog.filter(p => p.status !== 'trash').length})
            </button>
            <button onClick={() => setBlogFilter('trash')} className={`pb-2 px-4 text-sm font-bold border-b-2 transition-colors flex items-center ${blogFilter === 'trash' ? 'border-red-500 text-red-500' : 'border-transparent text-earth-500 hover:text-earth-700'}`}>
                <Trash2 className="w-4 h-4 mr-2" /> Trash ({trashCount})
            </button>
        </div>

        {blogFilter === 'trash' && trashCount > 0 && (
            <div className="mb-4 flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-xs text-red-800">Items in trash are automatically permanently deleted after 30 days.</p>
                <button onClick={emptyTrash} className="text-xs font-bold text-red-600 hover:underline">Empty Trash Now</button>
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
           <div className="p-4 border-b border-earth-200 bg-earth-50">
              <div className="relative">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-earth-400" />
                 <input type="text" placeholder="Search blogs by title..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
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
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'trash' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                             {post.status}
                          </span>
                       </td>
                       <td className="p-4 font-bold text-brand-900 group-hover:text-brand-700 cursor-pointer" onClick={() => post.status !== 'trash' && startEditingPost(post)}>
                          {post.title}
                          {post.deletedAt && <span className="block text-[10px] text-red-400 font-normal">Deleted: {new Date(post.deletedAt).toLocaleDateString()}</span>}
                       </td>
                       <td className="p-4 text-sm text-earth-600">{post.author}</td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end space-x-3">
                             {post.status !== 'trash' ? (
                                 <>
                                     <button onClick={(e) => { e.stopPropagation(); startEditingPost(post); }} className="text-earth-500 hover:text-brand-600 font-bold text-sm" type="button">Edit</button>
                                     <button onClick={(e) => deletePost(post.id, e)} className="text-red-400 hover:text-red-600 font-bold text-sm" type="button">Delete</button>
                                 </>
                             ) : (
                                 <>
                                     <button onClick={(e) => restorePost(post.id, e)} className="text-green-500 hover:text-green-700 font-bold text-sm flex items-center" type="button"><RotateCcw className="w-3 h-3 mr-1" /> Restore</button>
                                     <button onClick={(e) => permanentlyDeletePost(post.id, e)} className="text-red-600 hover:text-red-800 font-bold text-sm flex items-center" type="button"><X className="w-3 h-3 mr-1" /> Delete Forever</button>
                                 </>
                             )}
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  const renderBlogEditor = () => {
     const post = data.blog.find(b => b.id === editingPostId);
     if (!post) return null;

     const updatePost = (field: string, value: any) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, [field]: value } : b);
        updateData({ blog: updated });
     };
     const updateSeo = (field: string, value: any) => {
        const updated = data.blog.map(b => b.id === post.id ? { ...b, seo: { ...b.seo, [field]: value } } : b);
        updateData({ blog: updated });
     };

     const { score, checks } = calculateSeoScore(post);

     return (
        <div className="animate-in slide-in-from-right duration-300 pb-20">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => setEditingPostId(null)} className="flex items-center text-earth-500 hover:text-brand-600 font-bold">
                 <ChevronLeft className="w-5 h-5 mr-1" /> Back to List
              </button>
              <div className="flex space-x-4">
                 <select value={post.status} onChange={(e) => updatePost('status', e.target.value)} className="bg-white border border-earth-300 rounded-lg px-3 py-2 text-sm font-bold">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                 </select>
                 <button onClick={() => { setEditingPostId(null); showNotification('Post updated!', 'success'); }} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center shadow-lg">
                    <Save className="w-4 h-4 mr-2" /> Update Post
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                    {/* Main Content Editor */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                        <input 
                            value={post.title} 
                            onChange={(e) => updatePost('title', e.target.value)} 
                            className="w-full text-3xl font-serif font-bold text-brand-900 border-none focus:ring-0 placeholder-earth-300 px-0" 
                            placeholder="Post Title..."
                        />
                        <div className="flex items-center text-xs text-earth-400 mt-2 mb-6">
                            <span className="bg-earth-100 px-2 py-1 rounded mr-2">SLUG</span>
                            <input 
                                value={post.slug} 
                                onChange={(e) => updatePost('slug', e.target.value)} 
                                className="w-full bg-transparent border-none focus:ring-0 text-earth-500 p-0" 
                            />
                        </div>
                        
                        {/* AI Toolbar */}
                        <div className="bg-brand-50 p-4 rounded-lg mb-4 border border-brand-100">
                            <h4 className="text-xs font-bold text-brand-700 uppercase mb-2 flex items-center"><Sparkles className="w-3 h-3 mr-1" /> AI Magic Write</h4>
                            <div className="flex gap-2">
                                <input 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Enter topic (e.g. 'How to grow tomatoes in pots')"
                                    className="flex-1 text-sm border-brand-200 rounded px-3 py-2"
                                />
                                <button 
                                    onClick={() => generateAIPost(post.id)}
                                    disabled={isGenerating}
                                    className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
                                >
                                    {isGenerating ? 'Writing...' : 'Generate Draft'}
                                </button>
                            </div>
                        </div>

                        <textarea 
                            value={post.content} 
                            onChange={(e) => updatePost('content', e.target.value)} 
                            className="w-full min-h-[500px] border-none focus:ring-0 text-earth-800 leading-relaxed resize-none p-0" 
                            placeholder="Start writing your story..."
                        />
                    </div>
               </div>

               <div className="space-y-6">
                   {/* Publish Settings */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                        <h3 className="font-bold text-brand-900 mb-4 text-sm uppercase tracking-wide">Publishing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1">Author</label>
                                <input value={post.author} onChange={(e) => updatePost('author', e.target.value)} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1">Category</label>
                                <input value={post.category} onChange={(e) => updatePost('category', e.target.value)} className="w-full border p-2 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1">Date</label>
                                <input type="date" value={new Date(post.date).toISOString().split('T')[0]} onChange={(e) => updatePost('date', e.target.value)} className="w-full border p-2 rounded text-sm" />
                            </div>
                        </div>
                   </div>

                   {/* Featured Image */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                       <h3 className="font-bold text-brand-900 mb-4 text-sm uppercase tracking-wide">Featured Image</h3>
                       <div 
                            className="aspect-video bg-earth-100 rounded-lg overflow-hidden relative group cursor-pointer border-2 border-dashed border-earth-300 hover:border-brand-500 transition-colors"
                            onClick={() => blogImageInputRef.current?.click()}
                        >
                            <img src={post.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-bold flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Change Image</span>
                            </div>
                       </div>
                       <input 
                            type="file" 
                            ref={blogImageInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleBlogImageUpload(e, post.id)} 
                        />
                   </div>

                   {/* SEO Scorecard */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide">SEO Scorecard</h3>
                            <span className={`text-lg font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{score}/100</span>
                        </div>
                        
                        <div className="w-full bg-earth-100 rounded-full h-2 mb-6">
                             <div className={`h-2 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
                        </div>

                        <div className="space-y-2 mb-6">
                            {checks.map((check, i) => (
                                <div key={i} className="flex items-center text-xs">
                                    {check.status === 'pass' ? <CheckCircle className="w-3 h-3 text-green-500 mr-2" /> : check.status === 'warn' ? <AlertTriangle className="w-3 h-3 text-yellow-500 mr-2" /> : <X className="w-3 h-3 text-red-500 mr-2" />}
                                    <span className={check.status === 'pass' ? 'text-earth-700' : 'text-earth-500'}>{check.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-earth-100">
                             <div>
                                <div className="flex justify-between">
                                    <label className="block text-xs font-bold text-earth-500 mb-1">Meta Title</label>
                                    <span className={`text-[10px] ${(post.seo.metaTitle || post.title).length > 60 ? 'text-red-500' : 'text-earth-400'}`}>{(post.seo.metaTitle || post.title).length}/60</span>
                                </div>
                                <input value={post.seo.metaTitle} onChange={(e) => updateSeo('metaTitle', e.target.value)} placeholder={post.title} className="w-full border p-2 rounded text-sm" />
                             </div>
                             <div>
                                <div className="flex justify-between">
                                    <label className="block text-xs font-bold text-earth-500 mb-1">Meta Description</label>
                                    <span className={`text-[10px] ${(post.seo.metaDescription || post.excerpt).length > 160 ? 'text-red-500' : 'text-earth-400'}`}>{(post.seo.metaDescription || post.excerpt).length}/160</span>
                                </div>
                                <textarea value={post.seo.metaDescription} onChange={(e) => updateSeo('metaDescription', e.target.value)} placeholder={post.excerpt} className="w-full border p-2 rounded text-sm h-20" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1">Keywords</label>
                                <input value={post.seo.keywords} onChange={(e) => updateSeo('keywords', e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="organic, soil, farming" />
                             </div>
                        </div>
                   </div>

                   {/* Delete Action */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                       <button 
                            onClick={(e) => deletePost(post.id, e)}
                            className="w-full text-red-500 text-sm font-bold py-2 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                            type="button"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                        </button>
                   </div>
               </div>
           </div>
        </div>
     );
  };

  const renderKnowledgeTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-brand-900">Knowledge Hub Manager</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 mb-8">
              <h3 className="font-bold text-brand-900 mb-4">Add Resource</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Title" value={newResource.title || ''} onChange={e => setNewResource({...newResource, title: e.target.value})} className="border p-2 rounded" />
                  <select value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value as any})} className="border p-2 rounded bg-white">
                      <option value="video">Video</option>
                      <option value="guide">Guide</option>
                      <option value="pdf">PDF Download</option>
                  </select>
                  <input placeholder="Category (e.g. Soil)" value={newResource.category || ''} onChange={e => setNewResource({...newResource, category: e.target.value})} className="border p-2 rounded" />
                  <input placeholder="URL / Link" value={newResource.url || ''} onChange={e => setNewResource({...newResource, url: e.target.value})} className="border p-2 rounded" />
                  <input placeholder="Description" value={newResource.description || ''} onChange={e => setNewResource({...newResource, description: e.target.value})} className="border p-2 rounded" />
                  <input placeholder="Thumbnail URL" value={newResource.thumbnail || ''} onChange={e => setNewResource({...newResource, thumbnail: e.target.value})} className="border p-2 rounded" />
                  
                  <button onClick={addKnowledgeResource} className="md:col-span-2 bg-brand-600 text-white font-bold py-2 rounded hover:bg-brand-700">Add Resource</button>
              </div>
          </div>

          <div className="grid gap-4">
              {data.knowledgeResources.map(res => (
                  <div key={res.id} className="bg-white p-4 rounded-xl border border-earth-200 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${res.type === 'video' ? 'bg-red-100 text-red-600' : res.type === 'pdf' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {res.type === 'video' ? <PlayCircle /> : res.type === 'pdf' ? <Download /> : <FileText />}
                          </div>
                          <div>
                              <h4 className="font-bold text-brand-900">{res.title}</h4>
                              <p className="text-xs text-earth-500">{res.category} • {res.durationOrSize}</p>
                          </div>
                      </div>
                      <button onClick={() => deleteResource(res.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderContactTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">Contact Info</h2>
          <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm space-y-4">
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
                  <label className="block text-sm font-bold text-earth-700 mb-1">City</label>
                  <input value={data.contact.city} onChange={(e) => updateContact('city', e.target.value)} className="w-full border p-2 rounded" />
              </div>
          </div>
      </div>
  );

  const renderUsersTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">User Management</h2>
          <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm mb-8">
              <h3 className="font-bold text-brand-900 mb-4">Add New User</h3>
              <div className="flex gap-4 items-end">
                  <div className="flex-1">
                      <label className="block text-xs text-earth-500 mb-1">Username</label>
                      <input value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div className="flex-1">
                      <label className="block text-xs text-earth-500 mb-1">Password</label>
                      <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div className="w-32">
                      <label className="block text-xs text-earth-500 mb-1">Role</label>
                      <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})} className="w-full border p-2 rounded bg-white">
                          <option value="editor">Editor</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                      </select>
                  </div>
                  <button onClick={addUser} className="bg-brand-600 text-white px-4 py-2 rounded font-bold hover:bg-brand-700">Add</button>
              </div>
          </div>
          <div className="bg-white rounded-xl border border-earth-200 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-earth-50 text-xs font-bold text-earth-500 uppercase">
                      <tr>
                          <th className="p-4">Username</th>
                          <th className="p-4">Role</th>
                          <th className="p-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-100">
                      {data.users.map(user => (
                          <tr key={user.id}>
                              <td className="p-4 font-bold">{user.username}</td>
                              <td className="p-4"><span className="bg-earth-100 px-2 py-1 rounded-full text-xs font-bold">{user.role}</span></td>
                              <td className="p-4 text-right">
                                  {user.id !== currentUser?.id && (
                                      <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-600">
                                          <Trash2 className="w-5 h-5" />
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderSoilLabTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-900">Soil Lab History</h2>
              <button onClick={exportSoilHistory} className="bg-brand-100 text-brand-700 px-4 py-2 rounded font-bold flex items-center hover:bg-brand-200">
                  <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
          </div>
          
          <div className="bg-white rounded-xl border border-earth-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-earth-50 text-xs font-bold text-earth-500 uppercase">
                     <tr>
                         <th className="p-3">Date</th>
                         <th className="p-3">Mode</th>
                         <th className="p-3">Score</th>
                         <th className="p-3">Result Type</th>
                         <th className="p-3">Location</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-earth-100">
                     {data.soilLabHistory.map(record => (
                         <tr key={record.id} className="hover:bg-earth-50 cursor-pointer">
                             <td className="p-3 text-earth-600">{record.date}</td>
                             <td className="p-3">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${record.mode === 'soil' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                     {record.mode}
                                 </span>
                             </td>
                             <td className="p-3 font-bold">{record.score}</td>
                             <td className="p-3">{record.en?.type || (record as any).type}</td>
                             <td className="p-3 text-earth-500">{record.location || 'Unknown'}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>
  );

  const renderMarketingTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">Marketing & Testimonials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                      <h3 className="font-bold text-brand-900 mb-4">Add Testimonial</h3>
                      <div className="space-y-4">
                          <input placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})} className="w-full border p-2 rounded" />
                          <input placeholder="Role (e.g. CSA Member)" value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})} className="w-full border p-2 rounded" />
                          <textarea placeholder="Quote" value={newTestimonial.text} onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})} className="w-full border p-2 rounded h-24" />
                          <button onClick={addTestimonial} className="w-full bg-brand-600 text-white py-2 rounded font-bold">Add Review</button>
                      </div>
                  </div>
              </div>
              <div className="space-y-4">
                  {data.testimonials.map(t => (
                      <div key={t.id} className="bg-white p-4 rounded-xl border border-earth-200 shadow-sm relative">
                          <button onClick={() => deleteTestimonial(t.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="italic text-earth-600 mb-2">"{t.text}"</p>
                          <p className="font-bold text-brand-900">{t.name}</p>
                          <p className="text-xs text-earth-500">{t.role}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderSettingsTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">System Settings</h2>
          <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
              <h3 className="font-bold text-brand-900 mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2" /> Backup & Restore
              </h3>
              <p className="text-sm text-earth-600 mb-6">
                  Download a full backup of your website data (pages, blogs, users, settings) or restore from a previous backup file.
              </p>
              <div className="flex gap-4">
                  <button onClick={exportDatabase} className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 flex items-center justify-center">
                      <Download className="w-5 h-5 mr-2" /> Download Backup
                  </button>
                  <button onClick={() => dbFileInputRef.current?.click()} className="flex-1 bg-earth-100 text-brand-800 py-3 rounded-lg font-bold hover:bg-earth-200 flex items-center justify-center border border-earth-200">
                      <UploadIcon className="w-5 h-5 mr-2" /> Restore from File
                  </button>
                  <input type="file" ref={dbFileInputRef} className="hidden" accept=".json" onChange={importDatabase} />
              </div>
          </div>
           <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-900 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone</h3>
              <button onClick={() => { if(window.confirm("Are you sure? This will wipe all data and reset to default.")) { resetData(); window.location.reload(); } }} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Reset Site to Factory Default</button>
           </div>
      </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-earth-50 flex flex-col justify-center items-center p-4 font-sans">
        <SEO title="Admin Login - Mothercrop" description="Staff login portal." />
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-earth-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-brand-600 p-3 rounded-xl inline-flex mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-brand-900">Staff Portal</h1>
            <p className="text-earth-500 text-sm mt-2">Please sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-earth-700 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-earth-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                  placeholder="Enter username"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-earth-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-earth-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-earth-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-earth-400">
              Default: admin / admin
            </p>
          </div>
        </div>
        <button onClick={() => onNavigate(Page.HOME)} className="mt-8 text-earth-500 hover:text-brand-600 text-sm font-bold flex items-center">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Website
        </button>
      </div>
    );
  }

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
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Content</div>
          {hasPermission('home') && (
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <Layout className="w-5 h-5 mr-3" /> Home Page
            </button>
          )}
          {hasPermission('about') && (
            <button onClick={() => setActiveTab('about')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <Users className="w-5 h-5 mr-3" /> About Us
            </button>
          )}
          {hasPermission('services') && (
            <button onClick={() => setActiveTab('services')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <Briefcase className="w-5 h-5 mr-3" /> Services
            </button>
          )}
          {hasPermission('blog') && (
            <button onClick={() => setActiveTab('blog')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'blog' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <BookOpen className="w-5 h-5 mr-3" /> Blog
            </button>
          )}
          {hasPermission('blog') && (
            <button onClick={() => setActiveTab('knowledge')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'knowledge' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <GraduationCap className="w-5 h-5 mr-3" /> Knowledge Hub
            </button>
          )}
          {hasPermission('contact') && (
            <button onClick={() => setActiveTab('contact')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contact' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <Phone className="w-5 h-5 mr-3" /> Contact Info
            </button>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-500 uppercase tracking-wider">Data</div>
          {hasPermission('soil-lab') && (
             <button onClick={() => setActiveTab('soil-lab')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'soil-lab' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
               <FlaskConical className="w-5 h-5 mr-3" /> Soil Lab
             </button>
          )}
          {hasPermission('dashboard') && (
            <button onClick={() => setActiveTab('marketing')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'marketing' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <Megaphone className="w-5 h-5 mr-3" /> Marketing
            </button>
          )}
           {hasPermission('settings') && (
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`}>
              <AlertOctagon className="w-5 h-5 mr-3" /> System
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm font-medium text-brand-300 hover:text-white hover:bg-brand-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
         <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-earth-100">
             <h1 className="text-xl font-serif font-bold text-brand-900">
                 {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ') : 'Dashboard'}
             </h1>
             <button onClick={() => onNavigate(Page.HOME)} className="text-earth-600 hover:text-brand-600 font-medium text-sm flex items-center">
                 View Live Site <span className="ml-2 w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold">{currentUser.username[0].toUpperCase()}</span>
             </button>
         </div>

         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'home' && renderHomeTab()}
         {activeTab === 'about' && renderAboutTab()}
         {activeTab === 'services' && renderServicesTab()}
         {activeTab === 'blog' && renderBlogTab()}
         {activeTab === 'knowledge' && renderKnowledgeTab()}
         {activeTab === 'contact' && renderContactTab()}
         {activeTab === 'users' && renderUsersTab()}
         {activeTab === 'soil-lab' && renderSoilLabTab()}
         {activeTab === 'marketing' && renderMarketingTab()}
         {activeTab === 'settings' && renderSettingsTab()}
      </main>
    </div>
  );
};
