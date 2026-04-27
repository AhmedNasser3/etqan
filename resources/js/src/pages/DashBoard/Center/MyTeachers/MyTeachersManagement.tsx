import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiEdit3,
    FiEye,
    FiFilter,
    FiMail,
    FiPhone,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrash2,
    FiTrendingUp,
    FiUsers,
    FiX,
    FiXCircle,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { RiRobot2Fill } from "react-icons/ri";

type TeacherStatus = "active" | "pending" | "suspended" | "inactive";
type AttendanceStatus = "present" | "late" | "absent";
type DetailTab = "circles" | "students";

interface TeacherPlan {
    id: string;
    title: string;
    description?: string;
    studentsCount: number;
    sessionsDone: number;
    sessionsTotal: number;
    weeklyDays: string[];
    timeRange?: string | null;
}

interface TeacherCircle {
    id: number | string;
    name: string;
    studentsCount: number;
    timeRange?: string | null;
    notes?: string | null;
}

interface TeacherStudent {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
}

interface Teacher {
    id: number;
    user_id?: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    status: TeacherStatus;
    created_at: string;
    mosque?: string | null;
    mosque_id?: number | null;
    circles_count?: number;
    students_count?: number;
    salary?: number;
    deduction?: number;
    net_salary?: number;
    attendance_rate?: number;
    hours_this_month?: number;
    last_checkin?: string | null;
    attendance_today?: AttendanceStatus | null;
    delay_minutes?: number;
    circles?: TeacherCircle[];
    students?: TeacherStudent[];
    plan?: TeacherPlan | null;
    teacher?: {
        role?: string;
        notes?: string;
        session_time?: string;
    };
}

interface Pagination {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
    to?: number;
}

interface Stats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
}

interface AttendanceRecord {
    teacher_id?: number;
    status?: AttendanceStatus;
    checkin_time?: string;
    delay_minutes?: number;
}

const MOCK_TEACHERS: Teacher[] = [
    {
        id: 1,
        user_id: 1,
        name: "الشيخ محمد أحمد عبد الله",
        email: "m.ahmed@example.com",
        phone: "0501234567",
        status: "active",
        created_at: "2024-01-10",
        mosque: "مسجد النور",
        mosque_id: 11,
        circles_count: 3,
        students_count: 67,
        salary: 3200,
        deduction: 320,
        net_salary: 2880,
        attendance_rate: 92,
        hours_this_month: 18,
        last_checkin: "07:55",
        attendance_today: "present",
        delay_minutes: 0,
        teacher: {
            role: "teacher",
            notes: "يتابع حلقتين صباحيتين وخطة ختمة شهرية.",
            session_time: "07:00 - 12:00",
        },
        circles: [
            {
                id: 1,
                name: "حلقة: تختيم القرآن (2) - (8 -9 سنوات) (ID: 1) | من 7:30 م إلى 8:30 م",
                studentsCount: 24,
            },
            {
                id: 2,
                name: "حلقة: حلقة الرحمن لتختيم القرآن (ID: 8) | من 5:00 م إلى 6:00 م",
                studentsCount: 18,
            },
            {
                id: 3,
                name: "حلقة: مراجعة المتقدمين (ID: 9) | من 8:30 م إلى 9:30 م",
                studentsCount: 25,
            },
        ],
        students: [
            { id: 101, name: "أحمد محمد علي", phone: "0501110001" },
            { id: 102, name: "محمود عبد الله", phone: "0501110002" },
            { id: 103, name: "يوسف إبراهيم", phone: "0501110003" },
            { id: 104, name: "عبد الرحمن سعيد", phone: "0501110004" },
        ],
        plan: {
            id: "p-1",
            title: "خطة ختم القرآن خلال 17 شهرًا",
            description: "وجه يومي مع مراجعة أسبوعية وربط بالحضور والإنجاز.",
            studentsCount: 24,
            sessionsDone: 62,
            sessionsTotal: 170,
            weeklyDays: ["السبت", "الثلاثاء"],
            timeRange: "07:00 - 09:00",
        },
    },
    {
        id: 2,
        user_id: 2,
        name: "الشيخة آمنة إبراهيم",
        email: "amina@example.com",
        phone: "0509876543",
        status: "active",
        created_at: "2024-03-21",
        mosque: "مسجد الفتح",
        mosque_id: 12,
        circles_count: 2,
        students_count: 44,
        salary: 2600,
        deduction: 0,
        net_salary: 2600,
        attendance_rate: 100,
        hours_this_month: 20,
        last_checkin: "08:05",
        attendance_today: "present",
        delay_minutes: 0,
        teacher: {
            role: "supervisor",
            notes: "تشرف على حلقة البنات وتتابع التقييم الشهري.",
            session_time: "08:00 - 12:00",
        },
        circles: [
            {
                id: 4,
                name: "حلقة: بنات النور (ID: 4) | من 8:00 ص إلى 10:00 ص",
                studentsCount: 24,
            },
            {
                id: 5,
                name: "حلقة: التحفيظ النسائي (ID: 5) | من 10:00 ص إلى 12:00 م",
                studentsCount: 20,
            },
        ],
        students: [
            { id: 201, name: "سلمى أحمد", phone: "0502220001" },
            { id: 202, name: "إيمان علي", phone: "0502220002" },
            { id: 203, name: "هدى محمود", phone: "0502220003" },
        ],
        plan: {
            id: "p-2",
            title: "خطة تحفيظ 10 أجزاء",
            description: "برنامج تدريجي للأجزاء 21 إلى 30.",
            studentsCount: 24,
            sessionsDone: 31,
            sessionsTotal: 80,
            weeklyDays: ["السبت", "الثلاثاء"],
            timeRange: "08:00 - 10:00",
        },
    },
    {
        id: 3,
        user_id: 3,
        name: "الشيخ طارق فوزي البكري",
        email: "tarek@example.com",
        phone: "0502221111",
        status: "suspended",
        created_at: "2023-11-02",
        mosque: "مسجد الرحمة",
        mosque_id: 13,
        circles_count: 1,
        students_count: 0,
        salary: 3100,
        deduction: 620,
        net_salary: 2480,
        attendance_rate: 53,
        hours_this_month: 8,
        last_checkin: null,
        attendance_today: "absent",
        delay_minutes: 0,
        teacher: {
            role: "teacher",
            notes: "يحتاج متابعة انتظام الحضور.",
            session_time: "09:00 - 11:30",
        },
        circles: [
            {
                id: 6,
                name: "حلقة: تختيم القرآن (2) - (8 -9 سنوات) (ID: 6) | من 9:00 ص إلى 11:00 ص",
                studentsCount: 0,
            },
        ],
        students: [],
        plan: {
            id: "p-3",
            title: "خطة ختم القرآن للمتقدمين",
            description: "ختم مجود مع جلسات مراجعة وقياس تقدم.",
            studentsCount: 0,
            sessionsDone: 55,
            sessionsTotal: 180,
            weeklyDays: ["السبت", "الثلاثاء", "الخميس"],
            timeRange: "09:00 - 11:00",
        },
    },
];

