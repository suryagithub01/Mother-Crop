import React from 'react';
import { Page } from '../types';
import { useData } from '../store';
import { ArrowRight, Leaf, Truck, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { data } = useData();
  const { home } = data;

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'Leaf': return <Leaf className="h-8 w-8 text-brand-500" />;
      case 'Truck': return <Truck className="h-8 w-8 text-brand-500" />;
      case 'Users': return <Users className="h-8 w-8 text-brand-500" />;
      default: return <Leaf className="h-8 w-8 text-brand-500" />;
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={home.heroImage} 
            alt="Farm landscape" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {home.heroTitle}
          </h1>
          <p className="text-xl text-brand-50 mb-8 max-w-2xl drop-shadow-md">
            {home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate(Page.SERVICES)}
              className="px-8 py-4 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 transition-all flex items-center justify-center shadow-lg hover:shadow-brand-500/20"
            >
              Shop Produce <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => onNavigate(Page.ABOUT)}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-md font-medium hover:bg-white/20 transition-all"
            >
              Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mt-2">{home.whyChooseUsTitle}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {home.features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-earth-100 hover:shadow-md transition-shadow">
                <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {getIcon(feature.iconName)}
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-3">{feature.title}</h3>
                <p className="text-earth-800 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products/Image Split */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-100 rounded-full z-0"></div>
              <img 
                src={home.featuredSection.imageUrl} 
                alt="Farmer holding vegetables" 
                className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[500px]"
              />
              <div className="absolute bottom-8 right-8 z-20 bg-white p-6 rounded-lg shadow-lg max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-yellow-100 p-2 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-brand-900">Award Winning</p>
                    <p className="text-xs text-earth-500">Best Organic Farm 2023</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-6 whitespace-pre-line">
                {home.featuredSection.title}
              </h2>
              <p className="text-earth-800 mb-6 text-lg">
                {home.featuredSection.description}
              </p>
              <ul className="space-y-4 mb-8">
                {home.featuredSection.bullets.map((item, i) => (
                  <li key={i} className="flex items-center text-brand-800 font-medium">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onNavigate(Page.BLOG)}
                className="text-brand-600 font-semibold hover:text-brand-700 flex items-center group"
              >
                Read our philosophy <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};