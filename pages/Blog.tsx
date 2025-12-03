
import React, { useState, useEffect } from 'react';
import { useData } from '../store';
import { Calendar, User, X, Clock, ArrowRight, Share2, Tag, ChevronLeft, Facebook, Twitter, Linkedin } from 'lucide-react';
import { BlogPost } from '../types';
import { SEO } from '../components/Layout';

export const Blog: React.FC = () => {
  const { data } = useData();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Scroll to top when opening a post
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPost]);

  // Filter only published posts
  const publishedPosts = data.blog.filter(post => post.status === 'published');
  const featuredPost = publishedPosts[0];
  const remainingPosts = publishedPosts.slice(1);

  // Share functionality
  const sharePost = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    if (!selectedPost) return;
    
    // Construct real URLs (assuming website is deployed)
    // For local dev, we use window.location.origin
    const url = encodeURIComponent(`${window.location.origin}/blog/${selectedPost.slug}`);
    const title = encodeURIComponent(selectedPost.title);

    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // --- FULL POST VIEW (Page-like) ---
  if (selectedPost) {
    return (
      <div className="bg-white min-h-screen">
         {/* Dynamic SEO for Single Post */}
         <SEO 
            title={selectedPost.seo?.metaTitle || selectedPost.title} 
            description={selectedPost.seo?.metaDescription || selectedPost.excerpt} 
            image={selectedPost.imageUrl}
            type="article"
            schema={{
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": selectedPost.title,
                "image": [selectedPost.imageUrl],
                "datePublished": selectedPost.date,
                "author": {
                  "@type": "Person",
                  "name": selectedPost.author
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Mothercrop",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://mothercrop.com/logo.png"
                  }
                },
                "articleBody": selectedPost.content
            }}
          />

          <article className="animate-in fade-in duration-500">
             {/* Hero Image */}
             <div className="relative h-[60vh] w-full">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                
                {/* Back Button Overlay */}
                <div className="absolute top-8 left-4 md:left-8 z-20">
                    <button 
                      onClick={() => setSelectedPost(null)}
                      className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold flex items-center hover:bg-white/30 transition-all border border-white/30 text-sm"
                    >
                       <ChevronLeft className="w-4 h-4 mr-2" /> Back to Journal
                    </button>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16">
                   <div className="max-w-5xl mx-auto">
                      <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold uppercase tracking-wide rounded-full mb-6 inline-block shadow-lg">
                        {selectedPost.category}
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
                        {selectedPost.title}
                      </h1>
                      <div className="flex items-center text-sm font-medium text-white/90 space-x-6">
                        <span className="flex items-center"><User className="w-4 h-4 mr-2 opacity-80" /> {selectedPost.author}</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 opacity-80" /> {selectedPost.date}</span>
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-80" /> 5 min read</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Content Area */}
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="prose prose-lg prose-brand mx-auto text-earth-800 leading-relaxed whitespace-pre-line first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-brand-900 mb-16">
                  {selectedPost.content}
                </div>

                {/* Tags */}
                {selectedPost.seo.keywords && (
                   <div className="flex flex-wrap gap-2 justify-center mb-16 border-t border-earth-100 pt-8">
                      {selectedPost.seo.keywords.split(',').map((tag, i) => (
                        <span key={i} className="flex items-center text-xs font-bold text-brand-600 bg-brand-50 px-4 py-2 rounded-full border border-brand-100">
                          <Tag className="w-3 h-3 mr-2" />
                          {tag.trim()}
                        </span>
                      ))}
                   </div>
                )}

                {/* Share Section */}
                <div className="bg-earth-50 rounded-2xl p-8 text-center">
                   <h3 className="text-xl font-serif font-bold text-brand-900 mb-6 flex items-center justify-center">
                      <Share2 className="w-5 h-5 mr-2" /> Share this story
                   </h3>
                   <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => sharePost('facebook')}
                        className="flex items-center px-6 py-3 bg-[#1877F2] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                      >
                         <Facebook className="w-4 h-4 mr-2" /> Facebook
                      </button>
                      <button 
                        onClick={() => sharePost('twitter')}
                        className="flex items-center px-6 py-3 bg-[#1DA1F2] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                      >
                         <Twitter className="w-4 h-4 mr-2" /> Twitter
                      </button>
                      <button 
                        onClick={() => sharePost('linkedin')}
                        className="flex items-center px-6 py-3 bg-[#0A66C2] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                      >
                         <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                      </button>
                   </div>
                </div>
             </div>
          </article>
      </div>
    );
  }

  // --- LIST VIEW ---

  // Schema for the main blog page
  const listSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Mothercrop Journal",
      "description": "Stories from the field, recipes from the kitchen, and thoughts on the future of food.",
      "blogPost": publishedPosts.map(post => ({
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Person", "name": post.author },
          "datePublished": post.date
      }))
  };

  return (
    <div className="bg-white min-h-screen pb-20 relative animate-in fade-in">
      <SEO 
        title="The Mothercrop Journal - Organic Farming Blog" 
        description="Read the latest insights on sustainable agriculture, organic recipes, and farm life from Mothercrop." 
        schema={listSchema}
      />

      {/* Header */}
      <div className="bg-earth-50 pt-20 pb-16 border-b border-earth-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-600 font-bold uppercase tracking-widest text-xs mb-2 block">Our Publications</span>
          <h1 className="text-5xl font-serif font-bold text-brand-900 mb-6">The Journal</h1>
          <p className="text-xl text-earth-600 max-w-2xl mx-auto leading-relaxed">
            Stories from the field, recipes from the kitchen, and thoughts on the future of food.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-earth-100">
            <h3 className="text-lg font-bold text-earth-400">No articles published yet.</h3>
          </div>
        ) : (
          <>
            {/* Featured Post (Hero) */}
            {featuredPost && (
              <div 
                className="group relative bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-2 mb-16 border border-earth-100 hover:shadow-2xl transition-all duration-500"
                onClick={() => setSelectedPost(featuredPost)}
              >
                 <div className="relative h-96 lg:h-auto overflow-hidden">
                   <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                   <img 
                      src={featuredPost.imageUrl} 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                   />
                   <span className="absolute top-6 left-6 z-20 px-4 py-1.5 bg-brand-600 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
                      Featured
                   </span>
                 </div>
                 <div className="p-10 lg:p-16 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 text-sm text-earth-500 mb-6">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {featuredPost.date}</span>
                        <span className="flex items-center"><User className="w-4 h-4 mr-2" /> {featuredPost.author}</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-brand-900 mb-6 group-hover:text-brand-700 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-earth-600 text-lg mb-8 line-clamp-3 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center text-brand-600 font-bold group-hover:translate-x-2 transition-transform">
                       Read Full Article <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                 </div>
              </div>
            )}

            {/* Grid for Remaining Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {remainingPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-earth-100 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-white/90 backdrop-blur text-brand-700 text-xs font-bold uppercase tracking-wide rounded-md shadow-sm">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-xs text-earth-400 mb-3">{post.date}</div>
                    <h2 className="text-xl font-bold text-brand-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-earth-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-earth-500 border-t border-earth-100 pt-4 mt-auto">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 5 min
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
