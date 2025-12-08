import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/footer/Footer";
import { DolarProvider } from "@/contexts/DolarContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <DolarProvider>
      <NavBar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </DolarProvider>
  );
}