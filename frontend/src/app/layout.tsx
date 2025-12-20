/**
 * Root layout with CopilotKit provider.
 *
 * This sets up the CopilotKit context for the entire application,
 * connecting to our RAG agent via the API route.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interactive RAG Agent",
  description:
    "Human-in-the-loop RAG agent demonstrating CopilotKit useAgent hook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="rag_agent"
          showDevConsole={true}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
