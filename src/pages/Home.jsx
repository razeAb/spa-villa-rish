import Navbar from "../components/Navbar";
import HeroLanding from "../components/HeroLanding";
import VipPackage from "../components/VipPackage";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar />
      <HeroLanding />
      <VipPackage />
    </div>
  );
}
