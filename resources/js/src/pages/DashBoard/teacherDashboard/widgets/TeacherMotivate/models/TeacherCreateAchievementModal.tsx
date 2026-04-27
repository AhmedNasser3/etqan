import React from "react";
import toast from "react-hot-toast";
import { useTeacherAchievementFormCreate } from "../hooks/useTeacherAchievementFormCreate";

interface CreateAchievementModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

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

function FG({ label, children }: { label: string; children: React.ReactNode }) {
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

const TeacherCreateAchievementModal: React.FC<CreateAchievementModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentsData,
        achievementKey,
        achievementValue,
        handleInputChange,
        addAchievement,
        removeAchievement,
        setAchievementKey,
        setAchievementValue,
        submitForm,
    } = useTeacherAchievementFormCreate();

    const handleSubmit = async (formDataSubmit: any) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/v1/teacher/achievements", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    user_id: parseInt(formDataSubmit.user_id),
                    points: parseInt(formDataSubmit.points),
                    points_action: formDataSubmit.points_action,
                    reason: formDataSubmit.reason,
                    achievement_type:
                        formDataSubmit.achievement_type || undefined,
                    achievements: formDataSubmit.achievements,
                }),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            toast.success("تم إضافة الإنجاز بنجاح!");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                {/* Header */}
                <div className="mh">
                    <span className="mh-t">إضافة إنجاز جديد</span>
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

                {/* Body */}
                <div className="mb">
                    {/* الطالب */}
                    <FG label="الطالب *">
                        <select
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            className="fi2"
                            disabled={isSubmitting || loadingData}
                            required
                        >
                            <option value="">
                                {loadingData
                                    ? "جاري التحميل..."
                                    : studentsData.length === 0
                                      ? "لا يوجد طلاب"
                                      : "اختر طالبك"}
                            </option>
                            {studentsData.map((userItem) => (
                                <option key={userItem.id} value={userItem.id}>
                                    {userItem.name} - {userItem.email}
                                </option>
                            ))}
                        </select>
                        {errors.user_id && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "var(--red)",
                                    marginTop: 3,
                                    display: "block",
                                }}
                            >
                                {errors.user_id}
                            </span>
                        )}
                        {studentsData.length > 0 && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "var(--color-text-secondary)",
                                    marginTop: 3,
                                    display: "block",
                                }}
                            >
                                عدد طلابك: {studentsData.length}
                            </span>
                        )}
                    </FG>

                    {/* النقاط + نوع العملية */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                        }}
                    >
                        <FG label="النقاط *">
                            <input
                                className="fi2"
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleInputChange}
                                placeholder="50"
                                min="-1000"
                                max="1000"
                                disabled={isSubmitting}
                                required
                            />
                            {errors.points && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "var(--red)",
                                        marginTop: 3,
                                        display: "block",
                                    }}
                                >
                                    {errors.points}
                                </span>
                            )}
                        </FG>

                        <FG label="نوع العملية *">
                            <select
                                className="fi2"
                                name="points_action"
                                value={formData.points_action}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                required
                            >
                                <option value="added">إضافة</option>
                                <option value="deducted">خصم</option>
                            </select>
                        </FG>
                    </div>

                    {/* السبب */}
                    <FG label="السبب *">
                        <textarea
                            className="fi2"
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="سبب إضافة/خصم النقاط..."
                            disabled={isSubmitting}
                            required
                            style={{ resize: "vertical", height: "auto" }}
                        />
                        {errors.reason && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "var(--red)",
                                    marginTop: 3,
                                    display: "block",
                                }}
                            >
                                {errors.reason}
                            </span>
                        )}
                    </FG>

                    {/* نوع الإنجاز */}
                    <FG label="نوع الإنجاز (اختياري)">
                        <input
                            className="fi2"
                            type="text"
                            name="achievement_type"
                            value={formData.achievement_type}
                            onChange={handleInputChange}
                            placeholder="طالب الشهر، حضور ممتاز..."
                            disabled={isSubmitting}
                        />
                    </FG>

                    {/* الإنجازات الديناميكية */}
                    <FG label="إنجازات إضافية">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr auto",
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <input
                                className="fi2"
                                type="text"
                                value={achievementKey}
                                onChange={(e) =>
                                    setAchievementKey(e.target.value)
                                }
                                placeholder="مفتاح (طالب_الشهر)"
                                disabled={isSubmitting}
                            />
                            <input
                                className="fi2"
                                type="text"
                                value={achievementValue}
                                onChange={(e) =>
                                    setAchievementValue(e.target.value)
                                }
                                placeholder="القيمة (فبراير 2026)"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="btn bp bsm"
                                onClick={addAchievement}
                                disabled={
                                    !achievementKey.trim() ||
                                    !achievementValue.trim() ||
                                    isSubmitting
                                }
                                style={{ whiteSpace: "nowrap" }}
                            >
                                + إضافة
                            </button>
                        </div>

                        {Object.keys(formData.achievements).length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                }}
                            >
                                {Object.entries(formData.achievements).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "7px 10px",
                                                background:
                                                    "var(--color-background-secondary)",
                                                border: "0.5px solid var(--color-border-tertiary)",
                                                borderRadius:
                                                    "var(--border-radius-md)",
                                                fontSize: 13,
                                            }}
                                        >
                                            <span>
                                                <strong
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {key}:
                                                </strong>{" "}
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {String(value)}
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                className="btn bd bxs"
                                                onClick={() =>
                                                    removeAchievement(key)
                                                }
                                                disabled={isSubmitting}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </FG>
                </div>

                {/* Footer */}
                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "flex-end",
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
                            onClick={() => submitForm(handleSubmit)}
                            disabled={isSubmitting || loadingData}
                        >
                            {isSubmitting ? "جاري الإضافة..." : "إضافة الإنجاز"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherCreateAchievementModal;
