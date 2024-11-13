'use client';

import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import { Progress } from "@chakra-ui/react";

export default function ClientWrapper({ children  }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}