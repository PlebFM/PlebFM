/* eslint-disable @next/next/no-head-element */
import "./globals.css"
import { Manrope } from '@next/font/google'

const manrope = Manrope({
  weight: 'variable',
  subsets: ['latin'],
  variable: "--font-manrope"
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head></head>
      <body>
        {children}
      </body>
    </html>
  );
}