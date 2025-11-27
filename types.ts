
import React from 'react';

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string; // Comma separated
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Full HTML/Markdown body
  date: string;
  author: string;
  imageUrl: string;
  category: string;
  status: 'published' | 'draft';
  seo: SEOData;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  details?: string; // Extended description for the Learn More modal
  iconName: string;
  price?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  features: {
    title: string;
    desc: string;
    iconName: string;
  }[];
  whyChooseUsTitle: string;
  featuredSection: {
    title: string;
    description: string;
    imageUrl: string;
    bullets: string[];
  };
}

export interface AboutData {
  heroTitle: string;
  intro: string;
  storyTitle: string;
  story: string;
  stats: {
    label: string;
    value: string;
  }[];
  teamTitle: string;
  team: TeamMember[];
}

export interface ServicesPageData {
  heroTitle: string;
  intro: string;
  items: Service[];
  csa: {
    title: string;
    description: string;
    imageUrl: string;
    features: string[];
  };
}

export interface ContactData {
  address: string;
  city: string;
  email: string;
  phone: string;
  hours: string;
  mapUrl: string;
}

export type Role = 'admin' | 'manager' | 'editor';

export interface User {
  id: number;
  username: string;
  password: string; // In a real app, this should be hashed. For this demo, we store as plain text.
  role: Role;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  date: string;
  messages: ChatMessage[];
  preview: string; // First user message
}

export interface TrafficStat {
  [pageName: string]: number;
}

export interface SoilAnalysisResult {
  score: number;
  type: string;
  summary: string;
  issues: string[];
  fixes: string[];
  crops: string[];
}

export interface SoilAnalysisRecord extends SoilAnalysisResult {
  id: string;
  date: string;
  imageUrl?: string; // Optional to save space
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SiteData {
  home: HomeData;
  about: AboutData;
  servicesPage: ServicesPageData;
  blog: BlogPost[];
  contact: ContactData;
  users: User[];
  chatHistory: ChatSession[];
  trafficStats: TrafficStat;
  soilLabHistory: SoilAnalysisRecord[];
}

export enum Page {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  SERVICES = 'SERVICES',
  BLOG = 'BLOG',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN',
  SOIL_ANALYSIS = 'SOIL_ANALYSIS'
}
