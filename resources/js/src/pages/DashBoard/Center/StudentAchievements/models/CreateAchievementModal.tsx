// modals/CreateAchievementModal.tsx - مصحح نهائي مع parseInt fix
import { useState, useEffect, useCallback } from "react";
import { useAchievementFormCreate } from "../hooks/useAchievementFormCreate";
import { useToast } from "../../../../../../contexts/ToastContext";

interface CreateAchievementModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateAchievementModal: React.FC<CreateAchievementModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        usersData,
        achievementKey,
        achievementValue,
        handleInputChange,
        addAchievement,
        removeAchievement,
        setAchievementKey,
        setAchievementValue,
        user,
    } = useAchievementFormCreate();

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
                    {required && <span style={{ color: "#ef4444" }}>*</span>}
                </label>
                {children}
            </div>
        );
    }

    const addAchievementFn = async () => {
        // ✅ جيب الـ CSRF token الأول
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            return;
        }

        // ✅ جيب البيانات من الـ form elements مع validation
        const userSelect = document.getElementById(
            "achievementUserId",
        ) as HTMLSelectElement;
        const pointsInput = document.getElementById(
            "achievementPoints",
        ) as HTMLInputElement;
        const pointsActionSelect = document.getElementById(
            "achievementPointsAction",
        ) as HTMLSelectElement;
        const reasonInput = document.getElementById(
            "achievementReason",
        ) as HTMLTextAreaElement;
        const achievementTypeInput = document.getElementById(
            "achievementType",
        ) as HTMLInputElement;

        const userId = userSelect?.value?.trim();
        const points = pointsInput?.value?.trim();
        const pointsAction = pointsActionSelect?.value?.trim();
        const reason = reasonInput?.value?.trim();

        // ✅ Frontend validation
        if (!userId) {
            notifyError("يرجى اختيار الطالب");
            return;
        }
        if (!points || points === "0") {
            notifyError("يرجى إدخال النقاط");
            return;
        }
        if (!pointsAction) {
            notifyError("يرجى اختيار نوع العملية");
            return;
        }
        if (!reason) {
            notifyError("يرجى إدخال السبب");
            return;
        }

        console.log("FORM DATA:", {
            user_id: userId,
            points,
            points_action: pointsAction,
            reason,
            achievement_type: achievementTypeInput?.value?.trim() || undefined,
            achievements: formData.achievements,
        });

        try {
            const response = await fetch("/api/v1/achievements", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    user_id: parseInt(userId), // ✅ الآن مضمون أنه رقم
                    points: parseInt(points), // ✅ الآن مضمون أنه رقم
                    points_action: pointsAction,
                    reason: reason,
                    achievement_type:
                        achievementTypeInput?.value?.trim() || undefined,
                    achievements: formData.achievements,
                }),
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
            notifySuccess("تم إضافة الإنجاز بنجاح!");
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
                        <span className="mh-t">اضافة إنجاز جديد</span>
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
                        <FG label="الطالب" required>
                            <select
                                id="achievementUserId"
                                className={`fi2 ${loadingData ? "bg-red-50 border-red-300" : ""}`}
                                disabled={isSubmitting || loadingData}
                                required
                            >
                                <option value="">
                                    {loadingData
                                        ? "جاري التحميل..."
                                        : usersData.length === 0
                                          ? "لا يوجد طلاب"
                                          : "اختر الطالب"}
                                </option>
                                {usersData.map((userItem) => (
                                    <option
                                        key={userItem.id}
                                        value={userItem.id}
                                    >
                                        {userItem.name} - {userItem.email}
                                    </option>
                                ))}
                            </select>
                        </FG>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                            }}
                        >
                            <FG label="النقاط" required>
                                <input
                                    id="achievementPoints"
                                    className="fi2"
                                    type="number"
                                    placeholder="50"
                                    min="-1000"
                                    max="1000"
                                    disabled={isSubmitting}
                                    required
                                />
                            </FG>

                            <FG label="نوع العملية" required>
                                <select
                                    id="achievementPointsAction"
                                    className="fi2"
                                    disabled={isSubmitting}
                                    required
                                >
                                    <option value="added">إضافة</option>
                                    <option value="deducted">خصم</option>
                                </select>
                            </FG>
                        </div>

                        <FG label="السبب" required>
                            <textarea
                                id="achievementReason"
                                className="fi2"
                                rows={3}
                                placeholder="سبب إضافة/خصم النقاط..."
                                disabled={isSubmitting}
                                required
                            />
                        </FG>

                        <FG label="نوع الإنجاز">
                            <input
                                id="achievementType"
                                className="fi2"
                                type="text"
                                placeholder="طالب الشهر، حضور ممتاز..."
                                disabled={isSubmitting}
                            />
                        </FG>

                        <FG label="إنجازات إضافية">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr auto",
                                    gap: "8px",
                                    padding: "12px",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <input
                                    className="fi2"
                                    placeholder="مفتاح (طالب_الشهر)"
                                    value={achievementKey}
                                    onChange={(e) =>
                                        setAchievementKey(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    style={{ padding: "12px" }}
                                />
                                <input
                                    className="fi2"
                                    placeholder="القيمة (فبراير 2026)"
                                    value={achievementValue}
                                    onChange={(e) =>
                                        setAchievementValue(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    style={{ padding: "12px" }}
                                />
                                <button
                                    type="button"
                                    onClick={addAchievement}
                                    className="btn bp"
                                    disabled={
                                        !achievementKey.trim() ||
                                        !achievementValue.trim() ||
                                        isSubmitting
                                    }
                                    style={{
                                        padding: "12px 16px",
                                        fontSize: "12px",
                                    }}
                                >
                                    إضافة
                                </button>
                            </div>

                            {Object.keys(formData.achievements).length > 0 && (
                                <div style={{ marginTop: "12px" }}>
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "var(--n700)",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        الإنجازات المضافة:
                                    </div>
                                    {Object.entries(formData.achievements).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    padding: "10px 12px",
                                                    backgroundColor: "#eff6ff",
                                                    border: "1px solid #dbeafe",
                                                    borderRadius: "6px",
                                                    marginBottom: "6px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                <span>
                                                    <strong>{key}:</strong>{" "}
                                                    {String(value)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeAchievement(key)
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            "#fee2e2",
                                                        color: "#dc2626",
                                                        padding: "4px 8px",
                                                        fontSize: "10px",
                                                        borderRadius: "4px",
                                                        border: "none",
                                                        cursor: "pointer",
                                                    }}
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

                        {user?.center_id && (
                            <div
                                className="fi2 bg-green-50 border-green-300 text-green-800 p-3 rounded"
                                style={{ textAlign: "center" }}
                            >
                                مجمعك:{" "}
                                {user.center?.name || `ID: ${user.center_id}`}
                            </div>
                        )}
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
                                onClick={addAchievementFn}
                                disabled={
                                    isSubmitting ||
                                    loadingData ||
                                    !usersData.length
                                }
                            >
                                {isSubmitting
                                    ? "جاري الإضافة..."
                                    : "إضافة الإنجاز"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateAchievementModal;
