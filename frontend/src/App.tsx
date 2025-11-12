import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import NoAutorizadoPage from "./pages/NoAutorizadoPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal: Login */}
        <Route path="/" element={<Login />} />

        {/* Panel principal: Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
s
        <Route path="/no-autorizado" element={<NoAutorizadoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
