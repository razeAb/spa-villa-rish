import { motion } from "framer-motion";
import HeroLanding from "../components/HeroLanding";
import VipPackage from "../components/VipPackage";
import TurkishHammamPackage from "../components/TurkishHammamPackage";
import SpaDayPackage from "../components/SpaDayPackage";
import ServicesPage from "../components/ServicesPage";
import VillaStayPage from "../components/VillaStayPage";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-0"
    >
      <HeroLanding />
      <VipPackage />
      <TurkishHammamPackage />
      <SpaDayPackage />
      <ServicesPage />
      <VillaStayPage />
    </motion.div>
  );
}
