import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./src/assets/scss/main.scss";
import Navbar from "./src/layouts/navbar";
import Sidebar from "./src/layouts/Sidebar";
import Footer from "./src/layouts/Footer";
import Login from "./src/pages/auth/pages/Login";
import Dashboard from "./src/pages/DashBoard/Dashboard";
import UserSidebar from "./src/layouts/userDashboard/UserSidebar";
import UserNavbar from "./src/layouts/userDashboard/userNavbar";
import UserDashboard from "./src/pages/DashBoard/UserDashboard/UserDashboard";
import Plans from "./src/pages/DashBoard/UserDashboard/widgets/Plans";
import UserProgress from "./src/pages/DashBoard/UserDashboard/userProgress/UserProgress";
import UserComplexes from "./src/pages/DashBoard/UserDashboard/usercomplexes/UserComplexes";
import UserListening from "./src/pages/DashBoard/UserDashboard/userListening/UserListening";
import UserPresence from "./src/pages/DashBoard/UserDashboard/userPresence/UserPresence";
import Certificate from "./src/pages/DashBoard/UserDashboard/certificate/certificate";
import Register from "./src/pages/auth/pages/Register";
import TeacherRegister from "./src/pages/auth/pages/TeacherRegister";
import TeacherNavbar from "./src/layouts/teacherDashboard/TeacherNavbar";
import TeacherSidebar from "./src/layouts/teacherDashboard/TeacherSidebar";
import TeacherDashboard from "./src/pages/DashBoard/teacherDashboard/TeacherDashboard";
import TeacherStudents from "./src/pages/DashBoard/teacherDashboard/widgets/teacherStudents/TeacherStudents";
import TeacherPlan from "./src/pages/DashBoard/teacherDashboard/widgets/teacherPlan/TeacherPlan";
import TeacherMotivate from "./src/pages/DashBoard/teacherDashboard/widgets/TeacherMotivate/TeacherMotivate";
import TeacherAttendance from "./src/pages/DashBoard/teacherDashboard/widgets/TeacherAttendance/TeacherAttendance";
import TeacherRoom from "./src/pages/DashBoard/teacherDashboard/widgets/TeahcerRoom/TeahcerRoom";
import TeacherReports from "./src/pages/DashBoard/teacherDashboard/widgets/TeacherReports/TeacherReports";
import TestimonialsView from "./src/pages/DashBoard/home/TestimonialsView/TestimonialsView";

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
        </>
    );
}
function TeacehrLayout() {
    return (
        <>
            <TeacherNavbar />
            <TeacherSidebar />
            <main className="page">
                <div className="page__container">
                    <Outlet />
                </div>
            </main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Admin Routes */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/teacher-view"
                        element={<TestimonialsView />}
                    />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/teacher-register"
                        element={<TeacherRegister />}
                    />
                </Route>

                {/* Teacher Dashboard */}
                <Route path="/teacher-dashboard" element={<TeacehrLayout />}>
                    <Route index element={<TeacherDashboard />} />
                    <Route path="students" element={<TeacherStudents />} />
                    <Route path="plan" element={<TeacherPlan />} />
                    <Route path="motivation" element={<TeacherMotivate />} />
                    <Route path="attendance" element={<TeacherAttendance />} />
                    <Route path="room" element={<TeacherRoom />} />
                    <Route path="reports" element={<TeacherReports />} />
                </Route>

                {/* User Dashboard - Legacy */}
                <Route path="/user-dashboard" element={<UserLayout />}>
                    <Route index element={<UserDashboard />} />
                    <Route path="plans" element={<Plans />} />
                    <Route path="user-progress" element={<UserProgress />} />
                    <Route path="user-complexes" element={<UserComplexes />} />
                    <Route path="user-listesning" element={<UserListening />} />
                    <Route path="user-presence" element={<UserPresence />} />
                    <Route path="user-certificate" element={<Certificate />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