const roleLabels: Record<string, string> = {
    teacher: "مدرس",
    supervisor: "مشرف",
    motivator: "محفز",
    student_affairs: "شؤون طلاب",
    financial: "مالي",
};

const statusMeta: Record<
    string,
    { label: string; className: string; icon: ReactNode }
> = {
    active: {
        label: "نشط",
        className: "badge success",
        icon: <FiCheckCircle size={12} />,
    },
    pending: {
        label: "معلّق",
        className: "badge warning",
        icon: <FiClock size={12} />,
    },
    suspended: {
        label: "موقوف",
        className: "badge danger",
        icon: <FiXCircle size={12} />,
    },
    inactive: {
        label: "غير نشط",
        className: "badge neutral",
        icon: <FiXCircle size={12} />,
    },
    present: {
        label: "حاضر اليوم",
        className: "badge success",
        icon: <FiCheckCircle size={12} />,
    },
    late: {
        label: "متأخر",
        className: "badge warning",
        icon: <FiClock size={12} />,
    },
    absent: {
        label: "غائب",
        className: "badge danger",
        icon: <FiXCircle size={12} />,
    },
};

const AvatarSVG = ({ idx }: { idx: number }) => {
    const skins = ["#F5D3A8", "#E8B97A", "#D4915A", "#F0C894"];
    const robes = ["#1A5C3A", "#C9A84C", "#1565C0", "#6D4C41"];
    const skin = skins[idx % skins.length];
    const robe = robes[idx % robes.length];

    return (
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" fill="#EDF5F0" />
            <path d="M15 80C15 58 25 52 40 52C55 52 65 58 65 80Z" fill={robe} />
            <ellipse cx="40" cy="34" rx="14" ry="15" fill={skin} />
            <ellipse
                cx="40"
                cy="21"
                rx="12"
                ry="5"
                fill="#FFF"
                fillOpacity="0.95"
            />
            <rect
                x="28"
                y="18"
                width="24"
                height="7"
                rx="3"
                fill="#FFF"
                fillOpacity="0.9"
            />
            <path
                d="M28 40Q40 50 52 40Q48 48 40 50Q32 48 28 40Z"
                fill="#3D2314"
                fillOpacity="0.68"
            />
            <circle cx="35" cy="35" r="2.5" fill="#2C1810" />
            <circle cx="45" cy="35" r="2.5" fill="#2C1810" />
            <path
                d="M36 40Q40 43 44 40"
                stroke="#B87040"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
};

const parseCirclePresentation = (circle: TeacherCircle) => {
    const source = (circle.notes || circle.name || "").trim();

    if (!source) {
        return {
            title: "حلقة غير محددة",
            time: circle.timeRange || "غير محدد",
        };
    }

    const parts = source.split("|").map((part) => part.trim());
    const leftPart = parts[0] || source;
    const rightPart = parts[1]?.trim() || circle.timeRange || "غير محدد";

    const title = leftPart
        .replace(/^حلقة:\s*/i, "")
        .replace(/\s*\(ID:\s*\d+\)\s*$/i, "")
        .trim();

    return {
        title: title || "حلقة غير محددة",
        time: rightPart,
    };
};

const RolePill = ({ role }: { role?: string }) => (
    <span className="role-pill">{roleLabels[role || "teacher"] || "مدرس"}</span>
);

const InfoTile = ({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) => (
    <div className="info-tile">
        <div className="info-tile-icon">{icon}</div>
        <div>
            <div className="info-label">{label}</div>
            <div className="info-value">{value}</div>
        </div>
    </div>
);

const Toast = ({
    message,
    tone,
    onClose,
}: {
    message: string;
    tone: "success" | "error";
    onClose: () => void;
}) => (
    <div className={`toast ${tone}`}>
        {tone === "success" ? (
            <FiCheckCircle size={16} />
        ) : (
            <FiXCircle size={16} />
        )}
        <span>{message}</span>
        <button className="icon-btn subtle invert" onClick={onClose}>
            <FiX size={14} />
        </button>
    </div>
);

const ConfirmModal = ({
    message,
    onConfirm,
    onCancel,
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div className="modal-overlay">
        <div className="modal-card modal-compact">
            <div className="modal-head">
                <h3>تأكيد الإجراء</h3>
                <button className="icon-btn subtle" onClick={onCancel}>
                    <FiX size={16} />
                </button>
            </div>
            <p className="modal-copy">{message}</p>
            <div className="modal-actions">
                <button className="btn secondary" onClick={onCancel}>
                    إلغاء
                </button>
                <button className="btn danger" onClick={onConfirm}>
                    تنفيذ
                </button>
            </div>
        </div>
    </div>
);

const TeacherFormModal = ({
    title,
    submitLabel,
    mosques,
    initialValues,
    onClose,
    onSubmit,
}: {
    title: string;
    submitLabel: string;
    mosques: string[];
    initialValues: {
        name: string;
        email: string;
        phone: string;
        teacher_role: string;
        notes: string;
        mosque: string;
    };
    onClose: () => void;
    onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) => {
    const [form, setForm] = useState(initialValues);
    const [saving, setSaving] = useState(false);

    const updateField =
        (key: keyof typeof form) =>
        (
            event: ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) =>
            setForm((prev) => ({ ...prev, [key]: event.target.value }));

    const submit = async () => {
        setSaving(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card modal-rich">
                <div className="modal-ornament" />
                <div className="modal-head">
                    <div>
                        <h3>{title}</h3>
                        <p className="modal-subtitle">
                            نموذج منسق بنفس روح التصميم الأساسية مع فصل واضح لكل
                            جزء.
                        </p>
                    </div>
                    <button className="icon-btn subtle" onClick={onClose}>
                        <FiX size={16} />
                    </button>
                </div>

                <div className="modal-panel-grid">
                    <div className="modal-panel">
                        <div className="modal-panel-title">
                            <FiEdit3 size={15} />
                            البيانات الأساسية
                        </div>

                        <div className="form-grid">
                            <label className="field">
                                <span>الاسم</span>
                                <input
                                    value={form.name}
                                    onChange={updateField("name")}
                                />
                            </label>

                            <label className="field">
                                <span>البريد الإلكتروني</span>
                                <input
                                    value={form.email}
                                    onChange={updateField("email")}
                                />
                            </label>

                            <label className="field">
                                <span>الهاتف</span>
                                <input
                                    value={form.phone}
                                    onChange={updateField("phone")}
                                />
                            </label>

                            <label className="field">
                                <span>الدور الوظيفي</span>
                                <select
                                    value={form.teacher_role}
                                    onChange={updateField("teacher_role")}
                                >
                                    <option value="teacher">مدرس</option>
                                    <option value="supervisor">مشرف</option>
                                    <option value="motivator">محفز</option>
                                    <option value="student_affairs">
                                        شؤون طلاب
                                    </option>
                                    <option value="financial">مالي</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="modal-panel">
                        <div className="modal-panel-title">
                            <FaMosque size={15} />
                            الربط والملاحظات
                        </div>

                        <div className="form-grid">
                            <label className="field">
                                <span>المسجد</span>
                                <select
                                    value={form.mosque}
                                    onChange={updateField("mosque")}
                                >
                                    <option value="">بلا مسجد</option>
                                    {mosques.map((mosque) => (
                                        <option key={mosque} value={mosque}>
                                            {mosque}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="field full">
                                <span>الملاحظات أو اسم الخطة</span>
                                <textarea
                                    rows={5}
                                    value={form.notes}
                                    onChange={updateField("notes")}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        إلغاء
                    </button>
                    <button
                        className="btn primary"
                        onClick={submit}
                        disabled={saving}
                    >
                        {saving ? "جاري الحفظ..." : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TeacherCard = ({
    teacher,
    index,
    expanded,
    onToggleExpand,
    onEdit,
    onToggleStatus,
    onDelete,
    onStudentClick,
    onViewAllStudents,
}: {
    teacher: Teacher;
    index: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
    onStudentClick: (student: TeacherStudent) => void;
    onViewAllStudents: (teacher: Teacher) => void;
}) => {
    const [detailTab, setDetailTab] = useState<DetailTab>("circles");

    const statusState = statusMeta[teacher.status] || statusMeta.inactive;
    const attendanceState = teacher.attendance_today
        ? statusMeta[teacher.attendance_today]
        : null;
    const plan = teacher.plan;
    const planProgress = plan
        ? Math.min(
              100,
              Math.round(
                  (plan.sessionsDone / Math.max(plan.sessionsTotal, 1)) * 100,
              ),
          )
        : 0;

    const studentsPreview = (teacher.students || []).slice(0, 2);
    const remainingStudents = Math.max((teacher.students?.length || 0) - 2, 0);

    return (
        <article className="teacher-card">
            <div className="teacher-card-head">
                <div className="teacher-id-block">
                    <button
                        className="icon-btn subtle"
                        onClick={onToggleExpand}
                    >
                        {expanded ? (
                            <FiChevronDown size={16} />
                        ) : (
                            <FiChevronLeft size={16} />
                        )}
                    </button>
                    <div className="avatar-wrap">
                        <AvatarSVG idx={index} />
                    </div>
                    <div>
                        <div className="teacher-name">{teacher.name}</div>
                        <div className="teacher-subline">
                            <RolePill role={teacher.teacher?.role} />
                            <span className="sub-sep" />
                            <span>{teacher.mosque || "غير مربوط بمسجد"}</span>
                            <span className="sub-sep" />
                            <span>{teacher.students_count || 0} طالب</span>
                            <span className="sub-sep" />
                            <span>{teacher.circles_count || 0} حلقات</span>
                        </div>
                    </div>
                </div>

                <div className="teacher-card-actions">
                    <span className={statusState.className}>
                        {statusState.icon}
                        {statusState.label}
                    </span>

                    {attendanceState && (
                        <span className={attendanceState.className}>
                            {attendanceState.icon}
                            {attendanceState.label}
                        </span>
                    )}

                    <button className="icon-btn" onClick={onEdit} title="تعديل">
                        <FiEdit3 size={15} />
                    </button>

                    <button
                        className="icon-btn"
                        onClick={onToggleStatus}
                        title="تغيير الحالة"
                    >
                        <FiRefreshCw size={15} />
                    </button>

                    <button
                        className="icon-btn danger"
                        onClick={onDelete}
                        title="تعليق"
                    >
                        <FiTrash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="teacher-grid">
                <InfoTile
                    icon={<FaMosque size={15} />}
                    label="المسجد التابع"
                    value={teacher.mosque || "بلا مسجد"}
                />
                <InfoTile
                    icon={<FiUsers size={15} />}
                    label="عدد الطلاب"
                    value={`${teacher.students_count || 0} طالب`}
                />
                <InfoTile
                    icon={<FiClock size={15} />}
                    label="آخر حضور"
                    value={teacher.last_checkin || "لا يوجد"}
                />
                <InfoTile
                    icon={<FaMoneyBillWave size={15} />}
                    label="الصافي"
                    value={`${(teacher.net_salary || 0).toLocaleString()} ج`}
                />
            </div>

            {plan && (
                <div className="plan-strip">
                    <div className="plan-strip-title">
                        <GoGoal size={16} />
                        <span>{plan.title}</span>
                    </div>

                    <div className="plan-strip-meta">
                        <span>{plan.studentsCount} طالب</span>
                        <span>{plan.timeRange || "غير محدد"}</span>
                        <span>
                            {plan.weeklyDays.length > 0
                                ? plan.weeklyDays.join(" - ")
                                : "لا يوجد أيام محددة"}
                        </span>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${planProgress}%` }}
                        />
                    </div>

                    <div className="progress-caption">
                        <span>{plan.sessionsDone} جلسة منجزة</span>
                        <span>{plan.sessionsTotal} إجمالي الجلسات</span>
                    </div>
                </div>
            )}

            {expanded && (
                <div className="expand-panel">
                    <div className="detail-tabs">
                        <button
                            className={`detail-tab ${detailTab === "circles" ? "active" : ""}`}
                            onClick={() => setDetailTab("circles")}
                        >
                            <FaChalkboardTeacher size={14} />
                            الحلقات
                        </button>

                        <button
                            className={`detail-tab ${detailTab === "students" ? "active" : ""}`}
                            onClick={() => setDetailTab("students")}
                        >
                            <FiUsers size={14} />
                            الطلاب
                        </button>
                    </div>

                    <div className="expand-columns">
                        <div className="expand-box">
                            <div className="expand-title">
                                <FiEye size={15} />
                                البيانات التفصيلية
                            </div>

                            <ul className="detail-list">
                                <li>
                                    <FiMail size={13} />
                                    <span>{teacher.email}</span>
                                </li>
                                <li>
                                    <FiPhone size={13} />
                                    <span>
                                        {teacher.phone || "لا يوجد رقم هاتف"}
                                    </span>
                                </li>
                                <li>
                                    <FiCalendar size={13} />
                                    <span>
                                        {teacher.created_at?.slice(0, 10)}
                                    </span>
                                </li>
                                <li>
                                    <RiRobot2Fill size={13} />
                                    <span>
                                        {teacher.teacher?.notes ||
                                            "لا توجد ملاحظات"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="expand-box">
                            <div className="expand-title">
                                {detailTab === "circles" ? (
                                    <FaChalkboardTeacher size={15} />
                                ) : (
                                    <FiUsers size={15} />
                                )}
                                {detailTab === "circles"
                                    ? "بيانات الحلقات"
                                    : "بيانات الطلاب"}
                            </div>

                            {detailTab === "circles" ? (
                                <div className="circle-list">
                                    {(teacher.circles || []).length > 0 ? (
                                        teacher.circles!.map((circle) => {
                                            const parsed =
                                                parseCirclePresentation(circle);

                                            return (
                                                <div
                                                    key={circle.id}
                                                    className="circle-item rich"
                                                >
                                                    <div>
                                                        <div className="circle-name">
                                                            {parsed.title}
                                                        </div>
                                                        <div className="circle-meta">
                                                            {
                                                                circle.studentsCount
                                                            }{" "}
                                                            طالب
                                                        </div>
                                                    </div>

                                                    <div className="circle-time">
                                                        {parsed.time ||
                                                            "غير محدد"}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty-inline">
                                            لا توجد حلقات مرتبطة بهذا المعلم.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="students-box">
                                    {(teacher.students || []).length > 0 ? (
                                        <>
                                            {studentsPreview.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="student-item"
                                                >
                                                    <div>
                                                        <div className="circle-name">
                                                            {student.name}
                                                        </div>
                                                        <div className="circle-meta">
                                                            {student.phone ||
                                                                "لا يوجد رقم هاتف"}
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="btn secondary student-link-btn"
                                                        onClick={() =>
                                                            onStudentClick(
                                                                student,
                                                            )
                                                        }
                                                    >
                                                        <FiEye size={13} />
                                                        فتح الطالب
                                                    </button>
                                                </div>
                                            ))}

                                            {remainingStudents > 0 && (
                                                <button
                                                    className="btn primary full-width-btn"
                                                    onClick={() =>
                                                        onViewAllStudents(
                                                            teacher,
                                                        )
                                                    }
                                                >
                                                    <FiUsers size={14} />
                                                    جميع الطلاب (
                                                    {teacher.students?.length ||
                                                        0}
                                                    )
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="empty-inline">
                                            لا يوجد طلبة مع هذا المعلم.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

const useMyTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total: 0,
        per_page: 8,
        last_page: 1,
    });
    const [stats, setStats] = useState<Stats>({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
    });
    const [mosques, setMosques] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const csrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    const apiFetch = async (url: string, options: RequestInit = {}) => {
        const response = await fetch(url, {
            credentials: "include",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": csrfToken(),
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        return response.json();
    };

    const normalizeTeacher = (
        teacher: Teacher,
        attendanceMap: Map<number, AttendanceRecord>,
    ): Teacher => {
        const mock = MOCK_TEACHERS.find((item) => item.id === teacher.id);
        const attendance = attendanceMap.get(teacher.id);

        const merged: Teacher = {
            ...mock,
            ...teacher,
            teacher: {
                ...mock?.teacher,
                ...teacher.teacher,
            },
        };

        return {
            ...merged,
            circles_count: merged.circles_count ?? merged.circles?.length ?? 0,
            students_count:
                merged.students_count ?? merged.students?.length ?? 0,
            net_salary:
                merged.net_salary ??
                Math.max(0, (merged.salary ?? 0) - (merged.deduction ?? 0)),
            last_checkin:
                attendance?.checkin_time ?? merged.last_checkin ?? null,
            attendance_today:
                attendance?.status ?? merged.attendance_today ?? null,
            delay_minutes:
                attendance?.delay_minutes ?? merged.delay_minutes ?? 0,
        };
    };

    const fetchStats = async () => {
        try {
            const data = await apiFetch(
                "/api/v1/teachers/my-teachers?per_page=200",
            );
            const items: Teacher[] = data.data || [];
            setStats({
                total: items.length,
                active: items.filter((item) => item.status === "active").length,
                pending: items.filter((item) => item.status === "pending")
                    .length,
                suspended: items.filter(
                    (item) =>
                        item.status === "suspended" ||
                        item.status === "inactive",
                ).length,
            });
        } catch {
            setStats({
                total: MOCK_TEACHERS.length,
                active: MOCK_TEACHERS.filter((item) => item.status === "active")
                    .length,
                pending: MOCK_TEACHERS.filter(
                    (item) => item.status === "pending",
                ).length,
                suspended: MOCK_TEACHERS.filter(
                    (item) => item.status === "suspended",
                ).length,
            });
        }
    };

    const loadMosques = async () => {
        try {
            const data = await apiFetch("/api/v1/mosques");
            const names = (data.data || [])
                .map((item: { name?: string }) => item.name)
                .filter(Boolean);
            setMosques(names);
        } catch {
            setMosques(
                Array.from(
                    new Set(
                        MOCK_TEACHERS.map((item) => item.mosque).filter(
                            Boolean,
                        ),
                    ),
                ) as string[],
            );
        }
    };

    const fetchTeachers = async (
        page = 1,
        perPage = 8,
        search = "",
        status = "",
        mosque = "",
    ) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: String(page),
                per_page: String(perPage),
                search,
            });

            if (status) params.set("status", status);

            const [teachersData, attendanceData] = await Promise.all([
                apiFetch(`/api/v1/teachers/my-teachers?${params.toString()}`),
                fetch("/api/v1/attendance/staff-attendance?date_filter=today", {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                })
                    .then(async (res) => {
                        if (!res.ok) return { data: [] };
                        return res.json();
                    })
                    .catch(() => ({ data: [] })),
            ]);

            const attendanceMap = new Map<number, AttendanceRecord>();
            (attendanceData.data || []).forEach((record: AttendanceRecord) => {
                if (record.teacher_id != null) {
                    attendanceMap.set(record.teacher_id, record);
                }
            });

            const normalized = ((teachersData.data || []) as Teacher[])
                .map((teacher) => normalizeTeacher(teacher, attendanceMap))
                .filter((teacher) =>
                    mosque ? (teacher.mosque || "") === mosque : true,
                );

            setTeachers(normalized);
            setPagination(
                teachersData.pagination || {
                    current_page: page,
                    total: normalized.length,
                    per_page: perPage,
                    last_page: 1,
                },
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "تعذر تحميل البيانات";
            setError(message);

            let fallback = [...MOCK_TEACHERS];

            if (search.trim()) {
                const q = search.trim().toLowerCase();
                fallback = fallback.filter(
                    (teacher) =>
                        teacher.name.toLowerCase().includes(q) ||
                        teacher.email.toLowerCase().includes(q),
                );
            }

            if (status) {
                fallback = fallback.filter(
                    (teacher) => teacher.status === status,
                );
            }

            if (mosque) {
                fallback = fallback.filter(
                    (teacher) => teacher.mosque === mosque,
                );
            }

            setTeachers(fallback);
            setPagination({
                current_page: 1,
                total: fallback.length,
                per_page: perPage,
                last_page: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}/toggle-status`, {
            method: "POST",
        });
    };

    const deleteTeacher = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "DELETE",
        });
    };

    const updateTeacher = async (
        id: number,
        payload: Record<string, unknown>,
    ) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    };

    const createTeacher = async (payload: Record<string, unknown>) => {
        await apiFetch(`/api/v1/teachers/my-teachers`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    };

    useEffect(() => {
        loadMosques();
        fetchStats();
    }, []);

    return {
        teachers,
        pagination,
        stats,
        mosques,
        loading,
        error,
        fetchTeachers,
        fetchStats,
        toggleStatus,
        deleteTeacher,
        updateTeacher,
        createTeacher,
    };
};

const MyTeachersManagement: React.FC = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "active" | "suspended">(
        "all",
    );
    const [mosqueFilter, setMosqueFilter] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(8);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [confirmTeacher, setConfirmTeacher] = useState<Teacher | null>(null);
    const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        tone: "success" | "error";
    } | null>(null);
    const toastTimer = useRef<number | null>(null);

    const {
        teachers,
        pagination,
        stats,
        mosques,
        loading,
        error,
        fetchTeachers,
        fetchStats,
        toggleStatus,
        deleteTeacher,
        updateTeacher,
        createTeacher,
    } = useMyTeachers();

    useEffect(() => {
        const timeout = window.setTimeout(
            () => setDebouncedSearch(search),
            350,
        );
        return () => window.clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        const status = activeTab === "all" ? "" : activeTab;
        fetchTeachers(page, perPage, debouncedSearch, status, mosqueFilter);
    }, [page, perPage, debouncedSearch, activeTab, mosqueFilter]);

    const showToast = (
        message: string,
        tone: "success" | "error" = "success",
    ) => {
        setToast({ message, tone });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    };

    const displayTeachers = useMemo(() => {
        if (activeTab === "active") {
            return teachers.filter((teacher) => teacher.status === "active");
        }
        if (activeTab === "suspended") {
            return teachers.filter(
                (teacher) =>
                    teacher.status === "suspended" ||
                    teacher.status === "inactive",
            );
        }
        return teachers;
    }, [teachers, activeTab]);

    const pageRange = () => {
        const totalPages = pagination.last_page || 1;
        if (totalPages <= 6) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
        if (page >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }
        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    const handleRefresh = async () => {
        const status = activeTab === "all" ? "" : activeTab;
        await fetchTeachers(
            page,
            perPage,
            debouncedSearch,
            status,
            mosqueFilter,
        );
        await fetchStats();
        showToast("تم تحديث البيانات");
    };

    const handleToggleStatus = async (teacher: Teacher) => {
        try {
            await toggleStatus(teacher.id);
            await handleRefresh();
        } catch {
            showToast("تعذر تحديث الحالة", "error");
        }
    };

    const handleDelete = async (teacher: Teacher) => {
        try {
            await deleteTeacher(teacher.id);
            setConfirmTeacher(null);
            await handleRefresh();
            showToast("تم تعليق حساب المعلم");
        } catch {
            showToast("تعذر تنفيذ العملية", "error");
        }
    };

    const handleSaveTeacher = async (payload: Record<string, unknown>) => {
        if (!editTeacher) return;
        try {
            await updateTeacher(editTeacher.id, payload);
            await handleRefresh();
            showToast("تم حفظ التعديلات");
        } catch {
            showToast("تعذر حفظ التعديلات", "error");
            throw new Error("save_failed");
        }
    };

    const handleCreateTeacher = async (payload: Record<string, unknown>) => {
        try {
            await createTeacher(payload);
            await handleRefresh();
            showToast("تم إنشاء المعلم بنجاح");
        } catch {
            showToast("تعذر إنشاء المعلم، وتم إبقاء التصميم جاهزًا", "error");
            throw new Error("create_failed");
        }
    };

    return (
        <div className="my-teachers-page" dir="rtl">
            <div className="page-shell">
                <section className="hero-card">
                    <div>
                        <h1 className="hero-title">إدارة المعلمين</h1>
                        <p className="hero-copy">
                            واجهة كاملة تعرض المعلم، المسجد المرتبط به، عدد
                            الطلاب، الخطة، حالة الحضور، مع تبويب واضح بين
                            الحلقات والطلاب، وبوب أب محترم للتعديل والإنشاء بنفس
                            روح التصميم الأساسي.
                        </p>
                    </div>

                    <div className="hero-actions">
                        <button
                            className="btn secondary"
                            onClick={handleRefresh}
                        >
                            <FiRefreshCw size={15} />
                            تحديث
                        </button>

                        <button
                            className="btn primary"
                            onClick={() => setShowCreate(true)}
                        >
                            <FiPlus size={15} />
                            إضافة معلم
                        </button>
                    </div>
                </section>

                <section className="stats-grid">
                    <div className="stat-card gold">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FaChalkboardTeacher />
                            </div>
                            <FiTrendingUp />
                        </div>
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">إجمالي المعلمين</div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiCheckCircle />
                            </div>
                            <FiTrendingUp />
                        </div>
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-label">المعلمون النشطون</div>
                    </div>

                    <div className="stat-card blue">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiClock />
                            </div>
                            <FiFilter />
                        </div>
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-label">الطلبات المعلقة</div>
                    </div>

                    <div className="stat-card orange">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiXCircle />
                            </div>
                            <FiUsers />
                        </div>
                        <div className="stat-number">{stats.suspended}</div>
                        <div className="stat-label">الموقوفون</div>
                    </div>
                </section>

                <section className="filter-bar">
                    <label className="search-field">
                        <FiSearch size={16} />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="ابحث باسم المعلم أو البريد"
                        />
                    </label>

                    <label className="select-field">
                        <FaMosque size={14} />
                        <select
                            value={mosqueFilter}
                            onChange={(e) => {
                                setMosqueFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">كل المساجد</option>
                            {mosques.map((mosque) => (
                                <option key={mosque} value={mosque}>
                                    {mosque}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="select-field">
                        <FiFilter size={14} />
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={8}>8 / صفحة</option>
                            <option value={12}>12 / صفحة</option>
                            <option value={20}>20 / صفحة</option>
                        </select>
                    </label>

                    <div className="toolbar">
                        <button
                            className="btn secondary"
                            onClick={() => {
                                setSearch("");
                                setDebouncedSearch("");
                                setMosqueFilter("");
                                setActiveTab("all");
                                setPage(1);
                            }}
                        >
                            <FiX size={15} />
                            إعادة ضبط
                        </button>
                    </div>
                </section>

                <section className="table-shell">
                    {error && (
                        <div className="error-banner">
                            تعذر تحميل بعض البيانات من الـ API وتم عرض بيانات
                            بديلة مؤقتًا.
                        </div>
                    )}

                    <div className="table-head">
                        <div>
                            <h2 style={{ margin: 0, color: "var(--emerald)" }}>
                                قائمة المعلمين
                            </h2>
                            <div className="muted">
                                عرض {displayTeachers.length} معلم
                                {loading ? " - جاري التحديث..." : ""}
                            </div>
                        </div>

                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab("all");
                                    setPage(1);
                                }}
                            >
                                الكل
                            </button>

                            <button
                                className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab("active");
                                    setPage(1);
                                }}
                            >
                                النشطون
                            </button>

                            <button
                                className={`tab-btn ${activeTab === "suspended" ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab("suspended");
                                    setPage(1);
                                }}
                            >
                                الموقوفون
                            </button>
                        </div>
                    </div>

                    {displayTeachers.length > 0 ? (
                        <div className="teacher-list">
                            {displayTeachers.map((teacher, index) => (
                                <TeacherCard
                                    key={teacher.id}
                                    teacher={teacher}
                                    index={index}
                                    expanded={expandedIds.has(teacher.id)}
                                    onToggleExpand={() =>
                                        setExpandedIds((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(teacher.id))
                                                next.delete(teacher.id);
                                            else next.add(teacher.id);
                                            return next;
                                        })
                                    }
                                    onEdit={() => setEditTeacher(teacher)}
                                    onToggleStatus={() =>
                                        handleToggleStatus(teacher)
                                    }
                                    onDelete={() => setConfirmTeacher(teacher)}
                                    onStudentClick={(student) =>
                                        showToast(`الطالب: ${student.name}`)
                                    }
                                    onViewAllStudents={(teacherItem) => {
                                        window.location.href = `/teachers/${teacherItem.id}/students`;
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            لا توجد نتائج مطابقة للفلاتر الحالية.
                        </div>
                    )}

                    <div className="pagination-bar">
                        <div className="muted">
                            الصفحة {pagination.current_page} من{" "}
                            {pagination.last_page || 1}
                        </div>

                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((prev) => Math.max(1, prev - 1))
                                }
                            >
                                <FiChevronRight size={14} />
                            </button>

                            {pageRange().map((item, index) =>
                                item === "..." ? (
                                    <button
                                        key={`ellipsis-${index}`}
                                        className="page-btn"
                                        disabled
                                    >
                                        ...
                                    </button>
                                ) : (
                                    <button
                                        key={item}
                                        className={`page-btn ${page === item ? "active" : ""}`}
                                        onClick={() => setPage(item as number)}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}

                            <button
                                className="page-btn"
                                disabled={page >= (pagination.last_page || 1)}
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(
                                            pagination.last_page || 1,
                                            prev + 1,
                                        ),
                                    )
                                }
                            >
                                <FiChevronLeft size={14} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {confirmTeacher && (
                <ConfirmModal
                    message={`سيتم تعليق حساب ${confirmTeacher.name}. هل تريد المتابعة؟`}
                    onCancel={() => setConfirmTeacher(null)}
                    onConfirm={() => handleDelete(confirmTeacher)}
                />
            )}

            {editTeacher && (
                <TeacherFormModal
                    title="تعديل بيانات المعلم"
                    submitLabel="حفظ التعديلات"
                    mosques={mosques}
                    initialValues={{
                        name: editTeacher.name,
                        email: editTeacher.email,
                        phone: editTeacher.phone || "",
                        teacher_role: editTeacher.teacher?.role || "teacher",
                        notes: editTeacher.teacher?.notes || "",
                        mosque: editTeacher.mosque || "",
                    }}
                    onClose={() => setEditTeacher(null)}
                    onSubmit={handleSaveTeacher}
                />
            )}

            {showCreate && (
                <TeacherFormModal
                    title="إضافة معلم جديد"
                    submitLabel="إنشاء المعلم"
                    mosques={mosques}
                    initialValues={{
                        name: "",
                        email: "",
                        phone: "",
                        teacher_role: "teacher",
                        notes: "",
                        mosque: "",
                    }}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreateTeacher}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    tone={toast.tone}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default MyTeachersManagement;
