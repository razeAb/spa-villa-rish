import Navbar from "../components/Navbar";
import HeroLanding from "../components/HeroLanding";
import VipPackage from "../components/VipPackage";
import TurkishHammamPackage from "../components/TurkishHammamPackage";
import SpaDayPackage from "../components/SpaDayPackage";
import ServicesPage from "../components/ServicesPage";
import VillaStayPage from "../components/VillaStayPage";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar />
      <HeroLanding />
      <VipPackage />
      <TurkishHammamPackage />
      <SpaDayPackage />
      <ServicesPage />
      <VillaStayPage />
    </div>
  );
}
