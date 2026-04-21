import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Word Pronunciation Practice",
  description: "Practice English word pronunciation with speech recognition",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
