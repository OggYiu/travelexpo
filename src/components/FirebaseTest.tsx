'use client';

import { useEffect, useState } from 'react';
import app from '@/lib/firebase';

export default function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking Firebase...');

  useEffect(() => {
    try {
      // Check if Firebase app is initialized
      if (app) {
        setFirebaseStatus(`✅ Firebase initialized successfully! App name: ${app.name}`);
      } else {
        setFirebaseStatus('❌ Firebase initialization failed');
      }
    } catch (error) {
      setFirebaseStatus(`❌ Firebase error: ${error}`);
    }
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Firebase Connection Test</h2>
      <p className="text-sm">{firebaseStatus}</p>
      <p className="text-xs text-gray-600 mt-2">
        Note: This will show an error until you add your Firebase configuration in src/lib/firebase.ts
      </p>
    </div>
  );
}
