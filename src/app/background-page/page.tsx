'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import QueueElement from '@/components/QueueElement';
import { database, ref, set, onValue, type DataSnapshot, type CompanyId } from '@/lib/firebase';
import { getPrinterServiceUrl } from '@/lib/printerConfig';

const ticketKeys = ['1', '2', '3', '4'];

export default function BackgroundPage() {
  const [printStatus, setPrintStatus] = useState('Ready');
  const [currentTicketNumbers, setCurrentTicketNumbers] = useState({
    A: 0,
    B: 0,
    C: 0,
    D: 0
  });
  const [lastPrintTime, setLastPrintTime] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  // Listen to ticket numbers from database
  useEffect(() => {
    const companies: CompanyId[] = ['A', 'B', 'C', 'D'];
    const unsubscribes: (() => void)[] = [];

    companies.forEach(companyId => {
      const ticketRef = ref(database, `ticket/${companyId}`);
      const unsubscribe = onValue(ticketRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data && typeof data.current === 'number') {
          setCurrentTicketNumbers(prev => ({
            ...prev,
            [companyId]: data.current
          }));
        }
      });
      unsubscribes.push(unsubscribe);
    });

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Function to increment ticket number for a company and return the new number
  const incrementTicketNumber = async (companyId: CompanyId): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const ticketRef = ref(database, `ticket/${companyId}`);
        
        // Get current ticket number
        onValue(ticketRef, (snapshot: DataSnapshot) => {
          const data = snapshot.val();
          const currentTicket = data?.current || 0;
          const newTicketNumber = currentTicket + 1;
          
          // Update the ticket number in the database
          set(ticketRef, {
            current: newTicketNumber,
          });
          console.log("new ticket number: " + newTicketNumber);
          resolve(newTicketNumber);
        }, { onlyOnce: true }); // Use onlyOnce to prevent continuous listening
        
      } catch (error) {
        console.error('Error incrementing ticket number:', error);
        reject(error);
      }
    });
  };

  // Load image to canvas function (reused from PrintReceipt.tsx)
  const loadImageToCanvas = (imagePath: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas);
      };
      
      img.onerror = () => {
        reject(`Failed to load image: ${imagePath}`);
      };
      
      img.src = imagePath;
    });
  };

  // Load images and print function (reused from PrintReceipt.tsx)
  const loadImagesAndPrint = async (ticketNumber: string, id: CompanyId) => {
    try {
      // Load both images based on ID
      const [firstImageCanvas, secondImageCanvas] = await Promise.all([
        loadImageToCanvas(`/ticket_${id.toLowerCase()}_01.png`),
        loadImageToCanvas(`/ticket_${id.toLowerCase()}_02.png`)
      ]);

      // Create builder object
      const builder = new (window as any).epson.ePOSBuilder();

      // 1. Print first image (ticket_{id}_01.png)
      const firstImageContext = firstImageCanvas.getContext('2d');
      if (firstImageContext) {
        builder.addImage(firstImageContext, 0, 0, firstImageCanvas.width, firstImageCanvas.height, builder.COLOR_1, builder.MODE_MONO);
      }
      builder.addText('\n');

      // 2. Print ticket number (A000-A999) centered
      builder.addTextAlign(builder.ALIGN_CENTER);
      builder.addTextFont(builder.FONT_A);
      builder.addTextSize(3, 3); // Large text
      builder.addTextStyle(false, false, true, builder.COLOR_1); // Bold
      builder.addText(ticketNumber + '\n\n');

      // 3. Print QR code (centered) - 50% bigger, using ID instead of ticket number
      builder.addSymbol(`https://travelexpo-iota.vercel.app/${id.toLowerCase()}-page`, 
                       builder.SYMBOL_QRCODE_MODEL_2, 
                       builder.LEVEL_M, 
                       6, 6, 0); // 50% bigger QR code (4 * 1.5 = 6)
      builder.addText('\n');

      // 4. Print second image (ticket_{id}_02.png)
      const secondImageContext = secondImageCanvas.getContext('2d');
      if (secondImageContext) {
        builder.addImage(secondImageContext, 0, 0, secondImageCanvas.width, secondImageCanvas.height, builder.COLOR_1, builder.MODE_MONO);
      }

      // Add feed and cut
      builder.addFeedLine(3);
      builder.addCut(builder.CUT_FEED);

      // Get the generated XML
      const xmlRequest = builder.toString();
      // console.log('Image Print XML:', xmlRequest);

      const address = getPrinterServiceUrl(60000);

      // Create ePOS-Print object
      const epos = new (window as any).epson.ePOSPrint(address);

      // Handle response
      epos.onreceive = function (res: any) {
        console.log('ePOS Image Response:', res);
        if (res.success) {
          setPrintStatus(`Print successful! ID: ${id}, Ticket: ${ticketNumber}, Code: ${res.code}`);
        } else {
          setPrintStatus(`Print failed: ${res.code} - ${res.status || 'Unknown error'}`);
        }
      };

      // Handle error
      epos.onerror = function (err: any) {
        setPrintStatus(`Print Error: ${err.status}`);
      };

      // Send the XML
      epos.send(xmlRequest);

    } catch (error) {
      setPrintStatus(`Error loading images: ${error}`);
    }
  };

  // Print ticket function
  const printTicket = (companyId: CompanyId, newTicketNum?: number) => {
    if (typeof (window as any).epson === 'undefined') {
      setPrintStatus('SDK not loaded');
      return;
    }

    // Check cooldown (1 second = 1000ms)
    const currentTime = Date.now();
    if (currentTime - lastPrintTime < 1000) {
      setPrintStatus(`Cooldown active - please wait ${Math.ceil((1000 - (currentTime - lastPrintTime)) / 1000)} second(s)`);
      return;
    }
    
    // Set cooldown
    setLastPrintTime(currentTime);
    setIsOnCooldown(true);
    
    setPrintStatus(`Loading images for ID ${companyId} and printing...`);

    // Use the new ticket number if provided, otherwise fall back to current state
    const currentTicketNum = newTicketNum ?? currentTicketNumbers[companyId];
    const ticketNumber = `${companyId}${currentTicketNum.toString().padStart(3, '0')}`;
    
    // Load images and print with specified ID
    loadImagesAndPrint(ticketNumber, companyId);

    // Clear cooldown after 1 second
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 1000);
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // Check if cooldown is active
      if (isOnCooldown) {
        return;
      }

      const key = event.key.toLowerCase();
      let companyId: CompanyId | null = null;
      
      switch (key) {
        case ticketKeys[0]:
          companyId = 'A';
          break;
        case ticketKeys[1]:
          companyId = 'B';
          break;
        case ticketKeys[2]:
          companyId = 'C';
          break;
        case ticketKeys[3]:
          companyId = 'D';
          break;
      }
      
      if (companyId) {
        try {
          const newTicketNumber = await incrementTicketNumber(companyId);
          printTicket(companyId, newTicketNumber);
        } catch (error) {
          console.error('Error incrementing ticket number:', error);
          setPrintStatus(`Error incrementing ticket number: ${error}`);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOnCooldown, currentTicketNumbers]);

  return (
    <>
      <Script src="/js/epos-print-5.0.0.js" strategy="beforeInteractive" />
      <style jsx>{`
        @font-face {
          font-family: 'Gothic';
          src: url('/GOTHIC.TTF') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        .responsive-bg-image {
          /* Always maintain aspect ratio and fit width to screen */
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: contain;
          object-position: center;
        }
        
        .image-overlay-container {
          /* Container that matches the background image's dimensions and position */
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 100vh;
          max-width: calc(100vh * 16/9); /* Adjust this ratio to match your actual image aspect ratio */
          max-height: calc(100vw * 9/16); /* Inverse of the above ratio */
        }
      `}</style>
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Responsive Background Image */}
        <img 
          src="/background.png" 
          alt="Queue Display Background"
          className="responsive-bg-image"
        />
        
        {/* Queue Elements - Positioned relative to background image */}
        <div className="image-overlay-container z-10">
          {/* A999 (Pink) - Top Left area of the image */}
          <QueueElement
            companyId="A"
            queuePrefix="A"
            color="pink"
            position={{
              top: '18%',
              left: '36%',
              width: '30%',
              height: '31%'
            }}
          />
          
          {/* B999 (Green) - Top Right area of the image */}
          <QueueElement
            companyId="B"
            queuePrefix="B"
            color="green"
            position={{
              top: '18%',
              right: '2.8%',
              width: '30%',
              height: '31%'
            }}
          />
          
          {/* C999 (Orange/Yellow) - Bottom Left area of the image */}
          <QueueElement
            companyId="C"
            queuePrefix="C"
            color="orange"
            position={{
              bottom: '5%',
              left: '36%',
              width: '30%',
              height: '31%'
            }}
          />
          
          {/* D999 (Blue) - Bottom Right area of the image */}
          <QueueElement
            companyId="D"
            queuePrefix="D"
            color="blue"
            position={{
              bottom: '5%',
              right: '2.8%',
              width: '30%',
              height: '31%'
            }}
          />
        </div>
        
        {/* Print Status Display - Fixed position at bottom */}
        <div className={`fixed bottom-4 left-4 px-4 py-2 rounded-lg font-mono text-sm z-20 ${
          isOnCooldown 
            ? 'bg-red-600 bg-opacity-90 text-white' 
            : 'bg-black bg-opacity-75 text-white'
        }`}>
          <div>Print Status: {printStatus}</div>
          {isOnCooldown && (
            <div className="mt-1 text-xs font-bold text-yellow-300">
              ⏳ COOLDOWN ACTIVE - Please wait...
            </div>
          )}
          <div className="mt-1 text-xs opacity-75">
            Current Tickets - A:{currentTicketNumbers.A.toString().padStart(3, '0')} 
            B:{currentTicketNumbers.B.toString().padStart(3, '0')} 
            C:{currentTicketNumbers.C.toString().padStart(3, '0')} 
            D:{currentTicketNumbers.D.toString().padStart(3, '0')}
          </div>
        </div>
      </div>
    </>
  );
}
