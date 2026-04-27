import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import { useTeacherStudents } from "./hooks/useTeacherStudents";

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    progress?: number;
    status: "active" | "paused";
}

const TeacherStudents: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const { students, totalCount, loading, error, toggleStudentStatus } =
        useTeacherStudents();

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getStatusStyle = (status: Student["status"]): React.CSSProperties => {
        return status === "active"
            ? {
                  background: "var(--g100, #dcfce7)",
                  color: "var(--g700, #15803d)",
              }
            : { background: "#fee2e2", color: "#ef4444" };
    };

    const getStatusIcon = (status: Student["status"]) => {
        return status === "active" ? (
            <GrStatusGood style={{ color: "#16a34a", width: 14, height: 14 }} />
        ) : (
            <GrStatusCritical
                style={{ color: "#ef4444", width: 14, height: 14 }}
            />
        );
    };

    const getStatusText = (status: Student["status"]) =>
        status === "active" ? "نشط" : "متوقف";

    const getActionText = (status: Student["status"]) =>
        status === "active" ? "وقف الطالب" : "تنشيط الطالب";

    const avgProgress =
        students.length > 0
            ? Math.round(
                  students.reduce((acc, s) => acc + (s.progress || 0), 0) /
                      students.length,
              ) + "%"
            : "0%";

    const activeCount = students.filter((s) => s.status === "active").length;

    return (
        <div className="content" id="contentArea">
            <div className="widget">
                {/* Header */}
                <div className="wh">
                    <div className="wh-l">قائمة الطلاب</div>
                    <div className="flx">
                        <input
                            className="fi"
                            style={{ margin: "0 6px" }}
                            placeholder="البحث بالاسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>اسم الطالب</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty">
                                            <p>
                                                {searchTerm
                                                    ? `لا توجد نتائج لـ "${searchTerm}"`
                                                    : "لا يوجد طلاب"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((item) => (
                                    <tr key={item.id}>
                                        {/* الصورة */}
                                        <td>
                                            {item.avatar ? (
                                                <img
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "50%",
                                                        background:
                                                            "var(--color-background-info)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                        color: "var(--color-text-info)",
                                                    }}
                                                >
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                        </td>

                                        {/* الاسم */}
                                        <td style={{ fontWeight: 500 }}>
                                            {item.name}
                                        </td>

                                        {/* الحالة */}
                                        <td>
                                            <span
                                                style={{
                                                    ...getStatusStyle(
                                                        item.status,
                                                    ),
                                                    fontSize: 12,
                                                    padding: "3px 10px",
                                                    borderRadius: 999,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 5,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {getStatusIcon(item.status)}
                                                {getStatusText(item.status)}
                                            </span>
                                        </td>

                                        {/* الإجراءات */}
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className={
                                                        item.status === "active"
                                                            ? "btn bd bxs"
                                                            : "btn bs bxs"
                                                    }
                                                    onClick={() =>
                                                        toggleStudentStatus(
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    {getActionText(item.status)}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherStudents;
