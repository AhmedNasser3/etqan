// PayrollModel.tsx - النسخة النهائية المصححة كاملة
import { useState } from "react";
import { useToast } from "../../../../../../../contexts/ToastContext";

interface PayrollModelProps {
    isOpen: boolean;
    onClose: () => void;
    staffName?: string;
}

const PayrollModel: React.FC<PayrollModelProps> = ({
    isOpen,
    onClose,
    staffName = "الموظف",
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { notifySuccess, notifyError } = useToast();

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
        required = false,
    }: {
        label: string;
        children: React.ReactNode;
        required?: boolean;
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
                    {label}{" "}
                    {required && <span style={{ color: "var(--red)" }}>*</span>}
                </label>
                {children}
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // ✅ جيب الـ CSRF token الأول
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            setIsSubmitting(false);
            return;
        }

        const formDataSubmit = new FormData();
        formDataSubmit.append(
            "staff_name",
            (document.getElementById("staff_name") as HTMLInputElement)
                ?.value || "",
        );
        formDataSubmit.append(
            "iban_number",
            (document.getElementById("iban_number") as HTMLInputElement)
                ?.value || "",
        );
        formDataSubmit.append(
            "insurance_number",
            (document.getElementById("insurance_number") as HTMLInputElement)
                ?.value || "",
        );

        console.log(
            "PAYROLL SUBMIT FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const response = await fetch("/api/v1/payroll/link", {
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
            notifySuccess("تم ربط حساب الرواتب بنجاح!");
            onClose();
        } catch (error: any) {
            console.error("SUBMIT FAILED:", error);
            notifyError(error.message || "حدث خطأ");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        ربط حسابات الرواتب - {staffName}
                    </span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
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
                <form onSubmit={handleSubmit}>
                    <div className="mb">
                        <FG label="اسم الموظف" required>
                            <input
                                className="fi2"
                                id="staff_name"
                                name="staff_name"
                                defaultValue={staffName}
                                placeholder="أحمد محمد صالح العتيبي"
                                required
                                disabled={isSubmitting}
                            />
                        </FG>

                        <FG label="رقم IBAN البنكي" required>
                            <input
                                className="fi2"
                                id="iban_number"
                                name="iban_number"
                                placeholder="SA1234567890123456789012"
                                required
                                disabled={isSubmitting}
                            />
                        </FG>

                        <FG label="رقم التأمينات الاجتماعية" required>
                            <input
                                className="fi2"
                                id="insurance_number"
                                name="insurance_number"
                                placeholder="400-1234-56789"
                                required
                                disabled={isSubmitting}
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
                                type="button"
                                className="btn bs"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="btn bp"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "جاري الحفظ..."
                                    : "ربط حساب الرواتب"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayrollModel;
