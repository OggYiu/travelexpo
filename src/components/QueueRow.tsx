interface QueueRowProps {
  letter: string;
  currentValue: number;
  onIncrement: () => void;
  onDecrement: () => void;
  color?: string;
  /** Position configuration for responsive placement */
  position?: {
    /** CSS position property (e.g., '18%', '5%') */
    top?: string;
    /** CSS position property (e.g., '18%', '5%') */
    bottom?: string;
    /** CSS position property (e.g., '36%', '2.8%') */
    left?: string;
    /** CSS position property (e.g., '36%', '2.8%') */
    right?: string;
    /** Width as percentage (default: auto) */
    width?: string;
    /** Height as percentage (default: auto) */
    height?: string;
  };
  /** Optional additional CSS classes */
  className?: string;
}

export default function QueueRow({ 
  letter, 
  currentValue, 
  onIncrement, 
  onDecrement, 
  color = 'text-gray-400',
  position,
  className = ''
}: QueueRowProps) {
  const positionStyle = position ? {
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
    width: position.width,
    height: position.height,
  } : {};

  const containerClass = position 
    ? `absolute flex items-center justify-center gap-4 ${className}`
    : `flex items-center justify-center gap-8 mb-8 ${className}`;

  return (
    <div 
      className={containerClass}
      style={positionStyle}
    >
      {/* Minus Button */}
      <button
        onClick={onDecrement}
        className="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
        style={{ fontSize: '2rem', fontWeight: 'bold' }}
      >
        −
      </button>

      {/* Queue Display */}
      <div 
        className={`font-bold ${color} min-w-[200px] text-center`}
        style={{ 
          fontFamily: 'Gothic, sans-serif',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 'bold'
        }}
      >
        {letter}{currentValue.toString().padStart(3, '0')}
      </div>

      {/* Plus Button */}
      <button
        onClick={onIncrement}
        className="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
        style={{ fontSize: '2rem', fontWeight: 'bold' }}
      >
        +
      </button>
    </div>
  );
}
