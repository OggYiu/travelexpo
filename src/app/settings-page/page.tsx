'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [ipAddress, setIpAddress] = useState('192.168.50.244');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const router = useRouter();

  // Load IP address from localStorage on component mount
  useEffect(() => {
    const savedIp = localStorage.getItem('printerIpAddress');
    if (savedIp) {
      setIpAddress(savedIp);
    }
    setIsLoading(false);
  }, []);

  // Save IP address to localStorage
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ipAddress)) {
        throw new Error('Invalid IP address format');
      }

      // Check if each octet is between 0-255
      const octets = ipAddress.split('.');
      for (const octet of octets) {
        const num = parseInt(octet, 10);
        if (num < 0 || num > 255) {
          throw new Error('IP address octets must be between 0-255');
        }
      }

      // Save to localStorage
      localStorage.setItem('printerIpAddress', ipAddress);
      setSaveStatus('IP address saved successfully!');
      
      // Optional: Test connection to the printer
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);

    } catch (error) {
      setSaveStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    setIpAddress('192.168.50.244');
    localStorage.setItem('printerIpAddress', '192.168.50.244');
    setSaveStatus('Reset to default IP address');
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  // Test connection to printer
  const handleTestConnection = async () => {
    setIsSaving(true);
    setSaveStatus('Testing connection...');

    try {
      const address = `http://${ipAddress}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=5000`;
      
      // Simple test - try to create a connection
      const testPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        // Try to reach the endpoint
        fetch(address, { 
          method: 'GET',
          mode: 'no-cors' // This will help avoid CORS issues for testing
        })
        .then(() => {
          clearTimeout(timeout);
          resolve('Connection successful');
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      await testPromise;
      setSaveStatus('✅ Connection test successful!');
    } catch (error) {
      setSaveStatus(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatus('');
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
          <p className="text-gray-600">Configure your printer settings and system preferences.</p>
        </div>

        {/* IP Address Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Printer IP Address</h2>
          <p className="text-gray-600 mb-4">
            Set the IP address of your EPSON printer. This will be used for all printing operations.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-2">
                IP Address
              </label>
              <input
                type="text"
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isSaving}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save IP Address'}
              </button>

              <button
                onClick={handleTestConnection}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Reset to Default
              </button>
            </div>

            {/* Status Message */}
            {saveStatus && (
              <div className={`p-3 rounded-lg ${
                saveStatus.includes('Error') || saveStatus.includes('❌') 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/background-page')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-semibold text-blue-800">Background Page</div>
              <div className="text-sm text-blue-600">Main queue display</div>
            </button>

            <button
              onClick={() => router.push('/management-page')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="font-semibold text-green-800">Management Page</div>
              <div className="text-sm text-green-600">Manage queue numbers</div>
            </button>

            <button
              onClick={() => router.push('/print-test-page')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="font-semibold text-purple-800">Print Test</div>
              <div className="text-sm text-purple-600">Test printer functionality</div>
            </button>
          </div>
        </div>

        {/* Current Configuration Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Configuration</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600">Printer IP Address</div>
                <div className="text-lg font-mono text-gray-800">{ipAddress}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Printer URL</div>
                <div className="text-sm font-mono text-gray-800 break-all">
                  http://{ipAddress}/cgi-bin/epos/service.cgi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
