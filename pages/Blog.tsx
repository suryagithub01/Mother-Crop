import React, { useState } from 'react';
import { useData } from '../store';
import { Calendar, User, X, Clock } from 'lucide-react';
import { BlogPost } from '../types';

export const Blog: React.FC = () => {
  const { data } = useData();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Filter only published posts for the public view
  const publishedPosts = data.blog.filter(post => post.status === 'published');

  return (
    <div className="bg-earth-50 min-h-screen pb-20 relative">
      {/* Blog Listing */}
      <div className="bg-brand-900 py-20 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">The Mothercrop Journal</h1>
          <p className="text-brand-100">Thoughts on farming, food, and the future.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-12 text-earth-500">No published posts yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {publishedPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-earth-100 group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/90 backdrop-blur text-brand-700 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-brand-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-earth-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-earth-500 border-t border-earth-100 pt-4 mt-auto">
                    <div className="flex items-center mr-4">
                      <User className="h-3 w-3 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {post.date}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {publishedPosts.length > 0 && (
          <div className="mt-16 text-center">
            <button className="px-8 py-3 bg-white border-2 border-brand-200 text-brand-700 font-semibold rounded-md hover:bg-brand-50 transition-colors">
              Load More Articles
            </button>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="min-h-screen px-4 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSelectedPost(null)}
            ></div>

            {/* Modal Content */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white text-brand-900 rounded-full transition-all backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header Image */}
              <div className="h-64 sm:h-96 w-full relative">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                  <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold uppercase tracking-wide rounded-full mb-3 inline-block">
                    {selectedPost.category}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4 leading-tight shadow-black drop-shadow-lg">
                    {selectedPost.title}
                  </h1>
                  <div className="flex items-center text-sm font-medium text-brand-100 space-x-6">
                    <span className="flex items-center"><User className="w-4 h-4 mr-2" /> {selectedPost.author}</span>
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {selectedPost.date}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5 min read</span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-8 sm:p-12 bg-white">
                <div className="prose prose-lg prose-green mx-auto text-earth-800 leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </div>
                
                {/* Keywords/Tags */}
                {selectedPost.seo.keywords && (
                   <div className="mt-12 pt-8 border-t border-earth-100 flex flex-wrap gap-2">
                      {selectedPost.seo.keywords.split(',').map((tag, i) => (
                        <span key={i} className="text-xs text-earth-500 bg-earth-100 px-3 py-1 rounded-full">
                          #{tag.trim()}
                        </span>
                      ))}
                   </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-earth-50 p-6 flex justify-between items-center border-t border-earth-100">
                <p className="text-sm text-earth-500">Share this article</p>
                <div className="flex gap-2">
                   {/* Dummy Social Buttons */}
                   <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs cursor-pointer">FB</div>
                   <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs cursor-pointer">TW</div>
                   <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs cursor-pointer">IG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};