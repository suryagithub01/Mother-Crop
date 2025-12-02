
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, FlaskConical, Sprout, AlertCircle, CheckCircle, Loader2, ChevronRight, Flower2, ScanLine, Download, MapPin, Volume2, History, RefreshCw, Calendar, ArrowRight, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useData } from '../store';
import { SoilAnalysisResult, CropRotationPlan } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { SEO } from '../components/Layout';

type AnalysisMode = 'soil' | 'plant';

export const SoilAnalysis: React.FC = () => {
  const { saveSoilAnalysis } = useData();
  const [mode, setMode] = useState<AnalysisMode>('soil');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  // New Inputs
  const [farmSize, setFarmSize] = useState('500');
  const [farmUnit, setFarmUnit] = useState('sqft');
  const [location, setLocation] = useState<string>('Unknown');
  const [isLocating, setIsLocating] = useState(false);

  // Rotation State
  const [farmScale, setFarmScale] = useState<'garden' | 'farm'>('garden');
  const [rotationPlan, setRotationPlan] = useState<CropRotationPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulation timer for the progress bar
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setAnalysisProgress(0);
      const phases = mode === 'soil' ? [
        { p: 10, text: language === 'hi' ? "ऑप्टिकल सेंसर प्रारंभ हो रहे हैं..." : "Initializing optical sensors..." },
        { p: 30, text: language === 'hi' ? "मिट्टी की बनावट स्कैन हो रही है..." : "Scanning soil texture & granularity..." },
        { p: 50, text: language === 'hi' ? "रंग संरचना का विश्लेषण..." : "Analyzing color composition (RGB)..." },
        { p: 70, text: language === 'hi' ? "जैविक पदार्थ का पता लगाना..." : "Detecting organic matter & moisture..." },
        { p: 85, text: language === 'hi' ? "कृषि रिपोर्ट संकलित की जा रही है..." : "Compiling agronomist report..." },
        { p: 95, text: language === 'hi' ? "पूर्ण हो रहा है..." : "Finalizing data..." },
      ] : [
        { p: 10, text: language === 'hi' ? "इमेज प्रोसेसिंग शुरू..." : "Initializing image processing..." },
        { p: 30, text: language === 'hi' ? "पत्ती की संरचना स्कैन हो रही है..." : "Scanning leaf structure & veins..." },
        { p: 50, text: language === 'hi' ? "विकृतियों का पता लगाना..." : "Detecting discoloration & lesions..." },
        { p: 70, text: language === 'hi' ? "रोगजनक पैटर्न का मिलान..." : "Matching pathogen patterns..." },
        { p: 85, text: language === 'hi' ? "निदान रिपोर्ट तैयार हो रही है..." : "Generating diagnosis & treatment..." },
        { p: 95, text: language === 'hi' ? "पूर्ण हो रहा है..." : "Finalizing data..." },
      ];
      
      let phaseIdx = 0;
      setAnalysisStatus(phases[0].text);

      interval = setInterval(() => {
        setAnalysisProgress(prev => {
           if (prev >= 98) return prev; // Hold until API returns
           // Check if we should switch text
           if (phaseIdx < phases.length - 1 && prev > phases[phaseIdx + 1].p) {
             phaseIdx++;
             setAnalysisStatus(phases[phaseIdx].text);
           }
           return prev + 1; // Increment progress
        });
      }, 80); // Slightly faster updates for smoother feel
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, language, mode]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
        setRotationPlan(null); // Reset plan on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
      if (navigator.geolocation) {
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                  setIsLocating(false);
              },
              (err) => {
                  console.error(err);
                  setIsLocating(false);
                  alert("Could not detect location. Please allow permissions.");
              }
          );
      }
  };

  const playAudio = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
  };

  const downloadReport = () => {
    if (!result) return;
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mothercrop_${mode}_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analyzeSample = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    // Auto-capture location if not set
    let activeLocation = location;
    if (activeLocation === 'Unknown' || !activeLocation) {
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) reject("No geolocation");
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            activeLocation = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            setLocation(activeLocation);
        } catch (e) {
            console.warn("Auto-location skipped", e);
        }
    }

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
        throw new Error("API Key missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Extract base64 data
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      let prompt = "";
      
      if (mode === 'soil') {
        prompt = `
          You are an expert Agronomist. Analyze this soil image.
          Context: Farm Size: ${farmSize} ${farmUnit}, Location: ${activeLocation}.
          Task:
          1. Analyze soil type, moisture, and potential issues.
          2. ESTIMATE soil composition percentages (Sand, Silt, Clay) summing to 100.
          3. ESTIMATE nutrient levels (Nitrogen, Phosphorus, Potassium) on scale 0-100, and pH (0-14).
          4. Generate a report in ENGLISH and HINDI.
          5. Calculate exact organic fertilizer needs for the stated farm size.

          Return strictly valid JSON:
          {
            "mode": "soil",
            "score": number (0-100),
            "en": {
              "type": string,
              "summary": string,
              "issues": string[],
              "fixes": string[],
              "crops": string[],
              "fertilizer_plan": [{ "item": string, "quantity": string, "note": string }],
              "composition": { "sand": number, "silt": number, "clay": number },
              "nutrients": { "nitrogen": number, "phosphorus": number, "potassium": number, "ph": number }
            },
            "hi": {
              "type": string,
              "summary": string,
              "issues": string[],
              "fixes": string[],
              "crops": string[],
              "fertilizer_plan": [{ "item": string, "quantity": string, "note": string }],
              "composition": { "sand": number, "silt": number, "clay": number },
              "nutrients": { "nitrogen": number, "phosphorus": number, "potassium": number, "ph": number }
            }
          }
        `;
      } else {
        prompt = `
          You are an expert Plant Pathologist. Analyze this plant/leaf image.
          Context: Location: ${activeLocation}.
          Task:
          1. Identify plant and disease/pest.
          2. Generate report in ENGLISH and HINDI.
          3. Include specific prevention AND general preventative measures.

          Return strictly valid JSON:
          {
            "mode": "plant",
            "score": number (0-100),
            "en": {
              "type": string,
              "summary": string,
              "issues": string[],
              "fixes": string[],
              "crops": string[] (Prevention tips)
            },
            "hi": {
              "type": string,
              "summary": string,
              "issues": string[],
              "fixes": string[],
              "crops": string[]
            }
          }
        `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: prompt }
          ]
        },
        config: {
           responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        
        const data = JSON.parse(cleanText) as SoilAnalysisResult;
        
        // Ensure mode is set correctly in result if AI forgot it
        data.mode = mode;

        setAnalysisProgress(100);
        setAnalysisStatus(language === 'hi' ? "विश्लेषण पूर्ण!" : "Analysis Complete!");
        
        setTimeout(() => {
            setResult(data);
            saveSoilAnalysis({ ...data, location: activeLocation });
            setIsAnalyzing(false);
        }, 800);

      } else {
        throw new Error("No analysis received from AI.");
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(language === 'hi' ? "छवि का विश्लेषण नहीं कर सका।" : "Could not analyze image.");
      setIsAnalyzing(false);
    }
  };

  const generateRotationPlan = async () => {
    if (!result || !result.en) return;
    
    setIsGeneratingPlan(true);
    try {
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        
        const soilType = result.en.type;
        const issues = result.en.issues.join(', ');
        const scaleText = farmScale === 'garden' ? "Home Garden (Hand tools, intensive spacing)" : "Small Farm (Tractor/Tillers, row cropping)";
        const langInstruction = language === 'hi' ? "Translate all content to HINDI." : "Keep content in ENGLISH.";

        const prompt = `
            Act as a master crop planner. 
            Based on the following soil analysis:
            - Soil Type: ${soilType}
            - Detected Issues: ${issues}
            - Location/Climate: ${location}
            - Scale: ${scaleText}

            Create a 3-Year Crop Rotation Plan designed to fix these specific soil issues (e.g. use legumes if nitrogen is low, cover crops if compacted) and prevent pests.

            ${langInstruction}

            Return strictly valid JSON:
            {
                "scale": "${farmScale}",
                "soilType": "${soilType}",
                "years": [
                    {
                        "year": 1,
                        "focus": "string (e.g. Nitrogen Fixation)",
                        "schedule": [
                           { "season": "Spring", "crop": "string", "family": "string", "benefit": "string" },
                           { "season": "Summer", "crop": "string", "family": "string", "benefit": "string" },
                           { "season": "Fall", "crop": "string", "family": "string", "benefit": "string" }
                        ]
                    },
                    { "year": 2, "focus": "string", "schedule": [...] },
                    { "year": 3, "focus": "string", "schedule": [...] }
                ]
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const text = response.text;
        if (text) {
             const plan = JSON.parse(text) as CropRotationPlan;
             setRotationPlan(plan);
        }

    } catch (e) {
        console.error(e);
        alert("Failed to generate plan. Please try again.");
    } finally {
        setIsGeneratingPlan(false);
    }
  };

  const currentContent = result ? result[language] : null;

  // Chart Data Preparation
  const compositionData = currentContent?.composition ? [
    { name: 'Sand', value: currentContent.composition.sand, color: '#f59e0b' }, // Amber
    { name: 'Silt', value: currentContent.composition.silt, color: '#3b82f6' }, // Blue
    { name: 'Clay', value: currentContent.composition.clay, color: '#ef4444' }, // Red
  ] : [];

  const nutrientData = currentContent?.nutrients ? [
    { name: 'N', value: currentContent.nutrients.nitrogen, full: 'Nitrogen' },
    { name: 'P', value: currentContent.nutrients.phosphorus, full: 'Phosphorus' },
    { name: 'K', value: currentContent.nutrients.potassium, full: 'Potassium' },
  ] : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mothercrop Soil Lab",
    "applicationCategory": "AgricultureApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "featureList": "Soil Analysis, Plant Disease Diagnosis, Crop Rotation Planning",
    "screenshot": "https://picsum.photos/id/429/800/600"
  };

  return (
    <div className="min-h-screen bg-earth-50">
      <SEO 
        title="AI Soil Lab & Plant Doctor - Mothercrop" 
        description="Analyze your soil health and diagnose plant diseases instantly with our AI-powered tool. Get organic crop recommendations." 
        schema={schema}
      />
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; box-shadow: 0 0 15px rgba(74, 222, 128, 0.5); }
          90% { opacity: 1; box-shadow: 0 0 15px rgba(74, 222, 128, 0.5); }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="bg-brand-900 py-16 text-white relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           {mode === 'soil' ? <FlaskConical className="w-64 h-64" /> : <Flower2 className="w-64 h-64" />}
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-white/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-brand-500/30">
            {mode === 'soil' ? <FlaskConical className="w-10 h-10 text-brand-300" /> : <Flower2 className="w-10 h-10 text-brand-300" />}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            AI {mode === 'soil' ? 'Soil Lab' : 'Plant Doctor'}
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto leading-relaxed">
            {mode === 'soil' 
              ? "Advanced computer vision analysis for your garden. Detect nutrient deficiencies, texture, and get custom crop plans instantly."
              : "Instant diagnosis for your crops. Detect pests, diseases, and nutrient issues simply by taking a photo of a leaf."}
          </p>
          
          {/* Mode Switcher */}
          <div className="mt-8 inline-flex bg-brand-800 p-1 rounded-full border border-brand-700 shadow-inner">
             <button 
               onClick={() => { setMode('soil'); setResult(null); setSelectedImage(null); setRotationPlan(null); }}
               className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center ${mode === 'soil' ? 'bg-white text-brand-900 shadow-md' : 'text-brand-300 hover:text-white'}`}
             >
               <FlaskConical className="w-4 h-4 mr-2" /> Soil Analysis
             </button>
             <button 
               onClick={() => { setMode('plant'); setResult(null); setSelectedImage(null); setRotationPlan(null); }}
               className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center ${mode === 'plant' ? 'bg-white text-brand-900 shadow-md' : 'text-brand-300 hover:text-white'}`}
             >
               <Flower2 className="w-4 h-4 mr-2" /> Plant Doctor
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-earth-100">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Upload */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-900 flex items-center">
                  <Camera className="w-6 h-6 mr-2 text-brand-600" /> 
                  1. Snap & Upload
                </h2>
                
                {/* Language Toggle */}
                <div className="flex items-center bg-earth-100 rounded-lg p-1">
                   <button 
                     onClick={() => setLanguage('en')}
                     className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-earth-500 hover:text-earth-700'}`}
                   >
                     English
                   </button>
                   <button 
                     onClick={() => setLanguage('hi')}
                     className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${language === 'hi' ? 'bg-white text-brand-700 shadow-sm' : 'text-earth-500 hover:text-earth-700'}`}
                   >
                     हिंदी
                   </button>
                </div>
              </div>

               {/* Smart Inputs for Calculation */}
               {mode === 'soil' && !isAnalyzing && !result && (
                  <div className="mb-6 grid grid-cols-2 gap-4 bg-earth-50 p-4 rounded-xl border border-earth-100">
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Farm/Garden Size</label>
                        <div className="flex">
                           <input type="number" value={farmSize} onChange={e => setFarmSize(e.target.value)} className="w-2/3 px-3 py-2 border rounded-l-lg" />
                           <select value={farmUnit} onChange={e => setFarmUnit(e.target.value)} className="w-1/3 px-3 py-2 border-y border-r rounded-r-lg bg-white">
                              <option value="sqft">Sq Ft</option>
                              <option value="acres">Acres</option>
                           </select>
                        </div>
                     </div>
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-earth-500 uppercase mb-1">Location</label>
                        <div className="flex">
                           <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-l-lg" placeholder="City or Region" />
                           <button onClick={detectLocation} className="px-3 bg-brand-100 text-brand-700 rounded-r-lg hover:bg-brand-200">
                              <MapPin className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               )}
              
              <div 
                className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${selectedImage ? 'border-brand-500 bg-brand-50' : 'border-earth-300 bg-earth-50 hover:bg-earth-100'}`}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    
                    {/* Advanced Scanning Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex flex-col items-center justify-center">
                            {/* Animated Scan Line */}
                            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_20px_rgba(74,222,128,1)] animate-scan top-0 z-10"></div>
                            
                            {/* Grid Overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(74,222,128,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.4)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                            
                            {/* Central HUD Panel */}
                            <div className="bg-black/80 p-6 rounded-2xl border border-brand-500/30 shadow-2xl flex flex-col items-center max-w-xs w-full relative overflow-hidden backdrop-blur-md">
                                {/* Pulse Effect Background */}
                                <div className="absolute inset-0 bg-brand-500/5 animate-pulse"></div>

                                <div className="relative z-10 mb-4 bg-brand-900/50 p-3 rounded-full border border-brand-500/50">
                                   <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                                </div>
                                
                                <h3 className="relative z-10 text-brand-400 font-mono text-xl font-bold mb-2 tracking-widest">{analysisProgress}%</h3>
                                
                                {/* Status Text */}
                                <div className="relative z-10 h-10 w-full flex items-center justify-center">
                                    <p className="text-white/90 text-xs font-mono text-center animate-pulse">
                                      {'>'} {analysisStatus}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative z-10 w-full bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 shadow-[0_0_10px_rgba(74,222,128,0.8)] transition-all duration-300" style={{ width: `${analysisProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-brand-100 p-4 rounded-full mb-4 group-hover:bg-brand-200 transition-colors">
                      <Upload className="w-8 h-8 text-brand-600" />
                    </div>
                    <p className="text-earth-600 font-medium">Click to Upload Photo</p>
                    <p className="text-earth-400 text-sm mt-2">JPG, PNG (Max 5MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload} 
                />
              </div>

              {selectedImage && !result && !isAnalyzing && (
                <button 
                  onClick={analyzeSample}
                  className="w-full mt-6 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 flex justify-center items-center"
                >
                  <ScanLine className="w-6 h-6 mr-2" /> 
                  Run {mode === 'soil' ? 'Full Analysis' : 'Diagnosis'}
                </button>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                   <AlertCircle className="w-5 h-5 mr-2" />
                   {error}
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="bg-earth-50 rounded-xl p-6 md:p-8 min-h-[400px] flex flex-col justify-center border border-earth-100">
              {!result ? (
                <div className="text-center text-earth-400">
                   <Sprout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                   <p className="text-lg">Upload an image to see the {mode === 'soil' ? 'agronomist' : 'pathology'} report.</p>
                </div>
              ) : currentContent ? (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                   
                   {/* Score Header */}
                   <div className="flex justify-between items-start">
                      <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                {currentContent.type}
                            </span>
                            <span className="px-3 py-1 bg-earth-200 text-earth-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
                                <MapPin className="w-3 h-3 mr-1" /> {location}
                            </span>
                          </div>
                          <h2 className="text-3xl font-serif font-bold text-brand-900 mt-3 mb-2">
                             Health Score: <span className={result.score > 70 ? 'text-green-600' : result.score > 40 ? 'text-yellow-600' : 'text-red-600'}>{result.score}/100</span>
                          </h2>
                          <div className="w-full bg-earth-200 h-2 rounded-full max-w-xs mt-2">
                             <div className={`h-2 rounded-full ${result.score > 70 ? 'bg-green-500' : result.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.score}%` }}></div>
                          </div>
                      </div>
                      <div className="flex space-x-2">
                         <button onClick={() => playAudio(currentContent.summary)} className="p-2 bg-white border border-earth-200 rounded-full hover:bg-brand-50 text-brand-600" title="Listen">
                             <Volume2 className="w-5 h-5" />
                         </button>
                         <button onClick={downloadReport} className="p-2 bg-white border border-earth-200 rounded-full hover:bg-brand-50 text-brand-600" title="Export JSON">
                             <Download className="w-5 h-5" />
                         </button>
                      </div>
                   </div>

                   {/* Summary */}
                   <div className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm">
                      <p className="text-earth-700 leading-relaxed text-lg italic">"{currentContent.summary}"</p>
                   </div>
                   
                   {/* VISUALIZATIONS SECTION (Only for Soil Mode) */}
                   {mode === 'soil' && currentContent.composition && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-white p-4 rounded-xl border border-earth-200 shadow-sm">
                               <h4 className="font-bold text-earth-900 mb-4 flex items-center text-sm uppercase"><PieChartIcon className="w-4 h-4 mr-2" /> Composition</h4>
                               <div className="h-48 w-full">
                                   <ResponsiveContainer width="100%" height="100%">
                                       <PieChart>
                                           <Pie data={compositionData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                               {compositionData.map((entry, index) => (
                                                   <Cell key={`cell-${index}`} fill={entry.color} />
                                               ))}
                                           </Pie>
                                           <Tooltip />
                                           <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                       </PieChart>
                                   </ResponsiveContainer>
                               </div>
                           </div>
                           <div className="bg-white p-4 rounded-xl border border-earth-200 shadow-sm">
                               <h4 className="font-bold text-earth-900 mb-4 flex items-center text-sm uppercase"><BarChart3 className="w-4 h-4 mr-2" /> Nutrients (0-100)</h4>
                               <div className="h-48 w-full">
                                   <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={nutrientData}>
                                           <XAxis dataKey="name" tick={{fontSize: 12}} />
                                           <YAxis hide />
                                           <Tooltip cursor={{fill: '#f0fdf4'}} />
                                           <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                       </BarChart>
                                   </ResponsiveContainer>
                                   <div className="text-center mt-2 text-xs font-bold text-earth-500">pH Level: {currentContent.nutrients?.ph}</div>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Diagnosis/Issues */}
                   <div>
                      <h3 className="font-bold text-brand-900 mb-3 flex items-center">
                         <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> 
                         {mode === 'soil' ? 'Identified Issues' : 'Symptoms Detected'}
                      </h3>
                      <div className="space-y-2">
                         {currentContent.issues.map((issue, i) => (
                            <div key={i} className="flex items-start bg-red-50 p-3 rounded-lg text-red-800 text-sm">
                               <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                               {issue}
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Solutions */}
                   <div>
                      <h3 className="font-bold text-brand-900 mb-3 flex items-center">
                         <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> 
                         {mode === 'soil' ? 'Recommended Amendments' : 'Treatment Plan'}
                      </h3>
                      <div className="space-y-2">
                         {currentContent.fixes.map((fix, i) => (
                            <div key={i} className="flex items-start bg-green-50 p-3 rounded-lg text-green-800 text-sm">
                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                               {fix}
                            </div>
                         ))}
                      </div>
                   </div>
                   
                   {/* Fertilizer Plan (Soil Only) */}
                   {mode === 'soil' && currentContent.fertilizer_plan && (
                       <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                           <h3 className="font-bold text-blue-900 mb-3">Smart Fertilizer Plan ({farmSize} {farmUnit})</h3>
                           <div className="space-y-2">
                               {currentContent.fertilizer_plan.map((plan, i) => (
                                   <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                                       <span className="font-bold text-blue-800">{plan.item}</span>
                                       <div className="text-right">
                                           <span className="block font-bold text-brand-600">{plan.quantity}</span>
                                           <span className="text-[10px] text-earth-400">{plan.note}</span>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                   {/* Recommendations */}
                   <div>
                      <h3 className="font-bold text-brand-900 mb-3">
                        {mode === 'soil' ? 'Optimal Crops' : 'Preventative Measures'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                         {currentContent.crops.map((crop, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-earth-200 rounded-full text-sm text-earth-700 font-medium">
                               {crop}
                            </span>
                         ))}
                      </div>
                   </div>

                   {/* Crop Rotation Scheduler Tool */}
                   {mode === 'soil' && (
                       <div className="mt-8 border-t-2 border-dashed border-earth-200 pt-8">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="text-xl font-serif font-bold text-brand-900">Step 3: Long-Term Planning</h3>
                               <div className="flex bg-earth-200 rounded-lg p-1 text-xs font-bold">
                                   <button onClick={() => setFarmScale('garden')} className={`px-3 py-1 rounded ${farmScale === 'garden' ? 'bg-white shadow' : ''}`}>Garden</button>
                                   <button onClick={() => setFarmScale('farm')} className={`px-3 py-1 rounded ${farmScale === 'farm' ? 'bg-white shadow' : ''}`}>Farm</button>
                               </div>
                           </div>
                           
                           {!rotationPlan ? (
                               <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 text-center">
                                   <Calendar className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                                   <h4 className="font-bold text-brand-900 mb-2">Generate 3-Year Crop Rotation</h4>
                                   <p className="text-sm text-earth-600 mb-4">AI will create a schedule to naturally fix your soil issues over time.</p>
                                   <button 
                                     onClick={generateRotationPlan} 
                                     disabled={isGeneratingPlan}
                                     className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50"
                                   >
                                      {isGeneratingPlan ? 'Generating Schedule...' : 'Create Plan'}
                                   </button>
                               </div>
                           ) : (
                               <div className="space-y-4">
                                   {rotationPlan.years.map((year) => (
                                       <div key={year.year} className="bg-white border border-earth-200 rounded-xl overflow-hidden">
                                           <div className="bg-earth-100 px-4 py-2 flex justify-between items-center">
                                               <span className="font-bold text-brand-900">Year {year.year}</span>
                                               <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">{year.focus}</span>
                                           </div>
                                           <div className="grid grid-cols-3 divide-x divide-earth-100">
                                               {year.schedule.map((season, i) => (
                                                   <div key={i} className="p-3 text-center">
                                                       <div className="text-[10px] font-bold text-earth-400 uppercase mb-1">{season.season}</div>
                                                       <div className="font-bold text-brand-800 text-sm mb-1">{season.crop}</div>
                                                       <div className="text-[10px] text-earth-500 leading-tight">{season.benefit}</div>
                                                   </div>
                                               ))}
                                           </div>
                                       </div>
                                   ))}
                                   <button onClick={() => setRotationPlan(null)} className="w-full py-2 text-earth-400 hover:text-earth-600 text-xs font-bold flex items-center justify-center">
                                       <RefreshCw className="w-3 h-3 mr-1" /> Reset Plan
                                   </button>
                               </div>
                           )}
                       </div>
                   )}

                </div>
              ) : null}
            </div>
          </div>
        </div>
        
        {/* History Graph Placeholder (Visual flair) */}
        {mode === 'soil' && (
            <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
                 <div className="flex items-center justify-center space-x-2 text-white/80 mb-4">
                     <History className="w-5 h-5" />
                     <span className="font-bold">Soil Health Timeline</span>
                 </div>
                 <div className="h-32 bg-white/10 backdrop-blur rounded-xl border border-white/20 flex items-end justify-around p-4 relative overflow-hidden">
                      {[45, 50, 55, 52, 60, 68, 75].map((h, i) => (
                          <div key={i} className="w-8 bg-brand-400/50 rounded-t hover:bg-brand-400 transition-colors relative group cursor-pointer" style={{ height: `${h}%` }}>
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100">{h}</span>
                          </div>
                      ))}
                      <div className="absolute inset-x-0 bottom-0 h-px bg-white/20"></div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};
