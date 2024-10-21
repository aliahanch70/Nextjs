import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css';
import { ReactNode } from 'react';
const inter = Inter({ subsets: ["latin"] });
import { Providers } from './providers'
import ClientWrapper from "@/components/ClientWrapper";

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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
