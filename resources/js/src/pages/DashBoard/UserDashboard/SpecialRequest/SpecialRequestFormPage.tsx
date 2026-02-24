// components/SpecialRequestFormPage.tsx
import { useState } from "react";
import {
    FiX,
    FiUser,
    FiPhone,
    FiCalendar,
    FiClock,
    FiBook,
    FiCheckSquare,
    FiEdit3,
} from "react-icons/fi";
import { useSpecialRequestEdit } from "./hooks/useSpecialRequestEdit";

interface SpecialRequestFormProps {
    specialRequestId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

const SpecialRequestFormPage: React.FC<SpecialRequestFormProps> = ({
    specialRequestId,
    onClose,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        errors,
        reset,
        setValue,
        loadingUser,
        isSubmitting,
        deleting,
        submitForm,
        deleteRequest,
        watch,
    } = useSpecialRequestEdit({ specialRequestId, onSuccess, onClose });

    const watchedWhatsapp = watch("whatsapp_number");
    const watchedName = watch("name");

    // ✅ Loading state
    if (loadingUser) {
        return (
            <div className="ParentModel">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content max-w-2xl mx-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        {/* Header */}
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={onClose}
                                disabled={isSubmitting || deleting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Title */}
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>
                                    {specialRequestId
                                        ? "تعديل طلب الحلقة المخصصة"
                                        : "طلب حلقة مخصصة"}
                                </p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>
                                    {specialRequestId
                                        ? "تعديل الطلب"
                                        : "طلب جديد"}
                                </h1>
                                <p>
                                    {specialRequestId
                                        ? "قم بتحديث تفاصيل طلب الحلقة المخصصة حسب رغبتك"
                                        : "أدخل جميع التفاصيل المطلوبة لطلب حلقة حفظ مخصصة حسب رغبتك تماماً"}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit(submitForm)}
                            className="ParentModel__container"
                        >
                            {/* رقم الواتساب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رقم الواتساب *</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            {...register("whatsapp_number")}
                                            className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.whatsapp_number
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="01xxxxxxxxx"
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    {errors.whatsapp_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.whatsapp_number.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الاسم الكامل */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الاسم الكامل *</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.name
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="الاسم الكامل كما تريد"
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* العمر */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>العمر (اختياري)</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            {...register("age", {
                                                valueAsNumber: true,
                                            })}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="عمرك بالسنوات"
                                            min={5}
                                            max={100}
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    {errors.age && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.age.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المواعيد المتاحة - textarea مخصص */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المواعيد المتاحة لك *</label>
                                    <div className="relative">
                                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <textarea
                                            {...register("available_schedule")}
                                            rows={3}
                                            className={`w-full pl-10 pt-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical ${
                                                errors.available_schedule
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="اكتب مواعيدك المتاحة بالتفصيل
مثال:
- السبت والأحد 9-11 صباحاً
- الاثنين والأربعاء 3-5 عصراً
- أي وقت في عطلة نهاية الأسبوع"
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    {errors.available_schedule && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.available_schedule.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        اكتب جميع المواعيد اللي تناسبك بالتفصيل
                                    </p>
                                </div>
                            </div>

                            {/* الأجزاء المحفوظة حالياً - textarea مخصص */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        الأجزاء/السور المحفوظة حالياً (اختياري)
                                    </label>
                                    <div className="relative">
                                        <FiBook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <textarea
                                            {...register("memorized_parts")}
                                            rows={2}
                                            className="w-full pl-10 pt-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-vertical"
                                            placeholder="اكتب الأجزاء أو السور المحفوظة حالياً
مثال: الجزء 29، 30 - سورة الفاتحة، البقرة، يس"
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        اكتب بالتفصيل ما حفظته من القرآن
                                    </p>
                                </div>
                            </div>

                            {/* الأجزاء/السور المطلوب حفظها - textarea مخصص */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        الأجزاء/السور المطلوب حفظها (اختياري)
                                    </label>
                                    <div className="relative">
                                        <FiCheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <textarea
                                            {...register("parts_to_memorize")}
                                            rows={2}
                                            className="w-full pl-10 pt-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-vertical"
                                            placeholder="اكتب الأجزاء أو السور اللي عايز تحفظها
مثال: الجزء 15-20، سورة الكهف، مريم، طه"
                                            disabled={isSubmitting || deleting}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        حدد بالضبط ما تريد حفظه
                                    </p>
                                </div>
                            </div>

                            {/* الحفظ اليومي المطلوب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        قدرتك على الحفظ يومياً (اختياري)
                                    </label>
                                    <div className="relative">
                                        <FiEdit3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            {...register("daily_memorization")}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            disabled={isSubmitting || deleting}
                                        >
                                            <option value="">
                                                -- اختر قدرتك --
                                            </option>
                                            <option value="وجه">
                                                وجه يومياً
                                            </option>
                                            <option value="وجهين">
                                                وجهين يومياً
                                            </option>
                                            <option value="أكثر">
                                                أكثر من وجهين يومياً
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* الأزرار */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || deleting}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center disabled:opacity-50 shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                جاري إرسال الطلب...
                                            </>
                                        ) : (
                                            <>إرسال الطلب المخصص</>
                                        )}
                                    </button>

                                    {specialRequestId && (
                                        <button
                                            type="button"
                                            onClick={deleteRequest}
                                            disabled={isSubmitting || deleting}
                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center disabled:opacity-50 shadow-lg"
                                        >
                                            {deleting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    جاري الحذف...
                                                </>
                                            ) : (
                                                <>حذف الطلب</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialRequestFormPage;
