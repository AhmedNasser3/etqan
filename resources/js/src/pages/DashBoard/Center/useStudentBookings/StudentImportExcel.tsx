// StudentImportExcel.tsx
import React, { useState, useRef, useCallback } from "react";
import {
    FiUploadCloud,
    FiDownload,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiInfo,
    FiFile,
    FiX,
    FiUsers,
    FiRefreshCw,
} from "react-icons/fi";

// ─── Types ──────────────────────────────────────────────────
interface ImportRow {
    row?: number;
    name: string;
    circle_name?: string;
    reason: string;
    schedule_id?: number;
}

interface ImportSummary {
    imported: number;
    already_exists: number;
    missing_circles: number;
    errors: number;
    total: number;
}

interface ImportResult {
    success: boolean;
    summary: ImportSummary;
    details: {
        imported: ImportRow[];
        already_exists: ImportRow[];
        missing_circles: ImportRow[];
        errors: ImportRow[];
    };
}

// ─── helpers ────────────────────────────────────────────────
function getCSRFHeaders(): Record<string, string> {
    const token =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";
    return {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": token,
    };
}

// ─── Sub-components ──────────────────────────────────────────
const Pill: React.FC<{
    count: number;
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
}> = ({ count, label, color, bg, icon }) => (
    <div
        style={{
            background: bg,
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 140,
            flex: 1,
        }}
    >
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: color + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                flexShrink: 0,
            }}
        >
            {icon}
        </div>
        <div>
            <div
                style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}
            >
                {count}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {label}
            </div>
        </div>
    </div>
);

