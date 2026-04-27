// models/CreateCertificatePagePage.tsx
import { useRef, useState } from "react";
import { useToast } from "../../../../../../contexts/ToastContext";
import { useCertificateFormCreate } from "../hooks/useCertificateFormCreate";

interface CreateCertificatePagePageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCertificatePage: React.FC<CreateCertificatePagePageProps> = ({
    onClose,
    onSuccess,
}) => {
    const { notifySuccess, notifyError } = useToast();

    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        studentsData,
        loadingData,
        user,
    } = useCertificateFormCreate();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const isLoading = loadingData || studentsData.length === 0;

    const handleSubmit = async (formDataSubmit: any) => {
        try {
            if (!selectedFile) {
                notifyError("يرجى اختيار ملف الشهادة");
                return;
            }

            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const formDataToSend = new FormData();
            formDataToSend.append("user_id", formDataSubmit.user_id);
            formDataToSend.append("certificate_image", selectedFile);

            const response = await fetch("/api/certificates", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-XSRF-TOKEN": csrfToken,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Error response:", errorData);

                if (errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    notifyError(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("Create response:", result);
            onSuccess();
        } catch (error: any) {
            console.error("❌ Create error:", error);
            notifyError(error.message || "حدث خطأ في الإضافة");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                background: "var(--blue-100)",
                                color: "var(--blue-700)",
                                fontSize: "18px",
                            }}
                        >
                            + 📜
                        </span>{" "}
                        شهادة جديدة
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
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </span>
                    </button>
                </div>

                <div className="mb">
                    <p
                        style={{
                            fontSize: "11px",
                            color: "var(--n600)",
                            marginBottom: 4,
                        }}
                    >
                        مجمعك:
                        <strong
                            style={{
                                color: "var(--green-700)",
                                margin: "0 4px",
                            }}
                        >
                            {user?.center?.name || "غير محدد"}
                        </strong>
                    </p>

                    {/* اختيار الطالب */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الطالب *
                        </label>
                        <select
                            required
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            className={`fi2 ${
                                errors.user_id
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            disabled={isSubmitting}
                        >
                            <option value="">اختر الطالب</option>
                            {studentsData.map((student: any) => (
                                <option
                                    key={student.user_id}
                                    value={student.user_id}
                                >
                                    {student.user_name} - {student.id_number}
                                </option>
                            ))}
                        </select>
                        {errors.user_id && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--red-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                {errors.user_id}
                            </p>
                        )}
                    </div>

                    {/* ملف الشهادة */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            ملف الشهادة *
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            required
                        />
                        {selectedFile && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--n600)",
                                    margin: "2px 0 0 0",
                                }}
                                className="downTitle"
                            >
                                {selectedFile.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "16px",
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
                            onClick={() =>
                                handleSubmit({
                                    user_id: formData.user_id,
                                })
                            }
                            disabled={
                                isSubmitting ||
                                !formData.user_id ||
                                !selectedFile
                            }
                        >
                            {isSubmitting ? (
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                        style={{
                                            width: 14,
                                            height: 14,
                                        }}
                                    ></div>
                                    <span>جاري الإضافة...</span>
                                </span>
                            ) : (
                                "إضافة الشهادة الجديدة"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCertificatePage;
