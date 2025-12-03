
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteData, ChatMessage, SoilAnalysisResult, SoilAnalysisRecord, Notification, Subscriber, KnowledgeResource, ContactMessage } from './types';

// Default Hardcoded Data (Initial State)
const defaultData: SiteData = {
  users: [
    { id: 1, username: 'admin', password: 'admin', role: 'admin' },
    { id: 2, username: 'manager', password: 'manager', role: 'manager' },
    { id: 3, username: 'editor', password: 'editor', role: 'editor' },
  ],
  trafficStats: {
    HOME: 120,
    ABOUT: 45,
    SERVICES: 67,
    BLOG: 89,
    CONTACT: 34,
    SOIL_ANALYSIS: 12,
    KNOWLEDGE: 55,
  },
  chatHistory: [
    {
      id: 'demo-1',
      date: '10/24/2023, 10:30 AM',
      preview: 'Do you sell organic pumpkins?',
      messages: [
        { role: 'user', text: 'Do you sell organic pumpkins?', timestamp: '10:30 AM' },
        { role: 'model', text: 'Yes, we have sugar pie pumpkins available in October!', timestamp: '10:30 AM' }
      ]
    }
  ],
  soilLabHistory: [],
  subscribers: [
    { id: 1, email: "john@example.com", date: "10/01/2023" },
    { id: 2, email: "sarah.v@localchef.com", date: "10/05/2023" }
  ],
  contactMessages: [
    { id: 1, name: "Alice Farm", email: "alice@farm.com", subject: "wholesale", message: "Interested in bulk carrots.", date: "10/20/2023" }
  ],
  testimonials: [
    {
      id: 1,
      name: "Emily R.",
      role: "CSA Member (3 years)",
      text: "The weekly veggie box has completely changed how my family eats. The carrots actually taste like carrots! Can't recommend Mothercrop enough.",
      rating: 5
    },
    {
      id: 2,
      name: "Chef Antonio",
      role: "Head Chef, The Green Fork",
      text: "As a chef, consistency and flavor are everything. Mothercrop delivers the highest quality organic produce in the valley, hands down.",
      rating: 5
    },
    {
      id: 3,
      name: "Mark Thompson",
      role: "Home Gardener",
      text: "Used their Soil Lab service and Garden Consulting. They saved my dying tomato patch. The AI analysis was spot on!",
      rating: 4
    }
  ],
  knowledgeResources: [
    {
        id: 1,
        title: "Composting 101: Turning Waste to Gold",
        type: "video",
        category: "Soil Health",
        description: "A 10-minute masterclass on creating the perfect compost pile ratio for your garden.",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        thumbnail: "https://picsum.photos/id/118/400/225",
        durationOrSize: "10:45"
    },
    {
        id: 2,
        title: "Crop Rotation Planner Sheet",
        type: "pdf",
        category: "Planning",
        description: "Downloadable template to track your 3-year crop rotation schedule.",
        url: "#",
        durationOrSize: "1.2 MB"
    },
    {
        id: 3,
        title: "Identifying Common Garden Pests",
        type: "guide",
        category: "Pest Control",
        description: "Visual guide to aphids, hornworms, and beetles with organic solutions.",
        url: "#",
        thumbnail: "https://picsum.photos/id/139/400/225",
        durationOrSize: "5 min read"
    }
  ],
  home: {
    heroTitle: "Cultivating Nature's Purest Potential",
    heroSubtitle: "Mothercrop connects you directly to the earth. 100% organic, sustainable, and delivered from our soil to your doorstep within 24 hours.",
    heroImage: "https://picsum.photos/id/429/1920/1080",
    features: [
      {
        title: "100% Certified Organic",
        desc: "No synthetic pesticides or fertilizers. Just pure, nutrient-rich soil and natural growing methods.",
        iconName: "Leaf"
      },
      {
        title: "Farm to Table",
        desc: "Harvested at sunrise, delivered by sunset. We minimize travel time to maximize freshness and nutrition.",
        iconName: "Truck"
      },
      {
        title: "Community Focused",
        desc: "We support local farmers and educate the community on sustainable agriculture practices.",
        iconName: "Users"
      }
    ],
    whyChooseUsTitle: "The Mothercrop Standard",
    featuredSection: {
      title: "Nourishing the Soil, Feeding the Soul.",
      description: "At Mothercrop, we believe that healthy food starts with healthy soil. Our regenerative farming techniques capture carbon, increase biodiversity, and result in produce that tastes the way nature intended.",
      imageUrl: "https://picsum.photos/id/292/800/800",
      bullets: [
        "Regenerative Agriculture",
        "Zero Chemical Runoff",
        "Heirloom Varieties",
        "Water Conservation"
      ]
    }
  },
  about: {
    heroTitle: "Our Roots",
    intro: "Founded on a Promise",
    storyTitle: "Our Story",
    story: "Mothercrop began in 2010 on a small 5-acre plot in the valley. Our founder, tired of flavorless, chemically-treated produce found in supermarkets, decided to take matters into his own hands.\n\nWhat started as a family garden has grown into a community-supported agriculture (CSA) network feeding over 1,000 families weekly. We haven't changed our methods—just our scale.\n\nWe believe that organic isn't just a label; it's a commitment to the ecosystem. We farm without shortcuts, respecting the seasons and the soil.",
    stats: [
      { label: "Acres Farmed", value: "150+" },
      { label: "Families Fed", value: "1,200" },
      { label: "Team Members", value: "45" },
      { label: "Years Growing", value: "14" }
    ],
    teamTitle: "Meet the Growers",
    team: [
      {
        id: 1,
        name: "Sarah Jenkins",
        role: "Head Farmer",
        bio: "With 20 years of agronomy experience, Sarah leads our field operations with a passion for regenerative soil health.",
        imageUrl: "https://picsum.photos/id/64/400/400"
      },
      {
        id: 2,
        name: "David Chen",
        role: "Sustainability Director",
        bio: "David ensures every step of our process, from seed to delivery, minimizes our carbon footprint.",
        imageUrl: "https://picsum.photos/id/91/400/400"
      },
      {
        id: 3,
        name: "Maria Rodriguez",
        role: "Community Outreach",
        bio: "Maria connects Mothercrop with local schools and food banks to ensure fresh food is accessible to all.",
        imageUrl: "https://picsum.photos/id/338/400/400"
      }
    ]
  },
  servicesPage: {
    heroTitle: "Our Services",
    intro: "Beyond just produce, we offer a connection to the land.",
    items: [
      {
        id: 1,
        title: "Weekly Veggie Box",
        description: "A curated selection of the week's freshest harvest delivered to your door. Includes 8-10 varieties of seasonal vegetables and herbs.",
        details: "Our signature Veggie Box is the easiest way to eat seasonally. Every week, our farmers hand-select the peak harvest.\n\nWhat's typically inside:\n- Leafy Greens (Kale, Spinach, Chard)\n- Root Vegetables (Carrots, Beets, Radishes)\n- Seasonal Fruit (Strawberries, Tomatoes, Apples)\n- Fresh Herbs\n\nAll produce is harvested within 24 hours of delivery to ensure maximum nutrient density and flavor.",
        iconName: "ShoppingBasket",
        price: "$35 / week"
      },
      {
        id: 2,
        title: "Garden Consulting",
        description: "Want to grow your own? Our experts visit your home to analyze your soil, sunlight, and space to design your perfect organic garden.",
        details: "Turn your backyard into a food forest with our expert guidance. \n\nOur consultation includes:\n1. Soil pH and composition testing\n2. Sunlight analysis\n3. Crop planning based on your taste\n4. Irrigation system recommendations\n\nWe also offer follow-up visits to help with planting and maintenance.",
        iconName: "Sprout",
        price: "$150 / visit"
      },
      {
        id: 3,
        title: "Educational Workshops",
        description: "Weekend classes on composting, regenerative farming, and canning/preserving. Perfect for schools and curious individuals.",
        details: "Join us at the farm for hands-on learning. We believe that sharing knowledge is key to a sustainable future.\n\nUpcoming Topics:\n- Composting 101: Turning waste into gold\n- Winter Gardening\n- Fermentation and Canning\n- Permaculture Basics\n\nClasses run every Saturday from 10am to 12pm. Tools and materials provided.",
        iconName: "GraduationCap",
        price: "$45 / person"
      }
    ],
    csa: {
      title: "The CSA Membership",
      description: "Community Supported Agriculture is the heart of Mothercrop. By subscribing, you support our farm early in the season and reap the rewards during harvest.",
      imageUrl: "https://picsum.photos/id/425/600/400",
      features: [
        "Priority access to scarce crops like strawberries and asparagus",
        "Weekly newsletter with recipes tailored to your box",
        "10% discount on farm events and workshops",
        "Cancel or pause anytime"
      ]
    }
  },
  blog: [
    {
      id: 1,
      title: "Why Regenerative Soil Matters",
      slug: "regenerative-soil-matters",
      excerpt: "Healthy soil is a living ecosystem. Learn how we nurture the microbiome beneath our feet to grow more nutrient-dense food.",
      content: "Soil is not just dirt; it is a complex living ecosystem teeming with life. In regenerative agriculture, our primary goal is to disturb the soil as little as possible.\n\nBy using cover crops, composting, and rotating crops, we feed the microorganisms that, in turn, feed our plants. This results in vegetables that are not only free from chemicals but are also richer in vitamins and minerals compared to conventionally grown produce.\n\nOur latest soil tests show a 200% increase in organic matter since 2010. This means our farm captures more carbon from the atmosphere and holds more water, making us resilient against droughts.",
      date: "Oct 15, 2023",
      author: "Sarah Jenkins",
      category: "Sustainability",
      imageUrl: "https://picsum.photos/id/534/800/600",
      status: 'published',
      seo: {
        metaTitle: "Why Regenerative Soil Matters - Mothercrop",
        metaDescription: "Discover how regenerative farming practices improve soil health and nutrient density in organic vegetables.",
        keywords: "organic farming, regenerative agriculture, soil health, nutrient density"
      }
    },
    {
      id: 2,
      title: "5 Seasonal Recipes for Autumn Squash",
      slug: "autumn-squash-recipes",
      excerpt: "Don't know what to do with that butternut squash? Here are our favorite warming recipes for the fall season.",
      content: "Autumn is squash season at Mothercrop! Whether you have a Butternut, Acorn, or Delicata, we have the perfect recipe for you.\n\n1. Roasted Butternut Soup: Simple, creamy, and dairy-free.\n2. Stuffed Acorn Squash: Quinoa, cranberries, and pecans make a perfect stuffing.\n3. Delicata Rings: No peeling required! Just slice, season, and roast.\n\nVisit our farm stand this Saturday to pick up your squash bundle.",
      date: "Oct 22, 2023",
      author: "Chef Mike",
      category: "Recipes",
      imageUrl: "https://picsum.photos/id/493/800/600",
      status: 'published',
      seo: {
        metaTitle: "5 Best Autumn Squash Recipes",
        metaDescription: "Easy and delicious recipes for butternut, acorn, and delicata squash from the Mothercrop kitchen.",
        keywords: "squash recipes, autumn cooking, organic vegetables, farm to table"
      }
    },
    {
      id: 3,
      title: "The Truth About 'Natural' vs 'Organic'",
      slug: "natural-vs-organic",
      excerpt: "Labels can be confusing. We break down the regulatory differences and what they mean for your health.",
      content: "Walk down any grocery aisle and you'll see 'All Natural' plastered on everything. But what does it mean? Legally, very little.\n\n'Organic', on the other hand, is a strictly regulated term by the USDA. It prohibits the use of synthetic pesticides, GMOs, and petroleum-based fertilizers.\n\nAt Mothercrop, we go beyond Organic standards. We focus on soil health and biodiversity, ensuring that our farming practices actively improve the environment rather than just sustaining it.",
      date: "Nov 01, 2023",
      author: "David Chen",
      category: "Education",
      imageUrl: "https://picsum.photos/id/292/800/600",
      status: 'published',
      seo: {
        metaTitle: "Natural vs Organic: What's the Difference?",
        metaDescription: "Understand food labeling. We explain why Certified Organic matters and how 'Natural' labels can be misleading.",
        keywords: "organic food, natural food labels, USDA organic, healthy eating"
      }
    },
    {
        id: 4,
        title: "Understanding N-P-K: The Holy Trinity",
        slug: "npk-explained",
        excerpt: "Nitrogen, Phosphorus, Potassium. What do they actually do for your plants?",
        content: "Draft content...",
        date: "Nov 05, 2023",
        author: "Sarah Jenkins",
        category: "Gardening Tips",
        imageUrl: "https://picsum.photos/id/299/800/600",
        status: 'published',
        seo: { metaTitle: "", metaDescription: "", keywords: "" }
    },
    {
        id: 5,
        title: "Winter Cover Crops Guide",
        slug: "cover-crops",
        excerpt: "Protect your soil this winter with rye, vetch, and clover.",
        content: "Draft content...",
        date: "Nov 12, 2023",
        author: "Sarah Jenkins",
        category: "Sustainability",
        imageUrl: "https://picsum.photos/id/512/800/600",
        status: 'published',
        seo: { metaTitle: "", metaDescription: "", keywords: "" }
    },
    {
        id: 6,
        title: "Pest Control Without Poison",
        slug: "organic-pest-control",
        excerpt: "How to attract beneficial insects to fight your battles for you.",
        content: "Draft content...",
        date: "Nov 15, 2023",
        author: "David Chen",
        category: "Gardening Tips",
        imageUrl: "https://picsum.photos/id/400/800/600",
        status: 'published',
        seo: { metaTitle: "", metaDescription: "", keywords: "" }
    }
  ],
  contact: {
    address: "123 Harvest Lane",
    city: "Green Valley, CA 90210",
    email: "hello@mothercrop.com",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Fri, 9am - 5pm",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0192361667086!2d-122.40618848468202!3d37.78868697975704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808b29c0c0d3%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1612345678901!5m2!1sen!2sus"
  }
};

