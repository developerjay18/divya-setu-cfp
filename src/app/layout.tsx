import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const onest = Onest({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Divya Setu - Crowdfunding Platform",
  description:
    "A platform for NGOs, religious organizations, and institutes to raise funds for their causes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onest.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
