import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiX } from "react-icons/fi";
import {
    useMosqueForm,
    MosqueFormData,
    CenterOption,
    UserOption,
} from "../hooks/useMosqueForm";
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
        centers,
        users,
        loadingOptions,
        errors,
        isSubmitting,
        handleInputChange,
        handleFileChange,
        submitForm,
        logoPreview,
    } = useMosqueForm(initialMosque || undefined);

    const handleSubmit = async (formData: FormData) => {
        if (!mosqueId) {
            toast.error("معرف المسجد مطلوب");
            return;
        }

        try {
            formData.append("_method", "PUT");

            const response = await fetch(`/api/super/mosques/${mosqueId}`, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("Error response:", errorData);

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
            console.log("Update response:", result);

            if (result.success) {
                toast.success("تم تحديث بيانات المسجد بنجاح!");
                onSuccess();
            } else {
                toast.error(result.message || "فشل في التحديث");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
        }
    };

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
                                <p>{initialMosque?.name || "مسجد جديد"}</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات المسجد</h1>
                                <p>
                                    يرجى تحديث بيانات المسجد المعتمد بشكل صحيح
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
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

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع التابع له *</label>
                                    <select
                                        required
                                        name="center_id"
                                        value={formData.center_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.center_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingOptions
                                        }
                                    >
                                        <option value="">
                                            تحميل المجمعات...
                                        </option>
                                        {!loadingOptions && (
                                            <>
                                                <option value="">
                                                    اختر المجمع
                                                </option>
                                                {centers.map((center) => (
                                                    <option
                                                        key={center.id}
                                                        value={center.id}
                                                    >
                                                        {center.name}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    {errors.center_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.center_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المشرف *</label>
                                    <select
                                        required
                                        name="supervisor_id"
                                        value={formData.supervisor_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.supervisor_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingOptions
                                        }
                                    >
                                        <option value="">
                                            تحميل المشرفين...
                                        </option>
                                        {!loadingOptions && (
                                            <>
                                                <option value="">
                                                    اختر المشرف
                                                </option>
                                                {users.map((user) => (
                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.name} -{" "}
                                                        {user.email}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    {errors.supervisor_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.supervisor_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>شعار المسجد</label>
                                    <div className="space-y-3">
                                        {typeof formData.logo === "string" &&
                                        formData.logo ? (
                                            <div className="text-center">
                                                <img
                                                    src={formData.logo}
                                                    alt="شعار المسجد الحالي"
                                                    className="w-24 h-24 object-cover rounded-2xl mx-auto border-2 border-gray-200"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    الصورة الحالية
                                                </p>
                                            </div>
                                        ) : formData.logo && logoPreview ? (
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
                                        ) : null}

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
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-medium"></div>
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

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting || loadingOptions}
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
