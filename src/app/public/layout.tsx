import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/footer/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}