interface DataContextType {
  data: SiteData;
  updateData: (newData: Partial<SiteData>) => void;
  resetData: () => void;
  logPageVisit: (pageName: string) => void;
  saveChatSession: (sessionId: string, messages: ChatMessage[]) => void;
  saveSoilAnalysis: (result: SoilAnalysisResult & { location?: string }) => void;
  addSubscriber: (email: string) => void;
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date'>) => void;
  notifications: Notification[];
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SiteData>(defaultData);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from LocalStorage on mount and listen for external changes
  useEffect(() => {
    // Initial Load
    const loadData = () => {
      const savedData = localStorage.getItem('mothercrop_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          mergeAndSetData(parsed);
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    };

    loadData();

    // Cross-Tab Sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mothercrop_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          mergeAndSetData(parsed);
        } catch (e) {
          console.error("Failed to sync data across tabs", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const mergeAndSetData = (parsed: any) => {
    setData(prev => {
        // Helper to ensure arrays exist
        const mergedUsers = Array.isArray(parsed.users) ? parsed.users : defaultData.users;
        const mergedChatHistory = Array.isArray(parsed.chatHistory) ? parsed.chatHistory : defaultData.chatHistory;
        const mergedTrafficStats = parsed.trafficStats || defaultData.trafficStats;
        const mergedSoilHistory = Array.isArray(parsed.soilLabHistory) ? parsed.soilLabHistory : defaultData.soilLabHistory;
        const mergedSubscribers = Array.isArray(parsed.subscribers) ? parsed.subscribers : defaultData.subscribers;
        const mergedContactMessages = Array.isArray(parsed.contactMessages) ? parsed.contactMessages : defaultData.contactMessages;
        const mergedTestimonials = Array.isArray(parsed.testimonials) ? parsed.testimonials : defaultData.testimonials;
        const mergedKnowledge = Array.isArray(parsed.knowledgeResources) ? parsed.knowledgeResources : defaultData.knowledgeResources;

        // Merge blog posts deeply AND clean up trash older than 30 days
        let mergedBlog = Array.isArray(parsed.blog) ? parsed.blog.map((p: any) => ({
            ...p,
            seo: p.seo || { metaTitle: p.title || '', metaDescription: p.excerpt || '', keywords: '' },
            slug: p.slug || (p.title ? p.title.toLowerCase().replace(/ /g, '-') : 'post'),
            content: p.content || p.excerpt || '',
            status: p.status || 'published',
            deletedAt: p.deletedAt || undefined
        })) : defaultData.blog;
        
        // Auto-Clean Trash > 30 Days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        mergedBlog = mergedBlog.filter((p: any) => {
            if (p.status === 'trash' && p.deletedAt) {
                const deletedDate = new Date(p.deletedAt).getTime();
                return deletedDate > thirtyDaysAgo;
            }
            return true;
        });

         // Merge services to include details
        const mergedServices = parsed.servicesPage ? {
            ...parsed.servicesPage,
            items: Array.isArray(parsed.servicesPage.items) 
              ? parsed.servicesPage.items.map((item: any, idx: number) => ({
                  ...item,
                  details: item.details || defaultData.servicesPage.items[idx]?.details || ''
                }))
              : defaultData.servicesPage.items
        } : defaultData.servicesPage;

        const mergedContact = { ...defaultData.contact, ...(parsed.contact || {}) };

        return { 
            ...defaultData, 
            ...parsed, 
            users: mergedUsers,
            blog: mergedBlog, 
            contact: mergedContact,
            servicesPage: mergedServices,
            chatHistory: mergedChatHistory,
            trafficStats: mergedTrafficStats,
            soilLabHistory: mergedSoilHistory,
            subscribers: mergedSubscribers,
            contactMessages: mergedContactMessages,
            testimonials: mergedTestimonials,
            knowledgeResources: mergedKnowledge
        };
    });
  }

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('mothercrop_data', JSON.stringify(data));
  }, [data]);

