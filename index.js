import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

const BarcodeScanner = () => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsScanning(true);
      
      const barcodeDetector = new window.BarcodeDetector();
      
      const scanFrame = async () => {
        if (!isScanning) return;
        
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          
          for (const barcode of barcodes) {
            const isDup = scannedCodes.includes(barcode.rawValue);
            setIsDuplicate(isDup);
            
            if (!isDup) {
              setScannedCodes(prev => [...prev, barcode.rawValue]);
            }
          }
        } catch (error) {
          console.error('Scanning error:', error);
        }
        
        requestAnimationFrame(scanFrame);
      };
      
      scanFrame();
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const removeCode = (code) => {
    setScannedCodes(prev => prev.filter(c => c !== code));
    setIsDuplicate(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Camera size={20} />
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>

      {isScanning && (
        <div className="mb-4 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-100 rounded"
          />
        </div>
      )}

      {isDuplicate && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Duplicate barcode detected!
        </div>
      )}

      <div className="space-y-2">
        {scannedCodes.map((code, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span className="font-mono">{code}</span>
            <button
              onClick={() => removeCode(code)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodeScanner;