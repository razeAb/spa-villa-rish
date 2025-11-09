import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FloatingActions from "./FloatingActions";
import SectionProgress from "./SectionProgress.jsx";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar />
      <FloatingActions />
      <SectionProgress />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
