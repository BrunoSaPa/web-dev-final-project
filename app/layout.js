import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BootstrapClient from "./components/BootstrapClient";
import AuthSessionProvider from "./components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mexican Wildlife | Protecting Endangered Species",
  description: "Discover and protect Mexico's 1,000+ endangered species.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <AuthSessionProvider session={session}>
          <Navbar />
          <main className="flex-grow-1">
            {children}
          </main>
          <Footer />
          <BootstrapClient />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
