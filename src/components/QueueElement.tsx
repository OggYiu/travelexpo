'use client';

import { useState, useEffect } from 'react';
import { database, ref, onValue, off, type DataSnapshot, type CompanyId } from '@/lib/firebase';

interface QueueElementProps {
  /** The company ID to listen for queue data (e.g., 'kkday', 'wingon') */
  companyId: CompanyId;
  /** The queue prefix/letter to display (e.g., "A", "B") */
  queuePrefix: string;
  /** Color theme for the element */
  color: 'pink' | 'green' | 'orange' | 'blue';
  /** Position configuration */
  position: {
    /** CSS position property (e.g., '18%', '5%') */
    top?: string;
    /** CSS position property (e.g., '18%', '5%') */
    bottom?: string;
    /** CSS position property (e.g., '36%', '2.8%') */
    left?: string;
    /** CSS position property (e.g., '36%', '2.8%') */
    right?: string;
    /** Width as percentage (default: '30%') */
    width?: string;
    /** Height as percentage (default: '31%') */
    height?: string;
  };
  /** Whether to show the semi-transparent background (default: true) */
  showBackground?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

const colorConfig = {
  pink: {
    bgColor: 'bg-pink-100/50',
    textColor: 'text-pink-400',
  },
  green: {
    bgColor: 'bg-green-100/50',
    textColor: 'text-green-400',
  },
  orange: {
    bgColor: 'bg-orange-100/50',
    textColor: 'text-yellow-500',
  },
  blue: {
    bgColor: 'bg-blue-100/50',
    textColor: 'text-blue-400',
  },
};

export default function QueueElement({ 
  companyId,
  queuePrefix, 
  color, 
  position, 
  showBackground = false,
  className = '' 
}: QueueElementProps) {
  const [queueNumber, setQueueNumber] = useState<number>(0);
  const [ticketNumber, setTicketNumber] = useState<number>(0);
  const [displayNumber, setDisplayNumber] = useState<string>('');
  const [displayTicketNumber, setDisplayTicketNumber] = useState<string>('');
  const { bgColor, textColor } = colorConfig[color];

  useEffect(() => {
    // Create a reference to the queue data for the specific company
    const queueRef = ref(database, `queue/${companyId}`);
    const ticketRef = ref(database, `ticket/${companyId}`);
    
    // Set up the listener
    const unsubscribe = onValue(queueRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data && typeof data.current === 'number') {
        setQueueNumber(data.current);
      }
    });
    const unsubscribeTicket = onValue(ticketRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data && typeof data.current === 'number') {
        setTicketNumber(data.current.toString());
      }
    });

    // Cleanup function to remove the listener when component unmounts
    return () => {
      off(queueRef, 'value', unsubscribe);
      off(ticketRef, 'value', unsubscribeTicket);
    };
  }, [companyId]);

  // Format the display number when queueNumber changes
  useEffect(() => {
    if (queueNumber > 0) {
      // Format number with leading zeros (e.g., A001, A010, A100)
      const formattedNumber = queueNumber.toString().padStart(3, '0');
      setDisplayNumber(`${queuePrefix}${formattedNumber}`);
    } else {
      setDisplayNumber(`${queuePrefix}000`);
    }

    if (ticketNumber > 0) {
      const formattedNumber = ticketNumber.toString().padStart(3, '0');
      setDisplayTicketNumber(`${queuePrefix}${formattedNumber}`);
    } else {
      setDisplayTicketNumber(`${queuePrefix}000`);
    }
  }, [queueNumber, queuePrefix, ticketNumber]);
  
  const positionStyle = {
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
    width: position.width || '30%',
    height: position.height || '31%',
  };

  const backgroundClass = showBackground ? bgColor : '';

  return (
    <div 
      className={`absolute ${backgroundClass} rounded-lg flex items-start justify-center pt-0 ${className}`}
      style={positionStyle}
    >
      {/* Main queue number - centered */}
      <div 
        className={`font-bold ${textColor}`}
        style={{ 
          fontFamily: 'Gothic, sans-serif',
          fontWeight: 'bold',
          fontSize: 'clamp(2rem, 10vw, 8.4rem)'
        }}
      >
        {displayNumber}
      </div>
      
      {/* Small queue number - bottom right corner */}
      <div 
        className={`absolute bottom-1 right-18 font-bold ${textColor}`}
        style={{ 
          fontFamily: 'Gothic, sans-serif',
          fontSize: 'clamp(0.8rem, 2.5vw, 3rem)'
        }}
      >
        {displayTicketNumber}
      </div>
    </div>
  );
}
