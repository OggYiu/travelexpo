declare global {
  interface Window {
    epson: {
      ePOSPrint: new (address: string) => ePOSPrint;
      ePOSBuilder: new () => ePOSBuilder;
    };
  }

  const epson: {
    ePOSPrint: new (address: string) => ePOSPrint;
    ePOSBuilder: new () => ePOSBuilder;
  };

  interface ePOSPrint {
    onreceive: ((response: ePOSResponse) => void) | null;
    onerror: ((error: ePOSError) => void) | null;
    send: (xml: string) => void;
  }

  interface ePOSBuilder {
    // Text formatting methods
    addTextLang: (lang: string) => void;
    addTextSmooth: (smooth: boolean) => void;
    addTextAlign: (align: number) => void;
    addTextFont: (font: number) => void;
    addTextSize: (width: number, height: number) => void;
    addTextStyle: (reverse: boolean, underline: boolean, emphasis: boolean, color: number) => void;
    addText: (text: string) => void;
    
    // Symbol/QR code methods
    addSymbol: (data: string, type: number, level: number, width: number, height: number, rotation: number) => void;
    
    // Image methods
    addImage: (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: number, mode: number) => void;
    
    // Feed and cut methods
    addFeedLine: (lines: number) => void;
    addCut: (type: number) => void;
    
    // Convert to XML string
    toString: () => string;
    
    // Constants for alignment
    readonly ALIGN_LEFT: number;
    readonly ALIGN_CENTER: number;
    readonly ALIGN_RIGHT: number;
    
    // Constants for fonts
    readonly FONT_A: number;
    readonly FONT_B: number;
    readonly FONT_C: number;
    readonly FONT_D: number;
    readonly FONT_E: number;
    
    // Constants for symbols
    readonly SYMBOL_QRCODE_MODEL_2: number;
    
    // Constants for error correction levels
    readonly LEVEL_L: number;
    readonly LEVEL_M: number;
    readonly LEVEL_Q: number;
    readonly LEVEL_H: number;
    
    // Constants for cut types
    readonly CUT_NO_FEED: number;
    readonly CUT_FEED: number;
    readonly CUT_RESERVE: number;
    
    // Constants for colors
    readonly COLOR_NONE: number;
    readonly COLOR_1: number;
    readonly COLOR_2: number;
    readonly COLOR_3: number;
    readonly COLOR_4: number;
    
    // Constants for image modes
    readonly MODE_MONO: number;
    readonly MODE_GRAY16: number;
  }

  interface ePOSResponse {
    success: boolean;
    code: string;
    status: string;
    battery?: string;
    printjobid?: string;
  }

  interface ePOSError {
    status: string;
  }
}

export {};
