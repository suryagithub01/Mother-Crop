
import React, { useState } from 'react';
import { useData } from '../store';
import { PlayCircle, FileText, Download, Search, GraduationCap, ArrowRight } from 'lucide-react';
import { SEO } from '../components/Layout';

export const Knowledge: React.FC = () => {
  const { data } = useData();
  const [filter, setFilter] = useState<'all' | 'video' | 'guide' | 'pdf'>('all');
  const [search, setSearch] = useState('');

  const resources = data.knowledgeResources.filter(r => {
      const matchesType = filter === 'all' || r.type === filter;
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
  });

  return (
    <div className="bg-earth-50 min-h-screen">
      <SEO title="Knowledge Hub - Mothercrop" description="Educational resources for farmers and learners. Videos, guides, and downloads." />
      
      {/* Hero */}
      <div className="bg-brand-900 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
              <GraduationCap className="w-96 h-96 transform rotate-12 -mr-16 -mt-16" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Knowledge Hub</h1>
              <p className="text-xl text-brand-100 max-w-2xl">
                  Empowering farmers and learners with expert knowledge. 
                  Access our library of video tutorials, step-by-step guides, and downloadable farming templates.
              </p>
          </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-earth-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}
                  >
                      All Resources
                  </button>
                  <button 
                    onClick={() => setFilter('video')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center ${filter === 'video' ? 'bg-brand-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}
                  >
                      <PlayCircle className="w-4 h-4 mr-2" /> Videos
                  </button>
                  <button 
                    onClick={() => setFilter('guide')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center ${filter === 'guide' ? 'bg-brand-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}
                  >
                      <FileText className="w-4 h-4 mr-2" /> Guides
                  </button>
                  <button 
                    onClick={() => setFilter('pdf')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex items-center ${filter === 'pdf' ? 'bg-brand-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}
                  >
                      <Download className="w-4 h-4 mr-2" /> Downloads
                  </button>
              </div>

              <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-earth-400" />
                  <input 
                    type="text" 
                    placeholder="Search topics..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-earth-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
              </div>
          </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      <div className="relative h-48 bg-earth-200 group">
                          {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-brand-50">
                                  {item.type === 'video' && <PlayCircle className="w-16 h-16 text-brand-300" />}
                                  {item.type === 'guide' && <FileText className="w-16 h-16 text-brand-300" />}
                                  {item.type === 'pdf' && <Download className="w-16 h-16 text-brand-300" />}
                              </div>
                          )}
                          
                          <div className="absolute top-4 left-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                                  item.type === 'video' ? 'bg-red-500 text-white' :
                                  item.type === 'guide' ? 'bg-blue-500 text-white' :
                                  'bg-green-500 text-white'
                              }`}>
                                  {item.type === 'pdf' ? 'PDF' : item.type}
                              </span>
                          </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-brand-600 uppercase">{item.category}</span>
                             <span className="text-xs text-earth-400">{item.durationOrSize}</span>
                          </div>
                          <h3 className="text-xl font-bold text-brand-900 mb-3 line-clamp-2">{item.title}</h3>
                          <p className="text-earth-600 text-sm mb-6 flex-1 line-clamp-3">{item.description}</p>
                          
                          <button className="w-full py-3 rounded-lg font-bold border-2 border-brand-100 text-brand-700 hover:bg-brand-50 hover:border-brand-200 transition-colors flex items-center justify-center group">
                              {item.type === 'video' ? 'Watch Video' : item.type === 'guide' ? 'Read Guide' : 'Download File'}
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>

          {resources.length === 0 && (
              <div className="text-center py-20">
                  <p className="text-earth-500 text-lg">No resources found matching your criteria.</p>
              </div>
          )}
      </div>
    </div>
  );
};
