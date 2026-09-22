import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Each page sets its own title; this template frames it.
  title: {
    default: "ForgeTrack Engineering Operations",
    template: "%s | ForgeTrack",
  },
  description:
    "ForgeTrack helps engineering teams manage inventory, equipment, projects, and field reports.",
  applicationName: "ForgeTrack",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" />
        <Script
          src="https://widget.swiftagents.org/dist/widget-ui.js"
          data-company-id="86fef8e9-d1aa-469f-86a9-38850c362724"
          data-api-key={process.env.SWIFT_API_KEY}
          defer
        ></Script>
      </body>
    </html>
  );
}
