import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    FiX,
    FiCamera,
    FiTrash2,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiLock,
} from "react-icons/fi";
import { useAccountEdit } from "./hooks/useAccountEdit";

interface EditAccountPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const EditAccountPage: React.FC<EditAccountPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        userData,
        loadingUser,
        avatarPreview,
        removingAvatar,
        handleInputChange,
        handleAvatarChange,
        handleRemoveAvatar,
        submitForm,
        deleteAccount,
    } = useAccountEdit();

    const [showPasswordFields, setShowPasswordFields] = useState(false);

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
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Title */}
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>تعديل الحساب الشخصي</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الحساب</h1>
                                <p>قم بتحديث بياناتك الشخصية والصورة الشخصية</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="ParentModel__container">
                            {/* الصورة الشخصية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الصورة الشخصية</label>
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : userData?.avatar ? (
                                                <img
                                                    src={userData.avatar}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <FiUser className="w-12 h-12 text-gray-400" />
                                            )}
                                            {removingAvatar && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 flex-1">
                                            <label className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center transition-all disabled:opacity-50">
                                                <FiCamera className="mr-2" />
                                                اختر صورة
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif"
                                                    onChange={
                                                        handleAvatarChange
                                                    }
                                                    className="hidden"
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            {(avatarPreview ||
                                                userData?.avatar) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAvatar}
                                                    disabled={
                                                        isSubmitting ||
                                                        removingAvatar
                                                    }
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                                >
                                                    <FiTrash2 className="mr-2" />
                                                    إزالة
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        يدعم: JPG, PNG, GIF - الحجم الأقصى 2MB
                                    </p>
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
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.name
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            disabled={isSubmitting}
                                            placeholder="أدخل اسمك الكامل"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* البريد الإلكتروني */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>البريد الإلكتروني *</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.email
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            disabled={isSubmitting}
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* رقم الهاتف */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رقم الهاتف</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="01xxxxxxxxx"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* تاريخ الميلاد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>تاريخ الميلاد</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* الجنس */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الجنس</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">-- اختر --</option>
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                            </div>

                            {/* تغيير كلمة المرور */}
                            <div className="inputs__verifyOTPBirth">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordFields(
                                            !showPasswordFields,
                                        )
                                    }
                                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium mb-3 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {showPasswordFields
                                        ? "إخفاء كلمة المرور"
                                        : "تغيير كلمة المرور"}
                                </button>
                            </div>

                            {/* حقول كلمة المرور */}
                            {showPasswordFields && (
                                <>
                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>كلمة المرور الحالية</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    name="current_password"
                                                    value={
                                                        formData.current_password
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                                                    placeholder="••••••••"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>كلمة المرور الجديدة</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${
                                                        errors.password
                                                            ? "border-red-300 bg-red-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                    placeholder="كلمة مرور جديدة (اختياري)"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>
                                                تأكيد كلمة المرور الجديدة
                                            </label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    name="password_confirmation"
                                                    value={
                                                        formData.password_confirmation
                                                    }
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all ${
                                                        errors.password_confirmation
                                                            ? "border-red-300 bg-red-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                    placeholder="تأكيد كلمة المرور"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        errors.password_confirmation
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* الأزرار */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={submitForm} // ✅ مباشرة بدون handleSubmit
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center disabled:opacity-50 shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>حفظ التغييرات</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deleteAccount}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center disabled:opacity-50 shadow-lg"
                                    >
                                        حذف الحساب
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAccountPage;
