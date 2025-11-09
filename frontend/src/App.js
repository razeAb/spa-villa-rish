// src/App.js
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home.jsx";
import VipPackagePage from "./pages/VipPackagePage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import AdminConsole from "./pages/AdminConsole.jsx";
import "./index.css";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="vip-package" element={<VipPackagePage />} />
          <Route path="booking" element={<BookingPage />} />
        </Route>
        <Route path="/admin" element={<AdminConsole />} />
      </Routes>
    </AnimatePresence>
  );
}
