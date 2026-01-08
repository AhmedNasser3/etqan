import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import "./src/assets/scss/main.scss";
import Navbar from "./src/layouts/navbar";
import Sidebar from "./src/layouts/Sidebar";
import Footer from "./src/layouts/Footer";
import Login from "./src/pages/auth/pages/Login";
import Dashboard from "./src/pages/DashBoard/Dashboard";
import TestimonialsView from "./src/pages/DashBoard/TestimonialsView/TestimonialsView";
import UserSidebar from "./src/layouts/userDashboard/UserSidebar";
import UserNavbar from "./src/layouts/userDashboard/userNavbar";
import UserDashboard from "./src/pages/DashBoard/UserDashboard/UserDashboard";
import Plans from "./src/pages/DashBoard/UserDashboard/widgets/Plans";

function MainLayout() {
    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="page">
                <div className="page__container">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </>
    );
}

function UserLayout() {
    return (
        <>
            <UserNavbar />
            <UserSidebar />
            <main className="page">
                <div className="page__container">
                    <Outlet />
                </div>
            </main>
            {/* لو عايز تخفي الفوتر في داشبورد اليوزر سيبه كده */}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/teacher-view"
                        element={<TestimonialsView />}
                    />
                    <Route path="/login" element={<Login />} />
                </Route>

                <Route path="/user-dashboard" element={<UserLayout />}>
                    <Route index element={<UserDashboard />} />
                    <Route path="plans" element={<Plans />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
