import Navbar from "../components/Navbar";
import HeroLanding from "../components/HeroLanding";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar />
      <HeroLanding />
    </div>
  );
}
