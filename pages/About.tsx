import React from 'react';
import { useData } from '../store';

export const About: React.FC = () => {
  const { data } = useData();
  const { about } = data;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{about.heroTitle}</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            {about.intro}
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-serif font-bold text-brand-900 mb-6">{about.storyTitle}</h2>
              <div className="space-y-4 text-earth-800 text-lg leading-relaxed whitespace-pre-line">
                {about.story}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sticky top-24">
              <img src="https://picsum.photos/id/106/400/500" alt="Farm dawn" className="rounded-lg shadow-lg w-full h-full object-cover mt-8" />
              <img src="https://picsum.photos/id/113/400/500" alt="Fresh herbs" className="rounded-lg shadow-lg w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-earth-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {about.stats.map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-brand-700 mb-2">{stat.value}</div>
                <div className="text-earth-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-brand-900">{about.teamTitle}</h2>
            <p className="text-earth-600 mt-4">The hands that nurture your food.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {about.team.map((member) => (
              <div key={member.id} className="group text-center">
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-brand-200 rounded-full transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand-900">{member.name}</h3>
                <p className="text-brand-600 font-medium mb-3">{member.role}</p>
                <p className="text-earth-600 text-sm max-w-xs mx-auto">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};