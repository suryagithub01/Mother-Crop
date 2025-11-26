
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, FlaskConical, Sprout, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useData } from '../store';
import { SoilAnalysisResult } from '../types';

export const SoilAnalysis: React.FC = () => {
  const { saveSoilAnalysis } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const analyzeSoil = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
        throw new Error("API Key missing. Please check configuration.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const prompt = `
        You are an expert Agronomist and Soil Scientist. Analyze this image of soil.
        Identify its likely texture (clay, sandy, silty, loam), moisture content based on color, and organic matter visibility.
        
        Provide a JSON response with the following structure (do not use markdown code blocks, just raw JSON):
        {
          "score": number (0-100, where 100 is perfect loam),
          "type": string (e.g., "Sandy Loam", "Compacted Clay"),
          "summary": string (2 sentences describing the soil condition),
          "issues": [string] (list of 2-3 potential problems like "Low water retention" or "Likely acidic"),
          "fixes": [string] (list of 3 specific organic remedies, e.g., "Add 2 inches of compost", "Use biochar"),
          "crops": [string] (list of 4 suitable vegetables for this soil)
        }
      `;

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
        // Clean markdown if present (though responseMimeType should handle it)
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
        const data = JSON.parse(cleanText) as SoilAnalysisResult;
        setResult(data);
        
        // Save to backend/store
        saveSoilAnalysis(data);

      } else {
        throw new Error("No analysis received from AI.");
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      setError("Could not analyze image. Please try a clearer photo or try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero Section */}
      <div className="bg-brand-900 py-16 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <FlaskConical className="w-10 h-10 text-brand-300" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">AI Soil Lab</h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            Upload a photo of your garden soil. Our AI agronomist will analyze its composition, 
            diagnose issues, and recommend the best organic fixes and crops for your land.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-earth-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Upload */}
            <div>
              <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-brand-600" /> 
                1. Snap & Upload
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${selectedImage ? 'border-brand-500 bg-brand-50' : 'border-earth-300 bg-earth-50 hover:bg-earth-100'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Soil preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Upload className="w-8 h-8 text-brand-600" />
                    </div>
                    <p className="text-earth-600 font-medium">Click to upload soil photo</p>
                    <p className="text-earth-400 text-xs mt-2">Supports JPG, PNG</p>
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

              {selectedImage && !isAnalyzing && !result && (
                <button 
                  onClick={analyzeSoil}
                  className="w-full mt-6 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-transform hover:-translate-y-1 shadow-lg shadow-brand-500/30 flex items-center justify-center"
                >
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Analyze Sample
                </button>
              )}

              {isAnalyzing && (
                 <div className="w-full mt-6 py-4 bg-earth-100 text-brand-800 rounded-xl font-bold flex items-center justify-center cursor-not-allowed">
                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                   Analyzing Composition...
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
            <div className={`transition-all duration-500 ${result ? 'opacity-100 translate-x-0' : 'opacity-50 blur-sm pointer-events-none'}`}>
              <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center">
                <Sprout className="w-6 h-6 mr-2 text-brand-600" />
                2. Lab Report
              </h2>

              {result ? (
                <div className="space-y-6">
                  {/* Score Card */}
                  <div className="flex items-center p-4 bg-brand-50 rounded-xl border border-brand-100">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md ${result.score > 70 ? 'bg-green-500' : result.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                       {result.score}
                     </div>
                     <div className="ml-6">
                       <p className="text-xs text-brand-600 uppercase font-bold tracking-wider">Overall Health</p>
                       <h3 className="text-xl font-bold text-brand-900">{result.type}</h3>
                     </div>
                  </div>

                  <div className="bg-white">
                    <h4 className="font-bold text-earth-800 mb-2">Analysis Summary</h4>
                    <p className="text-earth-600 leading-relaxed text-sm">
                      {result.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h5 className="font-bold text-red-800 text-sm mb-2 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Detected Issues</h5>
                      <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                        {result.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h5 className="font-bold text-green-800 text-sm mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Organic Fixes</h5>
                      <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                        {result.fixes.map((fix, i) => <li key={i}>{fix}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-earth-800 mb-3">Best Crops to Grow</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.crops.map((crop, i) => (
                        <span key={i} className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium border border-brand-200">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-earth-200 rounded-xl">
                  <div className="bg-earth-100 p-4 rounded-full mb-4">
                    <FlaskConical className="w-8 h-8 text-earth-400" />
                  </div>
                  <p className="text-earth-500 font-medium">Waiting for sample...</p>
                  <p className="text-earth-400 text-sm mt-1">Upload an image to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 mb-4">
               <Camera className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">Visual Analysis</h3>
             <p className="text-earth-600 text-sm">Our AI analyzes structure, color, and aggregation to determine soil taxonomy (Sand, Silt, Clay).</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 mb-4">
               <FlaskConical className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">Organic Remedies</h3>
             <p className="text-earth-600 text-sm">We only suggest natural amendments like compost, mulch, or cover crops to restore balance.</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-100">
             <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 mb-4">
               <Sprout className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-brand-900 mb-2">Crop Matching</h3>
             <p className="text-earth-600 text-sm">Don't fight your soil. We tell you what wants to grow there naturally, ensuring a better harvest.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
