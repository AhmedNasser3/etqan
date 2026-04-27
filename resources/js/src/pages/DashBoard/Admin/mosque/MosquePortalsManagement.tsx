import React, { useState, useEffect } from "react";
import { ToastProvider, useToast } from "../../../../../contexts/ToastContext";

interface PortalType {
    id: number;
    mosque_id: number;
    mosque_name: string;
    center_id: number;
    portal_url: string;
    token: string;
    expires_at: string;
    used_at: string | null;
    is_used: boolean;
    is_expired: boolean;
    created_at: string;
}

interface MosqueOption {
    id: number;
    name: string;
    center_id: number;
}

const MosquePortalsManagementInner: React.FC = () => {
    const [portals, setPortals] = useState<PortalType[]>([]);
    const [mosques, setMosques] = useState<MosqueOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedMosqueId, setSelectedMosqueId] = useState<string>("");
    const [creating, setCreating] = useState(false);
    const [createdUrl, setCreatedUrl] = useState<string | null>(null);

    const { notifySuccess, notifyError } = useToast();

    useEffect(() => {
        fetchPortals();
        fetchMosques();
    }, []);

    const getCsrf = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? "";

    const fetchPortals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/admin/mosque-portals", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success) setPortals(json.data);
        } catch {
            notifyError("فشل في جلب البيانات");
        } finally {
            setLoading(false);
        }
    };

    const fetchMosques = async () => {
        try {
            const res = await fetch("/api/v1/admin/mosque-portals/mosques", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success) setMosques(json.data);
        } catch {
            notifyError("فشل في جلب المساجد");
        }
    };

    const handleCreate = async () => {
        if (!selectedMosqueId) {
            notifyError("يرجى اختيار مسجد");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/v1/admin/mosque-portals", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrf(),
                },
                body: JSON.stringify({ mosque_id: selectedMosqueId }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                notifySuccess("تم إنشاء الرابط بنجاح");
                setCreatedUrl(json.data.portal_url);
                setSelectedMosqueId("");
                setShowCreate(false);
                fetchPortals();
            } else {
                notifyError(json.message ?? "فشل في الإنشاء");
            }
        } catch {
            notifyError("حدث خطأ في الاتصال");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الرابط؟")) return;
        try {
            const res = await fetch(`/api/v1/admin/mosque-portals/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrf(),
                },
            });
            const json = await res.json();
            if (res.ok && json.success) {
                notifySuccess("تم الحذف بنجاح");
                setPortals((prev) => prev.filter((p) => p.id !== id));
            } else {
                notifyError(json.message ?? "فشل في الحذف");
            }
        } catch {
            notifyError("حدث خطأ");
        }
    };

    const copy = (text: string) =>
        navigator.clipboard
            .writeText(text)
            .then(() => notifySuccess("تم النسخ!"));

    return (
        <>
            {/* ── Modal: الرابط الجديد ─────────────────────────────────────── */}
            {createdUrl && (
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
                        style={{
                            maxWidth: 500,
                            width: "90%",
                            direction: "rtl",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 40,
                                textAlign: "center",
                                marginBottom: 12,
                            }}
                        >
                            🔗
                        </div>
                        <div className="conf-t" style={{ marginBottom: 16 }}>
                            رابط البوابة جاهز — أرسله للمسجد
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label
                                style={{
                                    fontSize: 12,
                                    color: "var(--color-text-secondary)",
                                    display: "block",
                                    marginBottom: 6,
                                }}
                            >
                                الرابط
                            </label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    readOnly
                                    value={createdUrl}
                                    style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid var(--color-border-secondary)",
                                        fontSize: 13,
                                        direction: "ltr",
                                        background:
                                            "var(--color-background-secondary)",
                                    }}
                                />
                                <button
                                    className="btn bp bsm"
                                    onClick={() => copy(createdUrl)}
                                >
                                    نسخ
                                </button>
                            </div>
                        </div>

                        <p
                            style={{
                                fontSize: 12,
                                color: "var(--color-text-secondary)",
                                marginBottom: 16,
                            }}
                        >
                            من يفتح الرابط يقدر يضيف حلقات وطلاب مباشرة — الرابط
                            صالح 30 يوم.
                        </p>

                        <div className="conf-acts">
                            <button
                                className="btn bs"
                                onClick={() => setCreatedUrl(null)}
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: إنشاء رابط ────────────────────────────────────────── */}
            {showCreate && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 2000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#ffff",
                            borderRadius: 16,
                            padding: 32,
                            maxWidth: 420,
                            width: "90%",
                            direction: "rtl",
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: 500,
                                fontSize: 18,
                                marginBottom: 24,
                            }}
                        >
                            إنشاء رابط لمسجد
                        </h3>

                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 13,
                                    color: "var(--color-text-secondary)",
                                    marginBottom: 6,
                                }}
                            >
                                اختر المسجد *
                            </label>
                            <select
                                value={selectedMosqueId}
                                onChange={(e) =>
                                    setSelectedMosqueId(e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color-border-secondary)",
                                    fontSize: 14,
                                    boxSizing: "border-box",
                                    background:
                                        "var(--color-background-secondary)",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="">— اختر مسجد —</option>
                                {mosques.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                className="btn bp"
                                onClick={handleCreate}
                                disabled={creating}
                            >
                                {creating ? "جاري الإنشاء..." : "إنشاء الرابط"}
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => {
                                    setShowCreate(false);
                                    setSelectedMosqueId("");
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main ─────────────────────────────────────────────────────── */}
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">روابط بوابات المساجد</div>
                        <button
                            className="btn bp bsm"
                            onClick={() => setShowCreate(true)}
                        >
                            + رابط جديد
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>المسجد</th>
                                    <th>الرابط</th>
                                    <th>الحالة</th>
                                    <th>انتهاء الصلاحية</th>
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
                                ) : portals.length > 0 ? (
                                    portals.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 500 }}>
                                                {p.mosque_name}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn bs bxs"
                                                    onClick={() =>
                                                        copy(p.portal_url)
                                                    }
                                                    title={p.portal_url}
                                                >
                                                    نسخ الرابط
                                                </button>
                                            </td>
                                            <td>
                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        background: p.is_expired
                                                            ? "#fee2e2"
                                                            : p.is_used
                                                              ? "var(--g100)"
                                                              : "#fef3c7",
                                                        color: p.is_expired
                                                            ? "#ef4444"
                                                            : p.is_used
                                                              ? "var(--g700)"
                                                              : "#92400e",
                                                    }}
                                                >
                                                    {p.is_expired
                                                        ? "منتهي"
                                                        : p.is_used
                                                          ? "مستخدم"
                                                          : "نشط"}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    fontSize: 13,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {p.expires_at}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        handleDelete(p.id)
                                                    }
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty">
                                                <p>لا يوجد روابط بعد</p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={() =>
                                                        setShowCreate(true)
                                                    }
                                                >
                                                    إنشاء أول رابط
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

const MosquePortalsManagement: React.FC = () => (
    <ToastProvider>
        <MosquePortalsManagementInner />
    </ToastProvider>
);

export default MosquePortalsManagement;
