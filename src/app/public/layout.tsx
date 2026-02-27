import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/footer/Footer";
import { DolarProvider } from "@/contexts/DolarContext";
import NavigationProgress from "@/components/ui/NavigationProgress";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <DolarProvider>
      <NavigationProgress />
      <NavBar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </DolarProvider>
  );
}