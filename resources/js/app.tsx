import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./src/assets/scss/main.scss";
import Navbar from "./src/layouts/navbar";
import Dashboard from "./src/pages/DashBoard/Dashboard";
import Sidebar from "./src/layouts/Sidebar";
import Footer from "./src/layouts/Footer";
import Login from "./src/pages/auth/pages/Login";

function AppWrapper() {
    const location = useLocation();
    const hideFooter = location.pathname === "/login";

    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="page">
                <div className="page__container">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </div>
            </main>
            {!hideFooter && <Footer />}
        </>
    );
}

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(
    <BrowserRouter>
        <AppWrapper />
    </BrowserRouter>
);
