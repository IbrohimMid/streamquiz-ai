import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

/**
 * Typewriter Component
 * 
 * Simulates streaming text effect.
 * Now robust against re-renders and callback changes.
 */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 20,
  onComplete,
  className = "",
  showCursor = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update ref when callback changes to avoid effect re-trigger
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Handle text changes
  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    indexRef.current = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    // If speed is 0 or no text, show immediately
    const safeText = text || "";
    if (speed === 0 || !safeText) {
      setDisplayedText(safeText);
      setIsDone(true);
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }

    timerRef.current = setInterval(() => {
      if (indexRef.current < safeText.length) {
        setDisplayedText((prev) => prev + safeText.charAt(indexRef.current));
        indexRef.current++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsDone(true);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {showCursor && !isDone && (
        <span className="inline-block w-2 h-5 ml-1 align-middle bg-primary-500 animate-blink" />
      )}
    </div>
  );
};