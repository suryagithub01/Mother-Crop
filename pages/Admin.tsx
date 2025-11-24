import React, { useState } from 'react';
import { useData } from '../store';
import { Page, Service, BlogPost, TeamMember } from '../types';
import { Save, RefreshCw, Plus, Trash2, Layout, Users, BookOpen, Phone, Briefcase, Lock, User, Eye, ChevronDown, ChevronUp, ChevronLeft, Globe, Search } from 'lucide-react';

interface AdminProps {
  onNavigate: (page: Page) => void;
}

type Tab = 'home' | 'about' | 'services' | 'blog' | 'contact';

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
  const { data, updateData, resetData } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Blog State
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials (Try admin/admin)');
    }
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now(),
      title: "New Service",
      description: "Description of the new service...",
      details: "Detailed description goes here...",
      price: "$0.00",
      iconName: "Sprout"
    };
    updateData({ servicesPage: { ...data.servicesPage, items: [...data.servicesPage.items, newService] } });
  };

  const deleteService = (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      updateData({ servicesPage: { ...data.servicesPage, items: data.servicesPage.items.filter(s => s.id !== id) } });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-800">
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
                <User className="absolute left-3 top-3 h-5 w-5 text-earth-400 group-focus-within:text-brand-500 transition-colors" />
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
                Demo Credentials: <span className="font-mono bg-earth-100 px-1 rounded">admin</span> / <span className="font-mono bg-earth-100 px-1 rounded">admin</span>
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

  // --- Helpers ---
  // AccordionSection moved to module scope

  // --- Blog Logic ---
  const startEditingPost = (post: BlogPost) => {
    setEditingPostId(post.id);
  };

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: Date.now(),
      title: "Untitled Post",
      slug: "untitled-post",
      excerpt: "Write a short summary...",
      content: "Write your article content here...",
      date: new Date().toLocaleDateString(),
      author: "Admin",
      category: "Uncategorized",
      imageUrl: "https://picsum.photos/800/600",
      status: 'draft',
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: ""
      }
    };
    updateData({ blog: [newPost, ...data.blog] });
    setEditingPostId(newPost.id);
  };

  const deletePost = (id: number) => {
    if(confirm("Are you sure you want to delete this post?")) {
      updateData({ blog: data.blog.filter(b => b.id !== id) });
      if (editingPostId === id) setEditingPostId(null);
    }
  };

  // --- Render Functions for Editors ---

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
                  <th className="px-6 py-3 text-xs font-bold text-earth-500 uppercase">Date</th>
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
                    <td className="px-6 py-4 text-earth-600 text-sm">{post.date}</td>
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
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${post.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
              >
                {post.status === 'published' ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <label className="block text-sm font-bold text-earth-700 mb-2">Post Title</label>
                <input 
                  value={post.title}
                  onChange={(e) => updatePost('title', e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-serif font-bold text-brand-900 placeholder-earth-300"
                  placeholder="Enter a catchy headline..."
                />
                
                <div className="mt-6">
                  <label className="block text-sm font-bold text-earth-700 mb-2">Full Content (Body)</label>
                  <div className="relative">
                    <textarea 
                      value={post.content}
                      onChange={(e) => updatePost('content', e.target.value)}
                      rows={15}
                      className="w-full p-4 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed text-earth-800 font-mono text-sm"
                      placeholder="Write your article here..."
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-earth-400">Markdown supported</div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-earth-700 mb-2">Short Excerpt</label>
                  <textarea 
                    value={post.excerpt}
                    onChange={(e) => updatePost('excerpt', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Brief summary for the blog list..."
                  />
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                <div className="flex items-center mb-4 text-brand-700">
                  <Globe className="w-5 h-5 mr-2" />
                  <h3 className="font-bold text-lg">Search Engine Optimization</h3>
                </div>
                
                {/* Google Preview */}
                <div className="bg-earth-50 p-4 rounded-lg mb-6 border border-earth-200">
                  <label className="block text-xs font-bold text-earth-500 uppercase mb-2">Google Search Preview</label>
                  <div className="bg-white p-4 rounded shadow-sm max-w-xl">
                     <div className="flex items-center text-xs text-earth-600 mb-1">
                       <div className="bg-earth-200 rounded-full w-4 h-4 mr-2"></div>
                       <span>mothercrop.com › blog › {post.slug || 'url'}</span>
                     </div>
                     <div className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate">
                       {post.seo.metaTitle || post.title}
                     </div>
                     <div className="text-sm text-earth-700 mt-1 line-clamp-2">
                       {post.seo.metaDescription || post.excerpt}
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">SEO Title Tag</label>
                    <input 
                      value={post.seo.metaTitle}
                      onChange={(e) => updateSEO('metaTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Ideally 50-60 characters"
                    />
                    <div className="text-right text-xs text-earth-400 mt-1">{post.seo.metaTitle?.length || 0}/60</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">URL Slug</label>
                    <div className="flex items-center">
                       <span className="text-earth-500 bg-earth-50 border border-r-0 border-earth-300 rounded-l-lg px-3 py-2 text-sm">/blog/</span>
                       <input 
                        value={post.slug}
                        onChange={(e) => updatePost('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="flex-1 px-4 py-2 border border-earth-300 rounded-r-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">Meta Description</label>
                    <textarea 
                      value={post.seo.metaDescription}
                      onChange={(e) => updateSEO('metaDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Ideally 150-160 characters"
                    />
                    <div className="text-right text-xs text-earth-400 mt-1">{post.seo.metaDescription?.length || 0}/160</div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-earth-700 mb-1">Keywords (Comma separated)</label>
                    <input 
                      value={post.seo.keywords}
                      onChange={(e) => updateSEO('keywords', e.target.value)}
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="organic, farming, soil..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Meta Column */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-200">
                <h3 className="font-bold text-brand-900 mb-4">Publishing Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Author</label>
                    <input 
                      value={post.author}
                      onChange={(e) => updatePost('author', e.target.value)}
                      className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Category</label>
                    <input 
                      value={post.category}
                      onChange={(e) => updatePost('category', e.target.value)}
                      className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Publish Date</label>
                    <input 
                      value={post.date}
                      onChange={(e) => updatePost('date', e.target.value)}
                      className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-earth-200">
                <h3 className="font-bold text-brand-900 mb-4">Featured Image</h3>
                <div className="space-y-3">
                  <div className="aspect-video bg-earth-100 rounded-lg overflow-hidden border border-earth-200">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400 text-sm">No Image</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Image URL</label>
                    <input 
                      value={post.imageUrl}
                      onChange={(e) => updatePost('imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };


  // --- Helper to render Home Editor ---
  const renderHomeEditor = () => {
    return (
      <div className="space-y-6">
        <AccordionSection title="Hero Section" defaultOpen>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-bold text-earth-700 mb-2">Headline</label>
              <input 
                value={data.home.heroTitle} 
                onChange={(e) => updateData({ home: { ...data.home, heroTitle: e.target.value } })}
                className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-earth-700 mb-2">Subtitle</label>
              <textarea 
                rows={3}
                value={data.home.heroSubtitle} 
                onChange={(e) => updateData({ home: { ...data.home, heroSubtitle: e.target.value } })}
                className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-earth-700 mb-2">Hero Image</label>
              <input 
                value={data.home.heroImage} 
                onChange={(e) => updateData({ home: { ...data.home, heroImage: e.target.value } })}
                className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-earth-600"
              />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Feature Highlights">
            <div className="mb-4">
              <label className="block text-sm font-bold text-earth-700 mb-2">Section Title</label>
              <input 
                value={data.home.whyChooseUsTitle}
                onChange={(e) => updateData({ home: { ...data.home, whyChooseUsTitle: e.target.value } })}
                className="w-full px-4 py-2 border border-earth-300 rounded-lg"
              />
            </div>
            <div className="space-y-4">
              {data.home.features.map((feature, idx) => (
                <div key={idx} className="p-4 bg-earth-50 rounded-lg border border-earth-200 flex gap-4">
                  <div className="flex-1">
                    <input 
                       value={feature.title}
                       onChange={(e) => {
                         const newFeatures = [...data.home.features];
                         newFeatures[idx].title = e.target.value;
                         updateData({ home: { ...data.home, features: newFeatures } });
                       }}
                       className="w-full p-2 mb-2 border border-earth-200 rounded font-bold text-sm"
                       placeholder="Feature Title"
                    />
                    <textarea 
                       value={feature.desc}
                       rows={2}
                       onChange={(e) => {
                         const newFeatures = [...data.home.features];
                         newFeatures[idx].desc = e.target.value;
                         updateData({ home: { ...data.home, features: newFeatures } });
                       }}
                       className="w-full p-2 border border-earth-200 rounded text-sm"
                       placeholder="Feature Description"
                    />
                  </div>
                </div>
              ))}
            </div>
        </AccordionSection>

        <AccordionSection title="Featured Bottom Section">
           <div className="grid gap-4">
              <div>
                 <label className="block text-sm font-bold text-earth-700 mb-1">Title</label>
                 <input 
                    value={data.home.featuredSection.title}
                    onChange={(e) => updateData({ home: { ...data.home, featuredSection: { ...data.home.featuredSection, title: e.target.value } } })}
                    className="w-full px-4 py-2 border border-earth-300 rounded-lg"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-earth-700 mb-1">Content</label>
                 <textarea 
                    rows={4}
                    value={data.home.featuredSection.description}
                    onChange={(e) => updateData({ home: { ...data.home, featuredSection: { ...data.home.featuredSection, description: e.target.value } } })}
                    className="w-full px-4 py-2 border border-earth-300 rounded-lg"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-earth-700 mb-1">Bullets (Line separated)</label>
                 <textarea 
                    rows={4}
                    value={data.home.featuredSection.bullets.join('\n')}
                    onChange={(e) => updateData({ home: { ...data.home, featuredSection: { ...data.home.featuredSection, bullets: e.target.value.split('\n') } } })}
                    className="w-full px-4 py-2 border border-earth-300 rounded-lg font-mono text-sm"
                 />
              </div>
           </div>
        </AccordionSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
           <div className="bg-brand-700 p-2 rounded-lg">
             <Layout className="w-5 h-5 text-brand-100" />
           </div>
           <div>
             <h1 className="text-lg font-bold font-serif leading-none">Mothercrop</h1>
             <span className="text-xs text-brand-300 uppercase tracking-widest">Admin Dashboard</span>
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { if(confirm('Reset all data to default? This cannot be undone.')) resetData(); }}
            className="flex items-center text-xs bg-red-900/30 hover:bg-red-800 text-red-100 px-3 py-2 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-2" /> Reset Defaults
          </button>
          <div className="h-6 w-px bg-brand-700 mx-2"></div>
          <button 
            onClick={() => onNavigate(Page.HOME)}
            className="bg-brand-100 text-brand-900 hover:bg-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" /> View Site
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-earth-200 overflow-y-auto flex flex-col">
          <div className="p-6">
            <h3 className="text-xs font-bold text-earth-400 uppercase tracking-wider mb-4">Content Manager</h3>
            <nav className="space-y-1">
              {[
                { id: 'home', label: 'Home Page', icon: Layout },
                { id: 'about', label: 'About Us', icon: Users },
                { id: 'services', label: 'Services', icon: Briefcase },
                { id: 'blog', label: 'Blog & SEO', icon: BookOpen },
                { id: 'contact', label: 'Contact Info', icon: Phone },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setEditingPostId(null);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-brand-50 text-brand-700 font-bold shadow-sm ring-1 ring-brand-100' 
                      : 'text-earth-600 hover:bg-earth-50 hover:text-brand-600'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-500' : 'text-earth-400'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-earth-100">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">A</div>
               <div>
                 <p className="text-sm font-bold text-earth-800">Administrator</p>
                 <button onClick={() => setIsAuthenticated(false)} className="text-xs text-earth-500 hover:text-brand-600">Log Out</button>
               </div>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-earth-50 p-8">
          <div className="max-w-5xl mx-auto">
             {/* Header for current section */}
             <div className="mb-8">
               <h2 className="text-2xl font-serif font-bold text-brand-900 capitalize flex items-center">
                 {activeTab === 'blog' && editingPostId ? '' : `Manage ${activeTab}`}
               </h2>
               <p className="text-earth-500 text-sm">
                 {activeTab === 'home' && 'Edit the landing page hero, features, and call-to-actions.'}
                 {activeTab === 'about' && 'Update company history, stats, and team members.'}
                 {activeTab === 'services' && 'Manage service offerings and CSA details.'}
                 {activeTab === 'blog' && !editingPostId && 'Create, edit, and optimize your blog posts for search engines.'}
                 {activeTab === 'contact' && 'Update your business location and contact details.'}
               </p>
             </div>

             {/* Dynamic Content */}
             {activeTab === 'home' && renderHomeEditor()}
             {activeTab === 'blog' && renderBlogEditor()}
             
             {/* Simplified views for other tabs for brevity, using the same pattern */}
             {activeTab === 'about' && (
                <div className="space-y-6">
                  <AccordionSection title="Hero & Intro" defaultOpen>
                    <div className="grid gap-4">
                      <div><label className="block text-sm font-bold text-earth-700 mb-1">Title</label><input className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.about.heroTitle} onChange={(e) => updateData({ about: { ...data.about, heroTitle: e.target.value } })} /></div>
                      <div><label className="block text-sm font-bold text-earth-700 mb-1">Intro</label><textarea className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.about.intro} onChange={(e) => updateData({ about: { ...data.about, intro: e.target.value } })} /></div>
                    </div>
                  </AccordionSection>
                  <AccordionSection title="Our Story">
                     <textarea rows={10} className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.about.story} onChange={(e) => updateData({ about: { ...data.about, story: e.target.value } })} />
                  </AccordionSection>
                  <AccordionSection title="Team Members">
                     <div className="space-y-4">
                       {data.about.team.map((member, i) => (
                         <div key={member.id} className="p-4 border border-earth-200 rounded bg-earth-50">
                            <input className="font-bold w-full bg-transparent mb-2 border-b border-transparent focus:border-brand-500 outline-none" value={member.name} onChange={(e) => {
                              const newTeam = [...data.about.team]; newTeam[i].name = e.target.value; updateData({ about: { ...data.about, team: newTeam } });
                            }} />
                            <input className="text-sm w-full bg-transparent text-earth-600 border-b border-transparent focus:border-brand-500 outline-none" value={member.role} onChange={(e) => {
                              const newTeam = [...data.about.team]; newTeam[i].role = e.target.value; updateData({ about: { ...data.about, team: newTeam } });
                            }} />
                         </div>
                       ))}
                     </div>
                  </AccordionSection>
                </div>
             )}

             {activeTab === 'services' && (
               <div className="space-y-6">
                 <AccordionSection title="Service Items" defaultOpen>
                    <div className="flex justify-end mb-4">
                      <button onClick={addService} className="text-sm bg-brand-600 text-white px-3 py-2 rounded flex items-center hover:bg-brand-700 transition-colors">
                        <Plus className="w-4 h-4 mr-1" /> Add Service
                      </button>
                    </div>
                    <div className="grid gap-4">
                       {data.servicesPage.items.map((service, i) => (
                         <div key={service.id} className="bg-white p-4 rounded border border-earth-200 shadow-sm relative group">
                           <button onClick={() => deleteService(service.id)} className="absolute top-2 right-2 text-earth-300 hover:text-red-500 p-1">
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <div className="flex justify-between mb-2 pr-8">
                             <input className="font-bold text-brand-900 border-b border-transparent focus:border-brand-500 outline-none w-1/2" value={service.title} onChange={(e) => {
                               const items = [...data.servicesPage.items]; items[i].title = e.target.value; updateData({ servicesPage: { ...data.servicesPage, items } });
                             }} placeholder="Service Title" />
                             <input className="text-right font-mono text-brand-600 border-b border-transparent focus:border-brand-500 outline-none w-1/3" value={service.price} onChange={(e) => {
                               const items = [...data.servicesPage.items]; items[i].price = e.target.value; updateData({ servicesPage: { ...data.servicesPage, items } });
                             }} placeholder="Price" />
                           </div>
                           <div className="space-y-2">
                             <textarea className="w-full text-sm text-earth-600 border border-transparent focus:border-earth-300 rounded p-1" rows={2} value={service.description} onChange={(e) => {
                                 const items = [...data.servicesPage.items]; items[i].description = e.target.value; updateData({ servicesPage: { ...data.servicesPage, items } });
                             }} placeholder="Short Summary (visible on card)" />
                             
                             <div className="pt-2 border-t border-earth-100">
                               <label className="text-xs text-earth-400 font-bold uppercase">Full Detail View</label>
                               <textarea className="w-full text-sm text-earth-800 border border-transparent focus:border-earth-300 rounded p-1" rows={3} value={service.details || ''} onChange={(e) => {
                                   const items = [...data.servicesPage.items]; items[i].details = e.target.value; updateData({ servicesPage: { ...data.servicesPage, items } });
                               }} placeholder="Long description shown in popup..." />
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                 </AccordionSection>
                 <AccordionSection title="CSA Section">
                   <div className="grid gap-4">
                      <input className="w-full px-4 py-2 border border-earth-300 rounded-lg font-bold" value={data.servicesPage.csa.title} onChange={(e) => updateData({ servicesPage: { ...data.servicesPage, csa: { ...data.servicesPage.csa, title: e.target.value } } })} />
                      <textarea rows={4} className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.servicesPage.csa.description} onChange={(e) => updateData({ servicesPage: { ...data.servicesPage, csa: { ...data.servicesPage.csa, description: e.target.value } } })} />
                   </div>
                 </AccordionSection>
               </div>
             )}

             {activeTab === 'contact' && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
                  <div className="grid gap-6">
                    <div><label className="block text-sm font-bold text-earth-700 mb-1">Email</label><input className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.contact.email} onChange={(e) => updateData({ contact: { ...data.contact, email: e.target.value } })} /></div>
                    <div><label className="block text-sm font-bold text-earth-700 mb-1">Phone</label><input className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.contact.phone} onChange={(e) => updateData({ contact: { ...data.contact, phone: e.target.value } })} /></div>
                    <div><label className="block text-sm font-bold text-earth-700 mb-1">Address</label><input className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.contact.address} onChange={(e) => updateData({ contact: { ...data.contact, address: e.target.value } })} /></div>
                    <div><label className="block text-sm font-bold text-earth-700 mb-1">City/State</label><input className="w-full px-4 py-2 border border-earth-300 rounded-lg" value={data.contact.city} onChange={(e) => updateData({ contact: { ...data.contact, city: e.target.value } })} /></div>
                    
                    <div className="pt-4 border-t border-earth-100">
                      <label className="block text-sm font-bold text-earth-700 mb-1">Google Maps Embed URL</label>
                      <input className="w-full px-4 py-2 border border-earth-300 rounded-lg text-sm" value={data.contact.mapUrl} onChange={(e) => updateData({ contact: { ...data.contact, mapUrl: e.target.value } })} />
                      <p className="text-xs text-earth-500 mt-1">Go to Google Maps -&gt; Share -&gt; Embed a map -&gt; Copy HTML -&gt; Extract the "src" URL only.</p>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
};