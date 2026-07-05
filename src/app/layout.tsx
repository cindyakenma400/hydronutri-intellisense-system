import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <Sidebar />

          <div className="flex-1 min-h-screen bg-gray-100 flex flex-col">
            <Navbar />

            <main className="flex-1 p-8">
              {children}
            </main>

            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}