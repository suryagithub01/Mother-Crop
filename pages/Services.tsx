import React, { useState } from 'react';
import { ShoppingBasket, Sprout, GraduationCap, CheckCircle, Leaf, Truck, X, ArrowRight } from 'lucide-react';
import { useData } from '../store';
import { Service, Page } from '../types';

interface ServicesProps {
  onNavigate: (page: Page) => void;
}

export const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const { data } = useData();
  const { servicesPage } = data;
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'ShoppingBasket': return <ShoppingBasket className="w-10 h-10 text-white" />;
      case 'Sprout': return <Sprout className="w-10 h-10 text-white" />;
      case 'GraduationCap': return <GraduationCap className="w-10 h-10 text-white" />;
      case 'Leaf': return <Leaf className="w-10 h-10 text-white" />;
      case 'Truck': return <Truck className="w-10 h-10 text-white" />;
      default: return <Sprout className="w-10 h-10 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-earth-100 relative">
      <div className="bg-brand-800 py-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">{servicesPage.heroTitle}</h1>
          <p className="text-brand-100 max-w-2xl mx-auto">{servicesPage.intro}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesPage.items.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="bg-brand-600 p-8 flex justify-center items-center">
                <div className="bg-brand-500/30 p-4 rounded-full">
                  {getIcon(service.iconName)}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-brand-900 mb-4">{service.title}</h3>
                <p className="text-earth-600 mb-6 flex-1">{service.description}</p>
                <div className="border-t border-earth-100 pt-6 flex justify-between items-center">
                  <span className="text-xl font-bold text-brand-700">{service.price}</span>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="px-4 py-2 bg-earth-100 text-brand-800 rounded-md font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Features */}
      <section className="bg-white py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="md:w-1/2">
               <img 
                 src={servicesPage.csa.imageUrl} 
                 alt="Vegetable box" 
                 className="rounded-lg shadow-xl"
               />
             </div>
             <div className="md:w-1/2">
               <h2 className="text-3xl font-serif font-bold text-brand-900 mb-6">{servicesPage.csa.title}</h2>
               <p className="text-earth-800 mb-6">
                 {servicesPage.csa.description}
               </p>
               <div className="space-y-4">
                 {servicesPage.csa.features.map((item, i) => (
                   <div key={i} className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-brand-500 mr-3 flex-shrink-0" />
                     <span className="text-earth-700">{item}</span>
                   </div>
                 ))}
               </div>
               <button 
                onClick={() => onNavigate(Page.CONTACT)}
                className="mt-8 px-8 py-3 bg-brand-600 text-white rounded-md font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 flex items-center"
               >
                 Join Membership <ArrowRight className="ml-2 w-4 h-4" />
               </button>
             </div>
           </div>
         </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
           <div className="min-h-screen px-4 flex items-center justify-center text-center">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setSelectedService(null)}
              ></div>

              {/* Modal Content */}
              <div className="inline-block w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden text-left align-middle transition-all transform relative">
                 <button 
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-earth-500 hover:text-earth-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="bg-brand-600 p-8 flex flex-col items-center justify-center text-white">
                   <div className="bg-white/20 p-4 rounded-full mb-4">
                      {getIcon(selectedService.iconName)}
                   </div>
                   <h2 className="text-3xl font-serif font-bold text-center">{selectedService.title}</h2>
                   <p className="mt-2 text-brand-100 font-medium">{selectedService.price}</p>
                </div>
                
                <div className="p-8">
                   <div className="prose prose-earth prose-lg max-w-none text-earth-800 whitespace-pre-line leading-relaxed">
                     {selectedService.details || selectedService.description}
                   </div>

                   <div className="mt-8 pt-8 border-t border-earth-100 flex justify-center">
                      <button 
                        onClick={() => {
                          setSelectedService(null);
                          onNavigate(Page.CONTACT);
                        }}
                        className="px-8 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-md"
                      >
                        Inquire Now
                      </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};