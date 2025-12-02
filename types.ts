
import React from 'react';

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string; // Comma separated
}

export type BlogStatus = 'published' | 'draft' | 'trash';

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
  status: BlogStatus;
  deletedAt?: string; // ISO Date string for auto-cleanup
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

export interface KnowledgeResource {
  id: number;
  title: string;
  type: 'video' | 'guide' | 'pdf';
  category: string;
  description: string;
  url: string; // Video URL or Download Link
  thumbnail?: string;
  durationOrSize?: string; // e.g. "10 min" or "2.5 MB"
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string; // e.g. "CSA Member" or "Local Chef"
  text: string;
  rating: number; // 1-5
}

export interface Subscriber {
  id: number;
  email: string;
  date: string;
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

export interface FertilizerPlan {
  item: string;
  quantity: string;
  note: string;
}

export interface SoilComposition {
  sand: number;
  silt: number;
  clay: number;
}

export interface SoilNutrients {
  nitrogen: number; // 0-100 score
  phosphorus: number; // 0-100 score
  potassium: number; // 0-100 score
  ph: number; // 0-14
}

export interface SoilAnalysisContent {
  type: string; // Soil Type OR Disease Name
  summary: string;
  issues: string[]; // Issues OR Symptoms
  fixes: string[]; // Fixes OR Treatments
  crops: string[]; // Recommended Crops OR Prevention Tips
  fertilizer_plan?: FertilizerPlan[]; 
  composition?: SoilComposition;
  nutrients?: SoilNutrients;
}

export interface SoilAnalysisResult {
  mode: 'soil' | 'plant';
  score: number;
  en: SoilAnalysisContent;
  hi: SoilAnalysisContent;
}

export interface SoilAnalysisRecord extends SoilAnalysisResult {
  id: string;
  date: string;
  imageUrl?: string; // Optional to save space
  location?: string;
}

export interface RotationSeason {
  season: string;
  crop: string;
  family: string;
  benefit: string;
}

export interface RotationYear {
  year: number;
  focus: string; // e.g. "Nitrogen Fixing"
  schedule: RotationSeason[];
}

export interface CropRotationPlan {
  scale: 'garden' | 'farm';
  soilType: string;
  years: RotationYear[];
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Storm';
  humidity: number;
  windSpeed: number;
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
  testimonials: Testimonial[];
  subscribers: Subscriber[];
  knowledgeResources: KnowledgeResource[];
}

export enum Page {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  SERVICES = 'SERVICES',
  BLOG = 'BLOG',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN',
  SOIL_ANALYSIS = 'SOIL_ANALYSIS',
  KNOWLEDGE = 'KNOWLEDGE'
}