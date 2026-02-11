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
    Legend,
} from "recharts";

const CenterDashboard: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const payrollData = [
        { month: "يناير", amount: 42000 },
        { month: "فبراير", amount: 43500 },
        { month: "مارس", amount: 45000 },
        { month: "أبريل", amount: 46500 },
        { month: "مايو", amount: 47800 },
        { month: "يونيو", amount: 48500 },
    ];

    const successData = [
        { month: "يناير", rate: 87 },
        { month: "فبراير", rate: 89 },
        { month: "مارس", rate: 92 },
        { month: "أبريل", rate: 94 },
        { month: "مايو", rate: 96 },
        { month: "يونيو", rate: 95 },
    ];

    const studentsData = [
        { month: "يناير", count: 220 },
        { month: "فبراير", count: 228 },
        { month: "مارس", count: 235 },
        { month: "أبريل", count: 240 },
        { month: "مايو", count: 245 },
        { month: "يونيو", count: 252 },
    ];

    const attendanceData = [
        { month: "يناير", rate: 88 },
        { month: "فبراير", rate: 90 },
        { month: "مارس", rate: 92 },
        { month: "أبريل", rate: 93 },
        { month: "مايو", rate: 95 },
        { month: "يونيو", rate: 94 },
    ];

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
                            current.toFixed(1);
                    }
                }, 16);
            });
        };

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const data = [120, 180, 220, 190, 280, 320, 290, 380, 420, 450];
            const maxData = Math.max(...data);

            let progress = 0;
            const animateChart = () => {
                ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

                const bgGradient = ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    canvas.height / 2,
                );
                bgGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                bgGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

                ctx.strokeStyle = "rgba(0,0,0,0.08)";
                ctx.lineWidth = 0.5;
                for (let i = 0; i <= 5; i++) {
                    const y = ((canvas.height / 2) * i) / 5;
                    ctx.beginPath();
                    ctx.moveTo(50, y);
                    ctx.lineTo(canvas.width / 2 - 30, y);
                    ctx.stroke();
                }

                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = "#3B82F6";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "rgba(59, 130, 246, 0.5)";

                ctx.beginPath();
                const steps = Math.min(
                    data.length,
                    Math.floor(data.length * progress),
                );
                for (let i = 0; i < steps; i++) {
                    const x =
                        50 + ((canvas.width / 2 - 80) * i) / (data.length - 1);
                    const y =
                        canvas.height / 2 -
                        (data[i] / maxData) * ((canvas.height / 2) * 0.7);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    const dotGradient = ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        4,
                    );
                    dotGradient.addColorStop(0, "#3B82F6");
                    dotGradient.addColorStop(1, "rgba(59, 130, 246, 0.3)");
                    ctx.fillStyle = dotGradient;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.stroke();

                ctx.lineTo(canvas.width / 2 - 30, canvas.height / 2);
                ctx.lineTo(50, canvas.height / 2);
                ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
                ctx.fill();

                progress += 0.06;
                if (progress < 1.3) {
                    requestAnimationFrame(animateChart);
                }
            };

            animateChart();
        }

        animateNumbers();
    }, []);

    return (
        <div className="CenterDashboard">
            <div className="CenterDashboard__inner">
                <div
                    className={`CenterDashboard__cards ${isVisible ? "visible" : ""}`}
                >
                    <div className="stat-card">
                        <div className="stat-number" data-target="125,000">
                            0
                        </div>
                        <div className="stat-label">إجمالي الرواتب</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="78,500">
                            0
                        </div>
                        <div className="stat-label">الربح الصافي</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="245">
                            0
                        </div>
                        <div className="stat-label">عدد الطلاب</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="12">
                            0
                        </div>
                        <div className="stat-label">عدد الموظفين</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="89.5">
                            0
                        </div>
                        <div className="stat-label">مستوى تقدم المجمع %</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="156,234">
                            0
                        </div>
                        <div className="stat-label">إجمالي الزوار</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="24,567">
                            0
                        </div>
                        <div className="stat-label">الزوار اليوم</div>
                        <span className="currency">ر.س</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number" data-target="95">
                            0
                        </div>
                        <div className="stat-label">معدل الحضور %</div>
                    </div>
                </div>

                <div className="CenterDashboard__link">
                    <div className="CenterDashboard__LinkText">
                        <div className="userProfile__meetBtnUrl">
                            <i>
                                <IoCopy />
                            </i>
                            <h1>http://127.0.0.1:8000/user-dashboard</h1>
                        </div>{" "}
                    </div>
                </div>

                <div className="CenterCharts">
                    <div className="CenterCharts__container">
                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                تطور الرواتب
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={payrollData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#30802fad"
                                        strokeWidth={3}
                                        dot={{
                                            fill: "#30802fad",
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                معدل النجاح
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={successData}>
                                    <defs>
                                        <linearGradient
                                            id="successGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#ff73005d"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#ff73005d"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#ff73005d"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#successGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                معدل الحضور
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={attendanceData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#972a2a"
                                        strokeWidth={3}
                                        dot={{
                                            fill: "#972a2a",
                                            strokeWidth: 2,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterDashboard;
