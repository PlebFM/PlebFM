"use client"

/* eslint-disable @next/next/no-head-element */
import "./globals.css"
import { Manrope } from '@next/font/google'
import { SessionProvider } from "next-auth/react";

const manrope = Manrope({
  weight: 'variable',
  subsets: ['latin'],
  variable: "--font-manrope"
})

export default function RootLayout({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head></head>
      <body>
        {/* <SessionProvider refetchOnWindowFocus={false}> */}
        <SessionProvider>
          <>{children}</>
        </SessionProvider>
      </body>
    </html>
  );
}