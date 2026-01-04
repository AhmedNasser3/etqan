import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./src/assets/scss/main.scss";
import Navbar from "./src/layouts/navbar";
import Dashboard from "./src/pages/DashBoard/Dashboard";
import Sidebar from "./src/layouts/Sidebar";
import Footer from "./src/layouts/Footer";
import { Login } from "./src/pages/auth";
const root = createRoot(document.getElementById("app") as HTMLElement);

root.render(
    <BrowserRouter>
        <div>
            <Navbar />
            <Sidebar />
            <main className="page">
                <div className="page__container">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login-student" element={<Login />} />
                    </Routes>
                </div>
            </main>
            <Footer />
        </div>
    </BrowserRouter>
);
