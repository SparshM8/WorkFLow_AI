import React, { useState } from 'react';
import { Camera, Upload, Sparkles, X, ShieldCheck, UserPlus } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { analyzeBadgeImage, BadgeSchema } from '../services/aiService';
import './SmartScanner.css';

const SmartScanner = ({ onScanComplete, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleScan = async (file) => {
    setIsScanning(true);
    setError(null);

    try {
      const dataUrl = await fileToDataUrl(file);
      // data:image/jpeg;base64,....
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type;

      const result = await analyzeBadgeImage(base64Data, mimeType);
      const validated = BadgeSchema.parse(result);
      setScanResult(validated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to parse badge. Please ensure the photo is clear.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleScan(file);
  };

  return (
    <div className="smart-scanner-overlay">
      <Motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="smart-scanner-modal card border-glass"
      >
        <div className="scanner-header">
          <div className="flex items-center gap-2">
            <div className="scanner-icon-bg">
              <Sparkles size={20} className="text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Smart Scanner</h3>
              <p className="text-xs text-secondary">Powered by Google Lens & Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="scanner-content">
          {!scanResult ? (
            <div className="upload-zone">
              <div className="scan-animation-container">
                <div className={`scan-line ${isScanning ? 'active' : ''}`}></div>
                <Camera size={48} className={`text-tertiary ${isScanning ? 'animate-pulse' : ''}`} />
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm font-medium">Scan a Physical Badge</p>
                <p className="text-xs text-secondary mt-1">Extract profile and match instantly</p>
                
                <div className="mt-6 flex flex-col gap-3">
                  <label className="btn btn-primary cursor-pointer">
                    <Upload size={18} className="mr-2" />
                    Upload Badge Photo
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isScanning} />
                  </label>
                  <button className="btn btn-outline" disabled={isScanning}>
                    <Camera size={18} className="mr-2" />
                    Open Camera
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="scan-result-view"
            >
              <div className="result-badge">
                <div className="result-avatar">
                  {scanResult.name.charAt(0)}
                </div>
                <div className="result-info">
                  <h4 className="font-bold">{scanResult.name}</h4>
                  <p className="text-xs text-secondary">{scanResult.role} @ {scanResult.company}</p>
                </div>
                <div className="match-tag">
                  <Sparkles size={12} />
                  94% Match
                </div>
              </div>

              <div className="result-details mt-4">
                <div className="detail-group">
                  <span className="label">Skills Found</span>
                  <div className="tag-cloud">
                    {scanResult.skills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
                <div className="detail-group mt-3">
                  <span className="label">Shared Interests</span>
                  <div className="tag-cloud">
                    {scanResult.interests.map(i => <span key={i} className="tag interest">{i}</span>)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  className="btn btn-primary flex-1"
                  onClick={() => onScanComplete(scanResult)}
                >
                  <UserPlus size={18} className="mr-2" />
                  Connect Now
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setScanResult(null)}
                >
                  Scan Again
                </button>
              </div>
            </Motion.div>
          )}

          {isScanning && (
            <div className="scanning-status mt-4">
              <div className="progress-bar-container">
                <Motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="progress-bar"
                />
              </div>
              <p className="text-xs text-center mt-2 animate-pulse">Gemini is analyzing badge credentials...</p>
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-4 text-center">{error}</p>}
        </div>

        <div className="scanner-footer">
          <ShieldCheck size={14} className="text-accent-secondary" />
          <span>Encrypted Local-First Processing</span>
        </div>
      </Motion.div>
    </div>
  );
};

export default SmartScanner;