const ResultSection: React.FC<{
    title: string;
    rows: ImportRow[];
    color: string;
    bg: string;
    icon: React.ReactNode;
    show: boolean;
}> = ({ title, rows, color, bg, icon, show }) => {
    if (!show || rows.length === 0) return null;
    return (
        <div
            style={{
                border: `1px solid ${color}33`,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 12,
            }}
        >
            <div
                style={{
                    background: bg,
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color,
                    fontWeight: 800,
                    fontSize: 13,
                }}
            >
                {icon}
                {title}
                <span
                    style={{
                        background: color + "22",
                        borderRadius: 20,
                        padding: "1px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    {rows.length}
                </span>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 12,
                    }}
                >
                    <thead>
                        <tr style={{ background: "#f8fafc" }}>
                            {["الاسم", "الحلقة", "السبب"].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "8px 14px",
                                        textAlign: "right",
                                        color: "#64748b",
                                        fontWeight: 700,
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr
                                key={i}
                                style={{
                                    background:
                                        i % 2 === 0 ? "#fff" : "#fafbfc",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "8px 14px",
                                        fontWeight: 700,
                                        color: "#1e293b",
                                    }}
                                >
                                    {r.name}
                                </td>
                                <td
                                    style={{
                                        padding: "8px 14px",
                                        color: "#475569",
                                    }}
                                >
                                    {r.circle_name || "—"}
                                </td>
                                <td
                                    style={{
                                        padding: "8px 14px",
                                        color,
                                        fontWeight: 600,
                                    }}
                                >
                                    {r.reason}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────
const StudentImportExcel: React.FC = () => {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("imported");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (!["xlsx", "xls"].includes(ext || "")) {
            setError("يرجى رفع ملف Excel بصيغة .xlsx أو .xls فقط");
            return;
        }
        setFile(f);
        setResult(null);
        setError(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile],
    );

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        const fd = new FormData();
        fd.append("file", file);

        try {
            const res = await fetch("/api/v1/students/import-excel", {
                method: "POST",
                headers: getCSRFHeaders(),
                credentials: "include",
                body: fd,
            });
            const data: ImportResult = await res.json();
            if (!res.ok) {
                setError((data as any).message || `خطأ ${res.status}`);
            } else {
                setResult(data);
                setActiveTab(
                    data.details.imported.length > 0
                        ? "imported"
                        : data.details.already_exists.length > 0
                          ? "already_exists"
                          : data.details.missing_circles.length > 0
                            ? "missing_circles"
                            : "errors",
                );
            }
        } catch (e: any) {
            setError(e.message || "حدث خطأ في الرفع");
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = (type: "with_time" | "without_time") => {
        window.location.href = `/api/v1/students/import-template/${type}`;
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    // ─── tabs config ───
    const tabs = result
        ? [
              {
                  key: "imported",
                  label: "تم التسجيل",
                  count: result.details.imported.length,
                  color: "#16a34a",
                  bg: "#dcfce7",
                  icon: <FiCheckCircle size={13} />,
              },
              {
                  key: "already_exists",
                  label: "موجودون مسبقاً",
                  count: result.details.already_exists.length,
                  color: "#1d4ed8",
                  bg: "#dbeafe",
                  icon: <FiInfo size={13} />,
              },
              {
                  key: "missing_circles",
                  label: "حلقات غير موجودة",
                  count: result.details.missing_circles.length,
                  color: "#b45309",
                  bg: "#fef3c7",
                  icon: <FiAlertCircle size={13} />,
              },
              {
                  key: "errors",
                  label: "أخطاء",
                  count: result.details.errors.length,
                  color: "#b91c1c",
                  bg: "#fee2e2",
                  icon: <FiXCircle size={13} />,
              },
          ]
        : [];

    return (
        <div
            style={{
                fontFamily: "'Tajawal', sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* ── Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "28px 32px",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.04,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            fontSize: 11,
                            color: "#86efac",
                            marginBottom: 4,
                            letterSpacing: ".5px",
                        }}
                    >
                        ﷽ — منصة إتقان
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 900,
                        }}
                    >
                        رفع الطلاب من Excel
                    </h1>
                    <p
                        style={{
                            margin: "4px 0 0",
                            color: "#94a3b8",
                            fontSize: 12,
                        }}
                    >
                        استيراد بيانات الطلاب وتعيينهم في الحلقات تلقائياً
                    </p>
                </div>
            </div>

            {/* ── Template download ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "18px 24px",
                    boxShadow: "0 2px 12px #0001",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: 900,
                            color: "#1e293b",
                            fontSize: 14,
                        }}
                    >
                        تنزيل قالب Excel
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginTop: 3,
                        }}
                    >
                        اختر القالب المناسب ثم أدخل بيانات الطلاب
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        onClick={() => downloadTemplate("with_time")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "9px 18px",
                            borderRadius: 10,
                            border: "none",
                            background: "#0f4c35",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <FiDownload size={13} />
                        قالب مع وقت الحلقة
                    </button>
                    <button
                        onClick={() => downloadTemplate("without_time")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "9px 18px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#1e293b",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <FiDownload size={13} />
                        قالب بدون وقت
                    </button>
                </div>
            </div>

            {/* ── Upload area ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 2px 12px #0001",
                }}
            >
                <div
                    style={{
                        fontWeight: 900,
                        color: "#1e293b",
                        fontSize: 14,
                        marginBottom: 16,
                    }}
                >
                    رفع ملف Excel
                </div>

                {/* drop zone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? "#0f4c35" : file ? "#16a34a" : "#cbd5e1"}`,
                        borderRadius: 14,
                        padding: "36px 24px",
                        textAlign: "center",
                        cursor: file ? "default" : "pointer",
                        background: dragOver
                            ? "#f0fdf4"
                            : file
                              ? "#f0fdf4"
                              : "#fafbfc",
                        transition: "all .2s",
                    }}
                >
                    {file ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    background: "#dcfce7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#16a34a",
                                }}
                            >
                                <FiFile size={22} />
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div
                                    style={{
                                        fontWeight: 800,
                                        color: "#1e293b",
                                        fontSize: 13,
                                    }}
                                >
                                    {file.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        marginTop: 2,
                                    }}
                                >
                                    {(file.size / 1024).toFixed(1)} كيلوبايت
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    reset();
                                }}
                                style={{
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#b91c1c",
                                    borderRadius: "50%",
                                    width: 28,
                                    height: 28,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: "auto",
                                }}
                            >
                                <FiX size={13} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "#e0f2fe",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 12px",
                                    color: "#0369a1",
                                }}
                            >
                                <FiUploadCloud size={26} />
                            </div>
                            <div
                                style={{
                                    fontWeight: 800,
                                    color: "#1e293b",
                                    fontSize: 14,
                                    marginBottom: 4,
                                }}
                            >
                                اسحب ملف Excel هنا
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                }}
                            >
                                أو اضغط لاختيار الملف — .xlsx أو .xls فقط
                            </div>
                        </>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                />

                {/* error */}
                {error && (
                    <div
                        style={{
                            marginTop: 12,
                            background: "#fee2e2",
                            borderRadius: 10,
                            padding: "10px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#b91c1c",
                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        <FiXCircle size={14} /> {error}
                    </div>
                )}

                {/* action buttons */}
                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                    }}
                >
                    {result && (
                        <button
                            onClick={reset}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "9px 18px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#475569",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiRefreshCw size={12} /> رفع ملف آخر
                        </button>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "9px 24px",
                            borderRadius: 10,
                            border: "none",
                            background:
                                !file || uploading ? "#e2e8f0" : "#0f4c35",
                            color: !file || uploading ? "#94a3b8" : "#fff",
                            cursor:
                                !file || uploading ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 800,
                            fontFamily: "inherit",
                            opacity: uploading ? 0.75 : 1,
                            transition: "all .2s",
                        }}
                    >
                        {uploading ? (
                            <>
                                <div
                                    style={{
                                        width: 13,
                                        height: 13,
                                        border: "2px solid #fff4",
                                        borderTopColor: "#fff",
                                        borderRadius: "50%",
                                        animation:
                                            "si-spin .7s linear infinite",
                                    }}
                                />
                                جارٍ الرفع...
                            </>
                        ) : (
                            <>
                                <FiUploadCloud size={14} />
                                رفع وتسجيل الطلاب
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            {result && (
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: "0 2px 12px #0001",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            color: "#1e293b",
                            fontSize: 15,
                            marginBottom: 16,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <FiUsers size={16} color="#0f4c35" />
                        نتائج الرفع
                    </div>

                    {/* pills */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            marginBottom: 20,
                        }}
                    >
                        <Pill
                            count={result.summary.imported}
                            label="تم التسجيل"
                            color="#16a34a"
                            bg="#f0fdf4"
                            icon={<FiCheckCircle size={18} />}
                        />
                        <Pill
                            count={result.summary.already_exists}
                            label="موجودون مسبقاً"
                            color="#1d4ed8"
                            bg="#eff6ff"
                            icon={<FiInfo size={18} />}
                        />
                        <Pill
                            count={result.summary.missing_circles}
                            label="حلقات غير موجودة"
                            color="#b45309"
                            bg="#fffbeb"
                            icon={<FiAlertCircle size={18} />}
                        />
                        <Pill
                            count={result.summary.errors}
                            label="أخطاء"
                            color="#b91c1c"
                            bg="#fff1f2"
                            icon={<FiXCircle size={18} />}
                        />
                    </div>

                    {/* tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            marginBottom: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        {tabs.map((t) =>
                            t.count > 0 ? (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "6px 14px",
                                        borderRadius: 9,
                                        border:
                                            activeTab === t.key
                                                ? "none"
                                                : "1px solid #e2e8f0",
                                        background:
                                            activeTab === t.key
                                                ? t.color
                                                : "#f8fafc",
                                        color:
                                            activeTab === t.key
                                                ? "#fff"
                                                : t.color,
                                        cursor: "pointer",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        fontFamily: "inherit",
                                        transition: "all .15s",
                                    }}
                                >
                                    {t.icon} {t.label}
                                    <span
                                        style={{
                                            background:
                                                activeTab === t.key
                                                    ? "#ffffff33"
                                                    : t.bg,
                                            borderRadius: 20,
                                            padding: "1px 8px",
                                            fontSize: 10,
                                        }}
                                    >
                                        {t.count}
                                    </span>
                                </button>
                            ) : null,
                        )}
                    </div>

                    {/* detail tables */}
                    <ResultSection
                        title="الطلاب الذين تم تسجيلهم بنجاح"
                        rows={result.details.imported}
                        color="#16a34a"
                        bg="#f0fdf4"
                        icon={<FiCheckCircle size={13} />}
                        show={activeTab === "imported"}
                    />
                    <ResultSection
                        title="طلاب موجودون مسبقاً في الحلقة"
                        rows={result.details.already_exists}
                        color="#1d4ed8"
                        bg="#eff6ff"
                        icon={<FiInfo size={13} />}
                        show={activeTab === "already_exists"}
                    />
                    <ResultSection
                        title="حلقات غير موجودة — راجع الأسماء"
                        rows={result.details.missing_circles}
                        color="#b45309"
                        bg="#fffbeb"
                        icon={<FiAlertCircle size={13} />}
                        show={activeTab === "missing_circles"}
                    />
                    <ResultSection
                        title="أخطاء في المعالجة"
                        rows={result.details.errors}
                        color="#b91c1c"
                        bg="#fff1f2"
                        icon={<FiXCircle size={13} />}
                        show={activeTab === "errors"}
                    />
                </div>
            )}

            <style>{`
                @keyframes si-spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StudentImportExcel;
