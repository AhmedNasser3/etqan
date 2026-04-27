import { useState, useEffect } from "react";
import { useCircleFormCreate } from "../hooks/useCircleFormCreate";
import { useToast } from "../../../../../../contexts/ToastContext";

interface CreateCirclePageProps {
    onClose: () => void;
    onSuccess: () => void;
}

function getPortalCenterId(): string | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? String(id) : null;
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...extra,
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = centerId;
    return headers;
}

const CreateCirclePage: React.FC<CreateCirclePageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
    } = useCircleFormCreate();

    const { notifySuccess, notifyError } = useToast();

    const isLoading = loadingData;
    const currentCenter = centersData[0];

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

    const addCircleFn = async () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        const name =
            (document.getElementById("ciName") as HTMLInputElement)?.value ||
            "";
        if (!name.trim()) {
            notifyError("اسم الحلقة مطلوب");
            return;
        }

        if (!formData.center_id) {
            notifyError("المجمع غير محدد");
            return;
        }

        const fd = new FormData();
        fd.append("name", name);
        fd.append("center_id", formData.center_id);
        fd.append(
            "mosque_id",
            (document.getElementById("ciMosque") as HTMLSelectElement)?.value ||
                "",
        );
        fd.append(
            "teacher_id",
            (document.getElementById("ciTeacher") as HTMLSelectElement)
                ?.value || "",
        );
        fd.append(
            "notes",
            (document.getElementById("ciNotes") as HTMLInputElement)?.value ||
                "",
        );

        try {
            const response = await fetch("/api/v1/centers/circles", {
                method: "POST",
                credentials: "include",
                headers: buildHeaders({ "X-CSRF-TOKEN": csrfToken }),
                body: fd,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.errors) {
                    const msgs = Object.values(errorData.errors).flat();
                    notifyError((msgs[0] as string) || "خطأ في البيانات");
                } else {
                    notifyError(errorData.message || `خطأ ${response.status}`);
                }
                return;
            }

            notifySuccess("تم إضافة الحلقة بنجاح");
            onSuccess();
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ");
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">اضافة حلقة جديدة</span>
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
                    <FG label="اسم الحلقة *">
                        <input
                            className="fi2"
                            id="ciName"
                            name="name"
                            placeholder="مثال: حلقة حفظ سورة يس"
                            required
                        />
                    </FG>

                    <FG label="المجمع">
                        <div
                            className="fi2"
                            style={{
                                padding: "8px 12px",
                                background: "var(--color-background-secondary)",
                                borderRadius: 8,
                            }}
                        >
                            {isLoading
                                ? "جاري التحميل..."
                                : currentCenter?.name || "غير محدد"}
                        </div>
                        <input
                            type="hidden"
                            name="center_id"
                            value={formData.center_id || ""}
                        />
                    </FG>

                    <FG label="المسجد">
                        <select
                            className="fi2"
                            id="ciMosque"
                            name="mosque_id"
                            defaultValue=""
                        >
                            <option value="">اختر المسجد (اختياري)</option>
                            {isLoading ? (
                                <option disabled>جاري تحميل المساجد...</option>
                            ) : mosquesData.length === 0 ? (
                                <option disabled>
                                    لا توجد مساجد في هذا المجمع
                                </option>
                            ) : (
                                mosquesData.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </FG>

                    <FG label="المعلم">
                        <select
                            className="fi2"
                            id="ciTeacher"
                            name="teacher_id"
                            defaultValue=""
                        >
                            <option value="">اختر المعلم (اختياري)</option>
                            {isLoading ? (
                                <option disabled>جاري تحميل المعلمين...</option>
                            ) : teachersData.length === 0 ? (
                                <option disabled>
                                    لا يوجد معلمين في هذا المجمع
                                </option>
                            ) : (
                                teachersData.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </FG>

                    <FG label="ملاحظات">
                        <input
                            className="fi2"
                            id="ciNotes"
                            type="text"
                            name="notes"
                            placeholder="أي ملاحظات..."
                        />
                    </FG>
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
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={addCircleFn}
                            disabled={isSubmitting || !formData.center_id}
                        >
                            {isSubmitting ? "جاري الحفظ..." : "حفظ الحلقة"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCirclePage;
