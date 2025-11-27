
import React, { useState } from 'react';
import { useData } from '../store';
import { Page, Service, BlogPost, User, Role } from '../types';
import { 
  Plus, Trash2, Layout, Users, BookOpen, Phone, Briefcase, 
  Lock, User as UserIcon, ChevronDown, ChevronUp, ChevronLeft, 
  Globe, Save, BarChart3, MessageCircle, FlaskConical, LogOut,
  Shield
} from 'lucide-react';
import { SEO } from '../components/Layout';

interface AdminProps {
  onNavigate: (page: Page) => void;
}

type Tab = 'dashboard' | 'home' | 'about' | 'services' | 'blog' | 'contact' | 'users' | 'soil-lab';

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
  const { data, updateData, showNotification } = useData();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Blog State
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // User Management State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'editor' as Role });

  // Chat Viewer State
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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
    if (currentUser.role === 'manager') return tab !== 'users';
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

  // --- Blog Logic ---
  const startEditingPost = (post: BlogPost) => setEditingPostId(post.id);
  const createNewPost = () => {
    const newPost: BlogPost = {
      id: Date.now(),
      title: "Untitled Post",
      slug: "untitled-post",
      excerpt: "Summary...",
      content: "Content...",
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
                        <h3 className="text-earth-500 font-bold uppercase text-xs">Soil Analyses</h3>
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
                                        <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-brand-200' : 'text-earth-400'}`}>{msg.timestamp}</p>
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

  const renderSoilLabTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h3 className="text-xl font-bold text-brand-900">Soil Analysis History</h3>
             <p className="text-earth-600 text-sm">Recent automated tests performed by users.</p>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-brand-600">{data.soilLabHistory?.length || 0}</div>
             <div className="text-xs text-earth-500 uppercase font-bold">Total Tests</div>
           </div>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-earth-50 border-b border-earth-200">
               <tr>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Date</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Soil Type</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Score</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Issues Found</th>
                 <th className="px-4 py-3 text-xs font-bold text-earth-500 uppercase">Recommended</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-earth-100">
               {(data.soilLabHistory || []).map(record => (
                 <tr key={record.id} className="hover:bg-earth-50 transition-colors">
                   <td className="px-4 py-4 text-sm whitespace-nowrap text-earth-600">{record.date}</td>
                   <td className="px-4 py-4 text-sm font-medium text-brand-900">{record.type}</td>
                   <td className="px-4 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.score > 70 ? 'bg-green-100 text-green-700' : record.score > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                       {record.score}/100
                     </span>
                   </td>
                   <td className="px-4 py-4 text-sm text-earth-600 max-w-xs truncate">{record.issues.join(', ')}</td>
                   <td className="px-4 py-4 text-sm text-brand-600 font-medium max-w-xs truncate">{record.crops.join(', ')}</td>
                 </tr>
               ))}
               {(data.soilLabHistory || []).length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-earth-400">No soil analysis records found.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );

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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <label className="block text-sm font-bold text-earth-700 mb-2">Title</label>
                <input value={post.title} onChange={(e) => updatePost('title', e.target.value)} className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                <div className="mt-6">
                  <label className="block text-sm font-bold text-earth-700 mb-2">Content</label>
                  <textarea value={post.content} onChange={(e) => updatePost('content', e.target.value)} rows={15} className="w-full p-4 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm" />
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-bold text-earth-700 mb-2">Excerpt</label>
                  <textarea value={post.excerpt} onChange={(e) => updatePost('excerpt', e.target.value)} rows={3} className="w-full p-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <div className="flex items-center mb-4 text-brand-700"><Globe className="w-5 h-5 mr-2" /><h3 className="font-bold">SEO</h3></div>
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
                  <input value={post.seo.keywords} onChange={(e) => updateSEO('keywords', e.target.value)} className="w-full px-4 py-2 border border-earth-300 rounded-lg" placeholder="Keywords" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-200">
                <h3 className="font-bold text-brand-900 mb-4">Meta</h3>
                <div className="space-y-4">
                  <input value={post.author} onChange={(e) => updatePost('author', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded-lg" placeholder="Author" />
                  <input value={post.category} onChange={(e) => updatePost('category', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded-lg" placeholder="Category" />
                  <input value={post.date} onChange={(e) => updatePost('date', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded-lg" placeholder="Date" />
                  <input value={post.imageUrl} onChange={(e) => updatePost('imageUrl', e.target.value)} className="w-full px-3 py-2 border border-earth-300 rounded-lg" placeholder="Image URL" />
                </div>
              </div>
              
              <button onClick={() => { setEditingPostId(null); showNotification('Changes saved.', 'success'); }} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-md flex justify-center items-center">
                 <Save className="w-5 h-5 mr-2" /> Save & Exit
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
        <h3 className="font-bold text-brand-900 mb-4">Add New User</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Username</label>
            <input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Password</label>
            <input value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Role</label>
            <select 
              value={newUser.role} 
              onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})} 
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="editor">Editor</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={addUser} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700">Add</button>
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
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-earth-50">
                <td className="px-6 py-4 font-medium text-brand-900">{u.username}</td>
                <td className="px-6 py-4 capitalize text-earth-600">{u.role}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHomeTab = () => (
    <div>
       <AccordionSection title="Hero Section" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Main Title</label>
              <input value={data.home.heroTitle} onChange={(e) => updateHome('heroTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Subtitle</label>
              <textarea value={data.home.heroSubtitle} onChange={(e) => updateHome('heroSubtitle', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Hero Image URL</label>
               <input value={data.home.heroImage} onChange={(e) => updateHome('heroImage', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
       </AccordionSection>
       
       <AccordionSection title="Features Grid">
          {data.home.features.map((feat, i) => (
             <div key={i} className="mb-4 pb-4 border-b border-earth-100 last:border-0 last:pb-0">
               <label className="block text-xs font-bold text-brand-600 mb-1">Feature {i+1}</label>
               <input value={feat.title} onChange={(e) => updateHomeFeature(i, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="Title" />
               <textarea value={feat.desc} onChange={(e) => updateHomeFeature(i, 'desc', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Description" rows={2} />
             </div>
          ))}
       </AccordionSection>
    </div>
  );

  const renderAboutTab = () => (
    <div>
      <AccordionSection title="Hero & Story" defaultOpen>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Hero Title</label>
            <input value={data.about.heroTitle} onChange={(e) => updateAbout('heroTitle', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Story Content</label>
            <textarea value={data.about.story} onChange={(e) => updateAbout('story', e.target.value)} rows={8} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Team Members">
        <div className="space-y-6">
          {data.about.team.map(member => (
            <div key={member.id} className="bg-earth-50 p-4 rounded-lg border border-earth-100">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Name</label>
                   <input value={member.name} onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Role</label>
                   <input value={member.role} onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Bio</label>
                   <textarea value={member.bio} onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </AccordionSection>
    </div>
  );

  const renderServicesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-brand-900">Manage Services</h3>
        <button onClick={addService} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700">Add Service</button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {data.servicesPage.items.map(service => (
          <div key={service.id} className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <input value={service.title} onChange={(e) => updateService(service.id, 'title', e.target.value)} className="font-bold text-lg text-brand-900 border-none focus:ring-0 p-0 w-full" />
               <button onClick={() => deleteService(service.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
             </div>
             <div className="space-y-3">
               <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Short Description</label>
                  <textarea value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Full Details (Modal)</label>
                  <textarea value={service.details} onChange={(e) => updateService(service.id, 'details', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Price</label>
                  <input value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="bg-white p-6 rounded-xl border border-earth-200">
      <h3 className="font-bold text-brand-900 mb-6">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Address</label>
          <input value={data.contact.address} onChange={(e) => updateContact('address', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">City/State/Zip</label>
          <input value={data.contact.city} onChange={(e) => updateContact('city', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Email</label>
          <input value={data.contact.email} onChange={(e) => updateContact('email', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Phone</label>
          <input value={data.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="md:col-span-2">
           <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Google Maps Embed URL</label>
           <input value={data.contact.mapUrl} onChange={(e) => updateContact('mapUrl', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
    </div>
  );

  // --- Main Layout ---
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, role: ['admin', 'manager'] },
    { id: 'home', label: 'Home Page', icon: Layout, role: ['admin', 'manager'] },
    { id: 'about', label: 'About Us', icon: Users, role: ['admin', 'manager'] },
    { id: 'services', label: 'Services', icon: Briefcase, role: ['admin', 'manager'] },
    { id: 'soil-lab', label: 'Soil Lab History', icon: FlaskConical, role: ['admin', 'manager'] },
    { id: 'blog', label: 'Blog Manager', icon: BookOpen, role: ['admin', 'manager', 'editor'] },
    { id: 'contact', label: 'Contact Info', icon: Phone, role: ['admin', 'manager'] },
    { id: 'users', label: 'User Management', icon: Shield, role: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-earth-50 flex">
      <SEO title="Admin Dashboard - Mothercrop" description="Manage your website content." />
      
      {/* Sidebar */}
      <div className="w-64 bg-brand-900 text-brand-100 flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-brand-800">
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">Mothercrop</h2>
          <p className="text-xs text-brand-400 mt-1 uppercase tracking-wider font-bold">CMS Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.filter(item => item.role.includes(currentUser.role)).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-brand-700 text-white shadow-md' 
                    : 'hover:bg-brand-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-800 bg-brand-900">
           <div className="flex items-center mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold mr-3">
                 {currentUser.username[0].toUpperCase()}
              </div>
              <div>
                 <p className="text-sm font-bold text-white">{currentUser.username}</p>
                 <p className="text-xs text-brand-400 capitalize">{currentUser.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 bg-brand-800 hover:bg-brand-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
             <LogOut className="w-4 h-4 mr-2" /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen p-8">
         <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-serif font-bold text-brand-900 capitalize">
                 {activeTab?.replace('-', ' ') || 'Dashboard'}
               </h1>
               {activeTab !== 'dashboard' && activeTab !== 'blog' && activeTab !== 'users' && activeTab !== 'soil-lab' && (
                 <button onClick={handleSave} className="flex items-center bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-md transition-all hover:-translate-y-0.5">
                   <Save className="w-4 h-4 mr-2" /> Save Changes
                 </button>
               )}
            </div>

            <div className="animate-in fade-in duration-500">
               {activeTab === 'dashboard' && hasPermission('dashboard') && renderDashboard()}
               {activeTab === 'home' && hasPermission('home') && renderHomeTab()}
               {activeTab === 'about' && hasPermission('about') && renderAboutTab()}
               {activeTab === 'services' && hasPermission('services') && renderServicesTab()}
               {activeTab === 'blog' && hasPermission('blog') && renderBlogEditor()}
               {activeTab === 'contact' && hasPermission('contact') && renderContactTab()}
               {activeTab === 'users' && hasPermission('users') && renderUsersTab()}
               {activeTab === 'soil-lab' && hasPermission('soil-lab') && renderSoilLabTab()}
            </div>
         </div>
      </div>
    </div>
  );
};