import { createRoot } from "react-dom/client";
import {
    BrowserRouter,
    Routes,
    Route,
    Outlet,
    Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import CenterDashboard from "./src/pages/DashBoard/Center/CenterDashboard";
import CenterSidebar from "./src/layouts/centerDashboard/CenterSidebar";
import StudentApproval from "./src/pages/DashBoard/Center/Students/Approval/StudentApproval";
import StaffAttendance from "./src/pages/DashBoard/Center/Attendance/Staff/StaffAttendance";
import DomainLinks from "./src/pages/DashBoard/Center/Links/DomainLinks";
import StaffApproval from "./src/pages/DashBoard/Center/Staff/Approval/StaffApproval";
import UserSuspend from "./src/pages/DashBoard/Center/Users/Suspend/UserSuspend";
import FinancialDashboard from "./src/pages/DashBoard/Financial/Dashboard/FinancialDashboard";
import PayrollExport from "./src/pages/DashBoard/Financial/Export/PayrollExport";
import PayrollReports from "./src/pages/DashBoard/Financial/Reports/PayrollReports";
import PayrollSettings from "./src/pages/DashBoard/Financial/Settings/PayrollSettings";
import MotivationSupervisor from "./src/pages/DashBoard/Supervisors/Motivation/MotivationSupervisor";
import EducationalSupervisor from "./src/pages/DashBoard/Supervisors/Education/EducationSupervisor";
import ListeningRooms from "./src/pages/DashBoard/Supervisors/Rooms/ListeningRooms";
import StudentAffairs from "./src/pages/DashBoard/Supervisors/Students/StudentsAffairs";
import ReportsDashboard from "./src/pages/DashBoard/Reports/ReportsDashboard";
import AuditLogPage from "./src/pages/DashBoard/AuditLogs";
import CenterRegister from "./src/pages/auth/pages/CenterRegister";
import CentersMangement from "./src/pages/DashBoard/Admin/Center/CentersMangement";
import Mosque from "./src/pages/DashBoard/Admin/mosque/MosquesManagement";
import CirclesManagement from "./src/pages/DashBoard/Center/Circles/CirclesManagement";
import PlansManagement from "./src/pages/DashBoard/Center/Plans/PlansManagement";
import PlanDetailsManagement from "./src/pages/DashBoard/Center/PlansDetails/PlanDetailsManagement";
import SchedulesManagement from "./src/pages/DashBoard/Center/PlanCircleSchedule/SchedulesManagement";
import StudentBookingsManagement from "./src/pages/DashBoard/Center/useStudentBookings/StudentBookingsManagement";
import StudentAchievementsManagement from "./src/pages/DashBoard/Center/StudentAchievements/StudentAchievementsManagement";
import DomainRequestsManagement from "./src/pages/DashBoard/Center/useDomainRequests/DomainRequestsManagement";
import SalaryRulesManagement from "./src/pages/DashBoard/Center/SalaryRules/SalaryRulesManagement";
import SpecialRequestsManagement from "./src/pages/DashBoard/Center/SpecialRequests/SpecialRequestsManagement";
import PendingCentersApproval from "./src/pages/DashBoard/Center/PendingCenters/PendingCentersApproval";
import CenterPage from "./src/pages/DashBoard/Center/pages/Center";
import CentersPage from "./src/pages/DashBoard/Center/pages/CentersPage";
import EditAccountPage from "./src/pages/DashBoard/AccountEdit/EditAccountPage";
import MeetingsManagement from "./src/pages/DashBoard/Meeting/MeetingsManagement";
import TeacherAchievementList from "./src/pages/DashBoard/teacherDashboard/widgets/TeacherMotivate/TeacherAchievementList";
import SpecialRequestFormPage from "./src/pages/DashBoard/UserDashboard/SpecialRequest/SpecialRequestFormPage";

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

function TeacherLayout() {
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

function CenterLayout() {
    return (
        <>
            <TeacherNavbar />
            <CenterSidebar />
            <main className="page">
                <div className="page__container">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
function PublicLayout() {
    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="page">
                <div className="page__container">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
function DashLayout() {
    return (
        <>
            <Navbar />
            <Sidebar />
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
                <Route path="/" element={<DashLayout />}>
                    {" "}
                    {/* غيرت من /* لـ / */}
                    <Route index element={<Dashboard />} />
                    <Route path="teacher-view" element={<TestimonialsView />} />
                    <Route
                        path="center-register"
                        element={<CenterRegister />}
                    />
                    <Route
                        path="register/:centerSlug?"
                        element={<Register />}
                    />
                    <Route path="login" element={<Login />} />
                    <Route
                        path=":centerSlug?/teacher-register"
                        element={<TeacherRegister />}
                    />
                    {/* ضعه في الأول عشان priority عالي */}
                    <Route index element={<CentersPage />} />
                    <Route path=":centerSlug" element={<CenterPage />} />
                </Route>

                {/* خارج DashLayout - للصفحات العامة */}
                <Route path="/public/*" element={<PublicLayout />}>
                    <Route path=":centerSlug" element={<CenterPage />} />
                </Route>

                <Route path="/:complexSlug?">
                    <Route path="center-dashboard/*" element={<CenterLayout />}>
                        <Route index element={<CenterDashboard />} />
                        <Route
                            path="students/approval"
                            element={<StudentApproval />}
                        />

                        <Route
                            path="staff-attendance"
                            element={<StaffAttendance />}
                        />
                        <Route path="domian-links" element={<DomainLinks />} />
                        <Route
                            path="staff-approval"
                            element={<StaffApproval />}
                        />
                        <Route path="user-suspend" element={<UserSuspend />} />
                        <Route
                            path="financial-dashboard"
                            element={<FinancialDashboard />}
                        />
                        <Route
                            path="payroll-exports"
                            element={<PayrollExport />}
                        />
                        <Route
                            path="payroll-reports"
                            element={<PayrollReports />}
                        />
                        <Route
                            path="payroll-settings"
                            element={<PayrollSettings />}
                        />
                        <Route
                            path="education-supervisor"
                            element={<EducationalSupervisor />}
                        />
                        <Route
                            path="motivation-supervisor"
                            element={<MotivationSupervisor />}
                        />
                        <Route
                            path="rooms-supervisor"
                            element={<ListeningRooms />}
                        />
                        <Route
                            path="student-supervisor"
                            element={<StudentAffairs />}
                        />
                        <Route
                            path="report-dashboard"
                            element={<ReportsDashboard />}
                        />
                        <Route
                            path="center-manegment"
                            element={<CentersMangement />}
                        />
                        <Route
                            path="circle-manegment"
                            element={<CirclesManagement />}
                        />
                        <Route
                            path="plans-manegment"
                            element={<PlansManagement />}
                        />
                        <Route
                            path="plans-details-manegment"
                            element={<PlanDetailsManagement />}
                        />
                        <Route
                            path="shedule-manegment"
                            element={<SchedulesManagement />}
                        />
                        <Route path="mosque-manegment" element={<Mosque />} />
                        <Route
                            path="booking-manegment"
                            element={<StudentBookingsManagement />}
                        />
                        <Route
                            path="achieve-manegment"
                            element={<StudentAchievementsManagement />}
                        />
                        <Route
                            path="request-domain-manegment"
                            element={<DomainRequestsManagement />}
                        />
                        <Route
                            path="teaceher-salary-manegment"
                            element={<SalaryRulesManagement />}
                        />
                        <Route
                            path="special-request-manegment"
                            element={<SpecialRequestsManagement />}
                        />
                        <Route
                            path="centers-approval"
                            element={<PendingCentersApproval />}
                        />
                        <Route
                            path="meeting-management"
                            element={<MeetingsManagement />}
                        />
                        <Route path="audit-log" element={<AuditLogPage />} />
                    </Route>

                    <Route
                        path="teacher-dashboard/*"
                        element={<TeacherLayout />}
                    >
                        <Route index element={<TeacherDashboard />} />
                        <Route path="students" element={<TeacherStudents />} />
                        <Route path="plan" element={<TeacherPlan />} />
                        <Route
                            path="motivation"
                            element={<TeacherAchievementList />}
                        />
                        <Route
                            path="attendance"
                            element={<TeacherAttendance />}
                        />
                        <Route path="room" element={<TeacherRoom />} />
                        <Route path="reports" element={<TeacherReports />} />
                        <Route path="certificates" element={<Certificate />} />
                    </Route>

                    <Route path="user-dashboard/*" element={<UserLayout />}>
                        <Route index element={<UserDashboard />} />
                        <Route path="plans" element={<Plans />} />
                        <Route
                            path="user-progress"
                            element={<UserProgress />}
                        />
                        <Route
                            path="user-setting"
                            element={<EditAccountPage />}
                        />
                        <Route
                            path="user-special"
                            element={<SpecialRequestFormPage />}
                        />
                        <Route
                            path="user-complexes"
                            element={<UserComplexes />}
                        />
                        <Route
                            path="user-listesning"
                            element={<UserListening />}
                        />
                        <Route
                            path="user-presence"
                            element={<UserPresence />}
                        />
                        <Route
                            path="user-certificate"
                            element={<Certificate />}
                        />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
                position="top-right"
                gutter={8}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        border: "1px solid hsl(var(--border))",
                    },
                }}
            />
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
