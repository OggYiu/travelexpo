'use client';

import { useState, useEffect } from 'react';
import PrintReceipt from '@/components/PrintReceipt';

export default function PrintTestPage() {
  const [printerIP, setPrinterIP] = useState('192.168.50.244');
  const [testMode, setTestMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [eposSdkLoaded, setEposSdkLoaded] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setIsClient(true);
    setEposSdkLoaded(typeof (window as any).epson !== 'undefined');
    setUserAgent(window.navigator.userAgent);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-black">
            Print Test Page
          </h1>
          
          {/* Printer Configuration */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Printer Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-black">Test Mode (Console Log Only)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Print Component */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Receipt Printing
            </h2>
            <PrintReceipt />
          </div>

          {/* Test Information */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Test Information
            </h2>
            <div className="space-y-3 text-sm text-black">
              <p><strong>SDK Status:</strong> Check browser console for ePOS SDK loading status</p>
              <p><strong>Printer Address:</strong> http://{printerIP}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=30000</p>
              <p><strong>Receipt Content:</strong> KKday queue ticket with QR code and Chinese instructions</p>
              <p><strong>Requirements:</strong> ePOS-Print SDK must be loaded and printer must be network accessible</p>
            </div>
          </div>

          {/* Debug Information */}
          <div className="p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Debug Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">ePOS SDK Loaded:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  eposSdkLoaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isClient ? (eposSdkLoaded ? 'Yes' : 'No') : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Time:</span>
                <span className="text-black">
                  {isClient ? new Date().toLocaleString() : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Agent:</span>
                <span className="text-black text-xs truncate max-w-md">
                  {isClient ? userAgent : 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