  const updateData = (newData: Partial<SiteData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData(defaultData);
    localStorage.removeItem('mothercrop_data');
  };

  const logPageVisit = (pageName: string) => {
    // Session-based unique visit logic
    const sessionKey = `visited_${pageName}`;
    if (sessionStorage.getItem(sessionKey)) {
        return; // Already visited this session
    }
    sessionStorage.setItem(sessionKey, 'true');

    setData(prev => {
      const currentStats = prev.trafficStats || {};
      return {
        ...prev,
        trafficStats: {
          ...currentStats,
          [pageName]: (currentStats[pageName] || 0) + 1
        }
      };
    });
  };

  const saveChatSession = (sessionId: string, messages: ChatMessage[]) => {
     setData(prev => {
        const history = prev.chatHistory || [];
        const existingSessionIndex = history.findIndex(s => s.id === sessionId);
        const preview = messages.find(m => m.role === 'user')?.text || 'New Conversation';
        
        const limitedMessages = messages.slice(-50);
        
        const newSession = { 
            id: sessionId, 
            date: new Date().toLocaleString(), 
            messages: limitedMessages, 
            preview 
        };
        
        let newHistory;
        if (existingSessionIndex >= 0) {
            newHistory = [...history];
            newHistory[existingSessionIndex] = newSession;
        } else {
            newHistory = [newSession, ...history];
        }
        
        return { ...prev, chatHistory: newHistory.slice(0, 50) };
     });
  };

  const saveSoilAnalysis = (result: SoilAnalysisResult & { location?: string }) => {
    setData(prev => {
      const newRecord: SoilAnalysisRecord = {
        ...result,
        id: (result.mode === 'plant' ? 'plant-' : 'soil-') + Date.now(),
        date: new Date().toLocaleString()
      };
      return { ...prev, soilLabHistory: [newRecord, ...prev.soilLabHistory].slice(0, 50) };
    });
  };

  const addSubscriber = (email: string) => {
    setData(prev => {
      if (prev.subscribers.some(s => s.email === email)) return prev;
      return {
        ...prev,
        subscribers: [...prev.subscribers, { id: Date.now(), email, date: new Date().toLocaleDateString() }]
      };
    });
  };

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'date'>) => {
    setData(prev => {
        const newMsg: ContactMessage = {
            ...msg,
            id: Date.now(),
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        };
        return {
            ...prev,
            contactMessages: [newMsg, ...prev.contactMessages]
        };
    });
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  return (
    <DataContext.Provider value={{ data, updateData, resetData, logPageVisit, saveChatSession, saveSoilAnalysis, addSubscriber, addContactMessage, notifications, showNotification }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
