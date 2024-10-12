import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import { ReactNode } from 'react';
import Navbar from "@/components/Navbar";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "cp and gems shop",
  description: "buy anything you want",
};

// app/layout.tsx


export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  
  return (
    
    <html lang="en" className="dark">
      
      <body>
      <Navbar/>
        {children}
        </body>
      
    </html>
  );
}
