'use client';

import { useState, useEffect } from 'react';
import { database, ref, onValue, set, type DataSnapshot } from '@/lib/firebase';
import QueueRow from '@/components/QueueRow';

interface QueueData {
  current: number;
}

interface QueueState {
  A: number;
  B: number;
  C: number;
  D: number;
}

export default function ManagementPage() {
  const [queueState, setQueueState] = useState<QueueState>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  });

  // Color configuration for each queue
  const queueColors = {
    A: 'text-pink-400',
    B: 'text-green-400', 
    C: 'text-yellow-500',
    D: 'text-blue-400',
  };

  // Load initial queue data from Firebase
  useEffect(() => {
    const queueKeys = ['A', 'B', 'C', 'D'] as const;
    
    queueKeys.forEach((key, index) => {
      const queueRef = ref(database, `queue/${key}`);
      onValue(queueRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val() as QueueData;
        if (data && typeof data.current === 'number') {
          setQueueState(prev => ({
            ...prev,
            [queueKeys[index]]: data.current
          }));
        }
      });
    });
  }, []);

  // Update Firebase when queue state changes
  const updateQueue = async (queueLetter: keyof QueueState, newValue: number) => {
    try {
      await set(ref(database, `queue/${queueLetter}/current`), newValue);
      setQueueState(prev => ({
        ...prev,
        [queueLetter]: newValue
      }));
    } catch (error) {
      console.error(`Error updating queue ${queueLetter}:`, error);
    }
  };

  const incrementQueue = (queueLetter: keyof QueueState) => {
    const currentValue = queueState[queueLetter];
    const newValue = Math.min(currentValue + 1, 999);
    updateQueue(queueLetter, newValue);
  };

  const decrementQueue = (queueLetter: keyof QueueState) => {
    const currentValue = queueState[queueLetter];
    const newValue = Math.max(currentValue - 1, 0);
    updateQueue(queueLetter, newValue);
  };

  const resetAllQueues = async () => {
    const keys = ['A', 'B', 'C', 'D'];
    
    try {
        await Promise.all(
          keys.map(key => 
            set(ref(database, `queue/${key}/current`), 0)
          )
        );
        await Promise.all(
          keys.map(key => 
            set(ref(database, `ticket/${key}/current`), 0)
          )
        );
      
      setQueueState({
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      });
    } catch (error) {
      console.error('Error resetting queues:', error);
    }
  };


  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: 'Gothic';
          src: url('/GOTHIC.TTF') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
      <div className="w-full bg-gray-900 flex flex-col overflow-hidden" style={{ height: '100vh' }}>
        {/* Queue Control Interface */}
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          {/* A Queue - Row 1 (Pink) */}
          <div className="flex-1 flex items-center justify-center px-4 border-b border-gray-700" style={{ minHeight: 0, maxHeight: '20vh' }}>
            <QueueRow 
              letter="A" 
              currentValue={queueState.A}
              onIncrement={() => incrementQueue('A')}
              onDecrement={() => decrementQueue('A')}
              color={queueColors.A}
              className="w-full"
            />
          </div>
          
          {/* B Queue - Row 2 (Green) */}
          <div className="flex-1 flex items-center justify-center px-4 border-b border-gray-700" style={{ minHeight: 0, maxHeight: '20vh' }}>
            <QueueRow 
              letter="B" 
              currentValue={queueState.B}
              onIncrement={() => incrementQueue('B')}
              onDecrement={() => decrementQueue('B')}
              color={queueColors.B}
              className="w-full"
            />
          </div>
          
          {/* C Queue - Row 3 (Yellow) */}
          <div className="flex-1 flex items-center justify-center px-4 border-b border-gray-700" style={{ minHeight: 0, maxHeight: '20vh' }}>
            <QueueRow 
              letter="C" 
              currentValue={queueState.C}
              onIncrement={() => incrementQueue('C')}
              onDecrement={() => decrementQueue('C')}
              color={queueColors.C}
              className="w-full"
            />
          </div>
          
          {/* D Queue - Row 4 (Blue) */}
          <div className="flex-1 flex items-center justify-center px-4 border-b border-gray-700" style={{ minHeight: 0, maxHeight: '20vh' }}>
            <QueueRow 
              letter="D" 
              currentValue={queueState.D}
              onIncrement={() => incrementQueue('D')}
              onDecrement={() => decrementQueue('D')}
              color={queueColors.D}
              className="w-full"
            />
          </div>
          
          {/* Reset Button - Row 5 */}
          <div className="flex-1 flex items-center justify-center px-4" style={{ minHeight: 0, maxHeight: '20vh' }}>
            <button
              onClick={resetAllQueues}
              className="px-16 py-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
              style={{ 
                fontFamily: 'Gothic, sans-serif',
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 'bold'
              }}
            >
              RESTART
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
