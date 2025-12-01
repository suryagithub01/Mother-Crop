
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, FlaskConical, Sprout, AlertCircle, CheckCircle, Loader2, ChevronRight, Flower2, ScanLine, Download, MapPin, Volume2, History, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { useData } from '../store';
import { SoilAnalysisResult, CropRotationPlan } from '../types';

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
          2. Generate a report in ENGLISH and HINDI.
          3. Calculate exact organic fertilizer needs for the stated farm size.

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
              "fertilizer_plan": [{ "item": string, "quantity": string, "note": string }]
            },
            "hi": {
              "type": string,
              "summary": string,
              "issues": string[],
              "fixes": string[],
              "crops": string[],
              "fertilizer_plan": [{ "item": string, "quantity": string, "note": string }]
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

  return (
    <div className="min-h-screen bg-earth-50">
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
                                
                                <h3 className="text-brand-300 font-bold text-lg mb-1 relative z-10 font-mono tracking-widest uppercase">
                                  {language === 'hi' ? 'एआई विश्लेषण' : 'AI Analysis'}
                                </h3>
                                
                                <div className="text-white font-mono text-xs mb-4 h-8 relative z-10 text-center flex items-center justify-center px-4 w-full">
                                    <span className="animate-pulse">{analysisStatus}</span>
                                </div>
                                
                                {/* Sci-Fi Progress Bar */}
                                <div className="w-full bg-earth-800 rounded-full h-1.5 overflow-hidden relative z-10 border border-earth-700">
                                    <div 
                                      className="bg-brand-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(74,222,128,0.8)] relative" 
                                      style={{ width: `${analysisProgress}%` }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 shadow-[0_0_5px_#fff]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between w-full mt-2 text-[10px] text-brand-400 font-mono relative z-10 opacity-70">
                                    <span>INIT</span>
                                    <span>{analysisProgress}%</span>
                                    <span>DONE</span>
                                </div>
                            </div>
                        </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-white p-5 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform text-brand-500">
                      <Upload className="w-10 h-10" />
                    </div>
                    <p className="text-earth-600 font-medium text-lg text-center px-4">
                        {language === 'hi' 
                          ? (mode === 'soil' ? 'मिट्टी की फोटो अपलोड करें' : 'पत्ती/पौधे की फोटो अपलोड करें') 
                          : (mode === 'soil' ? 'Click to upload soil photo' : 'Click to upload plant/leaf photo')}
                    </p>
                    <p className="text-earth-400 text-sm mt-2">JPG, PNG</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  disabled={isAnalyzing}
                  onChange={handleImageUpload} 
                />
              </div>

              {selectedImage && !isAnalyzing && !result && (
                <button 
                  onClick={analyzeSample}
                  className="w-full mt-6 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-transform hover:-translate-y-1 shadow-lg shadow-brand-500/30 flex items-center justify-center"
                >
                  <ScanLine className="w-5 h-5 mr-2" />
                  {language === 'hi' ? 'विश्लेषण शुरू करें' : 'Start Scan & Analysis'}
                </button>
              )}

              {result && (
                <div className="mt-6 text-center text-sm text-earth-500">
                    <p>{language === 'hi' ? 'रिपोर्ट हिंदी और अंग्रेजी दोनों में उपलब्ध है। ऊपर टॉगल करें।' : 'Report generated in both English and Hindi. Toggle above to switch.'}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className={`transition-all duration-700 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 filter blur-[2px] pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-900 flex items-center">
                  <Sprout className="w-6 h-6 mr-2 text-brand-600" />
                  2. {mode === 'soil' ? 'Lab Report' : 'Doctor\'s Diagnosis'}
                </h2>
                
                {result && (
                    <div className="flex gap-2">
                        <button 
                          onClick={() => playAudio(currentContent?.summary || '')}
                          className="flex items-center text-brand-600 hover:text-brand-800 text-sm font-bold bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors border border-brand-200"
                          title="Listen to Report"
                        >
                           <Volume2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={downloadReport}
                          className="flex items-center text-brand-600 hover:text-brand-800 text-sm font-bold bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors border border-brand-200"
                          title="Download JSON Record"
                        >
                          <Download className="w-4 h-4 mr-2" /> Export
                        </button>
                    </div>
                )}
              </div>

              {currentContent && result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Score Card */}
                  <div className="flex items-center p-6 bg-gradient-to-br from-brand-50 to-white rounded-2xl border border-brand-100 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        {mode === 'soil' ? <FlaskConical className="w-32 h-32 text-brand-600" /> : <Flower2 className="w-32 h-32 text-brand-600" />}
                     </div>
                     <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white ${result.score > 70 ? 'bg-green-500' : result.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                       {result.score}
                     </div>
                     <div className="ml-8 relative z-10">
                       <p className="text-xs text-brand-600 uppercase font-bold tracking-wider mb-1">
                           {language === 'hi' ? 'स्वास्थ्य स्कोर' : 'Health Score'}
                       </p>
                       <h3 className="text-2xl font-serif font-bold text-brand-900">{currentContent.type}</h3>
                       {/* Timeline Graph Placeholder for Repeat Users */}
                       <div className="mt-2 flex items-center text-xs text-brand-400">
                          <History className="w-3 h-3 mr-1" /> 
                          {language === 'hi' ? 'इतिहास में सहेजा गया' : 'Saved to timeline'}
                       </div>
                     </div>
                  </div>

                  <div className="bg-white p-1">
                    <h4 className="font-bold text-brand-800 mb-2 flex items-center text-lg">
                        {language === 'hi' ? 'विश्लेषण सारांश' : (mode === 'soil' ? 'Analysis Summary' : 'Diagnosis Summary')}
                    </h4>
                    <p className="text-earth-700 leading-relaxed text-base border-l-4 border-brand-200 pl-4">
                      {currentContent.summary}
                    </p>
                  </div>

                  {/* Fertilizer Calculator (Soil Mode Only) */}
                  {mode === 'soil' && currentContent.fertilizer_plan && (
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center uppercase tracking-wide">
                              {language === 'hi' ? 'स्मार्ट फर्टिलाइजर कैलकुलेटर' : 'Smart Fertilizer Calculator'}
                              <span className="ml-2 text-xs normal-case bg-blue-200 px-2 py-0.5 rounded-full text-blue-800">For {farmSize} {farmUnit}</span>
                          </h4>
                          <div className="space-y-2">
                              {currentContent.fertilizer_plan.map((plan, i) => (
                                  <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                      <div className="font-bold text-blue-900">{plan.item}</div>
                                      <div className="text-right">
                                          <div className="font-bold text-brand-600">{plan.quantity}</div>
                                          <div className="text-xs text-earth-400">{plan.note}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                      <h5 className="font-bold text-red-800 text-sm mb-3 flex items-center uppercase tracking-wide">
                          <AlertCircle className="w-4 h-4 mr-2"/> 
                          {language === 'hi' ? 'समस्याएँ' : (mode === 'soil' ? 'Detected Issues' : 'Symptoms Detected')}
                      </h5>
                      <ul className="space-y-2">
                        {currentContent.issues.map((issue, i) => (
                            <li key={i} className="flex items-start text-red-700 text-sm">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {issue}
                            </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                      <h5 className="font-bold text-green-800 text-sm mb-3 flex items-center uppercase tracking-wide">
                          <CheckCircle className="w-4 h-4 mr-2"/> 
                          {language === 'hi' ? 'सुझाव' : (mode === 'soil' ? 'Recommended Fixes' : 'Treatment Plan')}
                      </h5>
                      <ul className="space-y-2">
                        {currentContent.fixes.map((fix, i) => (
                            <li key={i} className="flex items-start text-green-800 text-sm">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {fix}
                            </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-brand-800 mb-3 flex items-center">
                        <Sprout className="w-4 h-4 mr-2" /> 
                        {language === 'hi' ? 'सुझाव' : (mode === 'soil' ? 'Recommended Crops' : 'Prevention & General Care')}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {currentContent.crops.map((crop, i) => (
                        <div key={i} className="p-3 bg-brand-50 text-brand-900 rounded-lg text-sm font-medium border border-brand-200 shadow-sm flex items-start">
                           <ChevronRight className="w-4 h-4 mr-2 text-brand-500 flex-shrink-0 mt-0.5" /> 
                           <span>{crop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-earth-200 rounded-xl bg-earth-50/50">
                  <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                    {mode === 'soil' ? <FlaskConical className="w-8 h-8 text-earth-400" /> : <Flower2 className="w-8 h-8 text-earth-400" />}
                  </div>
                  <p className="text-earth-500 font-bold text-lg">
                      {language === 'hi' ? 'नमूने का इंतज़ार...' : 'Waiting for sample...'}
                  </p>
                  <p className="text-earth-400 text-sm mt-1 max-w-xs mx-auto">
                      {language === 'hi' 
                        ? 'विस्तृत रिपोर्ट देखने के लिए बाईं ओर एक छवि अपलोड करें।' 
                        : (mode === 'soil' ? 'Upload soil image for analysis.' : 'Upload leaf/plant image for diagnosis.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Crop Rotation Planner (Only appears after analysis) */}
        {result && mode === 'soil' && (
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-earth-100 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-900 flex items-center">
                   <Calendar className="w-6 h-6 mr-2 text-brand-600" />
                   3. Long-Term Planning: Crop Rotation
                </h2>
                <p className="text-earth-600 mt-2">
                   Generate a 3-year schedule tailored to your {result.en.type} soil to naturally replenish nutrients and break pest cycles.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-earth-50 p-2 rounded-lg border border-earth-100">
                 <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-earth-500 uppercase">Scale:</span>
                    <select 
                        value={farmScale} 
                        onChange={(e) => setFarmScale(e.target.value as 'garden' | 'farm')}
                        className="bg-white border border-earth-200 rounded px-2 py-1 text-sm font-medium"
                    >
                        <option value="garden">Home Garden</option>
                        <option value="farm">Small Farm</option>
                    </select>
                 </div>
                 <button 
                    onClick={generateRotationPlan}
                    disabled={isGeneratingPlan}
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-700 flex items-center shadow-sm disabled:opacity-50"
                 >
                    {isGeneratingPlan ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sprout className="w-4 h-4 mr-2" />}
                    {isGeneratingPlan ? 'Planning...' : 'Generate Plan'}
                 </button>
              </div>
            </div>

            {rotationPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rotationPlan.years.map((yearPlan) => (
                        <div key={yearPlan.year} className="bg-earth-50 rounded-xl border border-earth-200 overflow-hidden flex flex-col">
                            <div className="bg-brand-900 text-white p-4">
                                <h3 className="font-bold text-lg">Year {yearPlan.year}</h3>
                                <div className="text-xs text-brand-200 uppercase tracking-wider font-bold mt-1">Focus: {yearPlan.focus}</div>
                            </div>
                            <div className="p-4 space-y-4 flex-1">
                                {yearPlan.schedule.map((season, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-earth-100 shadow-sm relative pl-4">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                                            season.season.includes('Spring') ? 'bg-green-400' : 
                                            season.season.includes('Summer') ? 'bg-yellow-400' : 
                                            'bg-orange-400'
                                        }`}></div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-earth-400 uppercase">{season.season}</span>
                                            <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">{season.family}</span>
                                        </div>
                                        <div className="font-bold text-brand-900 text-lg">{season.crop}</div>
                                        <div className="text-xs text-earth-600 mt-1 leading-tight">{season.benefit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-earth-50/50 rounded-xl border-2 border-dashed border-earth-200">
                    <Calendar className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                    <p className="text-earth-500 font-medium">Click "Generate Plan" to create your custom schedule.</p>
                </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-4">
               <Camera className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">
                 Computer Vision
             </h3>
             <p className="text-earth-600 text-sm leading-relaxed">
                 Our AI uses advanced image recognition to detect soil texture particles or subtle leaf discoloration indicative of disease.
             </p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-4">
               <FlaskConical className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">
                 Organic Only
             </h3>
             <p className="text-earth-600 text-sm leading-relaxed">
                 All recommendations—whether for soil amendments or pest control—are strictly organic and safe for sustainable farming.
             </p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-4">
               <Sprout className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">
                 Complete Care
             </h3>
             <p className="text-earth-600 text-sm leading-relaxed">
                 From preparing the soil to curing sick plants, Mothercrop's AI Lab supports your farm through the entire growing season.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
