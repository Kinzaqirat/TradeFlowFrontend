import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/store/authContext";
import { ThemeProvider } from "@/store/themeContext";

export const metadata: Metadata = {
  title: "TradeFlow Journal",
  description: "Professional Trading Journal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
