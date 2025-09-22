'use client';

import { useState, useEffect } from 'react';
import { database, ref, onValue, off, type DataSnapshot } from '@/lib/firebase';

interface QueueDisplayProps {
  letter: string; // A, B, C, D
  logoPath: string; // Path to the logo image
  backgroundColor: string; // Tailwind color class (e.g., 'bg-pink-500', 'bg-blue-500')
  textColor: string; // Tailwind color class for the queue number text (e.g., 'text-pink-400', 'text-blue-400')
}

export default function QueueDisplay({ letter, logoPath, backgroundColor, textColor }: QueueDisplayProps) {
  const [queueNumber, setQueueNumber] = useState<number>(0);
  const [ticketNumber, setTicketNumber] = useState<number>(0);
  const [displayNumber, setDisplayNumber] = useState<string>(`${letter}000`);
  const [displayTicketNumber, setDisplayTicketNumber] = useState<string>(`${letter}000`);

  useEffect(() => {
    // Create a reference to the queue data for the specified letter
    const queueRef = ref(database, `queue/${letter}`);
    // Create a reference to the ticket data for the specified letter
    const ticketRef = ref(database, `ticket/${letter}`);
    
    // Set up the queue listener
    const unsubscribeQueue = onValue(queueRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data && typeof data.current === 'number') {
        setQueueNumber(data.current);
      }
    });

    // Set up the ticket listener
    const unsubscribeTicket = onValue(ticketRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data && typeof data.current === 'number') {
        setTicketNumber(data.current);
      }
    });

    // Cleanup function to remove the listeners when component unmounts
    return () => {
      off(queueRef, 'value', unsubscribeQueue);
      off(ticketRef, 'value', unsubscribeTicket);
    };
  }, [letter]);

  // Format the display number when queueNumber changes
  useEffect(() => {
    if (queueNumber > 0) {
      // Format number with leading zeros (e.g., A001, A010, A100)
      const formattedNumber = queueNumber.toString().padStart(3, '0');
      setDisplayNumber(`${letter}${formattedNumber}`);
    } else {
      setDisplayNumber(`${letter}000`);
    }

    if(ticketNumber > 0) {
      const formattedNumber = ticketNumber.toString().padStart(3, '0');
      setDisplayTicketNumber(`${letter}${formattedNumber}`);
    } else {
      setDisplayTicketNumber(`${letter}000`);
    }
  }, [queueNumber, ticketNumber, letter]);

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
      
      <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
        {/* Row 1: Header with letter logo and company logo */}
        <div className={`${backgroundColor} px-4 py-3 flex`} style={{ height: '18vh' }}>
          {/* Column 1: Letter logo - aligned left and center */}
          <div className="flex-1 flex items-center justify-start">
            <div className="text-white flex items-center justify-center rounded-lg" style={{ width: '12vh', height: '12vh' }}>
              <span 
                className="font-bold"
                style={{ 
                  fontFamily: 'Gothic, sans-serif',
                  fontSize: 'clamp(2.5rem, 14vh, 20.5rem)'
                }}
              >
                {letter}
              </span>
            </div>
          </div>
          
          {/* Column 2: Company logo */}
          <div className="w-3/4 bg-white flex flex-col items-center justify-center">
            <img 
              src={logoPath} 
              alt="company logo"
              className="max-h-full max-w-full object-contain"
              style={{ height: 'clamp(6vh, 10vh, 20vh)' }}
            />
          </div>
        </div>

        {/* Row 2: Queue Display with big and small queue number */}
        <div className="bg-black flex flex-col items-center justify-center" style={{ height: '47vh' }}>
          {/* Big queue number text */}
          <div className="text-center mb-4">
            <div 
              className={`${textColor} font-bold`}
              style={{ 
                fontFamily: 'Gothic, sans-serif',
                fontSize: 'clamp(4rem, 18vh, 10rem)',
                lineHeight: '0.85',
                letterSpacing: '0.05em'
              }}
            >
              {displayNumber}
            </div>
          </div>
          
          {/* Small queue number text in white box */}
          <div className="bg-white px-3 py-1 rounded">
            <div 
              className={`${textColor} font-bold`}
              style={{ 
                fontFamily: 'Gothic, sans-serif',
                fontSize: 'clamp(1.2rem, 3.5vh, 2rem)'
              }}
            >
              {displayTicketNumber}
            </div>
          </div>
        </div>

        {/* Row 3: Queue Rules */}
        <div className="bg-white px-4 py-3" style={{ height: '35vh', overflow: 'hidden' }}>
          <h2 
            className="text-black font-bold mb-2"
            style={{ 
              fontFamily: 'Gothic, sans-serif',
              fontSize: 'clamp(1.3rem, 3.5vh, 2rem)'
            }}
          >
            排隊守則
          </h2>
          
          <div className="space-y-1 text-black" style={{ fontFamily: 'Gothic, sans-serif', fontSize: 'clamp(0.7rem, 1.8vh, 1rem)' }}>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">1.</span>
              <span>一人一籌，憑籌入場。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">2.</span>
              <span>請耐心排隊等候，若有需要去洗手間，請預先通知在場工作人員，否則需重新取籌排隊。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">3.</span>
              <span>不准插隊。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">4.</span>
              <span>如欲選購其他旅行社產品，必需重新取籌排隊。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">5.</span>
              <span>嚴禁以物品或不同人士代替排隊。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">6.</span>
              <span>請互相尊重及待人有禮。</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold mr-2 flex-shrink-0">7.</span>
              <span>如叫號超過 10 個號碼或以上，請重新取籌，不設補票。</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
