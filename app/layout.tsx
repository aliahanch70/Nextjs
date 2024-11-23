import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import { ReactNode } from 'react';
const inter = Inter({ subsets: ["latin"] });
import { Providers } from './providers'
import ClientWrapper from "@/components/ClientWrapper";
import { ThemeProvider } from '@/components/ThemeProvider';
import Footer from "@/components/Footer";
import { LoadingProgress } from "@/components/LoadingProgress";

export const metadata: Metadata = {
  title: "cp and gems shop",
  description: "buy anything you want",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
   
     <html lang="en" suppressHydrationWarning>
     <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
       <ThemeProvider
         attribute="class"
         defaultTheme="system"
         enableSystem
         disableTransitionOnChange
       >
        
         <main className="flex-1">
         <Providers>
          <LoadingProgress />
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
         </main>
         <Footer />
       </ThemeProvider>
     </body>
   </html>
  );
}
