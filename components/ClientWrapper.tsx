'use client';

import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import { Progress } from "@chakra-ui/react";

export default function ClientWrapper({ children  }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {isLoading && (
        <div className="w-full bg-black">
          <Progress size='xs' isIndeterminate style={{ backgroundClip: 'text', backgroundColor: 'blue' }} />
        </div>
      )}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}