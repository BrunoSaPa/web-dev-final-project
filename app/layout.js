import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BootstrapClient from "./components/BootstrapClient";
import AuthSessionProvider from "./components/SessionProvider";

// Font configuration for optimal performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the website
export const metadata = {
  title: "Mexican Wildlife | Protecting Endangered Species",
  description: "Discover and protect Mexico's 1,000+ endangered species.",
};

// Root layout component that wraps all pages
export default async function RootLayout({ children }) {
  // Get the current user session from NextAuth
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        {/* Provide session context to all child components */}
        <AuthSessionProvider session={session}>
          {/* Navigation bar at the top */}
          <Navbar />
          {/* Main content area that grows to fill available space */}
          <main className="flex-grow-1">
            {children}
          </main>
          {/* Footer at the bottom */}
          <Footer />
          {/* Bootstrap JavaScript initialization */}
          <BootstrapClient />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
