// TeacherRegister.tsx - ✅ الحلقات مع المواعيد فقط (بدون تاريخ)
import React, { useState } from "react";
import { useTeacherRegister } from "../hooks/useTeacherRegister";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";

const TeacherRegister: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );

    const {
        data,
        loading,
        success,
        error,
        circles,
        schedules,
        selectedCircleId,
        circlesLoading,
        schedulesLoading,
        handleInputChange,
        handleCircleChange,
        handleScheduleChange,
        setGender,
        submitRegister,
        centerSlug,
        formatTimeToArabic,
        formatCircleWithTime, // 🔥 الدالة الجديدة (وقت فقط بدون تاريخ)
    } = useTeacherRegister();

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleInputChange("role", e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGender(selectedGender);
        submitRegister();
    };

    // 🔥 Debug info
    console.log("🎨 RENDER DEBUG:", {
        centerSlug,
        circlesCount: circles.length,
        selectedCircleId,
        schedulesCount: schedules.length,
        schedulesLoading,
        role: data.role,
    });

    return (
        <div className="auth">
            <div className="auth__inner">
                <div className="auth__container">
                    <div className="auth__content">
                        <div className="auth__form">
                            <form onSubmit={handleSubmit}>
                                <div className="auth__formContainer">
                                    <div className="auth__formContent">
                                        <div className="auth__formImg">
                                            <img
                                                src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                                                alt="لوجو"
                                            />
                                        </div>
                                        <div className="inputs">
                                            <div className="inputs__inner">
                                                <div className="inputs__container">
                                                    {/* الاسم الرباعي */}
                                                    <div className="inputs__name">
                                                        <div className="inputs__Firstname">
                                                            <label>
                                                                الاسم رباعي
                                                            </label>
                                                            <input
                                                                required
                                                                type="text"
                                                                name="full_name"
                                                                value={
                                                                    data.full_name
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "full_name",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={`... ${selectedGender === "male" ? "أحمد محمد علي أحمد" : "فاطمة محمد علي فاطمة"}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* الدور المطلوب */}
                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__verifyOTP">
                                                            <label>
                                                                الدور المطلوب
                                                            </label>
                                                            <select
                                                                name="role"
                                                                value={
                                                                    data.role
                                                                }
                                                                onChange={
                                                                    handleRoleChange
                                                                }
                                                            >
                                                                <option value="">
                                                                    اختتر الدور
                                                                </option>
                                                                <option value="teacher">
                                                                    معلم
                                                                </option>
                                                                <option value="supervisor">
                                                                    مشرف تعليمي
                                                                </option>
                                                                <option value="motivator">
                                                                    مشرف تحفيز
                                                                </option>
                                                                <option value="student_affairs">
                                                                    شؤون الطلاب
                                                                </option>
                                                                <option value="financial">
                                                                    مشرف مالي
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* ✅ الحلقات مع المواعيد فقط (بدون تاريخ) */}
                                                    {data.role ===
                                                        "teacher" && (
                                                        <div className="inputs__verifyOTPBirth">
                                                            <div className="inputs__verifyOTP">
                                                                <label>
                                                                    الحلقات
                                                                    المتاحة في{" "}
                                                                    <strong>
                                                                        {
                                                                            centerSlug
                                                                        }
                                                                    </strong>
                                                                </label>

                                                                {/* تحميل الحلقات */}
                                                                {circlesLoading ? (
                                                                    <div className="flex items-center justify-center p-3 text-gray-500">
                                                                        جاري
                                                                        تحميل
                                                                        الحلقات...
                                                                    </div>
                                                                ) : circles.length >
                                                                  0 ? (
                                                                    <>
                                                                        {/* قائمة الحلقات مع الوقت فقط */}
                                                                        <select
                                                                            name="circle_id"
                                                                            value={
                                                                                selectedCircleId ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleCircleChange(
                                                                                    Number(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ),
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                اختيار
                                                                                حلقة
                                                                                (اختياري)
                                                                            </option>
                                                                            {circles.map(
                                                                                (
                                                                                    circle,
                                                                                ) => (
                                                                                    <option
                                                                                        key={
                                                                                            circle.id
                                                                                        }
                                                                                        value={
                                                                                            circle.id
                                                                                        }
                                                                                    >
                                                                                        {formatCircleWithTime(
                                                                                            circle,
                                                                                        )}
                                                                                    </option>
                                                                                ),
                                                                            )}
                                                                        </select>

                                                                        {/* المواعيد - تحت الحلقة مباشرة */}
                                                                        {data.circle_id &&
                                                                            schedulesLoading && (
                                                                                <div className="mt-2 p-2 text-sm text-gray-500 bg-gray-50 rounded">
                                                                                    ⏳
                                                                                    جاري
                                                                                    تحميل
                                                                                    المواعيد...
                                                                                </div>
                                                                            )}

                                                                        {data.circle_id &&
                                                                            !schedulesLoading &&
                                                                            schedules.length >
                                                                                0 && (
                                                                                <div className="mt-2">
                                                                                    <label className="block text-xs text-gray-600 mb-1">
                                                                                        المواعيد
                                                                                        المتاحة
                                                                                        لهذه
                                                                                        الحلقة:
                                                                                    </label>
                                                                                    <select
                                                                                        name="schedule_id"
                                                                                        value={
                                                                                            data.schedule_id ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            handleScheduleChange(
                                                                                                Number(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ),
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <option value="">
                                                                                            اختيار
                                                                                            موعد
                                                                                            (اختياري)
                                                                                        </option>
                                                                                        {schedules.map(
                                                                                            (
                                                                                                schedule: any,
                                                                                            ) => {
                                                                                                const isFull =
                                                                                                    schedule.is_full;
                                                                                                const seatsText =
                                                                                                    isFull
                                                                                                        ? `مليان (${schedule.seats_available})`
                                                                                                        : `${schedule.seats_available} متاح`;

                                                                                                return (
                                                                                                    <option
                                                                                                        key={
                                                                                                            schedule.id
                                                                                                        }
                                                                                                        value={
                                                                                                            schedule.id
                                                                                                        }
                                                                                                        disabled={
                                                                                                            isFull
                                                                                                        }
                                                                                                    >
                                                                                                        من{" "}
                                                                                                        {schedule.start_time_ar ||
                                                                                                            schedule.start_time}
                                                                                                        إلى{" "}
                                                                                                        {schedule.end_time_ar ||
                                                                                                            schedule.end_time}

                                                                                                        (
                                                                                                        {
                                                                                                            seatsText
                                                                                                        }

                                                                                                        )
                                                                                                    </option>
                                                                                                );
                                                                                            },
                                                                                        )}
                                                                                    </select>
                                                                                </div>
                                                                            )}

                                                                        {data.circle_id &&
                                                                            !schedulesLoading &&
                                                                            schedules.length ===
                                                                                0 && (
                                                                                <div className="mt-2 p-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                                                                    📅
                                                                                    لا
                                                                                    توجد
                                                                                    مواعيد
                                                                                    متاحة
                                                                                    حالياً
                                                                                    لهذه
                                                                                    الحلقة
                                                                                    <br />
                                                                                    <small>
                                                                                        يمكنك
                                                                                        التسجيل
                                                                                        بدون
                                                                                        موعد
                                                                                        وسيتم
                                                                                        التواصل
                                                                                        معك
                                                                                        لاحقاً
                                                                                    </small>
                                                                                </div>
                                                                            )}
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 p-3">
                                                                        لا توجد
                                                                        حلقات
                                                                        متاحة في
                                                                        هذا
                                                                        المجمع
                                                                        حالياً
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* البريد الإلكتروني */}
                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__email">
                                                            <label>
                                                                بريدك الإلكتروني
                                                                *
                                                            </label>
                                                            <input
                                                                required
                                                                type="email"
                                                                name="email"
                                                                value={
                                                                    data.email
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "email",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="teacher@example.com"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* الملاحظات */}
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            ملاحظات/خبرات
                                                        </label>
                                                        <textarea
                                                            name="notes"
                                                            rows={3}
                                                            value={data.notes}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "notes",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="خبرتك التعليمية، المؤهلات، أو أي ملاحظات..."
                                                            maxLength={1000}
                                                        />
                                                    </div>

                                                    {/* رسائل الخطأ */}
                                                    {error && (
                                                        <div
                                                            className="error-message"
                                                            style={{
                                                                color: "#ef4444",
                                                                background:
                                                                    "#fef2f2",
                                                                padding: "12px",
                                                                borderRadius:
                                                                    "8px",
                                                                border: "1px solid #fecaca",
                                                                marginBottom:
                                                                    "16px",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ❌ {error}
                                                        </div>
                                                    )}

                                                    {/* رسائل النجاح */}
                                                    {success && (
                                                        <div
                                                            className="success-message"
                                                            style={{
                                                                color: "#10b981",
                                                                background:
                                                                    "#f0fdf4",
                                                                padding: "12px",
                                                                borderRadius:
                                                                    "8px",
                                                                border: "1px solid #bbf7d0",
                                                                marginBottom:
                                                                    "16px",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ✅ تم إرسال طلب
                                                            التسجيل بنجاح! سيتم
                                                            مراجعته قريباً
                                                        </div>
                                                    )}

                                                    {/* زر الإرسال */}
                                                    <div className="inputs__submitBtn">
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                loading ||
                                                                !data.full_name ||
                                                                !data.email ||
                                                                !data.role
                                                            }
                                                            style={{
                                                                opacity:
                                                                    loading ||
                                                                    !data.full_name ||
                                                                    !data.email ||
                                                                    !data.role
                                                                        ? 0.6
                                                                        : 1,
                                                                cursor:
                                                                    loading ||
                                                                    !data.full_name ||
                                                                    !data.email ||
                                                                    !data.role
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                            }}
                                                        >
                                                            {loading
                                                                ? "⏳ جاري الإرسال..."
                                                                : "إرسال طلب التسجيل"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Background Section */}
                        <div className="auth__bg">
                            <div className="auth__bgContainer">
                                <div className="auth__bgData">
                                    <h1>تسجيل معلم</h1>
                                    <p>
                                        بالقرآن نحيا (منصة اتقان لتسهيل حفظ
                                        القرآن)
                                    </p>
                                </div>
                                <div className="auth__bgImg">
                                    <img
                                        src={
                                            selectedGender === "male"
                                                ? Men
                                                : Woman
                                        }
                                        alt={
                                            selectedGender === "male"
                                                ? "رجل"
                                                : "امرأة"
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gender Selector */}
            <div className="gender-selector">
                <div className="gender-buttons">
                    <button
                        className={`gender-btn ${selectedGender === "male" ? "active" : ""}`}
                        onClick={() => setSelectedGender("male")}
                    >
                        <img src={Men} alt="ذكر" width={40} height={40} />
                        ذكر
                    </button>
                    <button
                        className={`gender-btn ${selectedGender === "female" ? "active" : ""}`}
                        onClick={() => setSelectedGender("female")}
                    >
                        <img src={Woman} alt="أنثى" width={40} height={40} />
                        أنثى
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherRegister;
