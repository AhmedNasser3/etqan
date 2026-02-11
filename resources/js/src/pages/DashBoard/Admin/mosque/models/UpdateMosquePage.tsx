import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiX } from "react-icons/fi";
import {
    useMosqueFormUpdate,
    MosqueFormData,
} from "../hooks/useMosqueFormUpdate";
import { Mosque } from "./types";

interface UpdateMosquePageProps {
    initialMosque?: Mosque | null;
    mosqueId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateMosquePage: React.FC<UpdateMosquePageProps> = ({
    initialMosque,
    mosqueId,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleFileChange,
        submitForm,
        logoPreview,
        centersData,
        usersData,
        loadingData,
        user,
    } = useMosqueFormUpdate(initialMosque || undefined);

    // ✅ handleSubmit للتحديث مع _method=PUT
    const handleSubmit = async (formDataSubmit: FormData) => {
        if (!mosqueId) {
            toast.error("معرف المسجد مطلوب");
            return;
        }

        try {
            // إضافة _method للـ PUT
            formDataSubmit.append("_method", "PUT");

            console.log("🌐 PUT → /api/v1/super/mosques/", mosqueId);

            const response = await fetch(`/api/v1/super/mosques/${mosqueId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formDataSubmit,
            });

            console.log("📡 Status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("❌ Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في التحديث");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Update response:", result);

            toast;
            onSuccess();
        } catch (error: any) {
            console.error("💥 Update error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
        }
    };

    const isCenterOwner = user?.role?.id === 1;
    const centerIsFixed = isCenterOwner && user?.center_id;

    // فلترة المشرفين حسب center_id
    const selectedCenterId = formData.center_id
        ? parseInt(formData.center_id)
        : null;
    const filteredSupervisors = selectedCenterId
        ? usersData.filter((u: any) => u.center_id === selectedCenterId)
        : [];

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>{initialMosque?.name || "مسجد"}</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات المسجد</h1>
                                <p>
                                    يرجى تحديث بيانات المسجد المعتمد بشكل صحيح
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اسم المسجد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم المسجد *</label>
                                    <input
                                        required
                                        type="text"
                                        name="mosque_name"
                                        value={formData.mosque_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.mosque_name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="أدخل اسم المسجد"
                                        disabled={isSubmitting}
                                    />
                                    {errors.mosque_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.mosque_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع التابع له *</label>
                                    {centerIsFixed ? (
                                        <div className="w-full px-4 py-3 border border-green-300 bg-green-50 rounded-xl text-green-800 font-medium">
                                            <span className="flex items-center gap-2">
                                                ✅{" "}
                                                {centersData[0]?.name ||
                                                    centersData[0]
                                                        ?.circle_name ||
                                                    "مجمعك"}
                                                <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                                                    محدد تلقائياً
                                                </span>
                                            </span>
                                            <input
                                                type="hidden"
                                                name="center_id"
                                                value={formData.center_id}
                                            />
                                        </div>
                                    ) : (
                                        <select
                                            required
                                            name="center_id"
                                            value={formData.center_id}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.center_id || loadingData
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            disabled={
                                                isSubmitting || loadingData
                                            }
                                        >
                                            <option value="">
                                                {loadingData
                                                    ? "جاري التحميل..."
                                                    : "اختر المجمع"}
                                            </option>
                                            {centersData.map((center) => (
                                                <option
                                                    key={center.id}
                                                    value={center.id}
                                                >
                                                    {center.circle_name ||
                                                        center.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.center_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.center_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المشرف */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المشرف *</label>
                                    <select
                                        required
                                        name="supervisor_id"
                                        value={formData.supervisor_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.supervisor_id || loadingData
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !formData.center_id
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "جاري التحميل..."
                                                : !formData.center_id
                                                  ? "اختر المجمع أولاً"
                                                  : filteredSupervisors.length ===
                                                      0
                                                    ? "لا يوجد مشرفين لهذا المجمع"
                                                    : "اختر المشرف"}
                                        </option>
                                        {filteredSupervisors.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} - {u.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.supervisor_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.supervisor_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* شعار المسجد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>شعار المسجد</label>
                                    <div className="space-y-3">
                                        {/* الصورة الحالية */}
                                        {typeof formData.logo === "string" &&
                                        formData.logo ? (
                                            <div className="text-center">
                                                <img
                                                    src={
                                                        formData.logo.startsWith(
                                                            "http",
                                                        )
                                                            ? formData.logo
                                                            : `/storage/${formData.logo}`
                                                    }
                                                    alt="شعار المسجد الحالي"
                                                    className="w-24 h-24 object-cover rounded-2xl mx-auto border-2 border-gray-200"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    الصورة الحالية
                                                </p>
                                            </div>
                                        ) : null}

                                        {/* معاينة الصورة الجديدة */}
                                        {logoPreview && (
                                            <div className="text-center">
                                                <img
                                                    src={logoPreview}
                                                    alt="معاينة الصورة الجديدة"
                                                    className="w-24 h-24 object-cover rounded-2xl mx-auto border-2 border-blue-200"
                                                />
                                                <p className="text-sm text-blue-600 mt-1">
                                                    صورة جديدة محملة
                                                </p>
                                            </div>
                                        )}

                                        {/* رفع صورة جديدة */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all bg-gray-50">
                                            <input
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="logo-upload"
                                                disabled={isSubmitting}
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="cursor-pointer flex flex-col items-center gap-3"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-medium">
                                                    +
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {formData.logo instanceof
                                                        File
                                                            ? formData.logo.name
                                                            : "اختر صورة جديدة (JPG, PNG)"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        حد أقصى 2 ميجا بايت
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* زر التحديث */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting || loadingData}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>تحديث المسجد</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateMosquePage;
