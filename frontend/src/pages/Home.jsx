import { motion } from "framer-motion";
import HeroLanding from "../components/HeroLanding";
import FeaturedPackages from "../components/FeaturedPackages";
import SpaPhotosCarousel from "../components/SpaPhotosCarousel";
import IndividualTreatments from "../components/IndividualTreatments";
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
      <FeaturedPackages />
      <SpaPhotosCarousel />
      <IndividualTreatments />
      <VillaStayPage />
    </motion.div>
  );
}
