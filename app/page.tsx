import { PublicNavbar } from "@/components/layout/public-navbar";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <Hero />
      <Features />
      <Footer />
    </>
  );
}