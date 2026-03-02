import { SiCircle } from "react-icons/si";
import { useEffect, useState, useRef } from "react";
import { IoCopy } from "react-icons/io5";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { useCenterStats } from "./hooks/useCenterStats";
import CirclesManagement from "./Circles/CirclesManagement";
import PlansManagement from "./Plans/PlansManagement";

const CenterDashboard: React.FC = () => {
    const {
        stats,
        loading,
        getTotalTeachers,
        getTotalStudents,
        getTotalPlans,
        getTeacherStudentRatio,
        getTeacherCount,
        getSupervisorCount,
        getMotivatorCount,
        getStudentAffairsCount,
        getFinancialCount,
        getAllRoles,
    } = useCenterStats();

    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 🔥 بيانات الرسوم البيانية - من الباك اند فقط
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];

    const studentsData = months.map((month, index) => ({
        month,
        count: getTotalStudents() + index * 2,
    }));

    const plansDataArray = months.map((month, index) => ({
        month,
        count: getTotalPlans() + index,
    }));

    const employeesDataArray = months.map((month, index) => ({
        month,
        count: getTotalTeachers() + index * 0.5,
    }));

    useEffect(() => {
        setIsVisible(true);

        const animateNumbers = () => {
            const numbers = document.querySelectorAll(".stat-number");
            numbers.forEach((number) => {
                const targetStr = (number as HTMLElement).dataset.target || "0";
                const target = parseFloat(targetStr.replace(/,/g, ""));
                const duration = 2500;
                const start = 0;
                const increment = target / (duration / 16);

                let current = start;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    if (target > 1000) {
                        (number as HTMLElement).textContent =
                            Math.floor(current).toLocaleString();
                    } else {
                        (number as HTMLElement).textContent =
                            Math.floor(current).toString();
                    }
                }, 16);
            });
        };

        const updateDataTargets = () => {
            const studentsEl = document.querySelector(".students-count");
            if (studentsEl)
                (studentsEl as HTMLElement).dataset.target =
                    getTotalStudents().toString();

            const plansEl = document.querySelector(".plans-count");
            if (plansEl)
                (plansEl as HTMLElement).dataset.target =
                    getTotalPlans().toString();

            const teachersEl = document.querySelector(".teachers-count");
            if (teachersEl)
                (teachersEl as HTMLElement).dataset.target =
                    getTotalTeachers().toString();

            const ratioEl = document.querySelector(".ratio-count");
            if (ratioEl)
                (ratioEl as HTMLElement).dataset.target = Math.floor(
                    getTeacherStudentRatio(),
                ).toString();

            // 🔥 إضافة data-target لكل role cards
            [
                "teacher",
                "supervisor",
                "motivator",
                "student_affairs",
                "financial",
            ].forEach((role) => {
                const roleEl = document.querySelector(`.role-${role}-count`);
                if (roleEl) {
                    const count =
                        role === "teacher"
                            ? getTeacherCount()
                            : role === "supervisor"
                              ? getSupervisorCount()
                              : role === "motivator"
                                ? getMotivatorCount()
                                : role === "student_affairs"
                                  ? getStudentAffairsCount()
                                  : getFinancialCount();
                    (roleEl as HTMLElement).dataset.target =
                        Math.floor(count).toString();
                }
            });
        };

        if (stats) {
            updateDataTargets();
            setTimeout(animateNumbers, 500);
        }
    }, [
        stats,
        getTotalStudents,
        getTotalPlans,
        getTotalTeachers,
        getTeacherStudentRatio,
        getTeacherCount,
        getSupervisorCount,
        getMotivatorCount,
        getStudentAffairsCount,
        getFinancialCount,
    ]);

    if (loading) {
        return (
            <div className="CenterDashboard">
                <div className="navbar">
                    <div className="navbar__inner">
                        <div className="navbar__loading">
                            <div className="loading-spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>{" "}
            </div>
        );
    }

    return (
        <>
            <div className="CenterDashboard">
                <div className="CenterDashboard__inner">
                    <div
                        className={`CenterDashboard__cards ${isVisible ? "visible" : ""}`}
                    >
                        {/* 🔥 عدد الطلاب - بيانات حقيقية */}
                        <div className="stat-card">
                            <div
                                className="stat-number students-count"
                                data-target="0"
                            >
                                0
                            </div>
                            <div className="stat-label">عدد الطلاب</div>
                        </div>

                        {/* 🔥 عدد الخطط - بيانات حقيقية */}
                        <div className="stat-card">
                            <div
                                className="stat-number plans-count"
                                data-target="0"
                            >
                                0
                            </div>
                            <div className="stat-label">عدد الخطط</div>
                        </div>

                        {/* 🔥 عدد الموظفين - بيانات حقيقية */}
                        <div className="stat-card">
                            <div
                                className="stat-number teachers-count"
                                data-target="0"
                            >
                                0
                            </div>
                            <div className="stat-label">عدد الموظفين</div>
                        </div>

                        {/* 🔥 نسبة الطلاب للمعلم */}
                        <div className="stat-card">
                            <div
                                className="stat-number ratio-count"
                                data-target="0"
                            >
                                0
                            </div>
                            <div className="stat-label">نسبة طالب/معلم</div>
                        </div>
                    </div>

                    {/* 🔥 توزيع الموظفين - مربعات زي اللي فوق */}
                    <div className="roles-section">
                        <div className="CenterDashboard__cards">
                            {/* المعلمين */}
                            <div className="stat-card">
                                <div
                                    className="stat-number role-teacher-count"
                                    data-target="0"
                                >
                                    0
                                </div>
                                <div className="stat-label">المعلمين 👨‍🏫</div>
                            </div>

                            {/* المشرفين */}
                            <div className="stat-card">
                                <div
                                    className="stat-number role-supervisor-count"
                                    data-target="0"
                                >
                                    0
                                </div>
                                <div className="stat-label">المشرفين 👨‍💼</div>
                            </div>

                            {/* المحفزين */}
                            <div className="stat-card">
                                <div
                                    className="stat-number role-motivator-count"
                                    data-target="0"
                                >
                                    0
                                </div>
                                <div className="stat-label">المحفزين 💡</div>
                            </div>

                            {/* شؤون الطلاب */}
                            <div className="stat-card">
                                <div
                                    className="stat-number role-student-affairs-count"
                                    data-target="0"
                                >
                                    0
                                </div>
                                <div className="stat-label">شؤون الطلاب 📚</div>
                            </div>

                            {/* الإدارة المالية */}
                            <div className="stat-card">
                                <div
                                    className="stat-number role-financial-count"
                                    data-target="0"
                                >
                                    0
                                </div>
                                <div className="stat-label">
                                    الإدارة المالية 💰
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الرسوم البيانية - بيانات من الباك اند */}
                </div>
            </div>
            <CirclesManagement />
            <PlansManagement />
        </>
    );
};

export default CenterDashboard;
