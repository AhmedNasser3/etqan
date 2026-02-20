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

    const studentsData = [
        { month: "يناير", count: 220 },
        { month: "فبراير", count: 228 },
        { month: "مارس", count: 235 },
        { month: "أبريل", count: 240 },
        { month: "مايو", count: 245 },
        { month: "يونيو", count: 252 },
    ];

    const plansDataArray = studentsData.map((item, index) => ({
        month: item.month,
        count: [15, 18, 22, 25, 28, 32][index],
    }));

    const employeesDataArray = studentsData.map((item, index) => ({
        month: item.month,
        count: [8, 9, 10, 11, 12, 12][index],
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
                            current.toFixed(1);
                    }
                }, 16);
            });
        };

        animateNumbers();
    }, []);

    return (
        <div className="CenterDashboard">
            <div className="CenterDashboard__inner">
                <div
                    className={`CenterDashboard__cards ${isVisible ? "visible" : ""}`}
                >
                    {/* إجمالي الرواتب */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="125,000">
                            0
                        </div>
                        <div className="stat-label">إجمالي الرواتب</div>
                        <span className="currency">ر.س</span>
                    </div>

                    {/* الربح الصافي */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="78,500">
                            0
                        </div>
                        <div className="stat-label">الربح الصافي</div>
                        <span className="currency">ر.س</span>
                    </div>

                    {/* عدد الطلاب */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="245">
                            0
                        </div>
                        <div className="stat-label">عدد الطلاب</div>
                    </div>

                    {/* عدد الخطط */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="32">
                            0
                        </div>
                        <div className="stat-label">عدد الخطط</div>
                    </div>

                    {/* عدد الموظفين */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="12">
                            0
                        </div>
                        <div className="stat-label">عدد الموظفين</div>
                    </div>

                    {/* مستوى تقدم المجمع % */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="89.5">
                            0
                        </div>
                        <div className="stat-label">مستوى تقدم المجمع %</div>
                    </div>

                    {/* إجمالي الزوار */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="156,234">
                            0
                        </div>
                        <div className="stat-label">إجمالي الزوار</div>
                    </div>

                    {/* الزوار اليوم */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="24,567">
                            0
                        </div>
                        <div className="stat-label">الزوار اليوم</div>
                    </div>

                    {/* معدل الحضور % */}
                    <div className="stat-card">
                        <div className="stat-number" data-target="95">
                            0
                        </div>
                        <div className="stat-label">معدل الحضور %</div>
                    </div>
                </div>

                {/* الرسوم البيانية الثلاثة فقط */}
                <div className="CenterCharts">
                    <div className="CenterCharts__container">
                        {/* رسم بياني عدد الطلاب */}
                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                تطور عدد الطلاب
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={studentsData}>
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
                                        dataKey="count"
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

                        {/* رسم بياني عدد الخطط */}
                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                تطور عدد الخطط
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={plansDataArray}>
                                    <defs>
                                        <linearGradient
                                            id="plansGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#10b98159"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#10b98159"
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
                                        dataKey="count"
                                        stroke="#10b98159"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#plansGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* رسم بياني عدد الموظفين */}
                        <div className="CenterCharts__chartCard">
                            <h4 className="CenterCharts__chartTitle">
                                تطور عدد الموظفين
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={employeesDataArray}>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        fill="#972a2a"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterDashboard;
