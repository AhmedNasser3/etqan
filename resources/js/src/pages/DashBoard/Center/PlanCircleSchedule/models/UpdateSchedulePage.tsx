// UpdateSchedulePage.tsx - نفس تصميم UpdatePlanPage مع Toast Context و CSRF و Jitsi support
import { useState, useEffect, useCallback } from "react";
import { useScheduleFormUpdate } from "../hooks/useScheduleFormUpdate";
import { useToast } from "../../../../../../contexts/ToastContext";
import { FiX } from "react-icons/fi";

interface UpdateSchedulePageProps {
    scheduleId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateSchedulePage: React.FC<UpdateSchedulePageProps> = ({
    scheduleId,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        plansData,
        circlesData,
        teachersData,
        loadingData,
        user,
        currentSchedule,
        regenerateJitsiRoom,
        jitsiRoomName,
    } = useScheduleFormUpdate({ scheduleId });

    const { notifySuccess, notifyError } = useToast();

    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = plansData.length === 1 && isCenterOwner;
    const currentPlan = plansData.find(
        (p) => p.id.toString() === formData.plan_id,
    );
    const hasPlans = plansData.length > 0;
    const hasCircles = circlesData.length > 0;
    const hasTeachers = teachersData.length > 0;
    const isLoading = loadingData || !user;

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
                    {required && (
                        <span style={{ color: "var(--danger)" }}>*</span>
                    )}
                </label>
                {children}
            </div>
        );
    }

    const updateScheduleFn = async () => {
        // ✅ جيب الـ CSRF token الأول
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        const formDataSubmit = new FormData();
        formDataSubmit.append("_method", "PUT"); // ✅ للـ Laravel update
        formDataSubmit.append("plan_id", formData.plan_id || "");
        formDataSubmit.append("circle_id", formData.circle_id || "");
        formDataSubmit.append("teacher_id", formData.teacher_id || "");
        formDataSubmit.append("schedule_date", formData.schedule_date || "");
        formDataSubmit.append("start_time", formData.start_time || "");
        formDataSubmit.append("end_time", formData.end_time || "");
        formDataSubmit.append(
            "max_students",
            formData.max_students?.toString() || "",
        );
        formDataSubmit.append("notes", formData.notes || "");
        formDataSubmit.append(
            "jitsi_room_name",
            formData.jitsi_room_name || "",
        );

        console.log(
            "SCHEDULE UPDATE FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const response = await fetch(
                `/api/v1/plans/schedules/${scheduleId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: formDataSubmit,
                },
            );

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
            onSuccess();
        } catch (error: any) {
            console.error("UPDATE FAILED:", error);
            notifyError(error.message || "حدث خطأ");
        }
    };

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">تعديل موعد الحلقة</span>
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
                        {/* 1. الخطة */}
                        <FG label="الخطة" required>
                            <select
                                className={`fi2 ${errors.plan_id || loadingData || !hasPlans ? "border-red-300 bg-red-50" : ""}`}
                                name="plan_id"
                                value={formData.plan_id}
                                onChange={handleInputChange}
                                required
                                disabled={
                                    isSubmitting ||
                                    loadingData ||
                                    showSingleCenter
                                }
                            >
                                <option value="">
                                    {loadingData
                                        ? "⏳ جاري التحميل..."
                                        : !hasPlans
                                          ? "🚫 لا توجد خطط"
                                          : showSingleCenter
                                            ? plansData[0].plan_name ||
                                              plansData[0].name
                                            : "اختر الخطة"}
                                </option>
                                {plansData.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.plan_name || plan.name}
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && (
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: "var(--danger)",
                                        marginTop: 4,
                                    }}
                                >
                                    {errors.plan_id}
                                </p>
                            )}
                        </FG>

                        {/* 2. الحلقة */}
                        <FG label="الحلقة" required>
                            <select
                                className={`fi2 ${errors.circle_id || loadingData || !hasCircles ? "border-red-300 bg-red-50" : ""}`}
                                name="circle_id"
                                value={formData.circle_id}
                                onChange={handleInputChange}
                                required
                                disabled={
                                    isSubmitting || loadingData || !hasPlans
                                }
                            >
                                <option value="">
                                    {loadingData
                                        ? "⏳ جاري التحميل..."
                                        : !hasCircles
                                          ? "🚫 لا توجد حلقات"
                                          : "اختر الحلقة"}
                                </option>
                                {circlesData.map((circle) => (
                                    <option key={circle.id} value={circle.id}>
                                        {circle.name}
                                    </option>
                                ))}
                            </select>
                            {errors.circle_id && (
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: "var(--danger)",
                                        marginTop: 4,
                                    }}
                                >
                                    {errors.circle_id}
                                </p>
                            )}
                        </FG>

                        {/* 3. المدرس */}
                        <FG label="المدرس">
                            <select
                                className="fi2"
                                name="teacher_id"
                                value={formData.teacher_id}
                                onChange={handleInputChange}
                                disabled={
                                    isSubmitting || loadingData || !hasPlans
                                }
                            >
                                <option value="">بدون مدرس</option>
                                {teachersData.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </FG>

                        {/* 4. تاريخ الموعد */}
                        <FG label="تاريخ الموعد" required>
                            <input
                                className={`fi2 ${errors.schedule_date ? "border-red-300 bg-red-50" : ""}`}
                                type="date"
                                name="schedule_date"
                                value={formData.schedule_date}
                                onChange={handleInputChange}
                                required
                                min={new Date().toISOString().split("T")[0]}
                                disabled={
                                    isSubmitting || loadingData || !hasPlans
                                }
                            />
                            {errors.schedule_date && (
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: "var(--danger)",
                                        marginTop: 4,
                                    }}
                                >
                                    {errors.schedule_date}
                                </p>
                            )}
                        </FG>

                        {/* 5. وقت البداية والنهاية */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                                marginBottom: 13,
                            }}
                        >
                            <FG label="وقت البداية" required>
                                <input
                                    className={`fi2 ${errors.start_time ? "border-red-300 bg-red-50" : ""}`}
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                    disabled={
                                        isSubmitting || loadingData || !hasPlans
                                    }
                                />
                                {errors.start_time && (
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            color: "var(--danger)",
                                            marginTop: 4,
                                        }}
                                    >
                                        {errors.start_time}
                                    </p>
                                )}
                            </FG>
                            <FG label="وقت النهاية" required>
                                <input
                                    className={`fi2 ${errors.end_time ? "border-red-300 bg-red-50" : ""}`}
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                    disabled={
                                        isSubmitting || loadingData || !hasPlans
                                    }
                                />
                                {errors.end_time && (
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            color: "var(--danger)",
                                            marginTop: 4,
                                        }}
                                    >
                                        {errors.end_time}
                                    </p>
                                )}
                            </FG>
                        </div>

                        {/* 6. العدد الأقصى */}
                        <FG label="العدد الأقصى للطلاب">
                            <input
                                className="fi2"
                                type="number"
                                name="max_students"
                                value={formData.max_students}
                                onChange={handleInputChange}
                                min="1"
                                max="50"
                                placeholder="اتركه فارغ لعدد غير محدود"
                                disabled={
                                    isSubmitting || loadingData || !hasPlans
                                }
                            />
                        </FG>

                        {/* 7. الملاحظات */}
                        <FG label="ملاحظات">
                            <input
                                className="fi2"
                                type="text"
                                name="notes"
                                value={formData.notes || ""}
                                onChange={handleInputChange}
                                placeholder="أي ملاحظات..."
                                disabled={
                                    isSubmitting || loadingData || !hasPlans
                                }
                            />
                        </FG>

                        {/* 8. Jitsi Room */}
                        <FG label="غرفة Jitsi">
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexDirection: "column",
                                }}
                            >
                                {jitsiRoomName && (
                                    <a
                                        href={`https://meet.jit.si/${jitsiRoomName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="fi2 bg-purple-50 border-purple-300 text-purple-800 p-3 rounded text-sm flex items-center justify-between"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <span>🔗 انقر للانضمام للغرفة</span>
                                        <span
                                            style={{
                                                fontFamily: "monospace",
                                                fontSize: "11px",
                                                background: "white",
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                            }}
                                        >
                                            {jitsiRoomName}
                                        </span>
                                    </a>
                                )}
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        type="button"
                                        onClick={regenerateJitsiRoom}
                                        disabled={isSubmitting || loadingData}
                                        className="btn bs text-xs py-2"
                                        style={{ flex: 1 }}
                                    >
                                        رابط جديد
                                    </button>
                                    <input
                                        className="fi2 bg-purple-50 border-purple-300"
                                        type="text"
                                        name="jitsi_room_name"
                                        value={formData.jitsi_room_name}
                                        onChange={handleInputChange}
                                        placeholder="abc123xyz"
                                        disabled={isSubmitting || loadingData}
                                        style={{ flex: 2 }}
                                    />
                                </div>
                            </div>
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "#8b5cf6",
                                    marginTop: 4,
                                }}
                            >
                                يمكنك تعديل اسم الغرفة أو إنشاء رابط جديد
                            </p>
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
                                onClick={updateScheduleFn}
                                disabled={
                                    isSubmitting ||
                                    !formData.plan_id ||
                                    !formData.circle_id
                                }
                            >
                                {isSubmitting
                                    ? "جاري التعديل..."
                                    : "تحديث الموعد"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateSchedulePage;
