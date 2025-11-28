
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, FlaskConical, Sprout, AlertCircle, CheckCircle, Loader2, ChevronRight, Flower2 } from 'lucide-react';
import { useData } from '../store';
import { SoilAnalysisResult } from '../types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulation timer for the progress bar
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setAnalysisProgress(0);
      const phases = mode === 'soil' ? [
        { p: 15, text: language === 'hi' ? "मिट्टी की बनावट स्कैन हो रही है..." : "Scanning soil texture..." },
        { p: 40, text: language === 'hi' ? "रंग संरचना का विश्लेषण..." : "Analyzing color composition..." },
        { p: 65, text: language === 'hi' ? "जैविक पदार्थ का पता लगाना..." : "Detecting organic matter..." },
        { p: 85, text: language === 'hi' ? "स्वास्थ्य स्कोर की गणना..." : "Calculating health score..." },
        { p: 90, text: language === 'hi' ? "दोनों भाषाओं में रिपोर्ट तैयार हो रही है..." : "Generating bilingual report..." },
      ] : [
        { p: 15, text: language === 'hi' ? "पत्ती को स्कैन किया जा रहा है..." : "Scanning leaf structure..." },
        { p: 40, text: language === 'hi' ? "लक्षणों का पता लगाना..." : "Detecting symptoms/pests..." },
        { p: 65, text: language === 'hi' ? "बीमारी की पहचान..." : "Identifying disease/deficiency..." },
        { p: 85, text: language === 'hi' ? "इलाज ढूँढना..." : "Calculating health impact..." },
        { p: 90, text: language === 'hi' ? "रिपोर्ट तैयार हो रही है..." : "Generating bilingual report..." },
      ];
      
      let phaseIdx = 0;
      setAnalysisStatus(phases[0].text);

      interval = setInterval(() => {
        setAnalysisProgress(prev => {
           if (prev >= 90) return prev; // Hold at 90 until API returns
           // Check if we should switch text
           if (phaseIdx < phases.length - 1 && prev > phases[phaseIdx + 1].p) {
             phaseIdx++;
             setAnalysisStatus(phases[phaseIdx].text);
           }
           return prev + 1; // Increment progress
        });
      }, 100);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSample = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

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
          You are an expert Agronomist and Soil Scientist. Analyze this image of soil in EXTREME DETAIL.
          Task:
          1. Analyze soil structure (e.g., Loam, Clay), moisture, and fertility.
          2. Generate a report in ENGLISH and HINDI.

          Return strictly valid JSON:
          {
            "mode": "soil",
            "score": number (0-100),
            "en": {
              "type": string (e.g. "Sandy Loam"),
              "summary": string (Detailed analysis paragraph),
              "issues": string[] (3-5 bullet points),
              "fixes": string[] (3-5 organic remedies),
              "crops": string[] (5 suitable crops)
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
      } else {
        prompt = `
          You are an expert Botanist and Plant Pathologist (Leaf Doctor). Analyze this image of a plant/leaf/fruit.
          Task:
          1. Identify the plant and detect any diseases, pests, or nutrient deficiencies (e.g., Yellowing = Nitrogen deficiency, Spots = Fungal).
          2. If healthy, state it is healthy.
          3. Generate a report in ENGLISH and HINDI.
          4. IMPORTANT: In the 'crops' field (Prevention Tips), include specific prevention for the detected issue, PLUS 2-3 general preventative measures for common plant diseases (e.g., tool sanitation, crop rotation) to promote overall garden health.

          Return strictly valid JSON:
          {
            "mode": "plant",
            "score": number (0-100, 100 is perfectly healthy),
            "en": {
              "type": string (Disease Name e.g. "Early Blight" OR "Healthy [Plant Name]"),
              "summary": string (Detailed diagnosis paragraph),
              "issues": string[] (Visual symptoms detected),
              "fixes": string[] (Organic treatments/remedies),
              "crops": string[] (Specific prevention tips AND General plant health best practices)
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
        // Robust parsing
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        
        const data = JSON.parse(cleanText) as SoilAnalysisResult;
        
        // Ensure mode is set correctly in result if AI forgot it
        data.mode = mode;

        setAnalysisProgress(100);
        setAnalysisStatus(language === 'hi' ? "पूर्ण!" : "Complete!");
        
        setTimeout(() => {
            setResult(data);
            saveSoilAnalysis(data);
            setIsAnalyzing(false);
        }, 500);

      } else {
        throw new Error("No analysis received from AI.");
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(language === 'hi' ? "छवि का विश्लेषण नहीं कर सका। कृपया स्पष्ट फोटो का उपयोग करें।" : "Could not analyze image. Please try a clearer photo or try again later.");
      setIsAnalyzing(false);
    }
  };

  const currentContent = result ? result[language] : null;

  return (
    <div className="min-h-screen bg-earth-50">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
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
               onClick={() => { setMode('soil'); setResult(null); setSelectedImage(null); }}
               className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center ${mode === 'soil' ? 'bg-white text-brand-900 shadow-md' : 'text-brand-300 hover:text-white'}`}
             >
               <FlaskConical className="w-4 h-4 mr-2" /> Soil Analysis
             </button>
             <button 
               onClick={() => { setMode('plant'); setResult(null); setSelectedImage(null); }}
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
              
              <div 
                className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${selectedImage ? 'border-brand-500 bg-brand-50' : 'border-earth-300 bg-earth-50 hover:bg-earth-100'}`}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    {/* Scanning Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-brand-900/60 z-10 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="absolute w-full h-1 bg-brand-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan top-0"></div>
                            <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-4" />
                            <div className="px-6 py-2 bg-black/40 rounded-full text-white font-mono text-sm border border-white/20">
                                {analysisStatus}
                            </div>
                            <div className="w-64 mt-4 bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-brand-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                                  style={{ width: `${analysisProgress}%` }}
                                ></div>
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
                  {mode === 'soil' ? <FlaskConical className="w-5 h-5 mr-2" /> : <Flower2 className="w-5 h-5 mr-2" />}
                  {language === 'hi' ? 'विश्लेषण करें' : 'Analyze Sample'}
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
              <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center">
                <Sprout className="w-6 h-6 mr-2 text-brand-600" />
                2. {mode === 'soil' ? 'Lab Report' : 'Doctor\'s Diagnosis'}
              </h2>

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
