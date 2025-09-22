'use client'; // This makes it a client component

import { useState } from 'react';
import Script from 'next/script'; // For loading external scripts
import { generateReceiptXml } from '@/lib/generateReceiptXml'; // Adjust path as needed

export default function PrintReceipt() {
  const [status, setStatus] = useState('Ready');
  const [currentTicketNumber, setCurrentTicketNumber] = useState(0); // A000-A999 counter

  const handlePrint = () => {
    if (typeof epson === 'undefined') {
      setStatus('SDK not loaded');
      return;
    }
    setStatus('Printing...');

    // Generate XML with dynamic content
    const title = 'KKday'; // Easily changeable
    const subtitle = 'A999';
    const qrData = 'https://example.com/qr-link'; // Or your actual QR content
    const instructions = [
      '1. 一人一籤，憑籤入場。',
      '2. 請耐心排隊等候，若有需要去洗手間，請預先通知在場工作人員，否則需重新取籤排隊。',
      '3. 不准插隊。',
      '4. 如欲選購其他旅行社產品，必需重新取籤排隊。',
      '5. 嚴禁以物品或不同人士代替排隊。',
      '6. 請互相尊重及待人有禮。',
      '7. 如叫號超過10個號碼或以上，請重新取籤，不設補票。',
    ];

    const xml = generateReceiptXml(title, subtitle, qrData, instructions);
    console.log('Generated XML:', xml);

    const ip = '192.168.50.244';
    // Printer address (replace with your printer's IP and Device ID)
    const address = `http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=30000`; // Timeout in ms

    // Create ePOS-Print object
    const epos = new epson.ePOSPrint(address);

    // Handle response
    epos.onreceive = function (res) {
      console.log('ePOS Response:', res);
      if (res.success) {
        setStatus(`Print successful! Code: ${res.code}, Status: ${res.status}, Battery: ${res.battery}`);
      } else {
        setStatus(`Print failed: ${res.code} - ${res.status || 'Unknown error'}`);
      }
    };

    // Handle error
    epos.onerror = function (err) {
      setStatus(`Error: ${err.status}`);
    };

    // Send the XML
    epos.send(xml);
  };

  const handleBuilderPrint = () => {
    if (typeof epson === 'undefined') {
      setStatus('SDK not loaded');
      return;
    }
    setStatus('Printing with Builder...');

    // Create builder object
    const builder = new epson.ePOSBuilder();

    // Configure text settings for title
    builder.addTextLang('zh-cn');  // Chinese language
    builder.addTextSmooth(true);   // Enable smoothing
    builder.addTextAlign(builder.ALIGN_CENTER);  // Center alignment
    builder.addTextFont(builder.FONT_A);  // Font A
    builder.addTextSize(2, 2);  // 2x height/width scaling
    builder.addTextStyle(false, false, true, builder.COLOR_1);  // Bold enabled, first color

    // Add title
    builder.addText('KKday\n');
    
    // Configure text for subtitle
    builder.addTextSize(1, 1);  // Normal size
    builder.addText('A999\n\n');

    // Add QR code
    builder.addSymbol('https://example.com/qr-link', 
                     builder.SYMBOL_QRCODE_MODEL_2, 
                     builder.LEVEL_M, 
                     3, 3, 0);  // width=3, height=3, rotation=0
    builder.addText('\n');

    // Configure text for instructions
    builder.addTextAlign(builder.ALIGN_LEFT);  // Left alignment
    builder.addTextStyle(false, false, false, builder.COLOR_1);  // Normal style, first color
    builder.addText('排隊須知：\n');
    
    // Add instructions
    const instructions = [
      '1. 一人一籤，憑籤入場。',
      '2. 請耐心排隊等候，若有需要去洗手間，請預先通知在場工作人員，否則需重新取籤排隊。',
      '3. 不准插隊。',
      '4. 如欲選購其他旅行社產品，必需重新取籤排隊。',
      '5. 嚴禁以物品或不同人士代替排隊。',
      '6. 請互相尊重及待人有禮。',
      '7. 如叫號超過10個號碼或以上，請重新取籤，不設補票。',
    ];

    instructions.forEach(instruction => {
      builder.addText(instruction + '\n');
    });

    // Add closing message
    builder.addText('\n');
    builder.addTextAlign(builder.ALIGN_CENTER);
    builder.addText('謝謝您的配合！\n');

    // Add feed and cut
    builder.addFeedLine(3);  // 3 lines feed
    builder.addCut(builder.CUT_FEED);  // Partial cut with feed

    // Get the generated XML as a string
    const xmlRequest = builder.toString();
    console.log('Builder Generated XML:', xmlRequest);

    const ip = '192.168.50.244';
    const address = `http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=30000`;

    // Create ePOS-Print object
    const epos = new epson.ePOSPrint(address);

    // Handle response
    epos.onreceive = function (res) {
      console.log('ePOS Builder Response:', res);
      if (res.success) {
        setStatus(`Builder Print successful! Code: ${res.code}, Status: ${res.status}, Battery: ${res.battery}`);
      } else {
        setStatus(`Builder Print failed: ${res.code} - ${res.status || 'Unknown error'}`);
      }
    };

    // Handle error
    epos.onerror = function (err) {
      setStatus(`Builder Error: ${err.status}`);
    };

    // Send the XML
    epos.send(xmlRequest);
  };

  const handleImagePrint = (id: 'A' | 'B' | 'C' | 'D') => {
    if (typeof epson === 'undefined') {
      setStatus('SDK not loaded');
      return;
    }
    setStatus(`Loading images for ID ${id} and printing...`);

    // Generate ticket number A000-A999
    const ticketNumber = `${id}${currentTicketNumber.toString().padStart(3, '0')}`;
    
    // Increment counter for next print (reset to 0 after 999)
    setCurrentTicketNumber((prev) => (prev + 1) % 1000);

    // Load images and print with specified ID
    loadImagesAndPrint(ticketNumber, id);
  };

  const loadImagesAndPrint = async (ticketNumber: string, id: 'A' | 'B' | 'C' | 'D') => {
    try {
      // Load both images based on ID
      const [firstImageCanvas, secondImageCanvas] = await Promise.all([
        loadImageToCanvas(`/ticket_${id.toLowerCase()}_01.png`),
        loadImageToCanvas(`/ticket_${id.toLowerCase()}_02.png`)
      ]);

      // Create builder object
      const builder = new epson.ePOSBuilder();

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
      builder.addSymbol(`https://cayee-guru.vercel.app/${id.toLocaleLowerCase()}-page`, 
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
      console.log('Image Print XML:', xmlRequest);

      const ip = '192.168.50.244';
      const address = `http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=30000`;

      // Create ePOS-Print object
      const epos = new epson.ePOSPrint(address);

      // Handle response
      epos.onreceive = function (res) {
        console.log('ePOS Image Response:', res);
        if (res.success) {
          setStatus(`Image Print successful! ID: ${id}, Ticket: ${ticketNumber}, Code: ${res.code}`);
        } else {
          setStatus(`Image Print failed: ${res.code} - ${res.status || 'Unknown error'}`);
        }
      };

      // Handle error
      epos.onerror = function (err) {
        setStatus(`Image Print Error: ${err.status}`);
      };

      // Send the XML
      epos.send(xmlRequest);

    } catch (error) {
      setStatus(`Error loading images: ${error}`);
    }
  };

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

  return (
    <div>
      <Script src="/js/epos-print-5.0.0.js" strategy="beforeInteractive" />
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Print Receipt (XML)
          </button>
          <button 
            onClick={handleBuilderPrint}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Print Receipt (Builder)
          </button>
          <button 
            onClick={() => handleImagePrint('A')}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            Print A
          </button>
          <button 
            onClick={() => handleImagePrint('B')}
            className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-md"
          >
            Print B
          </button>
          <button 
            onClick={() => handleImagePrint('C')}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Print C
          </button>
          <button 
            onClick={() => handleImagePrint('D')}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
          >
            Print D
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Current ticket number:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono">A</span>
            <input
              type="number"
              min="0"
              max="999"
              value={currentTicketNumber}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.max(0, Math.min(999, value));
                setCurrentTicketNumber(clampedValue);
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono text-black"
              placeholder="000"
            />
          </div>
          <span className="text-xs text-gray-500">
            Next print: A{currentTicketNumber.toString().padStart(3, '0')}
          </span>
        </div>
      </div>
      <p className="mt-4 text-black font-medium">Status: {status}</p>
    </div>
  );
}
