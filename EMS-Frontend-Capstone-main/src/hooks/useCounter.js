// src/hooks/useCounter.js
import { useEffect, useState } from "react";

export default function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (start === end) return;

    const increment = Math.max(1, Math.floor(end / (duration / 16))); 
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}
