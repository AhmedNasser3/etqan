// CreateSchedulePage.tsx - مصحح كامل بالتصميم الجديد + إضافة الحقول المفقودة
import { useToast } from "../../../../../../contexts/ToastContext";
import { useScheduleFormCreate } from "../hooks/useScheduleFormCreate";
import { useEffect } from "react";

interface CreateSchedulePageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateSchedulePage: React.FC<CreateSchedulePageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        circlesData,
        plansData, // ✅ إضافة plansData
        teachersData, // ✅ إضافة teachersData
    } = useScheduleFormCreate();

    const hasCircles = circlesData.length > 0;
    const hasPlans = plansData.length > 0;
    const hasTeachers = teachersData.length > 0;
    const isDisabled = isSubmitting || !hasCircles || !hasPlans || !hasTeachers;

    const { notifySuccess, notifyError } = useToast();

    // 🔍 Debug Console
    useEffect(() => {
        console.log("📊 PAGE DEBUG:", {
            circles: circlesData.length,
            plans: plansData.length,
            teachers: teachersData.length,
            formData,
        });
    }, [circlesData, plansData, teachersData, formData]);

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

    const addScheduleFn = async () => {
        // ✅ جيب الـ CSRF token
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        const formDataSubmit = new FormData();

        // ✅ الحقول المطلوبة من الـ Backend error
        formDataSubmit.append(
            "plan_id",
            (document.getElementById("scPlan") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "schedule_date",
            (document.getElementById("scDate") as HTMLInputElement)?.value ||
                "",
        );

        // ✅ باقي الحقول المهمة
        formDataSubmit.append(
            "circle_id",
            (document.getElementById("scCircle") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "teacher_id",
            (document.getElementById("scTeacher") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "start_time",
            (document.getElementById("scStart") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "end_time",
            (document.getElementById("scEnd") as HTMLInputElement)?.value || "",
        );
        formDataSubmit.append(
            "days",
            (document.getElementById("scDays") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append(
            "max_students",
            (document.getElementById("scCap") as HTMLInputElement)?.value || "",
        );
        formDataSubmit.append(
            "jitsi_room_name",
            (document.getElementById("scJitsi") as HTMLInputElement)?.value ||
                "",
        );

        console.log(
            "🚀 [SUBMIT] FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const response = await fetch("/api/v1/plans/schedules", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            console.log("📡 [SUBMIT] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [SUBMIT ERROR] Full response:", errorText);

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
            console.log("✅ [SUBMIT SUCCESS]:", result);
            onSuccess();
        } catch (error: any) {
            console.error("💥 [SUBMIT FAILED]:", error);
            notifyError(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">إضافة موعد جديد</span>
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
                        {/* الخطة */}
                        <FG label="الخطة *">
                            <select
                                id="scPlan"
                                name="plan_id"
                                className="fi2"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">اختر الخطة</option>
                                {plansData.map((plan: any) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.plan_name}
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.plan_id}
                                </p>
                            )}
                        </FG>

                        {/* التاريخ */}
                        <FG label="التاريخ *">
                            <input
                                id="scDate"
                                name="schedule_date"
                                type="date"
                                className="fi2"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.schedule_date && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.schedule_date}
                                </p>
                            )}
                        </FG>

                        {/* الحلقة */}
                        <FG label="الحلقة *">
                            <select
                                id="scCircle"
                                name="circle_id"
                                className="fi2"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">اختر الحلقة</option>
                                {circlesData.map((circle: any) => (
                                    <option key={circle.id} value={circle.id}>
                                        {circle.name}
                                    </option>
                                ))}
                            </select>
                            {errors.circle_id && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.circle_id}
                                </p>
                            )}
                        </FG>

                        {/* المدرس */}
                        <FG label="المدرس *">
                            <select
                                id="scTeacher"
                                name="teacher_id"
                                className="fi2"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">اختر المدرس</option>
                                {teachersData.map((teacher: any) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                            {errors.teacher_id && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.teacher_id}
                                </p>
                            )}
                        </FG>

                        {/* الوقت */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 11,
                            }}
                        >
                            <FG label="وقت البداية *">
                                <input
                                    id="scStart"
                                    name="start_time"
                                    type="time"
                                    className="fi2"
                                    required
                                    disabled={isSubmitting}
                                />
                                {errors.start_time && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.start_time}
                                    </p>
                                )}
                            </FG>
                            <FG label="وقت النهاية *">
                                <input
                                    id="scEnd"
                                    name="end_time"
                                    type="time"
                                    className="fi2"
                                    required
                                    disabled={isSubmitting}
                                />
                                {errors.end_time && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {errors.end_time}
                                    </p>
                                )}
                            </FG>
                        </div>

                        {/* الأيام */}
                        <FG label="الأيام *">
                            <input
                                id="scDays"
                                name="days"
                                placeholder="يومي، إثنين/خميس، أحد/ثلاثاء/خميس"
                                className="fi2"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.days && (
                                <p className="text-red-600 text-xs mt-1">
                                    {errors.days}
                                </p>
                            )}
                        </FG>

                        {/* السعة */}
                        <FG label="السعة القصوى">
                            <input
                                id="scCap"
                                name="max_students"
                                type="number"
                                min={1}
                                placeholder="10"
                                className="fi2"
                                disabled={isSubmitting}
                            />
                        </FG>

                        {/* Jitsi */}
                        <FG label="اسم غرفة Jitsi">
                            <input
                                id="scJitsi"
                                name="jitsi_room_name"
                                placeholder="room-123"
                                className="fi2"
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
                                className="btn bs"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn bp"
                                onClick={addScheduleFn}
                                disabled={isDisabled}
                            >
                                {isSubmitting
                                    ? "جاري الإضافة..."
                                    : "إضافة الموعد"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateSchedulePage;
