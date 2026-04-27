// CreatePlanPage.tsx - مصحح مع FI component و CSRF token check كامل
import { useState, useEffect, useCallback } from "react";
import { usePlanFormCreate } from "../hooks/usePlanFormCreate";
import { useToast } from "../../../../../../contexts/ToastContext";

interface CreatePlanPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePlanPage: React.FC<CreatePlanPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        centersData,
        loadingData,
        user,
    } = usePlanFormCreate();

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { notifySuccess, notifyError } = useToast();

    const isLoading = loadingData || !user;
    const currentCenter = centersData[0];

    const ICO: Record<string, JSX.Element> = {
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

    const addPlanFn = async () => {
        // ✅ جيب الـ CSRF token الأول
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        const formDataSubmit = new FormData();
        formDataSubmit.append(
            "plan_name",
            (document.getElementById("plName") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "total_months",
            (document.getElementById("plMonths") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append("center_id", formData.center_id || "");
        formDataSubmit.append("notes", formData.notes || "");

        console.log(
            "PLAN SUBMIT FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const response = await fetch("/api/v1/plans", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("SUBMIT ERROR:", errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.errors) {
                        const errorMessages = Object.values(
                            errorData.errors,
                        ).flat();
                        notifyError(errorMessages[0] || "خطأ في البيانات");
                        return;
                    }
                    notifyError(errorData.message || "حدث خطأ");
                    return;
                } catch (e) {
                    notifyError(`خطأ ${response.status}`);
                    return;
                }
            }

            const result = await response.json();
            onSuccess();
        } catch (error: any) {
            console.error("SUBMIT FAILED:", error);
            notifyError(error.message || "حدث خطأ");
        }
    };

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">اضافة خطة جديدة</span>
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
                        <FG label="اسم الخطة *">
                            <input
                                className="fi2"
                                id="plName"
                                name="plan_name"
                                placeholder="مثال: خطة حفظ سورة البقرة 12 شهر"
                                required
                            />
                        </FG>

                        <FG label="المجمع">
                            <div className="fi2 bg-green-50 border-green-300 text-green-800 p-3 rounded">
                                {currentCenter?.name ||
                                    user?.center?.name ||
                                    "غير محدد"}
                            </div>
                            <input
                                type="hidden"
                                name="center_id"
                                value={formData.center_id || ""}
                            />
                        </FG>

                        <FG label="مدة الخطة (بالشهور) *">
                            <input
                                className="fi2"
                                id="plMonths"
                                type="number"
                                name="total_months"
                                placeholder="12"
                                required
                            />
                        </FG>

                        <FG label="ملاحظات">
                            <input
                                className="fi2"
                                id="plNotes"
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
                                onClick={addPlanFn}
                                disabled={isSubmitting || !formData.center_id}
                            >
                                {isSubmitting ? "جاري الحفظ..." : "حفظ الخطة"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreatePlanPage;
