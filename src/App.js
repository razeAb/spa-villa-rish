// src/App.js
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
