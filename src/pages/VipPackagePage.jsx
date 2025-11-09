import { motion } from "framer-motion";
import VipPackage from "../components/VipPackage";

export default function VipPackagePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <VipPackage />
    </motion.div>
  );
}
