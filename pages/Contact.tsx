import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useData } from '../store';

export const Contact: React.FC = () => {
  const { data } = useData();
  const { contact } = data;
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for reaching out! We will get back to you shortly.");
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-brand-100">Have questions about our produce or CSA? We'd love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Visit the Farm</h2>
            <p className="text-earth-600 mb-8 leading-relaxed">
              We welcome visitors! {contact.hours}. Come see where your food grows!
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-brand-100 p-3 rounded-lg mr-4">
                  <MapPin className="h-6 w-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900">Our Location</h3>
                  <p className="text-earth-600">{contact.address}<br/>{contact.city}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-brand-100 p-3 rounded-lg mr-4">
                  <Mail className="h-6 w-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900">Email Us</h3>
                  <p className="text-earth-600">{contact.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-brand-100 p-3 rounded-lg mr-4">
                  <Phone className="h-6 w-6 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-900">Call Us</h3>
                  <p className="text-earth-600">{contact.phone}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-10 h-64 bg-earth-200 rounded-xl overflow-hidden relative">
              <img 
                src="https://picsum.photos/id/10/800/400" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/90 px-4 py-2 rounded-md shadow-md font-medium text-brand-900">
                  Interactive Map Loading...
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-earth-50 p-8 rounded-2xl border border-earth-100 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-earth-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-earth-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                    className="w-full px-4 py-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-earth-700 mb-1">Subject</label>
                <select
                  id="subject"
                  value={formState.subject}
                  onChange={(e) => setFormState({...formState, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow bg-white"
                >
                  <option value="">Select a topic...</option>
                  <option value="csa">CSA Membership</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                  <option value="event">Event/Workshop</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-earth-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                  className="w-full px-4 py-2 border border-earth-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 text-white font-bold rounded-md hover:bg-brand-700 transition-colors flex justify-center items-center"
              >
                Send Message <Send className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
