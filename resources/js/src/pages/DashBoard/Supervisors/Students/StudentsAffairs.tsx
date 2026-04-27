import React, { useState, useRef, useEffect } from "react";
import { useStudentAffairs } from "./hooks/useStudentAffairs";
import StudentAffairsUpdate from "./models/StudentAffairsUpdate";
import { useToast } from "../../../../../contexts/ToastContext";
import * as XLSX from "xlsx";

interface StudentType {
    id: number;
    name: string;
    idNumber: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

interface RegisterRow {
    "الاسم الأول": string;
    "اسم العائلة": string;
    "رقم الهوية": string;
    "تاريخ الميلاد": string;
    "المرحلة الدراسية": string;
    الجنس: string;
    "البريد الإلكتروني للطالب": string;
    "بريد ولي الأمر": string;
    "رمز دولة ولي الأمر": string;
    "هاتف ولي الأمر": string;
    "الحالة الصحية"?: string;
    "وقت الجلسة"?: string;
    ملاحظات?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

interface SingleStudentForm {
    first_name: string;
    family_name: string;
    id_number: string;
    birth_date: string;
    grade_level: string;
    gender: string;
    student_email: string;
    guardian_email: string;
    guardian_country_code: string;
    guardian_phone: string;
    health_status: string;
    session_time: string;
    notes: string;
}

const EMPTY_STUDENT: SingleStudentForm = {
    first_name: "",
    family_name: "",
    id_number: "",
    birth_date: "",
    grade_level: "elementary",
    gender: "male",
    student_email: "",
    guardian_email: "",
    guardian_country_code: "966",
    guardian_phone: "",
    health_status: "healthy",
    session_time: "",
    notes: "",
};

function getPortalCenterId(): string | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? String(id) : null;
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...extra,
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = centerId;
    return headers;
}

function getCsrfToken(): string | null {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? null
    );
}

const WhatsAppIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
);

const PrintIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-13H4V2h16v4z" />
    </svg>
);

