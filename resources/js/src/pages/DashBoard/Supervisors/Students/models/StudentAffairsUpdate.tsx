// StudentAffairsUpdate.tsx - مُصحح كامل بدون أخطاء
import React, { useState, useEffect, useCallback } from "react";
import { useStudentAffairsUpdate } from "../hooks/useStudentAffairsUpdate";
import { useToast } from "../../../../../../contexts/ToastContext";

interface StudentAffairsUpdateProps {
    onClose: () => void;
    onSuccess: () => void;
    studentId: number;
}

const StudentAffairsUpdate: React.FC<StudentAffairsUpdateProps> = ({
    onClose,
    onSuccess,
    studentId,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentData,
        grades,
        handleInputChange,
        loadStudentData,
    } = useStudentAffairsUpdate(studentId);

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

    // تحميل البيانات تلقائياً
    useEffect(() => {
        loadStudentData();
    }, [studentId, loadStudentData]);

    const updateStudentFn = async () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        const formDataSubmit = new FormData();
        formDataSubmit.append(
            "id_number",
            (document.getElementById("suIdNumber") as HTMLInputElement)
                ?.value || "",
        );
        formDataSubmit.append(
            "grade_level",
            (document.getElementById("suGrade") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "circle",
            (document.getElementById("suCircle") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "status",
            (document.getElementById("suStatus") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "health_status",
            (document.getElementById("suHealth") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "reading_level",
            (document.getElementById("suReading") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "session_time",
            (document.getElementById("suSession") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "attendance_rate",
            (document.getElementById("suAttendance") as HTMLInputElement)
                ?.value || "",
        );
        formDataSubmit.append(
            "notes",
            (document.getElementById("suNotes") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append("_method", "PUT");

        console.log(
            "STUDENT UPDATE FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const response = await fetch(`/api/v1/students/${studentId}`, {
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
                console.error("UPDATE ERROR:", errorText);

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
            notifySuccess("تم تعديل بيانات الطالب بنجاح");
            onSuccess();
        } catch (error: any) {
            console.error("UPDATE FAILED:", error);
            notifyError(error.message || "حدث خطأ");
        }
    };

    if (!studentData && !loadingData) {
        return (
            <>
                <div className="ov on">
                    <div className="modal">
                        <div className="mh">
                            <span className="mh-t">الطالب غير موجود</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">تعديل بيانات الطالب</span>
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
                    <div className="mb">
                        <FG label="رقم الهوية *">
                            <input
                                className="fi2"
                                id="suIdNumber"
                                defaultValue={
                                    studentData?.idNumber ||
                                    formData.id_number ||
                                    ""
                                }
                                placeholder="رقم الهوية الحالي"
                                required
                            />
                        </FG>

                        <FG label="الصف *">
                            <select
                                className="fi2"
                                id="suGrade"
                                defaultValue={
                                    studentData?.grade_level ||
                                    formData.grade_level ||
                                    ""
                                }
                                required
                            >
                                <option value="">اختر الصف</option>
                                {grades.map((grade: string) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </FG>

                        <FG label="الحلقة *">
                            <input
                                className="fi2"
                                id="suCircle"
                                defaultValue={
                                    studentData?.circle || formData.circle || ""
                                }
                                placeholder="الحلقة الحالية"
                                required
                            />
                        </FG>

                        <FG label="الحالة">
                            <select
                                className="fi2"
                                id="suStatus"
                                defaultValue={
                                    studentData?.status ||
                                    formData.status ||
                                    "نشط"
                                }
                            >
                                <option value="نشط">نشط</option>
                                <option value="معلق">معلق</option>
                                <option value="موقوف">موقوف</option>
                            </select>
                        </FG>

                        <FG label="الحالة الصحية">
                            <input
                                className="fi2"
                                id="suHealth"
                                defaultValue={
                                    studentData?.health_status ||
                                    formData.health_status ||
                                    ""
                                }
                                type="text"
                                placeholder="سليم / مريض..."
                            />
                        </FG>

                        <FG label="مستوى القراءة">
                            <input
                                className="fi2"
                                id="suReading"
                                defaultValue={
                                    studentData?.reading_level ||
                                    formData.reading_level ||
                                    ""
                                }
                                type="text"
                                placeholder="نص جزء ثالث..."
                            />
                        </FG>

                        <FG label="وقت الحلقة">
                            <input
                                className="fi2"
                                id="suSession"
                                defaultValue={
                                    studentData?.session_time ||
                                    formData.session_time ||
                                    ""
                                }
                                type="text"
                                placeholder="عصر / مغرب..."
                            />
                        </FG>

                        <FG label="نسبة الحضور %">
                            <input
                                className="fi2"
                                id="suAttendance"
                                defaultValue={
                                    studentData?.attendance_rate ||
                                    formData.attendance_rate ||
                                    ""
                                }
                                type="number"
                                min={0}
                                max={100}
                                placeholder="95"
                            />
                        </FG>

                        <FG label="ملاحظات">
                            <input
                                className="fi2"
                                id="suNotes"
                                defaultValue={
                                    studentData?.notes || formData.notes || ""
                                }
                                type="text"
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
                                onClick={updateStudentFn}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "جاري التعديل..."
                                    : "حفظ التغييرات"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentAffairsUpdate;
