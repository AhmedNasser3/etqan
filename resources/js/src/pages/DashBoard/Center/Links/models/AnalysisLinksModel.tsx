import { FiX } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";

interface AnalysisLinksModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AnalysisLinksModel: React.FC<AnalysisLinksModelProps> = ({
    isOpen,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    useEffect(() => {
        if (!isVisible || !canvasRef.current) return;

        // Animate Numbers
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

        // Line Chart Animation
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const data = [120, 180, 220, 190, 280, 320, 290, 380, 420, 450];
            const maxData = Math.max(...data);

            let progress = 0;
            const animateChart = () => {
                ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

                // Glass background
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

                // Grid lines
                ctx.strokeStyle = "rgba(0,0,0,0.08)";
                ctx.lineWidth = 0.5;
                for (let i = 0; i <= 5; i++) {
                    const y = ((canvas.height / 2) * i) / 5;
                    ctx.beginPath();
                    ctx.moveTo(50, y);
                    ctx.lineTo(canvas.width / 2 - 30, y);
                    ctx.stroke();

                    const x = 50 + ((canvas.width / 2 - 80) * i) / 5;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height / 2);
                    ctx.stroke();
                }

                // Animate line
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

                    // Animated dots
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

                // Area under curve
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
    }, [isVisible]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={handleClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={handleClose}
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle">
                                    تعديل رابط
                                </h1>
                                <p>
                                    لماذا؟
                                    <span>
                                        يمكنك تغيير الرابط اذا تم مشاركته بشكل
                                        خاطيئ او تعطيله{" "}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div
                            className={`ParentModel__container ${isVisible ? "container-visible" : ""}`}
                        >
                            <div className="stats-wrapper">
                                {/* Wave Background */}
                                <div className="wave-bg">
                                    <div className="wave wave1"></div>
                                    <div className="wave wave2"></div>
                                    <div className="wave wave3"></div>
                                </div>

                                {/* Stats Cards */}
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div
                                            className="stat-number"
                                            data-target="24,567"
                                        >
                                            0
                                        </div>
                                        <div className="stat-label">
                                            الزوار اليوم
                                        </div>
                                        <span className="currency">ر.س</span>
                                    </div>

                                    <div className="stat-card">
                                        <div
                                            className="stat-number"
                                            data-target="156,234"
                                        >
                                            0
                                        </div>
                                        <div className="stat-label">
                                            إجمالي الزوار
                                        </div>
                                        <span className="currency">ر.س</span>
                                    </div>

                                    <div className="stat-card">
                                        <div
                                            className="stat-number"
                                            data-target="2,450"
                                        >
                                            0
                                        </div>
                                        <div className="stat-label">
                                            الروابط النشطة
                                        </div>
                                        <span className="currency">ر.س</span>
                                    </div>

                                    <div className="stat-card">
                                        <div
                                            className="stat-number"
                                            data-target="89.5"
                                        >
                                            0
                                        </div>
                                        <div className="stat-label">
                                            معدل النجاح %
                                        </div>
                                    </div>
                                </div>

                                {/* Line Chart */}
                                <div className="chart-container">
                                    <canvas
                                        ref={canvasRef}
                                        className="line-chart"
                                    ></canvas>
                                    <div className="chart-glow"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisLinksModel;
