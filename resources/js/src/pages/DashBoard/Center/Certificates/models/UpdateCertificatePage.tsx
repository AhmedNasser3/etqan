// models/UpdateCertificatePage.tsx
import { useRef, useState, useEffect } from "react";
import { useToast } from "../../../../../../contexts/ToastContext";
import { useCertificateFormUpdate } from "../hooks/useCertificateFormUpdate";

interface UpdateCertificatePageProps {
    onClose: () => void;
    onSuccess: () => void;
    certificateId: number;
}

const UpdateCertificatePage: React.FC<UpdateCertificatePageProps> = ({
    onClose,
    onSuccess,
    certificateId,
}) => {
    const { notifySuccess, notifyError } = useToast();

    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleStudentChange,
        studentsData,
        user,
        certificateData,
        selectedStudentId,
        isFullyLoaded,
        setIsSubmitting,
    } = useCertificateFormUpdate(certificateId);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (selectedStudentId && studentsData.length > 0) {
            const studentExists = studentsData.find(
                (s) => s.id === selectedStudentId,
            );
            if (!studentExists) {
                console.log("⚠️ Student not in list, clearing selection");
                handleStudentChange(studentsData[0]?.id || 0);
            }
        }
    }, [selectedStudentId, studentsData, handleStudentChange]);

    const handleSubmit = async () => {
        if (!selectedStudentId) {
            notifyError("يرجى اختيار طالب");
            return;
        }
        try {
            setIsSubmitting(true);
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const formDataToSend = new FormData();
            formDataToSend.append("student_id", selectedStudentId.toString());
            if (selectedFile)
                formDataToSend.append("certificate_image", selectedFile);

            const response = await fetch(`/api/certificates/${certificateId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    notifyError(errorMessages[0] || "حدث خطأ");
                    return;
                }
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            notifySuccess("تم تعديل الشهادة بنجاح!");
            onSuccess();
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDownload = async () => {
        if (!certificateData?.certificate_image) return;

        try {
            const paths = [
                `${window.location.origin}/storage/${certificateData.certificate_image}`,
                `/storage/${certificateData.certificate_image}`,
                `${window.location.origin}/${certificateData.certificate_image}`,
                `/${certificateData.certificate_image}`,
            ];

            for (let path of paths) {
                try {
                    const response = await fetch(path, {
                        method: "GET",
                        credentials: "include",
                    });
                    if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `certificate-${certificateId}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        notifySuccess("تم التحميل بنجاح!");
                        return;
                    }
                } catch (e) {
                    console.log("❌ Download failed for:", path);
                }
            }
            notifyError("فشل في التحميل - تأكد من storage:link");
        } catch (error) {
            console.error("❌ Download failed:", error);
            notifyError("فشل في التحميل");
        }
    };

    // لو isFullyLoaded لكن certificateData لسه null/undefined
    if (!certificateData) {
        return (
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">
                            حدث خطأ في تحميل بيانات الشهادة
                        </span>
                    </div>
                </div>
            </div>
        );
    }

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
                            📜
                        </span>{" "}
                        تعديل شهادة
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
                        الطالب الحالي:
                        <strong
                            style={{
                                color: "var(--blue-700)",
                                margin: "0 4px",
                            }}
                        >
                            {certificateData.student?.user_name ||
                                certificateData.student?.user?.name ||
                                certificateData.user?.name ||
                                certificateData.student?.id_number ||
                                "غير محدد"}
                        </strong>
                        {selectedStudentId && ` (ID: ${selectedStudentId})`}
                    </p>

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

                    {/* Select الطالب الجديد */}
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
                            اختر الطالب الجديد:
                        </label>
                        <select
                            value={selectedStudentId?.toString() || ""}
                            onChange={(e) =>
                                handleStudentChange(Number(e.target.value))
                            }
                            disabled={isSubmitting}
                            className="fi2"
                        >
                            <option value="">اختر الطالب</option>
                            {studentsData.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.user_name} - {student.id_number} (
                                    {student.grade_level} - {student.circle})
                                </option>
                            ))}
                        </select>
                        {studentsData.length === 0 && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--red-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                لا توجد طلاب متاحين
                            </p>
                        )}
                    </div>

                    {/* الصورة الحالية + تحميل */}
                    {certificateData.certificate_image && (
                        <div style={{ marginBottom: 12 }}>
                            <div
                                style={{
                                    border: "1px solid var(--gray-200)",
                                    borderRadius: 8,
                                    padding: 12,
                                    backgroundColor: "var(--gray-50)",
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 4,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            position: "relative",
                                        }}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={`${window.location.origin}/storage/${certificateData.certificate_image}`}
                                            alt="شهادة حالية"
                                            className={`max-w-full max-h-48 object-contain rounded-lg w-full transition-all duration-500 ${
                                                imageError
                                                    ? "opacity-30 blur-sm border-2 border-red-200"
                                                    : "opacity-100 border-2 border-gray-200"
                                            }`}
                                            loading="lazy"
                                            onLoad={() => {
                                                setImageError(false);
                                            }}
                                        />
                                        <div
                                            className={`absolute inset-0 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                imageError
                                                    ? "bg-red-50 bg-opacity-95"
                                                    : "bg-white bg-opacity-80"
                                            }`}
                                            style={{
                                                pointerEvents: imageError
                                                    ? "auto"
                                                    : "none",
                                            }}
                                        >
                                            {imageError && (
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "12px 8px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                            backgroundColor:
                                                                "var(--red-100)",
                                                            borderRadius: 24,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <span>⚠️</span>
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: "12px",
                                                            fontWeight: 700,
                                                            color: "var(--red-800)",
                                                            margin: "8px 0 4px 0",
                                                        }}
                                                    >
                                                        فشل تحميل الصورة
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "10px",
                                                            color: "var(--red-600)",
                                                        }}
                                                    >
                                                        شغّل:{" "}
                                                        <code
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--red-100)",
                                                                padding:
                                                                    "2px 4px",
                                                                borderRadius:
                                                                    "4px",
                                                                fontSize: "9px",
                                                            }}
                                                        >
                                                            php artisan
                                                            storage:link
                                                        </code>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleDownload}
                                        className="btn bp bxs"
                                        disabled={isSubmitting}
                                        style={{
                                            whiteSpace: "nowrap",
                                            padding: "8px 12px",
                                        }}
                                    >
                                        تحميل الصورة
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ملف الشهادة الجديد (اختياري) */}
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
                            ملف الشهادة الجديد (اختياري):
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {selectedFile && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--green-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                تم اختيار: <code>{selectedFile.name}</code>
                            </p>
                        )}
                    </div>

                    {/* المجمع (readonly) */}
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
                            المجمع:
                        </label>
                        <input
                            type="text"
                            value={user?.center?.name || "غير محدد"}
                            className="fi2 bg-green-50 text-green-800 border-green-200"
                            disabled
                        />
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
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedStudentId}
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
                                    <span>جاري التعديل...</span>
                                </span>
                            ) : (
                                "تحديث الشهادة"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateCertificatePage;
