// FinancialDashboard.tsx
import { useState, useMemo, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiFileText, FiEdit2 } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { useTeacherPayrolls, PayrollItem } from "./hooks/useTeacherPayrolls";
import FinancialModel from "./models/FinancialModel";

const FinancialDashboard: React.FC = () => {
    const {
        payrolls: rawPayrolls = [],
        loading = false,
        search,
        setSearch,
        filterStatus = "all",
        setFilterStatus,
        markPaid,
    } = useTeacherPayrolls();

    const [showFinancialModel, setShowFinancialModel] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState<PayrollItem | null>(
        null,
    );

    const totalPayroll = useMemo(() => {
        return rawPayrolls.reduce((sum, emp) => {
            const value = parseFloat(emp?.total_due || "0");
            return isNaN(value) ? sum : sum + value;
        }, 0);
    }, [rawPayrolls]);

    const totalPending = useMemo(() => {
        return rawPayrolls
            .filter((emp: PayrollItem) => emp?.status === "pending")
            .reduce((sum, emp) => {
                const value = parseFloat(emp?.total_due || "0");
                return isNaN(value) ? sum : sum + value;
            }, 0);
    }, [rawPayrolls]);

    const totalPaid = useMemo(
        () => totalPayroll - totalPending,
        [totalPayroll, totalPending],
    );

    const handleOpenFinancialModel = useCallback((payroll?: PayrollItem) => {
        setEditingPayroll(payroll || null);
        setShowFinancialModel(true);
    }, []);

    const handleCloseFinancialModel = useCallback(() => {
        setShowFinancialModel(false);
        setEditingPayroll(null);
    }, []);

    const handleUpdatePayroll = useCallback(async () => {
        toast.success("تم حفظ التعديلات بنجاح");
        handleCloseFinancialModel();
    }, [handleCloseFinancialModel]);

    const handleExportPDF = useCallback(() => {
        const t = toast.loading("جاري تصدير PDF...");
        setTimeout(() => {
            toast.success("تم تصدير المسير الشهري بنجاح!", { id: t });
        }, 1500);
    }, []);

    const handleMarkPaidSafe = useCallback(
        async (id: number) => {
            try {
                const success = await markPaid(id);
                if (success) {
                    toast.success("تم تحديث الحالة");
                } else {
                    toast.error("❌ فشل في التحديث");
                }
            } catch {
                toast.error("❌ خطأ في التحديث");
            }
        },
        [markPaid],
    );

    const getStatusColor = useCallback(
        (status?: string) =>
            status === "paid"
                ? "text-green-600 bg-green-100"
                : "text-yellow-600 bg-yellow-100",
        [],
    );

    const getRoleName = useCallback((role?: string) => {
        const names: Record<string, string> = {
            teacher: "معلم",
            supervisor: "مشرف",
            financial: "مالية",
            motivator: "محفز",
            student_affairs: "شؤون طلاب",
        };
        return names[role as keyof typeof names] || "غير محدد";
    }, []);

    return (
        <>
            <Toaster position="top-right" rtl={true} />

            <FinancialModel
                isOpen={showFinancialModel}
                onClose={handleCloseFinancialModel}
                payroll={editingPayroll}
                onSubmit={handleUpdatePayroll}
            />

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">ملخص المستحقات والدوام</div>
                        <div
                            className="flx"
                            style={{
                                display: "flex",
                                alignContent: "center",
                            }}
                        >
                            {/* Filter Select */}
                            <div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value as any)
                                    }
                                    className="fi"
                                    style={{ margin: 0 }}
                                >
                                    <option value="all">
                                        الكل ({rawPayrolls.length})
                                    </option>
                                    <option value="pending">معلقة</option>
                                    <option value="paid">مدفوعة</option>
                                </select>
                            </div>

                            <input
                                style={{
                                    margin: "0 6px",
                                }}
                                className="fi"
                                placeholder="البحث بالاسم أو الدور..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الاسم</th>
                                    <th>الدور</th>
                                    <th>الراتب الأساسي</th>
                                    <th>أيام الدوام</th>
                                    <th>الخصومات</th>
                                    <th>المستحق</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawPayrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="empty text-center py-8 text-gray-500">
                                                لا توجد مستحقات حالياً
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rawPayrolls.map((item: PayrollItem) => (
                                        <tr key={item?.id || Math.random()}>
                                            <td
                                                className="teacherStudent__img"
                                                style={{ width: 60 }}
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs rounded-lg">
                                                        {(
                                                            item?.teacher?.user
                                                                ?.name ||
                                                            "غير معروف"
                                                        )
                                                            .split(" ")
                                                            .map(
                                                                (n: string) =>
                                                                    n[0],
                                                            )
                                                            .join("")
                                                            .slice(0, 2)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {item?.teacher?.user?.name ||
                                                    "غير معروف"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item?.teacher?.role ===
                                                        "teacher"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {getRoleName(
                                                        item?.teacher?.role,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="font-bold">
                                                ر.
                                                {parseFloat(
                                                    item?.base_salary || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td className="font-medium">
                                                {item?.attendance_days || 0}/26
                                            </td>
                                            <td className="text-red-600 font-medium">
                                                -ر.
                                                {parseFloat(
                                                    item?.deductions || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td className="font-bold text-green-600">
                                                ر.
                                                {parseFloat(
                                                    item?.total_due || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                        item?.status,
                                                    )}`}
                                                >
                                                    {item?.status === "paid"
                                                        ? "مدفوع"
                                                        : "معلق"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        onClick={() =>
                                                            handleMarkPaidSafe(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={
                                                            loading ||
                                                            item?.status ===
                                                                "paid"
                                                        }
                                                        className="btn bp bxs"
                                                        title="تحديد كمدفوع"
                                                    >
                                                        <IoCheckmarkCircleOutline
                                                            size={16}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleExportPDF
                                                        }
                                                        title="مسير PDF"
                                                        className="btn bs bxs"
                                                    >
                                                        <FiFileText size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleOpenFinancialModel(
                                                                item,
                                                            )
                                                        }
                                                        title="تعديل"
                                                        className="btn bs bxs"
                                                    >
                                                        <FiEdit2 size={16} />
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
        </>
    );
};

export default FinancialDashboard;
// import { useState, useMemo, useCallback } from "react";
// import { ICO } from "../icons";

// // ── Types ──────────────────────────────────────────────────────────────────
// interface Circle {
//     name: string;
//     students: number;
//     time: string;
// }

// interface Plan {
//     day: string;
//     title: string;
//     time: string;
//     hours: number;
// }

// interface Teacher {
//     id: string;
//     name: string;
//     avatarIdx: number;
//     mosque: string;
//     status: "online" | "offline" | "away";
//     circles: number;
//     circleList: Circle[];
//     presentDays: string[];
//     holidayDays: string[];
//     timeIn: string;
//     timeOut: string;
//     hours: number;
//     maxHours: number;
//     salary: number;
//     deduction: number;
//     net: number;
//     students: number;
//     plans: Plan[];
//     phone: string;
//     joinDate: string;
//     rating: number;
//     monthlyAttRate: number;
//     subject: string;
// }

// // ── Sheikh SVG ─────────────────────────────────────────────────────────────
// function SheikhSVG({ idx }: { idx: number }) {
//     const skins = [
//         "#F5D3A8",
//         "#E8B97A",
//         "#D4915A",
//         "#F0C894",
//         "#E8A86A",
//         "#C8784A",
//     ];
//     const robes: [string, string][] = [
//         ["#FFFFFF", "#F5F5F5"],
//         ["#1A5C3A", "#2E7D52"],
//         ["#C9A84C", "#8B6914"],
//         ["#37474F", "#263238"],
//         ["#1565C0", "#0D47A1"],
//         ["#4A148C", "#38006b"],
//     ];
//     const skin = skins[idx % skins.length];
//     const [robe1, robe2] = robes[idx % robes.length];
//     const hasBeard = idx % 3 !== 0;
//     const hasGlasses = idx % 5 === 2;
//     const hatColor = idx % 2 === 0 ? "#FFFFFF" : "#1A5C3A";
//     const bgId = `bg_${idx}`;
//     return (
//         <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <circle cx="40" cy="40" r="38" fill={`url(#${bgId})`} />
//             <defs>
//                 <radialGradient id={bgId} cx="50%" cy="40%" r="50%">
//                     <stop offset="0%" stopColor="#EBF5EF" />
//                     <stop offset="100%" stopColor="#D4EBD9" />
//                 </radialGradient>
//             </defs>
//             <path
//                 d="M15 80 C15 58 25 52 40 52 C55 52 65 58 65 80Z"
//                 fill={robe1}
//             />
//             <path d="M30 52 L40 62 L50 52Z" fill={robe2} opacity={0.4} />
//             <rect x="35" y="44" width="10" height="10" rx="3" fill={skin} />
//             <ellipse cx="40" cy="34" rx="14" ry="15" fill={skin} />
//             <ellipse
//                 cx="40"
//                 cy="21"
//                 rx="12"
//                 ry="5"
//                 fill={hatColor}
//                 opacity={0.95}
//             />
//             <rect
//                 x="28"
//                 y="18"
//                 width="24"
//                 height="7"
//                 rx="3"
//                 fill={hatColor}
//                 opacity={0.9}
//             />
//             {hasBeard && (
//                 <path
//                     d="M28 40 Q40 50 52 40 Q48 48 40 50 Q32 48 28 40Z"
//                     fill="#3D2314"
//                     opacity={0.7}
//                 />
//             )}
//             <circle cx="35" cy="35" r="2.5" fill="#2C1810" />
//             <circle cx="45" cy="35" r="2.5" fill="#2C1810" />
//             <circle cx="36" cy="34" r="0.8" fill="white" />
//             <circle cx="46" cy="34" r="0.8" fill="white" />
//             {hasGlasses && (
//                 <>
//                     <path
//                         d="M31 35 Q33 33 36 35 Q38 33 41 35"
//                         stroke="#666"
//                         strokeWidth="1.2"
//                         fill="none"
//                     />
//                     <path
//                         d="M41 35 Q43 33 46 35 Q48 33 50 35"
//                         stroke="#666"
//                         strokeWidth="1.2"
//                         fill="none"
//                     />
//                     <line
//                         x1="38.5"
//                         y1="35"
//                         x2="41"
//                         y2="35"
//                         stroke="#666"
//                         strokeWidth="1"
//                     />
//                 </>
//             )}
//             <path
//                 d="M36 40 Q40 43 44 40"
//                 stroke="#B87040"
//                 strokeWidth="1.2"
//                 fill="none"
//                 strokeLinecap="round"
//             />
//             <circle cx="40" cy="58" r="3" fill={robe2} opacity={0.5} />
//         </svg>
//     );
// }

// // ── Mock Data ──────────────────────────────────────────────────────────────
// const TEACHERS: Teacher[] = [
//     {
//         id: "T-001",
//         name: "أحمد ناصر مصطفى",
//         avatarIdx: 0,
//         mosque: "مسجد الفاروق",
//         status: "online",
//         circles: 3,
//         circleList: [
//             { name: "حلقة الفجر", students: 15, time: "08:00–09:00" },
//             { name: "حلقة العصر", students: 18, time: "16:00–17:30" },
//             { name: "حلقة المغرب", students: 12, time: "19:00–20:00" },
//         ],
//         presentDays: ["س", "أ", "ث", "أر", "خ"],
//         holidayDays: [],
//         timeIn: "08:00",
//         timeOut: "14:00",
//         hours: 42,
//         maxHours: 48,
//         salary: 2800,
//         deduction: 0,
//         net: 2800,
//         students: 45,
//         phone: "0501234567",
//         joinDate: "2022-03-15",
//         rating: 4.8,
//         monthlyAttRate: 96,
//         subject: "تحفيظ القرآن",
//         plans: [
//             { day: "السبت", title: "مراجعة الحفظ", time: "08:00", hours: 2 },
//             { day: "الأحد", title: "تجويد متقدم", time: "09:00", hours: 3 },
//             { day: "الثلاثاء", title: "اختبار شهري", time: "10:00", hours: 2 },
//         ],
//     },
//     {
//         id: "T-002",
//         name: "فاطمة عبدالله الزهراني",
//         avatarIdx: 1,
//         mosque: "مسجد النور",
//         status: "away",
//         circles: 2,
//         circleList: [
//             { name: "حلقة الصباح", students: 14, time: "09:00–10:30" },
//             { name: "حلقة المساء", students: 16, time: "17:00–18:30" },
//         ],
//         presentDays: ["أ", "ث", "خ"],
//         holidayDays: ["س"],
//         timeIn: "09:00",
//         timeOut: "15:00",
//         hours: 36,
//         maxHours: 48,
//         salary: 2400,
//         deduction: 100,
//         net: 2300,
//         students: 30,
//         phone: "0507654321",
//         joinDate: "2021-09-01",
//         rating: 4.5,
//         monthlyAttRate: 88,
//         subject: "التجويد",
//         plans: [
//             { day: "الأحد", title: "أحكام التجويد", time: "09:00", hours: 3 },
//             { day: "الثلاثاء", title: "تطبيق عملي", time: "10:00", hours: 2 },
//         ],
//     },
//     {
//         id: "T-003",
//         name: "محمد عبدالرحمن القحطاني",
//         avatarIdx: 2,
//         mosque: "مسجد الرحمة",
//         status: "online",
//         circles: 4,
//         circleList: [
//             { name: "حلقة الفجر الكبرى", students: 20, time: "06:30–08:00" },
//             { name: "حلقة الضحى", students: 12, time: "09:00–10:00" },
//             { name: "حلقة العصر", students: 18, time: "15:30–17:00" },
//             { name: "حلقة العشاء", students: 10, time: "21:00–22:00" },
//         ],
//         presentDays: ["س", "أ", "ث", "أر", "خ"],
//         holidayDays: [],
//         timeIn: "06:30",
//         timeOut: "14:30",
//         hours: 48,
//         maxHours: 48,
//         salary: 3200,
//         deduction: 0,
//         net: 3200,
//         students: 60,
//         phone: "0509876543",
//         joinDate: "2020-01-10",
//         rating: 5.0,
//         monthlyAttRate: 100,
//         subject: "تحفيظ وتجويد",
//         plans: [
//             { day: "السبت", title: "إجازة حفاظ", time: "07:00", hours: 4 },
//             { day: "الإثنين", title: "مراجعة عامة", time: "09:00", hours: 3 },
//             {
//                 day: "الأربعاء",
//                 title: "اختبار أسبوعي",
//                 time: "10:00",
//                 hours: 2,
//             },
//         ],
//     },
//     {
//         id: "T-004",
//         name: "سارة محمد الغامدي",
//         avatarIdx: 3,
//         mosque: "",
//         status: "offline",
//         circles: 1,
//         circleList: [
//             { name: "حلقة التأسيس", students: 8, time: "10:00–11:30" },
//         ],
//         presentDays: ["ث", "خ"],
//         holidayDays: ["س", "أ"],
//         timeIn: "10:00",
//         timeOut: "13:00",
//         hours: 18,
//         maxHours: 32,
//         salary: 1600,
//         deduction: 200,
//         net: 1400,
//         students: 8,
//         phone: "0511111222",
//         joinDate: "2023-06-01",
//         rating: 3.9,
//         monthlyAttRate: 72,
//         subject: "القراءة للمبتدئين",
//         plans: [
//             {
//                 day: "الثلاثاء",
//                 title: "تأسيس نطق الحروف",
//                 time: "10:00",
//                 hours: 3,
//             },
//             {
//                 day: "الخميس",
//                 title: "مراجعة الجزء الأول",
//                 time: "10:00",
//                 hours: 3,
//             },
//         ],
//     },
//     {
//         id: "T-005",
//         name: "خالد إبراهيم الشمري",
//         avatarIdx: 4,
//         mosque: "مسجد التقوى",
//         status: "online",
//         circles: 2,
//         circleList: [
//             { name: "حلقة الشباب", students: 22, time: "08:00–09:30" },
//             { name: "حلقة الكبار", students: 11, time: "20:00–21:30" },
//         ],
//         presentDays: ["س", "أ", "ث", "أر"],
//         holidayDays: ["خ"],
//         timeIn: "08:00",
//         timeOut: "14:00",
//         hours: 40,
//         maxHours: 48,
//         salary: 2600,
//         deduction: 50,
//         net: 2550,
//         students: 33,
//         phone: "0522233344",
//         joinDate: "2021-11-20",
//         rating: 4.6,
//         monthlyAttRate: 91,
//         subject: "تحفيظ القرآن",
//         plans: [
//             {
//                 day: "السبت",
//                 title: "سورة البقرة مراجعة",
//                 time: "08:00",
//                 hours: 2,
//             },
//             { day: "الأحد", title: "أحكام المد", time: "09:00", hours: 2 },
//         ],
//     },
//     {
//         id: "T-006",
//         name: "نورا عبدالعزيز الدوسري",
//         avatarIdx: 5,
//         mosque: "مسجد الإيمان",
//         status: "online",
//         circles: 3,
//         circleList: [
//             { name: "حلقة النساء الصباحية", students: 25, time: "09:00–10:30" },
//             { name: "حلقة المراهقات", students: 17, time: "16:00–17:00" },
//             { name: "حلقة الأمهات", students: 13, time: "19:30–21:00" },
//         ],
//         presentDays: ["س", "أ", "أر", "خ"],
//         holidayDays: ["ث"],
//         timeIn: "09:00",
//         timeOut: "15:30",
//         hours: 44,
//         maxHours: 48,
//         salary: 3000,
//         deduction: 0,
//         net: 3000,
//         students: 55,
//         phone: "0533344455",
//         joinDate: "2019-08-12",
//         rating: 4.9,
//         monthlyAttRate: 98,
//         subject: "تجويد وتفسير",
//         plans: [
//             { day: "السبت", title: "تفسير الجزء عم", time: "09:00", hours: 3 },
//             {
//                 day: "الأحد",
//                 title: "أحكام الوقف والابتداء",
//                 time: "10:00",
//                 hours: 2,
//             },
//             { day: "الأربعاء", title: "مسابقة الحفظ", time: "09:30", hours: 2 },
//         ],
//     },
//     {
//         id: "T-007",
//         name: "عمر سليمان العتيبي",
//         avatarIdx: 0,
//         mosque: "مسجد البدر",
//         status: "away",
//         circles: 2,
//         circleList: [
//             { name: "حلقة الأطفال", students: 19, time: "07:30–08:30" },
//             { name: "حلقة المتوسطة", students: 14, time: "16:00–17:30" },
//         ],
//         presentDays: ["أ", "أر", "خ"],
//         holidayDays: ["س"],
//         timeIn: "07:30",
//         timeOut: "13:00",
//         hours: 30,
//         maxHours: 40,
//         salary: 2200,
//         deduction: 150,
//         net: 2050,
//         students: 33,
//         phone: "0544455566",
//         joinDate: "2022-07-05",
//         rating: 4.2,
//         monthlyAttRate: 82,
//         subject: "تحفيظ للأطفال",
//         plans: [
//             { day: "الأحد", title: "ألعاب تحفيظية", time: "07:30", hours: 2 },
//             {
//                 day: "الأربعاء",
//                 title: "مراجعة أسبوعية",
//                 time: "08:00",
//                 hours: 2,
//             },
//         ],
//     },
//     {
//         id: "T-008",
//         name: "رنا يوسف الحربي",
//         avatarIdx: 3,
//         mosque: "",
//         status: "offline",
//         circles: 1,
//         circleList: [
//             { name: "حلقة التمهيدي", students: 6, time: "11:00–12:00" },
//         ],
//         presentDays: ["خ"],
//         holidayDays: ["س", "أ", "ث"],
//         timeIn: "11:00",
//         timeOut: "12:30",
//         hours: 8,
//         maxHours: 24,
//         salary: 1200,
//         deduction: 400,
//         net: 800,
//         students: 6,
//         phone: "0555566677",
//         joinDate: "2024-01-15",
//         rating: 3.5,
//         monthlyAttRate: 55,
//         subject: "القراءة التمهيدية",
//         plans: [
//             {
//                 day: "الخميس",
//                 title: "نطق الحروف الهجائية",
//                 time: "11:00",
//                 hours: 2,
//             },
//         ],
//     },
// ];

// // ── Analytics helpers ──────────────────────────────────────────────────────
// function getAnalytics(data: Teacher[]) {
//     const total = data.length;
//     const online = data.filter((t) => t.status === "online").length;
//     const away = data.filter((t) => t.status === "away").length;
//     const offline = data.filter((t) => t.status === "offline").length;
//     const totalStudents = data.reduce((s, t) => s + t.students, 0);
//     const totalCircles = data.reduce((s, t) => s + t.circles, 0);
//     const totalSalary = data.reduce((s, t) => s + t.net, 0);
//     const totalDeduction = data.reduce((s, t) => s + t.deduction, 0);
//     const avgAtt = total
//         ? Math.round(data.reduce((s, t) => s + t.monthlyAttRate, 0) / total)
//         : 0;
//     const avgRating = total
//         ? +(data.reduce((s, t) => s + t.rating, 0) / total).toFixed(1)
//         : 0;
//     const totalHours = data.reduce((s, t) => s + t.hours, 0);
//     return {
//         total,
//         online,
//         away,
//         offline,
//         totalStudents,
//         totalCircles,
//         totalSalary,
//         totalDeduction,
//         avgAtt,
//         avgRating,
//         totalHours,
//     };
// }

// // ── Stars ──────────────────────────────────────────────────────────────────
// function Stars({ rating }: { rating: number }) {
//     return (
//         <div style={{ display: "flex", gap: 1 }}>
//             {[1, 2, 3, 4, 5].map((i) => (
//                 <svg
//                     key={i}
//                     width="10"
//                     height="10"
//                     viewBox="0 0 24 24"
//                     fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
//                 >
//                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                 </svg>
//             ))}
//             <span
//                 style={{ fontSize: 10, color: "var(--n500)", marginRight: 3 }}
//             >
//                 {rating}
//             </span>
//         </div>
//     );
// }

// // ── Mini attendance bar ────────────────────────────────────────────────────
// function AttBar({ rate }: { rate: number }) {
//     const color =
//         rate >= 90
//             ? "var(--emerald, #10b981)"
//             : rate >= 75
//               ? "#f59e0b"
//               : "var(--red, #ef4444)";
//     return (
//         <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//             <div
//                 style={{
//                     flex: 1,
//                     height: 4,
//                     background: "var(--n200)",
//                     borderRadius: 4,
//                     overflow: "hidden",
//                     minWidth: 50,
//                 }}
//             >
//                 <div
//                     style={{
//                         height: "100%",
//                         width: `${rate}%`,
//                         background: color,
//                         borderRadius: 4,
//                         transition: "width .6s ease",
//                     }}
//                 />
//             </div>
//             <span style={{ fontSize: 10, fontWeight: 700, color }}>
//                 {rate}%
//             </span>
//         </div>
//     );
// }

// // ── Teacher Detail Modal ───────────────────────────────────────────────────
// function TeacherDetailModal({
//     teacher,
//     onClose,
// }: {
//     teacher: Teacher;
//     onClose: () => void;
// }) {
//     const hoursPercent = Math.round((teacher.hours / teacher.maxHours) * 100);
//     const hColor =
//         hoursPercent >= 80
//             ? "#10b981"
//             : hoursPercent >= 50
//               ? "#f59e0b"
//               : "#ef4444";

//     return (
//         <div
//             style={{
//                 position: "fixed",
//                 inset: 0,
//                 zIndex: 3000,
//                 background: "rgba(0,0,0,.55)",
//                 backdropFilter: "blur(6px)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//             }}
//             onClick={onClose}
//         >
//             <div
//                 style={{
//                     background: "white",
//                     borderRadius: 18,
//                     padding: 28,
//                     maxWidth: 620,
//                     width: "94%",
//                     direction: "rtl",
//                     maxHeight: "88vh",
//                     overflowY: "auto",
//                 }}
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Header */}
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                         marginBottom: 22,
//                     }}
//                 >
//                     <div
//                         style={{
//                             display: "flex",
//                             gap: 14,
//                             alignItems: "center",
//                         }}
//                     >
//                         <div
//                             style={{
//                                 width: 60,
//                                 height: 60,
//                                 borderRadius: "50%",
//                                 overflow: "hidden",
//                                 flexShrink: 0,
//                             }}
//                         >
//                             <SheikhSVG idx={teacher.avatarIdx} />
//                         </div>
//                         <div>
//                             <div
//                                 style={{
//                                     fontSize: 16,
//                                     fontWeight: 800,
//                                     color: "var(--n800, #1a1a2e)",
//                                 }}
//                             >
//                                 {teacher.name}
//                             </div>
//                             <div
//                                 style={{
//                                     fontSize: 11,
//                                     color: "var(--n500)",
//                                     marginTop: 2,
//                                 }}
//                             >
//                                 {teacher.subject} · {teacher.id}
//                             </div>
//                             <Stars rating={teacher.rating} />
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         style={{
//                             background: "var(--n100)",
//                             border: "none",
//                             cursor: "pointer",
//                             borderRadius: 8,
//                             padding: "6px 12px",
//                             fontSize: 13,
//                             color: "var(--n600)",
//                         }}
//                     >
//                         ✕ إغلاق
//                     </button>
//                 </div>

//                 {/* KPI row */}
//                 <div
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns: "repeat(4,1fr)",
//                         gap: 10,
//                         marginBottom: 20,
//                     }}
//                 >
//                     {[
//                         {
//                             l: "الطلاب",
//                             v: teacher.students,
//                             col: "#dbeafe",
//                             tc: "#1d4ed8",
//                         },
//                         {
//                             l: "الحلقات",
//                             v: teacher.circles,
//                             col: "#d1fae5",
//                             tc: "#065f46",
//                         },
//                         {
//                             l: "الساعات",
//                             v: `${teacher.hours}س`,
//                             col: "#fef3c7",
//                             tc: "#92400e",
//                         },
//                         {
//                             l: "صافي الراتب",
//                             v: `${teacher.net.toLocaleString()} ر.س`,
//                             col: "#ede9fe",
//                             tc: "#5b21b6",
//                         },
//                     ].map((k, i) => (
//                         <div
//                             key={i}
//                             style={{
//                                 background: k.col,
//                                 borderRadius: 10,
//                                 padding: "10px 12px",
//                                 textAlign: "center",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     fontSize: 14,
//                                     fontWeight: 800,
//                                     color: k.tc,
//                                 }}
//                             >
//                                 {k.v}
//                             </div>
//                             <div
//                                 style={{
//                                     fontSize: 10,
//                                     color: k.tc,
//                                     opacity: 0.7,
//                                 }}
//                             >
//                                 {k.l}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Hours progress */}
//                 <div
//                     style={{
//                         background: "var(--n50)",
//                         borderRadius: 10,
//                         padding: "12px 14px",
//                         marginBottom: 16,
//                     }}
//                 >
//                     <div
//                         style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             marginBottom: 6,
//                             fontSize: 12,
//                             fontWeight: 600,
//                             color: "var(--n700)",
//                         }}
//                     >
//                         <span>ساعات العمل هذا الشهر</span>
//                         <span style={{ color: hColor }}>
//                             {teacher.hours} / {teacher.maxHours} ساعة
//                         </span>
//                     </div>
//                     <div
//                         style={{
//                             height: 8,
//                             background: "var(--n200)",
//                             borderRadius: 8,
//                             overflow: "hidden",
//                         }}
//                     >
//                         <div
//                             style={{
//                                 height: "100%",
//                                 width: `${hoursPercent}%`,
//                                 background: hColor,
//                                 borderRadius: 8,
//                                 transition: "width .6s",
//                             }}
//                         />
//                     </div>
//                 </div>

//                 {/* Attendance */}
//                 <div
//                     style={{
//                         background: "var(--n50)",
//                         borderRadius: 10,
//                         padding: "12px 14px",
//                         marginBottom: 16,
//                     }}
//                 >
//                     <div
//                         style={{
//                             fontSize: 12,
//                             fontWeight: 600,
//                             color: "var(--n700)",
//                             marginBottom: 8,
//                         }}
//                     >
//                         نسبة الحضور الشهري
//                     </div>
//                     <AttBar rate={teacher.monthlyAttRate} />
//                     <div
//                         style={{
//                             display: "flex",
//                             gap: 6,
//                             marginTop: 8,
//                             flexWrap: "wrap",
//                         }}
//                     >
//                         {["س", "أ", "ث", "أر", "خ"].map((d) => {
//                             const cls = teacher.presentDays.includes(d)
//                                 ? "#10b981"
//                                 : teacher.holidayDays.includes(d)
//                                   ? "#f59e0b"
//                                   : "#ef4444";
//                             const label = {
//                                 س: "السبت",
//                                 أ: "الأحد",
//                                 ث: "الثلاثاء",
//                                 أر: "الأربعاء",
//                                 خ: "الخميس",
//                             }[d];
//                             return (
//                                 <div
//                                     key={d}
//                                     style={{
//                                         display: "flex",
//                                         alignItems: "center",
//                                         gap: 4,
//                                         fontSize: 10,
//                                         background:
//                                             teacher.presentDays.includes(d)
//                                                 ? "#d1fae5"
//                                                 : teacher.holidayDays.includes(
//                                                         d,
//                                                     )
//                                                   ? "#fef3c7"
//                                                   : "#fee2e2",
//                                         color: cls,
//                                         borderRadius: 6,
//                                         padding: "3px 8px",
//                                         fontWeight: 600,
//                                     }}
//                                 >
//                                     <div
//                                         style={{
//                                             width: 6,
//                                             height: 6,
//                                             borderRadius: "50%",
//                                             background: cls,
//                                         }}
//                                     />
//                                     {label}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Circles */}
//                 <div style={{ marginBottom: 16 }}>
//                     <div
//                         style={{
//                             fontSize: 12,
//                             fontWeight: 700,
//                             color: "var(--n700)",
//                             marginBottom: 8,
//                         }}
//                     >
//                         الحلقات القرآنية
//                     </div>
//                     <div style={{ display: "grid", gap: 7 }}>
//                         {teacher.circleList.map((c, i) => (
//                             <div
//                                 key={i}
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     background: "var(--n50)",
//                                     border: "1px solid var(--n200)",
//                                     borderRadius: 9,
//                                     padding: "9px 12px",
//                                 }}
//                             >
//                                 <div>
//                                     <div
//                                         style={{
//                                             fontSize: 12,
//                                             fontWeight: 600,
//                                             color: "var(--n800)",
//                                         }}
//                                     >
//                                         {c.name}
//                                     </div>
//                                     <div
//                                         style={{
//                                             fontSize: 10,
//                                             color: "var(--n500)",
//                                         }}
//                                     >
//                                         {c.students} طالب
//                                     </div>
//                                 </div>
//                                 <div
//                                     style={{
//                                         fontSize: 11,
//                                         color: "var(--n600)",
//                                         background: "var(--n100)",
//                                         borderRadius: 6,
//                                         padding: "3px 9px",
//                                     }}
//                                 >
//                                     {c.time}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Plans */}
//                 <div>
//                     <div
//                         style={{
//                             fontSize: 12,
//                             fontWeight: 700,
//                             color: "var(--n700)",
//                             marginBottom: 8,
//                         }}
//                     >
//                         الخطة الأسبوعية
//                     </div>
//                     <div style={{ display: "grid", gap: 7 }}>
//                         {teacher.plans.map((p, i) => (
//                             <div
//                                 key={i}
//                                 style={{
//                                     display: "flex",
//                                     gap: 10,
//                                     alignItems: "center",
//                                     background: "var(--n50)",
//                                     border: "1px solid var(--n200)",
//                                     borderRadius: 9,
//                                     padding: "8px 12px",
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         background: "#dbeafe",
//                                         color: "#1d4ed8",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         borderRadius: 6,
//                                         padding: "3px 8px",
//                                         whiteSpace: "nowrap",
//                                     }}
//                                 >
//                                     {p.day.substring(0, 2)}
//                                 </div>
//                                 <div
//                                     style={{
//                                         flex: 1,
//                                         fontSize: 12,
//                                         fontWeight: 500,
//                                         color: "var(--n700)",
//                                     }}
//                                 >
//                                     {p.title}
//                                 </div>
//                                 <div
//                                     style={{
//                                         fontSize: 10,
//                                         color: "var(--n500)",
//                                     }}
//                                 >
//                                     {p.time}
//                                 </div>
//                                 <div
//                                     style={{
//                                         background: "#fef3c7",
//                                         color: "#92400e",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         borderRadius: 6,
//                                         padding: "3px 8px",
//                                     }}
//                                 >
//                                     {p.hours}س
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Salary breakdown */}
//                 <div
//                     style={{
//                         background: "var(--n50)",
//                         borderRadius: 10,
//                         padding: "12px 14px",
//                         marginTop: 16,
//                         border: "1px solid var(--n200)",
//                     }}
//                 >
//                     <div
//                         style={{
//                             fontSize: 12,
//                             fontWeight: 700,
//                             color: "var(--n700)",
//                             marginBottom: 10,
//                         }}
//                     >
//                         تفاصيل الراتب
//                     </div>
//                     <div
//                         style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: 6,
//                         }}
//                     >
//                         <div
//                             style={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 fontSize: 12,
//                             }}
//                         >
//                             <span style={{ color: "var(--n600)" }}>
//                                 الراتب الأساسي
//                             </span>
//                             <span style={{ fontWeight: 600 }}>
//                                 {teacher.salary.toLocaleString()} ر.س
//                             </span>
//                         </div>
//                         {teacher.deduction > 0 && (
//                             <div
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     fontSize: 12,
//                                 }}
//                             >
//                                 <span style={{ color: "#ef4444" }}>
//                                     الخصومات
//                                 </span>
//                                 <span
//                                     style={{
//                                         fontWeight: 600,
//                                         color: "#ef4444",
//                                     }}
//                                 >
//                                     — {teacher.deduction.toLocaleString()} ر.س
//                                 </span>
//                             </div>
//                         )}
//                         <div
//                             style={{
//                                 borderTop: "1px dashed var(--n200)",
//                                 paddingTop: 6,
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 fontSize: 13,
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     fontWeight: 700,
//                                     color: "var(--n800)",
//                                 }}
//                             >
//                                 الصافي
//                             </span>
//                             <span
//                                 style={{
//                                     fontWeight: 800,
//                                     color: "#10b981",
//                                     fontSize: 14,
//                                 }}
//                             >
//                                 {teacher.net.toLocaleString()} ر.س
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ── Analytics Bar Chart (mini SVG) ─────────────────────────────────────────
// function MiniBarChart({
//     data,
// }: {
//     data: { label: string; value: number; color: string }[];
// }) {
//     const max = Math.max(...data.map((d) => d.value), 1);
//     return (
//         <div
//             style={{
//                 display: "flex",
//                 gap: 6,
//                 alignItems: "flex-end",
//                 height: 50,
//             }}
//         >
//             {data.map((d, i) => (
//                 <div
//                     key={i}
//                     style={{
//                         flex: 1,
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         gap: 3,
//                     }}
//                 >
//                     <span
//                         style={{ fontSize: 9, fontWeight: 700, color: d.color }}
//                     >
//                         {d.value}
//                     </span>
//                     <div
//                         style={{
//                             width: "100%",
//                             background: "var(--n100)",
//                             borderRadius: 4,
//                             height: 36,
//                             display: "flex",
//                             alignItems: "flex-end",
//                         }}
//                     >
//                         <div
//                             style={{
//                                 width: "100%",
//                                 height: `${(d.value / max) * 100}%`,
//                                 background: d.color,
//                                 borderRadius: 4,
//                                 minHeight: 3,
//                                 transition: "height .6s",
//                             }}
//                         />
//                     </div>
//                     <span
//                         style={{
//                             fontSize: 8,
//                             color: "var(--n500)",
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         {d.label}
//                     </span>
//                 </div>
//             ))}
//         </div>
//     );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────
// const FinancialDashboard: React.FC = () => {
//     const [search, setSearch] = useState("");
//     const [filterMosque, setFilterMosque] = useState("");
//     const [filterStatus, setFilterStatus] = useState<
//         "" | "online" | "offline" | "away"
//     >("");
//     const [sortKey, setSortKey] = useState<keyof Teacher | "">("");
//     const [sortDir, setSortDir] = useState<1 | -1>(-1);
//     const [activeTab, setActiveTab] = useState<
//         "all" | "online" | "mosque" | "free"
//     >("all");
//     const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
//     const [currentPage, setCurrentPage] = useState(1);
//     const [perPage, setPerPage] = useState(8);
//     const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(
//         null,
//     );
//     const [showAnalytics, setShowAnalytics] = useState(false);

//     // Unique mosques
//     const mosques = useMemo(
//         () => [...new Set(TEACHERS.map((t) => t.mosque).filter(Boolean))],
//         [],
//     );

//     // Filter + sort
//     const filteredData = useMemo(() => {
//         let d = TEACHERS.filter((t) => {
//             const matchSearch =
//                 !search || t.name.includes(search) || t.id.includes(search);
//             const matchMosque =
//                 !filterMosque ||
//                 (filterMosque === "بلا مسجد"
//                     ? !t.mosque
//                     : t.mosque === filterMosque);
//             const matchStatus = !filterStatus || t.status === filterStatus;
//             const matchTab =
//                 activeTab === "all"
//                     ? true
//                     : activeTab === "online"
//                       ? t.status === "online"
//                       : activeTab === "mosque"
//                         ? !!t.mosque
//                         : !t.mosque;
//             return matchSearch && matchMosque && matchStatus && matchTab;
//         });
//         if (sortKey) {
//             d = [...d].sort((a, b) => {
//                 const av = a[sortKey],
//                     bv = b[sortKey];
//                 if (typeof av === "number" && typeof bv === "number")
//                     return (bv - av) * sortDir;
//                 return String(av).localeCompare(String(bv), "ar") * sortDir;
//             });
//         }
//         return d;
//     }, [search, filterMosque, filterStatus, sortKey, sortDir, activeTab]);

//     const analytics = useMemo(() => getAnalytics(filteredData), [filteredData]);

//     const totalPages = Math.ceil(filteredData.length / perPage);
//     const pageData = useMemo(() => {
//         const start = (currentPage - 1) * perPage;
//         return filteredData.slice(start, start + perPage);
//     }, [filteredData, currentPage, perPage]);

//     const handleSort = useCallback(
//         (key: keyof Teacher) => {
//             setSortDir((d) => (sortKey === key ? (d === 1 ? -1 : 1) : -1));
//             setSortKey(key);
//             setCurrentPage(1);
//         },
//         [sortKey],
//     );

//     const toggleExpand = useCallback((id: string) => {
//         setExpandedRows((prev) => {
//             const s = new Set(prev);
//             s.has(id) ? s.delete(id) : s.add(id);
//             return s;
//         });
//     }, []);

//     const resetFilters = useCallback(() => {
//         setSearch("");
//         setFilterMosque("");
//         setFilterStatus("");
//         setSortKey("");
//         setActiveTab("all");
//         setCurrentPage(1);
//     }, []);

//     const statusLabel = {
//         online: "أونلاين",
//         offline: "أوفلاين",
//         away: "متأخر",
//     };
//     const statusClass = {
//         online: "badge-online",
//         offline: "badge-offline",
//         away: "badge-away",
//     };
//     const statusIcon = { online: "●", offline: "✕", away: "⏱" };

//     const SortIcon = ({ k }: { k: keyof Teacher }) => (
//         <span
//             style={{
//                 fontSize: 9,
//                 opacity: sortKey === k ? 1 : 0.35,
//                 marginLeft: 3,
//             }}
//         >
//             {sortKey === k ? (sortDir === -1 ? "▼" : "▲") : "⇅"}
//         </span>
//     );

//     const days = ["س", "أ", "ث", "أر", "خ"];
//     const dayLabel: Record<string, string> = {
//         س: "السبت",
//         أ: "الأحد",
//         ث: "الثلاثاء",
//         أر: "الأربعاء",
//         خ: "الخميس",
//     };

//     return (
//         <div className="content" id="contentArea">
//             <div
//                 className="widget"
//                 style={{ background: "transparent", border: "none" }}
//             >
//                 <div className="cc">
//                     {/* ── Analytics Panel (toggle) ─────────────────────────────── */}
//                     {showAnalytics && (
//                         <div className="widget" style={{ marginBottom: 14 }}>
//                             <div className="wh">
//                                 <span className="wh-l">📊 لوحة التحليلات</span>
//                                 <button
//                                     className="btn bs bsm"
//                                     onClick={() => setShowAnalytics(false)}
//                                 >
//                                     إخفاء
//                                 </button>
//                             </div>
//                             <div className="wb">
//                                 {/* KPI mini cards */}
//                                 <div
//                                     style={{
//                                         display: "grid",
//                                         gridTemplateColumns:
//                                             "repeat(auto-fill,minmax(130px,1fr))",
//                                         gap: 10,
//                                         marginBottom: 16,
//                                     }}
//                                 >
//                                     {[
//                                         {
//                                             l: "إجمالي المعلمين",
//                                             v: analytics.total,
//                                             col: "#dbeafe",
//                                             tc: "#1d4ed8",
//                                         },
//                                         {
//                                             l: "نشطون الآن",
//                                             v: analytics.online,
//                                             col: "#d1fae5",
//                                             tc: "#065f46",
//                                         },
//                                         {
//                                             l: "متأخرون",
//                                             v: analytics.away,
//                                             col: "#fef3c7",
//                                             tc: "#92400e",
//                                         },
//                                         {
//                                             l: "غائبون",
//                                             v: analytics.offline,
//                                             col: "#fee2e2",
//                                             tc: "#b91c1c",
//                                         },
//                                         {
//                                             l: "إجمالي الطلاب",
//                                             v: analytics.totalStudents,
//                                             col: "#ede9fe",
//                                             tc: "#5b21b6",
//                                         },
//                                         {
//                                             l: "إجمالي الحلقات",
//                                             v: analytics.totalCircles,
//                                             col: "#d1fae5",
//                                             tc: "#065f46",
//                                         },
//                                         {
//                                             l: "إجمالي الساعات",
//                                             v: `${analytics.totalHours}س`,
//                                             col: "#fef3c7",
//                                             tc: "#92400e",
//                                         },
//                                         {
//                                             l: "متوسط الحضور",
//                                             v: `${analytics.avgAtt}%`,
//                                             col: "#e0f2fe",
//                                             tc: "#0369a1",
//                                         },
//                                         {
//                                             l: "متوسط التقييم",
//                                             v: analytics.avgRating,
//                                             col: "#fdf4ff",
//                                             tc: "#7c3aed",
//                                         },
//                                         {
//                                             l: "إجمالي الرواتب",
//                                             v: `${analytics.totalSalary.toLocaleString()} ر.س`,
//                                             col: "#d1fae5",
//                                             tc: "#065f46",
//                                         },
//                                         {
//                                             l: "إجمالي الخصومات",
//                                             v: `${analytics.totalDeduction.toLocaleString()} ر.س`,
//                                             col: "#fee2e2",
//                                             tc: "#b91c1c",
//                                         },
//                                     ].map((k, i) => (
//                                         <div
//                                             key={i}
//                                             style={{
//                                                 background: k.col,
//                                                 borderRadius: 10,
//                                                 padding: "10px 12px",
//                                             }}
//                                         >
//                                             <div
//                                                 style={{
//                                                     fontSize: 15,
//                                                     fontWeight: 800,
//                                                     color: k.tc,
//                                                 }}
//                                             >
//                                                 {k.v}
//                                             </div>
//                                             <div
//                                                 style={{
//                                                     fontSize: 9.5,
//                                                     color: k.tc,
//                                                     opacity: 0.75,
//                                                     marginTop: 2,
//                                                 }}
//                                             >
//                                                 {k.l}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* Charts row */}
//                                 <div
//                                     style={{
//                                         display: "grid",
//                                         gridTemplateColumns: "1fr 1fr",
//                                         gap: 14,
//                                     }}
//                                 >
//                                     <div
//                                         style={{
//                                             background: "var(--n50)",
//                                             borderRadius: 10,
//                                             padding: "12px 14px",
//                                         }}
//                                     >
//                                         <div
//                                             style={{
//                                                 fontSize: 11,
//                                                 fontWeight: 700,
//                                                 color: "var(--n700)",
//                                                 marginBottom: 10,
//                                             }}
//                                         >
//                                             توزيع الحالة
//                                         </div>
//                                         <MiniBarChart
//                                             data={[
//                                                 {
//                                                     label: "نشط",
//                                                     value: analytics.online,
//                                                     color: "#10b981",
//                                                 },
//                                                 {
//                                                     label: "متأخر",
//                                                     value: analytics.away,
//                                                     color: "#f59e0b",
//                                                 },
//                                                 {
//                                                     label: "غائب",
//                                                     value: analytics.offline,
//                                                     color: "#ef4444",
//                                                 },
//                                             ]}
//                                         />
//                                     </div>
//                                     <div
//                                         style={{
//                                             background: "var(--n50)",
//                                             borderRadius: 10,
//                                             padding: "12px 14px",
//                                         }}
//                                     >
//                                         <div
//                                             style={{
//                                                 fontSize: 11,
//                                                 fontWeight: 700,
//                                                 color: "var(--n700)",
//                                                 marginBottom: 10,
//                                             }}
//                                         >
//                                             أعلى 4 معلمين بالساعات
//                                         </div>
//                                         <MiniBarChart
//                                             data={[...TEACHERS]
//                                                 .sort(
//                                                     (a, b) => b.hours - a.hours,
//                                                 )
//                                                 .slice(0, 4)
//                                                 .map((t) => ({
//                                                     label: t.name.split(" ")[0],
//                                                     value: t.hours,
//                                                     color: "#6366f1",
//                                                 }))}
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Top performers */}
//                                 <div style={{ marginTop: 14 }}>
//                                     <div
//                                         style={{
//                                             fontSize: 11,
//                                             fontWeight: 700,
//                                             color: "var(--n700)",
//                                             marginBottom: 8,
//                                         }}
//                                     >
//                                         🏆 أعلى تقييماً
//                                     </div>
//                                     <div
//                                         style={{
//                                             display: "flex",
//                                             gap: 8,
//                                             flexWrap: "wrap",
//                                         }}
//                                     >
//                                         {[...TEACHERS]
//                                             .sort((a, b) => b.rating - a.rating)
//                                             .slice(0, 3)
//                                             .map((t, i) => (
//                                                 <div
//                                                     key={i}
//                                                     style={{
//                                                         display: "flex",
//                                                         alignItems: "center",
//                                                         gap: 8,
//                                                         background:
//                                                             "var(--n50)",
//                                                         border: "1px solid var(--n200)",
//                                                         borderRadius: 9,
//                                                         padding: "7px 12px",
//                                                     }}
//                                                 >
//                                                     <span
//                                                         style={{ fontSize: 14 }}
//                                                     >
//                                                         {["🥇", "🥈", "🥉"][i]}
//                                                     </span>
//                                                     <div>
//                                                         <div
//                                                             style={{
//                                                                 fontSize: 11,
//                                                                 fontWeight: 700,
//                                                                 color: "var(--n800)",
//                                                             }}
//                                                         >
//                                                             {t.name
//                                                                 .split(" ")
//                                                                 .slice(0, 2)
//                                                                 .join(" ")}
//                                                         </div>
//                                                         <Stars
//                                                             rating={t.rating}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                     </div>
//                                 </div>

//                                 {/* Salary distribution */}
//                                 <div
//                                     style={{
//                                         marginTop: 14,
//                                         background: "var(--n50)",
//                                         borderRadius: 10,
//                                         padding: "12px 14px",
//                                     }}
//                                 >
//                                     <div
//                                         style={{
//                                             fontSize: 11,
//                                             fontWeight: 700,
//                                             color: "var(--n700)",
//                                             marginBottom: 10,
//                                         }}
//                                     >
//                                         توزيع الرواتب الصافية
//                                     </div>
//                                     <div
//                                         style={{
//                                             display: "flex",
//                                             flexDirection: "column",
//                                             gap: 6,
//                                         }}
//                                     >
//                                         {[...TEACHERS]
//                                             .sort((a, b) => b.net - a.net)
//                                             .map((t, i) => {
//                                                 const maxNet = Math.max(
//                                                     ...TEACHERS.map(
//                                                         (x) => x.net,
//                                                     ),
//                                                 );
//                                                 const pct = Math.round(
//                                                     (t.net / maxNet) * 100,
//                                                 );
//                                                 return (
//                                                     <div
//                                                         key={i}
//                                                         style={{
//                                                             display: "flex",
//                                                             alignItems:
//                                                                 "center",
//                                                             gap: 8,
//                                                         }}
//                                                     >
//                                                         <span
//                                                             style={{
//                                                                 fontSize: 10,
//                                                                 color: "var(--n600)",
//                                                                 minWidth: 110,
//                                                                 whiteSpace:
//                                                                     "nowrap",
//                                                             }}
//                                                         >
//                                                             {t.name
//                                                                 .split(" ")
//                                                                 .slice(0, 2)
//                                                                 .join(" ")}
//                                                         </span>
//                                                         <div
//                                                             style={{
//                                                                 flex: 1,
//                                                                 height: 6,
//                                                                 background:
//                                                                     "var(--n200)",
//                                                                 borderRadius: 4,
//                                                                 overflow:
//                                                                     "hidden",
//                                                             }}
//                                                         >
//                                                             <div
//                                                                 style={{
//                                                                     height: "100%",
//                                                                     width: `${pct}%`,
//                                                                     background:
//                                                                         "#6366f1",
//                                                                     borderRadius: 4,
//                                                                 }}
//                                                             />
//                                                         </div>
//                                                         <span
//                                                             style={{
//                                                                 fontSize: 10,
//                                                                 fontWeight: 700,
//                                                                 color: "#5b21b6",
//                                                                 minWidth: 70,
//                                                                 textAlign:
//                                                                     "left",
//                                                             }}
//                                                         >
//                                                             {t.net.toLocaleString()}{" "}
//                                                             ر.س
//                                                         </span>
//                                                     </div>
//                                                 );
//                                             })}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* ── Table Container ──────────────────────────────────────────── */}
//                     <div className="table-container">
//                         <div className="table-header-bar">
//                             <div>
//                                 <div className="table-title">
//                                     قائمة المعلمين التفصيلية
//                                 </div>
//                                 <div className="table-count" id="tableCount">
//                                     عرض {filteredData.length} معلم
//                                 </div>
//                             </div>
//                             <div className="table-actions">
//                                 {/* Tabs */}
//                                 <div style={{ display: "flex", gap: 4 }}>
//                                     {[
//                                         { key: "all", label: "الكل" },
//                                         { key: "online", label: "نشطون" },
//                                         { key: "mosque", label: "بمسجد" },
//                                         { key: "free", label: "بلا مسجد" },
//                                     ].map((tab) => (
//                                         <button
//                                             key={tab.key}
//                                             className={`tab${activeTab === tab.key ? " active" : ""}`}
//                                             onClick={() => {
//                                                 setActiveTab(
//                                                     tab.key as typeof activeTab,
//                                                 );
//                                                 setCurrentPage(1);
//                                             }}
//                                         >
//                                             {tab.label}
//                                         </button>
//                                     ))}
//                                 </div>
//                                 <button
//                                     className="btn btn-outline btn-sm"
//                                     onClick={() => setShowAnalytics((p) => !p)}
//                                 >
//                                     📊 التحليلات
//                                 </button>
//                                 <button
//                                     className="btn btn-outline btn-sm"
//                                     onClick={resetFilters}
//                                 >
//                                     ↺ إعادة تعيين
//                                 </button>
//                                 <button
//                                     className="btn btn-outline btn-sm"
//                                     onClick={() => alert("تصدير البيانات...")}
//                                 >
//                                     ↓ تصدير
//                                 </button>
//                             </div>
//                         </div>

//                         {/* ── Filters row ───────────────────────────────────────── */}
//                         <div
//                             style={{
//                                 display: "flex",
//                                 gap: 8,
//                                 padding: "10px 16px",
//                                 background: "var(--n50)",
//                                 borderBottom: "1px solid var(--n200)",
//                                 flexWrap: "wrap",
//                                 alignItems: "center",
//                             }}
//                         >
//                             <input
//                                 className="filter-select"
//                                 placeholder="🔍 ابحث عن معلم..."
//                                 value={search}
//                                 onChange={(e) => {
//                                     setSearch(e.target.value);
//                                     setCurrentPage(1);
//                                 }}
//                                 style={{
//                                     flex: 1,
//                                     minWidth: 160,
//                                     padding: "5px 10px",
//                                     fontSize: 12,
//                                 }}
//                             />
//                             <select
//                                 className="filter-select"
//                                 value={filterMosque}
//                                 onChange={(e) => {
//                                     setFilterMosque(e.target.value);
//                                     setCurrentPage(1);
//                                 }}
//                                 style={{ padding: "5px 10px", fontSize: 12 }}
//                             >
//                                 <option value="">كل المساجد</option>
//                                 <option value="بلا مسجد">بلا مسجد</option>
//                                 {mosques.map((m) => (
//                                     <option key={m} value={m}>
//                                         {m}
//                                     </option>
//                                 ))}
//                             </select>
//                             <select
//                                 className="filter-select"
//                                 value={filterStatus}
//                                 onChange={(e) => {
//                                     setFilterStatus(
//                                         e.target.value as typeof filterStatus,
//                                     );
//                                     setCurrentPage(1);
//                                 }}
//                                 style={{ padding: "5px 10px", fontSize: 12 }}
//                             >
//                                 <option value="">كل الحالات</option>
//                                 <option value="online">نشط</option>
//                                 <option value="away">متأخر</option>
//                                 <option value="offline">غائب</option>
//                             </select>
//                         </div>

//                         {/* ── Table ─────────────────────────────────────────────── */}
//                         <div style={{ overflowX: "auto" }}>
//                             <table id="mainTable">
//                                 <thead>
//                                     <tr>
//                                         <th style={{ width: 40 }}></th>
//                                         <th
//                                             onClick={() => handleSort("name")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="name" /> المعلم
//                                         </th>
//                                         <th
//                                             onClick={() => handleSort("mosque")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="mosque" /> المسجد
//                                         </th>
//                                         <th
//                                             onClick={() => handleSort("status")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="status" /> الحالة
//                                         </th>
//                                         <th
//                                             onClick={() =>
//                                                 handleSort("circles")
//                                             }
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="circles" /> الحلقات
//                                         </th>
//                                         <th
//                                             onClick={() =>
//                                                 handleSort("monthlyAttRate")
//                                             }
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="monthlyAttRate" /> أيام
//                                             الحضور
//                                         </th>
//                                         <th
//                                             onClick={() => handleSort("timeIn")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="timeIn" /> وقت الحضور
//                                         </th>
//                                         <th
//                                             onClick={() => handleSort("hours")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="hours" /> الساعات
//                                         </th>
//                                         <th
//                                             onClick={() => handleSort("salary")}
//                                             style={{ cursor: "pointer" }}
//                                         >
//                                             <SortIcon k="salary" /> الراتب /
//                                             الخصم
//                                         </th>
//                                         <th style={{ width: 110 }}>إجراءات</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody id="tableBody">
//                                     {pageData.length === 0 ? (
//                                         <tr>
//                                             <td
//                                                 colSpan={10}
//                                                 style={{
//                                                     textAlign: "center",
//                                                     padding: 32,
//                                                     color: "var(--n400)",
//                                                     fontSize: 13,
//                                                 }}
//                                             >
//                                                 لا توجد نتائج مطابقة
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         pageData.map((t) => {
//                                             const hoursPercent = Math.round(
//                                                 (t.hours / t.maxHours) * 100,
//                                             );
//                                             const hColor =
//                                                 hoursPercent >= 80
//                                                     ? "var(--emerald, #10b981)"
//                                                     : hoursPercent >= 50
//                                                       ? "#f59e0b"
//                                                       : "var(--red, #ef4444)";
//                                             const isExpanded = expandedRows.has(
//                                                 t.id,
//                                             );

//                                             return (
//                                                 <>
//                                                     <tr
//                                                         key={t.id}
//                                                         id={`row-${t.id}`}
//                                                     >
//                                                         {/* Expand toggle */}
//                                                         <td>
//                                                             <button
//                                                                 className="btn btn-icon btn-outline"
//                                                                 style={{
//                                                                     fontSize: 11,
//                                                                 }}
//                                                                 onClick={() =>
//                                                                     toggleExpand(
//                                                                         t.id,
//                                                                     )
//                                                                 }
//                                                                 title="تفاصيل"
//                                                             >
//                                                                 {isExpanded
//                                                                     ? "▲"
//                                                                     : "▼"}
//                                                             </button>
//                                                         </td>

//                                                         {/* Teacher info */}
//                                                         <td>
//                                                             <div className="emp-info">
//                                                                 <div
//                                                                     className="emp-avatar"
//                                                                     style={{
//                                                                         position:
//                                                                             "relative",
//                                                                     }}
//                                                                 >
//                                                                     <div
//                                                                         style={{
//                                                                             width: 40,
//                                                                             height: 40,
//                                                                             borderRadius:
//                                                                                 "50%",
//                                                                             overflow:
//                                                                                 "hidden",
//                                                                         }}
//                                                                     >
//                                                                         <SheikhSVG
//                                                                             idx={
//                                                                                 t.avatarIdx
//                                                                             }
//                                                                         />
//                                                                     </div>
//                                                                     <div
//                                                                         className={`emp-status-dot ${t.status}`}
//                                                                         style={{
//                                                                             position:
//                                                                                 "absolute",
//                                                                             bottom: 0,
//                                                                             left: 0,
//                                                                             width: 10,
//                                                                             height: 10,
//                                                                             borderRadius:
//                                                                                 "50%",
//                                                                             border: "2px solid white",
//                                                                             background:
//                                                                                 t.status ===
//                                                                                 "online"
//                                                                                     ? "#10b981"
//                                                                                     : t.status ===
//                                                                                         "away"
//                                                                                       ? "#f59e0b"
//                                                                                       : "#9ca3af",
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                                 <div>
//                                                                     <div className="emp-name">
//                                                                         {t.name}
//                                                                     </div>
//                                                                     <div
//                                                                         className="emp-id"
//                                                                         style={{
//                                                                             display:
//                                                                                 "flex",
//                                                                             gap: 5,
//                                                                             alignItems:
//                                                                                 "center",
//                                                                             marginTop: 2,
//                                                                         }}
//                                                                     >
//                                                                         <span>
//                                                                             {
//                                                                                 t.id
//                                                                             }
//                                                                         </span>
//                                                                         <span>
//                                                                             ·
//                                                                         </span>
//                                                                         <span>
//                                                                             {
//                                                                                 t.students
//                                                                             }{" "}
//                                                                             طالب
//                                                                         </span>
//                                                                         <span>
//                                                                             ·
//                                                                         </span>
//                                                                         <Stars
//                                                                             rating={
//                                                                                 t.rating
//                                                                             }
//                                                                         />
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </td>

//                                                         {/* Mosque */}
//                                                         <td>
//                                                             {t.mosque ? (
//                                                                 <div className="mosque-tag">
//                                                                     <span
//                                                                         style={{
//                                                                             fontSize: 10,
//                                                                         }}
//                                                                     >
//                                                                         🕌
//                                                                     </span>{" "}
//                                                                     {t.mosque}
//                                                                 </div>
//                                                             ) : (
//                                                                 <div
//                                                                     className="mosque-tag none"
//                                                                     style={{
//                                                                         opacity: 0.55,
//                                                                     }}
//                                                                 >
//                                                                     — بلا مسجد
//                                                                 </div>
//                                                             )}
//                                                         </td>

//                                                         {/* Status badge */}
//                                                         <td>
//                                                             <span
//                                                                 className={`badge ${statusClass[t.status]}`}
//                                                             >
//                                                                 <span
//                                                                     style={{
//                                                                         fontSize: 8,
//                                                                     }}
//                                                                 >
//                                                                     {
//                                                                         statusIcon[
//                                                                             t
//                                                                                 .status
//                                                                         ]
//                                                                     }
//                                                                 </span>
//                                                                 {
//                                                                     statusLabel[
//                                                                         t.status
//                                                                     ]
//                                                                 }
//                                                             </span>
//                                                         </td>

//                                                         {/* Circles */}
//                                                         <td>
//                                                             <div className="circles-count">
//                                                                 <div className="circ-num">
//                                                                     {t.circles}
//                                                                 </div>
//                                                                 <div className="circ-sub">
//                                                                     حلقة
//                                                                 </div>
//                                                             </div>
//                                                         </td>

//                                                         {/* Attendance days */}
//                                                         <td>
//                                                             <div className="circles-mini">
//                                                                 {days.map(
//                                                                     (d) => {
//                                                                         const cls =
//                                                                             t.presentDays.includes(
//                                                                                 d,
//                                                                             )
//                                                                                 ? "present"
//                                                                                 : t.holidayDays.includes(
//                                                                                         d,
//                                                                                     )
//                                                                                   ? "holiday"
//                                                                                   : "absent";
//                                                                         return (
//                                                                             <div
//                                                                                 key={
//                                                                                     d
//                                                                                 }
//                                                                                 className={`circle-day ${cls}`}
//                                                                                 title={
//                                                                                     dayLabel[
//                                                                                         d
//                                                                                     ]
//                                                                                 }
//                                                                             >
//                                                                                 {
//                                                                                     d
//                                                                                 }
//                                                                             </div>
//                                                                         );
//                                                                     },
//                                                                 )}
//                                                             </div>
//                                                             <div
//                                                                 style={{
//                                                                     fontSize: 10,
//                                                                     color: "var(--text-light)",
//                                                                     marginTop: 4,
//                                                                 }}
//                                                             >
//                                                                 {
//                                                                     t
//                                                                         .presentDays
//                                                                         .length
//                                                                 }
//                                                                 /5 يوم
//                                                             </div>
//                                                             <AttBar
//                                                                 rate={
//                                                                     t.monthlyAttRate
//                                                                 }
//                                                             />
//                                                         </td>

//                                                         {/* Time */}
//                                                         <td>
//                                                             <div className="time-range">
//                                                                 <span
//                                                                     style={{
//                                                                         color: "#f59e0b",
//                                                                         fontSize: 11,
//                                                                     }}
//                                                                 >
//                                                                     ⏰
//                                                                 </span>
//                                                                 <strong>
//                                                                     {t.timeIn}
//                                                                 </strong>{" "}
//                                                                 —{" "}
//                                                                 <strong>
//                                                                     {t.timeOut}
//                                                                 </strong>
//                                                             </div>
//                                                         </td>

//                                                         {/* Hours */}
//                                                         <td>
//                                                             <div className="hours-bar-wrap">
//                                                                 <div className="hours-bar">
//                                                                     <div
//                                                                         className="hours-bar-fill"
//                                                                         style={{
//                                                                             width: `${hoursPercent}%`,
//                                                                             background:
//                                                                                 hColor,
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                                 <div
//                                                                     className="hours-val"
//                                                                     style={{
//                                                                         color: hColor,
//                                                                     }}
//                                                                 >
//                                                                     {t.hours}س
//                                                                 </div>
//                                                             </div>
//                                                             <div
//                                                                 style={{
//                                                                     fontSize: 10,
//                                                                     color: "var(--text-light)",
//                                                                 }}
//                                                             >
//                                                                 من {t.maxHours}{" "}
//                                                                 ساعة (
//                                                                 {hoursPercent}%)
//                                                             </div>
//                                                         </td>

//                                                         {/* Salary */}
//                                                         <td>
//                                                             <div className="salary-value">
//                                                                 {t.salary.toLocaleString()}{" "}
//                                                                 ر.س
//                                                             </div>
//                                                             {t.deduction >
//                                                                 0 && (
//                                                                 <div className="salary-deduct">
//                                                                     —{" "}
//                                                                     {t.deduction.toLocaleString()}{" "}
//                                                                     ر.س خصم
//                                                                 </div>
//                                                             )}
//                                                             <div className="salary-net">
//                                                                 {t.net.toLocaleString()}{" "}
//                                                                 ر.س صافي
//                                                             </div>
//                                                         </td>

//                                                         {/* Actions */}
//                                                         <td>
//                                                             <div className="action-btns">
//                                                                 <button
//                                                                     className="btn btn-icon btn-outline"
//                                                                     title="عرض الملف الكامل"
//                                                                     onClick={() =>
//                                                                         setSelectedTeacher(
//                                                                             t,
//                                                                         )
//                                                                     }
//                                                                 >
//                                                                     <span
//                                                                         style={{
//                                                                             fontSize: 12,
//                                                                             color: "#10b981",
//                                                                         }}
//                                                                     >
//                                                                         👁
//                                                                     </span>
//                                                                 </button>
//                                                                 <button
//                                                                     className="btn btn-icon btn-outline"
//                                                                     title="تعديل"
//                                                                     onClick={() =>
//                                                                         alert(
//                                                                             `تعديل: ${t.name}`,
//                                                                         )
//                                                                     }
//                                                                 >
//                                                                     <span
//                                                                         style={{
//                                                                             fontSize: 12,
//                                                                             color: "#f59e0b",
//                                                                         }}
//                                                                     >
//                                                                         ✏️
//                                                                     </span>
//                                                                 </button>
//                                                                 <button
//                                                                     className="btn btn-icon btn-outline"
//                                                                     title="حذف"
//                                                                     onClick={() => {
//                                                                         if (
//                                                                             confirm(
//                                                                                 `حذف ${t.name}?`,
//                                                                             )
//                                                                         )
//                                                                             alert(
//                                                                                 "تم الحذف",
//                                                                             );
//                                                                     }}
//                                                                 >
//                                                                     <span
//                                                                         style={{
//                                                                             fontSize: 12,
//                                                                             color: "#ef4444",
//                                                                         }}
//                                                                     >
//                                                                         🗑
//                                                                     </span>
//                                                                 </button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>

//                                                     {/* ── Expanded row ───────────────────────── */}
//                                                     {isExpanded && (
//                                                         <tr
//                                                             key={`exp-${t.id}`}
//                                                             className="expand-row"
//                                                         >
//                                                             <td colSpan={10}>
//                                                                 <div className="expand-inner">
//                                                                     {/* Circles panel */}
//                                                                     <div className="expand-panel">
//                                                                         <div className="expand-panel-title">
//                                                                             👥
//                                                                             الحلقات
//                                                                             القرآنية
//                                                                             (
//                                                                             {
//                                                                                 t.circles
//                                                                             }
//                                                                             )
//                                                                         </div>
//                                                                         <div className="expand-panel-body">
//                                                                             <div className="circle-list">
//                                                                                 {t.circleList.map(
//                                                                                     (
//                                                                                         c,
//                                                                                         i,
//                                                                                     ) => (
//                                                                                         <div
//                                                                                             key={
//                                                                                                 i
//                                                                                             }
//                                                                                             className="circle-item"
//                                                                                         >
//                                                                                             <div>
//                                                                                                 <div className="circle-item-name">
//                                                                                                     {
//                                                                                                         c.name
//                                                                                                     }
//                                                                                                 </div>
//                                                                                                 <div className="circle-item-students">
//                                                                                                     👤{" "}
//                                                                                                     {
//                                                                                                         c.students
//                                                                                                     }{" "}
//                                                                                                     طالب
//                                                                                                 </div>
//                                                                                             </div>
//                                                                                             <div className="circle-item-time">
//                                                                                                 ⏰{" "}
//                                                                                                 {
//                                                                                                     c.time
//                                                                                                 }
//                                                                                             </div>
//                                                                                         </div>
//                                                                                     ),
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>

//                                                                     {/* Plans panel */}
//                                                                     <div className="expand-panel">
//                                                                         <div className="expand-panel-title">
//                                                                             📅
//                                                                             الخطة
//                                                                             الأسبوعية
//                                                                         </div>
//                                                                         <div className="expand-panel-body">
//                                                                             <div className="plan-list">
//                                                                                 {t.plans.map(
//                                                                                     (
//                                                                                         p,
//                                                                                         i,
//                                                                                     ) => (
//                                                                                         <div
//                                                                                             key={
//                                                                                                 i
//                                                                                             }
//                                                                                             className="plan-item"
//                                                                                         >
//                                                                                             <div className="plan-day">
//                                                                                                 {p.day.substring(
//                                                                                                     0,
//                                                                                                     2,
//                                                                                                 )}
//                                                                                             </div>
//                                                                                             <div className="plan-detail">
//                                                                                                 <div className="plan-detail-title">
//                                                                                                     {
//                                                                                                         p.title
//                                                                                                     }
//                                                                                                 </div>
//                                                                                                 <div className="plan-detail-time">
//                                                                                                     ⏰{" "}
//                                                                                                     {
//                                                                                                         p.time
//                                                                                                     }
//                                                                                                 </div>
//                                                                                             </div>
//                                                                                             <div className="plan-hours-badge">
//                                                                                                 {
//                                                                                                     p.hours
//                                                                                                 }
//                                                                                                 س
//                                                                                             </div>
//                                                                                         </div>
//                                                                                     ),
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>

//                                                                     {/* Quick stats panel */}
//                                                                     <div className="expand-panel">
//                                                                         <div className="expand-panel-title">
//                                                                             📊
//                                                                             إحصائيات
//                                                                             سريعة
//                                                                         </div>
//                                                                         <div className="expand-panel-body">
//                                                                             <div
//                                                                                 style={{
//                                                                                     display:
//                                                                                         "flex",
//                                                                                     flexDirection:
//                                                                                         "column",
//                                                                                     gap: 8,
//                                                                                     fontSize: 12,
//                                                                                 }}
//                                                                             >
//                                                                                 <div
//                                                                                     style={{
//                                                                                         display:
//                                                                                             "flex",
//                                                                                         justifyContent:
//                                                                                             "space-between",
//                                                                                     }}
//                                                                                 >
//                                                                                     <span
//                                                                                         style={{
//                                                                                             color: "var(--n600)",
//                                                                                         }}
//                                                                                     >
//                                                                                         التخصص
//                                                                                     </span>
//                                                                                     <span
//                                                                                         style={{
//                                                                                             fontWeight: 600,
//                                                                                         }}
//                                                                                     >
//                                                                                         {
//                                                                                             t.subject
//                                                                                         }
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div
//                                                                                     style={{
//                                                                                         display:
//                                                                                             "flex",
//                                                                                         justifyContent:
//                                                                                             "space-between",
//                                                                                     }}
//                                                                                 >
//                                                                                     <span
//                                                                                         style={{
//                                                                                             color: "var(--n600)",
//                                                                                         }}
//                                                                                     >
//                                                                                         تاريخ
//                                                                                         الانضمام
//                                                                                     </span>
//                                                                                     <span
//                                                                                         style={{
//                                                                                             fontWeight: 600,
//                                                                                         }}
//                                                                                     >
//                                                                                         {new Date(
//                                                                                             t.joinDate,
//                                                                                         ).toLocaleDateString(
//                                                                                             "ar-SA",
//                                                                                         )}
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div
//                                                                                     style={{
//                                                                                         display:
//                                                                                             "flex",
//                                                                                         justifyContent:
//                                                                                             "space-between",
//                                                                                     }}
//                                                                                 >
//                                                                                     <span
//                                                                                         style={{
//                                                                                             color: "var(--n600)",
//                                                                                         }}
//                                                                                     >
//                                                                                         الهاتف
//                                                                                     </span>
//                                                                                     <span
//                                                                                         style={{
//                                                                                             fontWeight: 600,
//                                                                                             direction:
//                                                                                                 "ltr",
//                                                                                         }}
//                                                                                     >
//                                                                                         {
//                                                                                             t.phone
//                                                                                         }
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div
//                                                                                     style={{
//                                                                                         display:
//                                                                                             "flex",
//                                                                                         justifyContent:
//                                                                                             "space-between",
//                                                                                         alignItems:
//                                                                                             "center",
//                                                                                     }}
//                                                                                 >
//                                                                                     <span
//                                                                                         style={{
//                                                                                             color: "var(--n600)",
//                                                                                         }}
//                                                                                     >
//                                                                                         التقييم
//                                                                                     </span>
//                                                                                     <Stars
//                                                                                         rating={
//                                                                                             t.rating
//                                                                                         }
//                                                                                     />
//                                                                                 </div>
//                                                                                 <div>
//                                                                                     <div
//                                                                                         style={{
//                                                                                             display:
//                                                                                                 "flex",
//                                                                                             justifyContent:
//                                                                                                 "space-between",
//                                                                                             marginBottom: 4,
//                                                                                         }}
//                                                                                     >
//                                                                                         <span
//                                                                                             style={{
//                                                                                                 color: "var(--n600)",
//                                                                                             }}
//                                                                                         >
//                                                                                             نسبة
//                                                                                             الحضور
//                                                                                             الشهري
//                                                                                         </span>
//                                                                                         <span
//                                                                                             style={{
//                                                                                                 fontWeight: 600,
//                                                                                             }}
//                                                                                         >
//                                                                                             {
//                                                                                                 t.monthlyAttRate
//                                                                                             }
//                                                                                             %
//                                                                                         </span>
//                                                                                     </div>
//                                                                                     <AttBar
//                                                                                         rate={
//                                                                                             t.monthlyAttRate
//                                                                                         }
//                                                                                     />
//                                                                                 </div>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 </>
//                                             );
//                                         })
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* ── Pagination ─────────────────────────────────────────── */}
//                         <div className="pagination-bar">
//                             <div className="page-info" id="pageInfo">
//                                 عرض{" "}
//                                 {Math.min(
//                                     (currentPage - 1) * perPage + 1,
//                                     filteredData.length,
//                                 )}
//                                 –
//                                 {Math.min(
//                                     currentPage * perPage,
//                                     filteredData.length,
//                                 )}{" "}
//                                 من {filteredData.length} نتيجة
//                             </div>
//                             <div
//                                 style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 12,
//                                 }}
//                             >
//                                 <select
//                                     className="filter-select"
//                                     id="perPageSelect"
//                                     value={perPage}
//                                     onChange={(e) => {
//                                         setPerPage(
//                                             Number(e.target.value) ||
//                                                 TEACHERS.length,
//                                         );
//                                         setCurrentPage(1);
//                                     }}
//                                     style={{
//                                         padding: "5px 10px",
//                                         fontSize: 12,
//                                     }}
//                                 >
//                                     <option value={8}>8 في الصفحة</option>
//                                     <option value={12}>12 في الصفحة</option>
//                                     <option value={TEACHERS.length}>
//                                         الكل
//                                     </option>
//                                 </select>
//                                 <div className="page-btns" id="pageBtns">
//                                     <button
//                                         className="page-btn"
//                                         disabled={currentPage === 1}
//                                         onClick={() =>
//                                             setCurrentPage((p) =>
//                                                 Math.max(1, p - 1),
//                                             )
//                                         }
//                                     >
//                                         ›
//                                     </button>
//                                     {Array.from(
//                                         { length: totalPages },
//                                         (_, i) => i + 1,
//                                     ).map((p) => (
//                                         <button
//                                             key={p}
//                                             className={`page-btn${p === currentPage ? " active" : ""}`}
//                                             onClick={() => setCurrentPage(p)}
//                                         >
//                                             {p}
//                                         </button>
//                                     ))}
//                                     <button
//                                         className="page-btn"
//                                         disabled={
//                                             currentPage === totalPages ||
//                                             totalPages === 0
//                                         }
//                                         onClick={() =>
//                                             setCurrentPage((p) =>
//                                                 Math.min(totalPages, p + 1),
//                                             )
//                                         }
//                                     >
//                                         ‹
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ── Teacher Detail Modal ────────────────────────────────────────── */}
//             {selectedTeacher && (
//                 <TeacherDetailModal
//                     teacher={selectedTeacher}
//                     onClose={() => setSelectedTeacher(null)}
//                 />
//             )}
//         </div>
//     );
// };

// export default FinancialDashboard;