function ImportResultModal({
    title,
    result,
    onClose,
}: {
    title: string;
    result: ImportResult;
    onClose: () => void;
}) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 3000,
                background: "rgba(0,0,0,.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div className="conf-box" style={{ maxWidth: 500, width: "90%" }}>
                <div className="conf-t">{title}</div>
                <div
                    style={{
                        margin: "12px 0",
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            background: "var(--g100)",
                            color: "var(--g700)",
                            padding: "6px 20px",
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        ✓ نجح: {result.success}
                    </span>
                    {result.failed > 0 && (
                        <span
                            style={{
                                background: "#fee2e2",
                                color: "#ef4444",
                                padding: "6px 20px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 16,
                            }}
                        >
                            ✗ فشل: {result.failed}
                        </span>
                    )}
                </div>
                {result.errors.length > 0 && (
                    <div
                        style={{
                            background: "#fff8f8",
                            border: "1px solid #fecaca",
                            borderRadius: 8,
                            padding: 12,
                            maxHeight: 220,
                            overflowY: "auto",
                            textAlign: "right",
                            fontSize: 13,
                            margin: "8px 0",
                        }}
                    >
                        {result.errors.map((err, i) => (
                            <div
                                key={i}
                                style={{ padding: "3px 0", color: "#b91c1c" }}
                            >
                                • {err}
                            </div>
                        ))}
                    </div>
                )}
                <div className="conf-acts">
                    <button className="btn bs" onClick={onClose}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Modal إضافة طالب — نفس تصميم CreateMosquePage ────────────────────────
function AddStudentModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const { notifySuccess, notifyError } = useToast();

    const ICO = {
        x: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    function FG({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) {
        return (
            <div style={{ marginBottom: 13 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "var(--n700)",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </label>
                {children}
            </div>
        );
    }

    function FR2({ children }: { children: React.ReactNode }) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 11,
                }}
            >
                {children}
            </div>
        );
    }

    const handleSubmit = async () => {
        setErrorMsg("");

        const getValue = (id: string) =>
            (
                document.getElementById(id) as
                    | HTMLInputElement
                    | HTMLSelectElement
            )?.value?.trim() ?? "";

        const data: SingleStudentForm = {
            first_name: getValue("st_first_name"),
            family_name: getValue("st_family_name"),
            id_number: getValue("st_id_number"),
            birth_date: getValue("st_birth_date"),
            grade_level: getValue("st_grade_level"),
            gender: getValue("st_gender"),
            student_email: getValue("st_student_email"),
            guardian_email: getValue("st_guardian_email"),
            guardian_country_code: getValue("st_guardian_country_code"),
            guardian_phone: getValue("st_guardian_phone"),
            health_status: getValue("st_health_status") || "healthy",
            session_time: getValue("st_session_time"),
            notes: getValue("st_notes"),
        };

        if (
            !data.first_name ||
            !data.family_name ||
            !data.id_number ||
            !data.birth_date ||
            !data.student_email ||
            !data.guardian_email ||
            !data.guardian_phone
        ) {
            setErrorMsg("يرجى تعبئة جميع الحقول المطلوبة (*)");
            return;
        }

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            setErrorMsg("فشل في جلب رمز الحماية");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/student/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...buildHeaders({ "X-CSRF-TOKEN": csrfToken }),
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                notifySuccess("تم إضافة الطالب بنجاح");
                onSuccess();
            } else {
                setErrorMsg(json.message || "فشل في الإضافة");
            }
        } catch {
            setErrorMsg("حدث خطأ في الاتصال");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">إضافة طالب جديد</span>
                    <button className="mx" onClick={onClose}>
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            {ICO.x}
                        </span>
                    </button>
                </div>

                <div className="mb">
                    {errorMsg && (
                        <div
                            style={{
                                background: "#fee2e2",
                                color: "#b91c1c",
                                padding: "10px 14px",
                                borderRadius: 8,
                                marginBottom: 14,
                                fontSize: 13,
                            }}
                        >
                            {errorMsg}
                        </div>
                    )}

                    <FR2>
                        <FG label="الاسم الأول *">
                            <input
                                id="st_first_name"
                                className="fi2"
                                placeholder="محمد"
                            />
                        </FG>
                        <FG label="اسم العائلة *">
                            <input
                                id="st_family_name"
                                className="fi2"
                                placeholder="العمري"
                            />
                        </FG>
                    </FR2>

                    <FR2>
                        <FG label="رقم الهوية *">
                            <input
                                id="st_id_number"
                                className="fi2"
                                placeholder="1234567890"
                            />
                        </FG>
                        <FG label="تاريخ الميلاد *">
                            <input
                                id="st_birth_date"
                                type="date"
                                className="fi2"
                            />
                        </FG>
                    </FR2>

                    <FR2>
                        <FG label="المرحلة الدراسية *">
                            <select
                                id="st_grade_level"
                                className="fi2"
                                defaultValue="elementary"
                            >
                                <option value="elementary">ابتدائي</option>
                                <option value="middle">متوسط</option>
                                <option value="high">ثانوي</option>
                            </select>
                        </FG>
                        <FG label="الجنس *">
                            <select
                                id="st_gender"
                                className="fi2"
                                defaultValue="male"
                            >
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </FG>
                    </FR2>

                    <FG label="بريد الطالب الإلكتروني *">
                        <input
                            id="st_student_email"
                            type="email"
                            className="fi2"
                            placeholder="student@example.com"
                            style={{ direction: "ltr" }}
                        />
                    </FG>

                    <FR2>
                        <FG label="بريد ولي الأمر *">
                            <input
                                id="st_guardian_email"
                                type="email"
                                className="fi2"
                                placeholder="guardian@example.com"
                                style={{ direction: "ltr" }}
                            />
                        </FG>
                        <FG label="رمز الدولة *">
                            <select
                                id="st_guardian_country_code"
                                className="fi2"
                                defaultValue="966"
                            >
                                <option value="966">🇸🇦 السعودية (+966)</option>
                                <option value="20">🇪🇬 مصر (+20)</option>
                                <option value="971">🇦🇪 الإمارات (+971)</option>
                            </select>
                        </FG>
                    </FR2>

                    <FR2>
                        <FG label="هاتف ولي الأمر *">
                            <input
                                id="st_guardian_phone"
                                type="tel"
                                className="fi2"
                                placeholder="501234567"
                                style={{ direction: "ltr" }}
                            />
                        </FG>
                        <FG label="الحالة الصحية">
                            <select
                                id="st_health_status"
                                className="fi2"
                                defaultValue="healthy"
                            >
                                <option value="healthy">سليم</option>
                                <option value="needs_attention">
                                    يحتاج متابعة
                                </option>
                                <option value="special_needs">
                                    ذوي احتياجات
                                </option>
                            </select>
                        </FG>
                    </FR2>

                    <FR2>
                        <FG label="وقت الجلسة">
                            <select
                                id="st_session_time"
                                className="fi2"
                                defaultValue=""
                            >
                                <option value="">— اختياري —</option>
                                <option value="asr">العصر</option>
                                <option value="maghrib">المغرب</option>
                            </select>
                        </FG>
                        <FG label="ملاحظات">
                            <input
                                id="st_notes"
                                className="fi2"
                                placeholder="أي ملاحظات..."
                            />
                        </FG>
                    </FR2>
                </div>

                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "20px",
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={saving}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "جاري الحفظ..." : "حفظ الطالب"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Component رئيسي ───────────────────────────────────────────────────────
const StudentAffairs: React.FC = () => {
    const {
        students: studentsFromHook,
        loading,
        filterStatus,
        setFilterStatus,
        sendWhatsappReminder,
        printCard,
        refetch,
    } = useStudentAffairs();

    const [students, setStudents] = useState<StudentType[]>([]);
    const [search, setSearch] = useState("");
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [registerImporting, setRegisterImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        title: string;
        result: ImportResult;
    } | null>(null);
    const registerInputRef = useRef<HTMLInputElement>(null);
    const { notifySuccess, notifyError } = useToast();

    useEffect(() => {
        setStudents(studentsFromHook);
    }, [studentsFromHook]);

    const isPortal = !!getPortalCenterId();

    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.idNumber.includes(search) ||
            s.guardianName.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDownloadRegisterTemplate = () => {
        const rows: RegisterRow[] = [
            {
                "الاسم الأول": "محمد",
                "اسم العائلة": "العمري",
                "رقم الهوية": "1234567890",
                "تاريخ الميلاد": "2010-05-15",
                "المرحلة الدراسية": "elementary",
                الجنس: "male",
                "البريد الإلكتروني للطالب": "student@example.com",
                "بريد ولي الأمر": "guardian@example.com",
                "رمز دولة ولي الأمر": "966",
                "هاتف ولي الأمر": "501234567",
                "الحالة الصحية": "healthy",
                "وقت الجلسة": "asr",
                ملاحظات: "",
            },
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "تسجيل الطلاب");
        XLSX.writeFile(wb, "قالب_تسجيل_الطلاب.xlsx");
        notifySuccess("تم تحميل القالب بنجاح");
    };

    const handleExport = () => {
        if (students.length === 0) {
            notifyError("لا توجد بيانات للتصدير");
            return;
        }
        const rows = students.map((s) => ({
            "رقم هوية الطالب": s.idNumber,
            "اسم الطالب": s.name,
            "اسم الحلقة": s.circle || "",
            "ولي الأمر": s.guardianName,
            "جوال ولي الأمر": s.guardianPhone,
            الحالة: s.status,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
        XLSX.writeFile(
            wb,
            `الطلاب_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        notifySuccess(`تم تصدير ${students.length} طالب بنجاح`);
    };

    const handleRegisterFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        setRegisterImporting(true);
        setImportResult(null);

        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const sheetName =
                wb.SheetNames.find((n) => n === "تسجيل الطلاب") ??
                wb.SheetNames[0];
            const rows: RegisterRow[] = XLSX.utils.sheet_to_json(
                wb.Sheets[sheetName],
                { defval: "" },
            );

            if (rows.length === 0) {
                notifyError("الملف فارغ");
                setRegisterImporting(false);
                return;
            }
            if (!("رقم الهوية" in rows[0])) {
                notifyError('تأكد من وجود عمود "رقم الهوية"');
                setRegisterImporting(false);
                return;
            }

            const studentsData = rows.map((row) => ({
                first_name: String(row["الاسم الأول"] ?? "").trim(),
                family_name: String(row["اسم العائلة"] ?? "").trim(),
                id_number: String(row["رقم الهوية"] ?? "").trim(),
                birth_date: String(row["تاريخ الميلاد"] ?? "").trim(),
                grade_level: String(row["المرحلة الدراسية"] ?? "").trim(),
                gender: String(row["الجنس"] ?? "").trim(),
                student_email: String(
                    row["البريد الإلكتروني للطالب"] ?? "",
                ).trim(),
                guardian_email: String(row["بريد ولي الأمر"] ?? "").trim(),
                guardian_country_code: String(
                    row["رمز دولة ولي الأمر"] ?? "",
                ).trim(),
                guardian_phone: String(row["هاتف ولي الأمر"] ?? "").trim(),
                health_status:
                    String(row["الحالة الصحية"] ?? "healthy").trim() ||
                    "healthy",
                session_time: String(row["وقت الجلسة"] ?? "").trim(),
                notes: String(row["ملاحظات"] ?? "").trim(),
            }));

            const res = await fetch("/api/v1/auth/student/import-register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...buildHeaders({ "X-CSRF-TOKEN": csrfToken }),
                },
                body: JSON.stringify({ students: studentsData }),
            });

            const json = await res.json();
            const data = json.data ?? {};

            setImportResult({
                title: "نتيجة تسجيل الطلاب",
                result: {
                    success: data.success_count ?? 0,
                    failed: data.failed_count ?? 0,
                    errors: data.errors ?? [],
                },
            });

            if ((data.success_count ?? 0) > 0) {
                notifySuccess(`تم تسجيل ${data.success_count} طالب`);
                refetch();
            }
            if ((data.failed_count ?? 0) > 0)
                notifyError(`فشل تسجيل ${data.failed_count} طالب`);
        } catch {
            notifyError("حدث خطأ في قراءة الملف");
        } finally {
            setRegisterImporting(false);
        }
    };

    const handleEdit = (id: number) => {
        setSelectedStudentId(id);
        setShowUpdateModal(true);
    };
    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedStudentId(null);
    };
    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث بيانات الطالب");
        handleCloseUpdateModal();
    };

    function BadgeStatus({ s }: { s: string }) {
        return (
            <span
                style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    background:
                        s === "نشط"
                            ? "var(--g100)"
                            : s === "متأخر مالياً"
                              ? "#fee2e2"
                              : "#fef3c7",
                    color:
                        s === "نشط"
                            ? "var(--g700)"
                            : s === "متأخر مالياً"
                              ? "#ef4444"
                              : "#92400e",
                }}
            >
                {s}
            </span>
        );
    }

    if (loading)
        return (
            <div
                className="content"
                id="contentArea"
                style={{
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="widget">
                    <div className="navbar__loading">
                        <div className="loading-spinner">
                            <div className="spinner-circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        );

    return (
        <>
            <input
                ref={registerInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleRegisterFile}
            />

            {showUpdateModal && selectedStudentId && (
                <StudentAffairsUpdate
                    studentId={selectedStudentId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showAddModal && (
                <AddStudentModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refetch();
                    }}
                />
            )}

            {confirm && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box">
                        <div className="conf-t">{confirm.title}</div>
                        <div className="conf-d">
                            {confirm.desc || "هل أنت متأكد؟"}
                        </div>
                        <div className="conf-acts">
                            <button className="btn bd" onClick={confirm.cb}>
                                تأكيد
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setConfirm(null)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {importResult && (
                <ImportResultModal
                    title={importResult.title}
                    result={importResult.result}
                    onClose={() => setImportResult(null)}
                />
            )}

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">
                            شؤون الطلاب{" "}
                            <span
                                style={{ fontWeight: 400, fontSize: "0.9em" }}
                            >
                                ({filteredStudents.length} طالب)
                            </span>
                        </div>
                        <div
                            className="flx"
                            style={{ gap: 6, flexWrap: "wrap" }}
                        >
                            <input
                                className="fi"
                                placeholder="البحث بالاسم أو الهوية..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="fi"
                                style={{ margin: "0 6px" }}
                            >
                                <option>الكل</option>
                                <option>نشط</option>
                                <option>معلق</option>
                            </select>

                            <button
                                className="btn bp bsm"
                                onClick={() => setShowAddModal(true)}
                            >
                                + طالب جديد
                            </button>

                            {!isPortal && (
                                <>
                                    <button
                                        style={{ margin: "0 3px" }}
                                        className="btn bs bsm"
                                        onClick={handleDownloadRegisterTemplate}
                                    >
                                        ⬇ قالب التسجيل
                                    </button>
                                    <button
                                        style={{ margin: "0 3px" }}
                                        className="btn bs bsm"
                                        onClick={() =>
                                            registerInputRef.current?.click()
                                        }
                                        disabled={registerImporting}
                                    >
                                        {registerImporting
                                            ? "جاري التسجيل..."
                                            : "↑ تسجيل من Excel"}
                                    </button>
                                </>
                            )}

                            <button
                                style={{ margin: "0 3px" }}
                                className="btn bs bsm"
                                onClick={handleExport}
                            >
                                ↓ تصدير Excel
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الاسم</th>
                                    <th>رقم الهوية</th>
                                    <th>ولي الأمر</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: "50%",
                                                        backgroundImage:
                                                            item.img
                                                                ? `url(${item.img})`
                                                                : undefined,
                                                        backgroundSize: "cover",
                                                        backgroundPosition:
                                                            "center",
                                                        background: item.img
                                                            ? undefined
                                                            : "var(--n100)",
                                                    }}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 700 }}>
                                                {item.name}
                                            </td>
                                            <td>{item.idNumber}</td>
                                            <td>
                                                <div style={{ fontSize: 13 }}>
                                                    <div>
                                                        {item.guardianName}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: "#3b82f6",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        {item.guardianPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <BadgeStatus s={item.status} />
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            sendWhatsappReminder(
                                                                item.id,
                                                                item.guardianPhone,
                                                            )
                                                        }
                                                        title="واتساب"
                                                    >
                                                        {WhatsAppIcon}
                                                    </button>
                                                    <button
                                                        className="btn bm bxs"
                                                        onClick={() =>
                                                            printCard(item.id)
                                                        }
                                                        title="طباعة"
                                                    >
                                                        {PrintIcon}
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(item.id)
                                                        }
                                                    >
                                                        تعديل
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6}>
                                            <div
                                                className="empty"
                                                style={{
                                                    textAlign: "center",
                                                    padding: 40,
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        color: "var(--n500)",
                                                    }}
                                                >
                                                    {search
                                                        ? "لا توجد نتائج"
                                                        : "لا يوجد طلاب"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={() =>
                                                        setShowAddModal(true)
                                                    }
                                                >
                                                    + إضافة طالب
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentAffairs;
