import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Pronunciation Practice",
  description: "Practice English word pronunciation with speech recognition",
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
