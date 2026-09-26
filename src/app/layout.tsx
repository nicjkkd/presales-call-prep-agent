import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Presales Call Prep Agent",
  description:
    "Turns a job post or project description into a structured prep plan for a presales discovery call.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
