import { useState, useEffect } from 'react';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Only set initial time, no interval needed for this use case
    setCurrentTime(new Date());
  }, []);

  return currentTime;
}