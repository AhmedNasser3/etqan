import { useState } from "react";
import { FiX, FiDownload, FiShare2 } from "react-icons/fi";
import {
    RiBarChartFill,
    RiPieChartFill,
    RiLineChartFill,
    RiStarFill,
} from "react-icons/ri";
import { PiBookOpen, PiUsers } from "react-icons/pi";
import toast from "react-hot-toast";

interface PerformanceChartsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName?: string;
    studentId?: string;
}

const PerformanceChartsModal: React.FC<PerformanceChartsModalProps> = ({
    isOpen,
    onClose,
    studentName = "محمد أحمد محمد",
    studentId = "STU-12345",
}) => {
    const [activeTab, setActiveTab] = useState<"charts" | "table">("charts");
    const [rating, setRating] = useState(4.5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("تم حفظ تقييم الأداء!");
        onClose();
    };

    if (!isOpen) return null;

    // بيانات تجريبية للـ Charts
    const attendanceData = [
        { month: "يناير", rate: 98 },
        { month: "فبراير", rate: 95 },
        { month: "مارس", rate: 97 },
        { month: "أبريل", rate: 99 },
        { month: "مايو", rate: 96 },
    ];

    const performanceData = [
        { skill: "الحفظ", score: 95 },
        { skill: "التسميع", score: 92 },
        { skill: "المراجعة", score: 88 },
        { skill: "الانضباط", score: 97 },
    ];

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="performance-modal-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="performance-modal-header">
                        <div className="performance-student-info">
                            <div className="student-avatar">
                                <img
                                    style={{ maxWidth: "100px" }}
                                    src="https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png"
                                    alt={studentName}
                                />
                            </div>
                            <div>
                                <h2 className="student-name">{studentName}</h2>
                                <p className="student-id">ID: {studentId}</p>
                                <div className="student-rating">
                                    <span className="rating-score">
                                        {rating}
                                    </span>
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <RiStarFill
                                                key={i}
                                                className={
                                                    i < Math.floor(rating)
                                                        ? "star-filled"
                                                        : "star-empty"
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="performance-tabs">
                        <button
                            className={`tab-btn ${activeTab === "charts" ? "active" : ""}`}
                            onClick={() => setActiveTab("charts")}
                        >
                            <RiBarChartFill /> الرسوم البيانية
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "table" ? "active" : ""}`}
                            onClick={() => setActiveTab("table")}
                        >
                            <PiBookOpen /> الجدول التفصيلي
                        </button>
                    </div>

                    {/* Content */}
                    <div className="performance-content">
                        {activeTab === "charts" ? (
                            // Charts Tab
                            <div className="charts-container">
                                <div className="chart-grid">
                                    {/* Attendance Chart */}
                                    <div className="chart-card">
                                        <h3 className="chart-title">
                                            <PiUsers className="chart-icon" />
                                            معدل الحضور
                                        </h3>
                                        <div className="chart-placeholder attendance-chart">
                                            <div className="chart-data">
                                                <RiLineChartFill
                                                    size={48}
                                                    className="chart-icon-large"
                                                />
                                                <p>متوسط: 95%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Pie */}
                                    <div className="chart-card">
                                        <h3 className="chart-title">
                                            <RiPieChartFill className="chart-icon" />
                                            توزيع المهارات
                                        </h3>
                                        <div className="chart-placeholder pie-chart">
                                            <div className="chart-legend">
                                                <div className="legend-item">
                                                    <span className="legend-color preserve"></span>
                                                    الحفظ 95%
                                                </div>
                                                <div className="legend-item">
                                                    <span className="legend-color recitation"></span>
                                                    التسميع 92%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Bar Chart */}
                                    <div className="chart-card full-width">
                                        <h3 className="chart-title">
                                            <RiBarChartFill className="chart-icon" />
                                            تقييم المهارات
                                        </h3>
                                        <div className="skills-bar-chart">
                                            {performanceData.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="skill-bar"
                                                    >
                                                        <span className="skill-name">
                                                            {item.skill}
                                                        </span>
                                                        <div className="skill-bar-container">
                                                            <div
                                                                className="skill-progress"
                                                                style={{
                                                                    width: `${item.score}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="skill-score">
                                                            {item.score}%
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Table Tab
                            <div className="table-container">
                                <table className="performance-table">
                                    <thead>
                                        <tr>
                                            <th>المهارة</th>
                                            <th>الدرجة</th>
                                            <th>التقدم الشهري</th>
                                            <th>ملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>الحفظ</td>
                                            <td>
                                                <span className="grade excellent">
                                                    95%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="trend positive">
                                                    +3%
                                                </span>
                                            </td>
                                            <td>ممتاز في الحفظ</td>
                                        </tr>
                                        <tr>
                                            <td>التسميع</td>
                                            <td>
                                                <span className="grade good">
                                                    92%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="trend positive">
                                                    +2%
                                                </span>
                                            </td>
                                            <td>تحسن ملحوظ</td>
                                        </tr>
                                        <tr>
                                            <td>المراجعة</td>
                                            <td>
                                                <span className="grade average">
                                                    88%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="trend neutral">
                                                    0%
                                                </span>
                                            </td>
                                            <td>ثابت</td>
                                        </tr>
                                        <tr>
                                            <td>الانضباط</td>
                                            <td>
                                                <span className="grade excellent">
                                                    97%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="trend positive">
                                                    +5%
                                                </span>
                                            </td>
                                            <td>ممتاز</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="performance-footer">
                        <div className="footer-actions">
                            <button className="action-btn secondary">
                                <FiShare2 /> مشاركة التقرير
                            </button>
                            <button className="action-btn secondary">
                                <FiDownload /> تصدير PDF
                            </button>
                        </div>
                        <button className="submit-btn" onClick={handleSubmit}>
                            حفظ التقييم
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChartsModal;
