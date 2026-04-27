// CirclesManagement.tsx
import React, { useState, useEffect, useRef } from "react";
import UpdateCirclePage from "./models/UpdateCirclePage";
import CreateCirclePage from "./models/CreateCirclePage";
import { useCircles } from "./hooks/useCircles";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";
import * as XLSX from "xlsx";

interface CircleType {
    id: number;
    name: string;
    center: { id: number; name: string };
    center_id: number;
    mosque?: { id: number; name: string } | null;
    mosque_id?: number | null;
    teacher?: { id: number; name: string } | null;
    teacher_id?: number | null;
    created_at: string;
    updated_at: string;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

interface ImportRow {
    "اسم الحلقة": string;
    المسجد?: string;
    المعلم?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

const CirclesManagement: React.FC = () => {
    const { circles: circlesFromHook, loading, refetch } = useCircles();
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCircle, setSelectedCircle] = useState<CircleType | null>(
        null,
    );
    const [selectedCircleId, setSelectedCircleId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [circles, setCircles] = useState<CircleType[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const { notifySuccess, notifyError } = useToast();

    useEffect(() => {
        setCircles(circlesFromHook);
    }, [circlesFromHook]);

    const filteredCircles = circles.filter(
        (circle) =>
            circle.name.toLowerCase().includes(search.toLowerCase()) ||
            circle.center.name.toLowerCase().includes(search.toLowerCase()) ||
            (circle.mosque?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (circle.teacher?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    // ─── Export ───────────────────────────────────────────────────────────────
    const handleExport = () => {
        if (circles.length === 0) {
            notifyError("لا توجد بيانات للتصدير");
            return;
        }

        const rows = circles.map((c) => ({
            "اسم الحلقة": c.name,
            المسجد: c.mosque?.name || "",
            المعلم: c.teacher?.name || "",
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws, "الحلقات");

        const instrData = [
            ["تعليمات الاستخدام"],
            [""],
            ["1. احتفظ بنفس ترتيب الأعمدة"],
            ["2. اسم الحلقة: مطلوب"],
            ["3. المسجد: اكتب الاسم كما هو مسجل في النظام (اختياري)"],
            ["4. المعلم: اكتب الاسم كما هو مسجل في النظام (اختياري)"],
            [""],
            ["ملاحظة: المجمع يُحدَّد تلقائياً من حساب المستخدم"],
            ["يمكنك استخدام هذا الملف مباشرة كقالب للاستيراد"],
        ];
        const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
        wsInstr["!cols"] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstr, "تعليمات الاستخدام");

        XLSX.writeFile(
            wb,
            `الحلقات_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        notifySuccess(`تم تصدير ${circles.length} حلقة بنجاح`);
    };

    // ─── Download blank template ──────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        const rows: ImportRow[] = [
            {
                "اسم الحلقة": "حلقة النور",
                المسجد: "مسجد النور",
                المعلم: "احمد ناصر محمد مجيد",
            },
            {
                "اسم الحلقة": "حلقة الفجر",
                المسجد: "مسجد السلام",
                المعلم: "احمد ناصر محمد مجيد",
            },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws, "الحلقات");

        const instrData = [
            ["تعليمات الاستخدام"],
            ["1. اسم الحلقة: مطلوب"],
            ["2. المسجد: اكتب الاسم كما هو في النظام (اختياري)"],
            ["3. المعلم: اكتب الاسم كما هو في النظام (اختياري)"],
            ["ملاحظة: المجمع يُحدَّد تلقائياً من حسابك"],
        ];
        const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
        wsInstr["!cols"] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstr, "تعليمات الاستخدام");

        XLSX.writeFile(wb, "قالب_استيراد_الحلقات.xlsx");
        notifySuccess("تم تحميل القالب بنجاح");
    };

    // ─── Import ───────────────────────────────────────────────────────────────
    const handleImportClick = () => importInputRef.current?.click();

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setImporting(true);
        setImportResult(null);

        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: ImportRow[] = XLSX.utils.sheet_to_json(ws, {
                defval: "",
            });

            if (rows.length === 0) {
                notifyError("الملف فارغ أو لا يحتوي على بيانات");
                setImporting(false);
                return;
            }

            if (!("اسم الحلقة" in rows[0])) {
                notifyError('تأكد من أن الملف يحتوي على عمود "اسم الحلقة"');
                setImporting(false);
                return;
            }

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                notifyError("فشل في جلب رمز الحماية");
                setImporting(false);
                return;
            }

            let successCount = 0;
            let failedCount = 0;
            const errors: string[] = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowNum = i + 2;

                const circleName = String(row["اسم الحلقة"] || "").trim();
                if (!circleName) {
                    errors.push(`سطر ${rowNum}: اسم الحلقة مطلوب`);
                    failedCount++;
                    continue;
                }

                const formData = new FormData();
                formData.append("name", circleName);
                formData.append(
                    "mosque_name",
                    String(row["المسجد"] || "").trim(),
                );
                formData.append(
                    "teacher_name",
                    String(row["المعلم"] || "").trim(),
                );

                try {
                    const res = await fetch(
                        "/api/v1/centers/circles/import-row",
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest",
                                "X-CSRF-TOKEN": csrfToken,
                            },
                            body: formData,
                        },
                    );

                    const result = await res.json();

                    if (res.ok && result.success) {
                        successCount++;
                    } else {
                        failedCount++;
                        errors.push(
                            `سطر ${rowNum} (${circleName}): ${result.message || "فشل"}`,
                        );
                    }
                } catch {
                    failedCount++;
                    errors.push(
                        `سطر ${rowNum} (${circleName}): خطأ في الاتصال`,
                    );
                }
            }

            setImportResult({
                success: successCount,
                failed: failedCount,
                errors,
            });

            if (successCount > 0) {
                notifySuccess(`تم استيراد ${successCount} حلقة بنجاح`);
                refetch();
            }
            if (failedCount > 0) {
                notifyError(`فشل استيراد ${failedCount} حلقة`);
            }
        } catch {
            notifyError("حدث خطأ في قراءة الملف");
        } finally {
            setImporting(false);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = (id: number) => {
        setConfirm({
            title: "حذف الحلقة",
            desc: "هل أنت متأكد من حذف هذه الحلقة؟ لا يمكن التراجع.",
            cb: async () => {
                try {
                    const csrfToken = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");

                    if (!csrfToken) {
                        notifyError("فشل في جلب رمز الحماية");
                        setConfirm(null);
                        return;
                    }

                    const response = await fetch(
                        `/api/v1/centers/circles/${id}`,
                        {
                            method: "DELETE",
                            credentials: "include",
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest",
                                "X-CSRF-TOKEN": csrfToken,
                            },
                        },
                    );

                    const result = await response.json();

                    if (response.ok && result.success) {
                        notifySuccess("تم حذف الحلقة بنجاح");
                        setCircles((prev) => prev.filter((c) => c.id !== id));
                    } else {
                        notifyError(result.message || "فشل في حذف الحلقة");
                    }
                } catch {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    const handleEdit = (circle: CircleType) => {
        setSelectedCircle(circle);
        setSelectedCircleId(circle.id);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedCircle(null);
        setSelectedCircleId(null);
    };

    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث بيانات الحلقة بنجاح");
        refetch();
    };

    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleCreateSuccess = () => {
        refetch();
    };

    function BadgeStatus({ s }: { s: string }) {
        const map: Record<string, React.CSSProperties> = {
            "bg-g": { background: "var(--g100)", color: "var(--g700)" },
            "bg-r": { background: "#fee2e2", color: "#ef4444" },
            "bg-a": { background: "#fef3c7", color: "#92400e" },
            "bg-n": { background: "var(--n100)", color: "var(--n500)" },
        };
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium"
                style={
                    map[
                        s === "نشط" ? "bg-g" : s === "معلق" ? "bg-a" : "bg-r"
                    ] || map["bg-n"]
                }
            >
                {s}
            </span>
        );
    }

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleImportFile}
            />

            {showUpdateModal && selectedCircle && selectedCircleId && (
                <UpdateCirclePage
                    circleId={selectedCircleId}
                    initialCircle={selectedCircle}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateCirclePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
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
                        <div className="conf-ico">
                            <span
                                style={{
                                    width: 22,
                                    height: 22,
                                    display: "inline-flex",
                                    color: "var(--red)",
                                }}
                            >
                                {ICO.trash}
                            </span>
                        </div>
                        <div className="conf-t">{confirm.title}</div>
                        <div className="conf-d">
                            {confirm.desc ||
                                "هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع."}
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

            {/* Import Result Modal */}
            {importResult && (
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
                    <div
                        className="conf-box"
                        style={{ maxWidth: 480, width: "90%" }}
                    >
                        <div className="conf-t">نتيجة الاستيراد</div>
                        <div
                            style={{
                                margin: "12px 0",
                                display: "flex",
                                gap: 12,
                                justifyContent: "center",
                            }}
                        >
                            <span
                                style={{
                                    background: "var(--g100)",
                                    color: "var(--g700)",
                                    padding: "6px 16px",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                }}
                            >
                                ✓ نجح: {importResult.success}
                            </span>
                            {importResult.failed > 0 && (
                                <span
                                    style={{
                                        background: "#fee2e2",
                                        color: "#ef4444",
                                        padding: "6px 16px",
                                        borderRadius: 8,
                                        fontWeight: 700,
                                    }}
                                >
                                    ✗ فشل: {importResult.failed}
                                </span>
                            )}
                        </div>
                        {importResult.errors.length > 0 && (
                            <div
                                style={{
                                    background: "#fff8f8",
                                    border: "1px solid #fecaca",
                                    borderRadius: 8,
                                    padding: 12,
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    textAlign: "right",
                                    fontSize: 13,
                                    margin: "8px 0",
                                }}
                            >
                                {importResult.errors.map((err, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "2px 0",
                                            color: "#b91c1c",
                                        }}
                                    >
                                        • {err}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="conf-acts">
                            <button
                                className="btn bs"
                                onClick={() => setImportResult(null)}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">إدارة الحلقات</div>
                        <div
                            className="flx"
                            style={{ gap: 6, flexWrap: "wrap" }}
                        >
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالحلقة أو المجمع أو المسجد أو المعلم..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="btn bs bsm"
                                onClick={handleImportClick}
                                disabled={importing}
                                title="استيراد من Excel"
                            >
                                {importing
                                    ? "جاري الاستيراد..."
                                    : "↑ استيراد Excel"}
                            </button>
                            <button
                                className="btn bs bsm"
                                onClick={handleExport}
                                title="تصدير إلى Excel"
                            >
                                ↓ تصدير Excel
                            </button>
                            <button
                                className="btn bs bsm"
                                onClick={handleDownloadTemplate}
                                title="تحميل قالب الاستيراد"
                            >
                                ⬇ قالب الاستيراد
                            </button>
                            <button
                                className="btn bp bsm"
                                onClick={() => setShowCreateModal(true)}
                            >
                                + حلقة جديدة
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الشعار</th>
                                    <th>اسم الحلقة</th>
                                    <th>المجمع</th>
                                    <th>المسجد</th>
                                    <th>المعلم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="empty">
                                                <p>جاري التحميل...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCircles.length > 0 ? (
                                    filteredCircles.map((c) => (
                                        <tr key={c.id}>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 8,
                                                        background:
                                                            "linear-gradient(135deg, #16161616 0%, #16161616 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        color: "#131313",
                                                    }}
                                                >
                                                    {c.name
                                                        .split(" ")
                                                        .slice(-2)
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>
                                                {c.name}
                                            </td>
                                            <td>
                                                {c.center?.name ||
                                                    `مجمع #${c.center_id}`}
                                            </td>
                                            <td>{c.mosque?.name || "-"}</td>
                                            <td>{c.teacher?.name || "-"}</td>
                                            <td>
                                                <BadgeStatus s="نشط" />
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDelete(c.id)
                                                        }
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(c)
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
                                        <td colSpan={7}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا يوجد حلقات"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={() =>
                                                        setShowCreateModal(true)
                                                    }
                                                >
                                                    إضافة حلقة
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

export default CirclesManagement;
