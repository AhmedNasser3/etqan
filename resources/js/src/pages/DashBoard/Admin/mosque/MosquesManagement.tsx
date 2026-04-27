// MosquesManagement.tsx
import React, { useState, useRef } from "react";
import UpdateMosquePage from "./models/UpdateMosquePage";
import CreateMosquePage from "./models/CreateMosquePage";
import { useMosques } from "./hooks/useMosques";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";
import * as XLSX from "xlsx";

interface MosqueType {
    id: number;
    name: string;
    circle: string;
    circleId: number;
    supervisor: string;
    supervisorId: number | null;
    logo: string | null;
    is_active: boolean;
    created_at: string;
}

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

interface ImportRow {
    "اسم المسجد": string;
    "مركز ID": string; // أو number
    المشرف: string;
    ملاحظات?: string;
    "الحالة (نشط/معلق)"?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

const MosquesManagement: React.FC = () => {
    const { mosques, loading, refetch } = useMosques();
    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMosque, setSelectedMosque] = useState<MosqueType | null>(
        null,
    );
    const [selectedMosqueId, setSelectedMosqueId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const { notifySuccess, notifyError } = useToast();

    const filteredMosques = mosques.filter(
        (mosque) =>
            mosque.name.toLowerCase().includes(search.toLowerCase()) ||
            mosque.circle.toLowerCase().includes(search.toLowerCase()) ||
            mosque.supervisor.toLowerCase().includes(search.toLowerCase()),
    );

    // ─── Export ───────────────────────────────────────────────────────────────
    const handleExport = () => {
        if (mosques.length === 0) {
            notifyError("لا توجد بيانات للتصدير");
            return;
        }

        const rows = mosques.map((m) => ({
            "اسم المسجد": m.name,
            "المركز/الحلقة": m.circle,
            المشرف: m.supervisor,
            ملاحظات: "",
            "الحالة (نشط/معلق)": m.is_active ? "نشط" : "معلق",
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

        // Column widths
        ws["!cols"] = [
            { wch: 30 },
            { wch: 25 },
            { wch: 25 },
            { wch: 30 },
            { wch: 20 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "المساجد");

        // Instructions sheet
        const instrData = [
            ["تعليمات الاستخدام"],
            [""],
            ["1. احتفظ بنفس ترتيب الأعمدة"],
            ["2. اسم المسجد: مطلوب"],
            ["3. المركز/الحلقة: اكتب الاسم كما هو في النظام"],
            ["4. المشرف: اكتب الاسم كما هو في النظام"],
            ["5. الملاحظات: اختياري"],
            ["6. الحالة: اكتب (نشط) أو (معلق) فقط"],
            [""],
            ["يمكنك استخدام هذا الملف مباشرة كقالب للاستيراد"],
        ];
        const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
        wsInstr["!cols"] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstr, "تعليمات الاستخدام");

        XLSX.writeFile(
            wb,
            `المساجد_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        notifySuccess(`تم تصدير ${mosques.length} مسجد بنجاح`);
    };

    // ─── Download blank template ──────────────────────────────────────────────
    const handleDownloadTemplate = () => {
        const rows: ImportRow[] = [
            {
                "اسم المسجد": "مسجد النور",
                "المركز/الحلقة": "1",
                المشرف: "احمد ناصر مصطفي",
                ملاحظات: "بجوار السوق",
                "الحالة (نشط/معلق)": "نشط",
            },
            {
                "اسم المسجد": "مسجد السلام",
                "المركز/الحلقة": "1",
                المشرف: "احمد ناصر مصطفي",
                ملاحظات: "",
                "الحالة (نشط/معلق)": "نشط",
            },
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [
            { wch: 30 },
            { wch: 25 },
            { wch: 25 },
            { wch: 30 },
            { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, "المساجد");

        const instrData = [
            ["تعليمات الاستخدام"],
            ["1. احتفظ بنفس ترتيب الأعمدة"],
            ["2. اسم المسجد: مطلوب"],
            ["3. المركز/الحلقة: اكتب الاسم كما هو في النظام"],
            ["4. المشرف: اكتب الاسم كما هو في النظام"],
            ["5. الملاحظات: اختياري"],
            ["6. الحالة: اكتب (نشط) أو (معلق) فقط"],
        ];
        const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
        wsInstr["!cols"] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsInstr, "تعليمات الاستخدام");

        XLSX.writeFile(wb, "قالب_استيراد_المساجد.xlsx");
        notifySuccess("تم تحميل القالب بنجاح");
    };

    // ─── Import ───────────────────────────────────────────────────────────────
    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so same file can be re-uploaded
        e.target.value = "";

        setImporting(true);
        setImportResult(null);

        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });

            // Read first sheet (المساجد)
            const sheetName = wb.SheetNames[0];
            const ws = wb.Sheets[sheetName];
            const rows: ImportRow[] = XLSX.utils.sheet_to_json(ws, {
                defval: "",
            });

            if (rows.length === 0) {
                notifyError("الملف فارغ أو لا يحتوي على بيانات");
                setImporting(false);
                return;
            }

            // Validate required columns
            const firstRow = rows[0];
            if (!("اسم المسجد" in firstRow)) {
                notifyError('تأكد من أن الملف يحتوي على عمود "اسم المسجد"');
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

            // Send rows one by one (or batch if your API supports it)
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowNum = i + 2; // +2 because row 1 is header

                const mosqueName = String(row["اسم المسجد"] || "").trim();
                if (!mosqueName) {
                    errors.push(`سطر ${rowNum}: اسم المسجد مطلوب`);
                    failedCount++;
                    continue;
                }

                // center_id من الـ Excel (مثلاً عمود "مركز ID" يُستخدم هنا)
                // لو اسمه في الـ Excel هو "مركز ID" أو "center_id" أو "المركز/الحلقة" كـ رقم
                const centerId = String(row["المركز/الحلقة"] || "").trim();

                const supervisorName = String(row["المشرف"] || "").trim();
                if (!supervisorName) {
                    errors.push(`سطر ${rowNum}: اسم المشرف مطلوب`);
                    failedCount++;
                    continue;
                }

                const formData = new FormData();
                formData.append("mosque_name", mosqueName);
                formData.append("center_id", centerId); // ← هنا center_id بدل circle_name
                formData.append("supervisor_name", supervisorName);
                formData.append("notes", String(row["ملاحظات"] || "").trim());
                formData.append(
                    "is_active",
                    (row["الحالة (نشط/معلق)"] || "نشط") === "نشط" ? "1" : "0",
                );

                try {
                    const res = await fetch(
                        "/api/v1/super/mosques/import-row",
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
                            `سطر ${rowNum} (${mosqueName}): ${result.message || "فشل"}`,
                        );
                    }
                } catch (err) {
                    failedCount++;
                    errors.push(
                        `سطر ${rowNum} (${mosqueName}): خطأ في الاتصال`,
                    );
                }
            }

            setImportResult({
                success: successCount,
                failedCount,
                errors,
            });

            if (successCount > 0) {
                notifySuccess(`تم استيراد ${successCount} مسجد بنجاح`);
                refetch();
            }
            if (failedCount > 0) {
                notifyError(`فشل استيراد ${failedCount} مسجد`);
            }
        } catch (err) {
            notifyError("حدث خطأ في قراءة الملف");
        } finally {
            setImporting(false);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = (id: number) => {
        setConfirm({
            title: "حذف المسجد",
            desc: "هل أنت متأكد من حذف هذا المسجد؟ لا يمكن التراجع.",
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
                        `/api/v1/super/mosques/${id}`,
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
                        notifySuccess("تم حذف المسجد بنجاح");
                        refetch();
                    } else {
                        notifyError(result.message || "فشل في حذف المسجد");
                    }
                } catch {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    const handleEdit = (mosque: MosqueType) => {
        setSelectedMosque(mosque);
        setSelectedMosqueId(mosque.id);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedMosque(null);
        setSelectedMosqueId(null);
    };

    const handleUpdateSuccess = () => {
        notifySuccess("تم تحديث بيانات المسجد بنجاح");
        refetch();
        handleCloseUpdateModal();
    };

    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleCreateSuccess = () => {
        notifySuccess("تم إضافة المسجد بنجاح");
        refetch();
        handleCloseCreateModal();
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
            {/* Hidden file input for import */}
            <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleImportFile}
            />

            {showUpdateModal && selectedMosque && (
                <UpdateMosquePage
                    initialMosque={selectedMosque}
                    mosqueId={selectedMosqueId!}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateMosquePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {confirm && (
                <div
                    className="conf-ov on"
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
                            {confirm.desc || "هل أنت متأكد من هذا الإجراء؟"}
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
                        <div className="wh-l">إدارة المساجد</div>
                        <div
                            className="flx"
                            style={{ gap: 6, flexWrap: "wrap" }}
                        >
                            <input
                                className="fi"
                                style={{ margin: "0 3px" }}
                                placeholder="البحث بالمسجد أو المشرف أو الحلقة..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {/* Import */}
                            <button
                                style={{ margin: "0 3px" }}
                                className="btn bs bsm"
                                onClick={handleImportClick}
                                disabled={importing}
                                title="استيراد من Excel"
                            >
                                {importing
                                    ? "جاري الاستيراد..."
                                    : "↑ استيراد Excel"}
                            </button>
                            {/* Export */}
                            <button
                                style={{ margin: "0 3px" }}
                                className="btn bs bsm"
                                onClick={handleExport}
                                title="تصدير إلى Excel"
                            >
                                ↓ تصدير Excel
                            </button>
                            {/* Download template */}
                            <button
                                style={{ margin: "0 3px" }}
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
                                + مسجد جديد
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>المسجد</th>
                                    <th>المشرف</th>
                                    <th>الحلقة</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty">
                                                <p>جاري التحميل...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMosques.length > 0 ? (
                                    filteredMosques.map((m) => (
                                        <tr key={m.id}>
                                            <td style={{ fontWeight: 700 }}>
                                                {m.name}
                                            </td>
                                            <td>{m.supervisor}</td>
                                            <td>{m.circle}</td>
                                            <td>
                                                <BadgeStatus
                                                    s={
                                                        m.is_active
                                                            ? "نشط"
                                                            : "معلق"
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDelete(m.id)
                                                        }
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(m)
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
                                        <td colSpan={5}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج للبحث"
                                                        : "لا يوجد مساجد"}
                                                </p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={() =>
                                                        setShowCreateModal(true)
                                                    }
                                                >
                                                    إضافة مسجد
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

export default MosquesManagement;
