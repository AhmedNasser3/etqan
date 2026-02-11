import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface UserAccountType {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;
    gender: "male" | "female" | null;
    avatar: string | null;
    status: string;
    email_verified_at: string | null;
}

interface FormDataType {
    name: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: "male" | "female" | "";
    current_password: string;
    password: string;
    password_confirmation: string;
}

interface FormErrors {
    [key: string]: string;
}

export const useAccountEdit = () => {
    // ✅ States
    const [formData, setFormData] = useState<FormDataType>({
        name: "",
        email: "",
        phone: "",
        birth_date: "",
        gender: "",
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState<UserAccountType | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removingAvatar, setRemovingAvatar] = useState(false);
    const avatarFileRef = useRef<File | null>(null);

    // ✅ CSRF Token (محسن)
    const getCsrfToken = useCallback((): string => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || ""
        );
    }, []);

    // ✅ جلب بيانات المستخدم
    const fetchUserData = useCallback(async () => {
        try {
            setLoadingUser(true);
            console.log("📡 جاري تحميل بيانات المستخدم...");

            const response = await fetch(`/api/v1/account/edit`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(), // ✅ CSRF للـ GET كمان
                },
            });

            console.log("📡 Response status:", response.status);

            if (response.status === 401) {
                toast.error("⚠️ يرجى تسجيل الدخول مرة أخرى");
                setLoadingUser(false);
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ فشل تحميل:", errorText);
                toast.error("فشل في تحميل بيانات الحساب");
                setLoadingUser(false);
                return;
            }

            const data = await response.json();
            console.log("✅ بيانات المستخدم:", data);

            if (data.success && data.data) {
                const user = data.data;
                setUserData(user);

                // ✅ تعيين البيانات في الـ form فوراً
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    birth_date: user.birth_date || "",
                    gender: user.gender || "",
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });

                setAvatarPreview(user.avatar || null);
                console.log("✅ تم تعيين البيانات:", {
                    name: user.name,
                    email: user.email,
                });
            }
        } catch (error) {
            console.error("❌ خطأ الشبكة:", error);
            toast.error("خطأ في الاتصال بالخادم");
        } finally {
            setLoadingUser(false);
        }
    }, [getCsrfToken]);

    // ✅ تحميل البيانات عند تحميل المكون
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // ✅ تغيير inputs
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            // مسح خطأ الحقل
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        },
        [],
    );

    // ✅ صورة
    const handleAvatarChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                console.log("🖼️ صورة جديدة:", file.name);
                const previewUrl = URL.createObjectURL(file);
                setAvatarPreview(previewUrl);
                avatarFileRef.current = file;
            }
        },
        [],
    );

    const handleRemoveAvatar = useCallback(() => {
        if (window.confirm("هل تريد إزالة الصورة الشخصية؟")) {
            setAvatarPreview(null);
            avatarFileRef.current = null;
            setRemovingAvatar(true);
            setTimeout(() => setRemovingAvatar(false), 1000);
        }
    }, []);

    // ✅ Validation محلي
    const validateForm = useCallback(
        (currentFormData: FormDataType): FormErrors => {
            const newErrors: FormErrors = {};

            if (!currentFormData.name.trim()) newErrors.name = "الاسم مطلوب";
            if (!currentFormData.email.trim())
                newErrors.email = "البريد الإلكتروني مطلوب";
            else if (!/\S+@\S+\.\S+/.test(currentFormData.email))
                newErrors.email = "البريد الإلكتروني غير صحيح";

            if (
                currentFormData.password &&
                currentFormData.password.length < 8
            ) {
                newErrors.password = "كلمة المرور 8 أحرف على الأقل";
            }
            if (
                currentFormData.password &&
                currentFormData.password !==
                    currentFormData.password_confirmation
            ) {
                newErrors.password_confirmation = "كلمة المرور غير متطابقة";
            }

            return newErrors;
        },
        [],
    );

    // ✅ Submit الرئيسي (محدث لـ web middleware)
    const submitForm = useCallback(async () => {
        console.log("🚀 بدء الإرسال...", formData);

        // ✅ Validation محلي
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("يرجى تصحيح الأخطاء");
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfToken = getCsrfToken();
            console.log("🔐 CSRF Token:", csrfToken ? "موجود ✅" : "مفقود ❌");

            const formDataSubmit = new FormData();

            // ✅ البيانات الأساسية (مع trim)
            formDataSubmit.append("name", formData.name.trim());
            formDataSubmit.append("email", formData.email.trim());
            formDataSubmit.append("phone", formData.phone);
            formDataSubmit.append("birth_date", formData.birth_date || "");
            formDataSubmit.append("gender", formData.gender);

            // ✅ كلمة المرور
            if (formData.current_password.trim()) {
                formDataSubmit.append(
                    "current_password",
                    formData.current_password.trim(),
                );
            }
            if (formData.password.trim()) {
                formDataSubmit.append("password", formData.password);
                formDataSubmit.append(
                    "password_confirmation",
                    formData.password_confirmation,
                );
            }

            // ✅ الصورة
            if (avatarFileRef.current) {
                formDataSubmit.append("avatar", avatarFileRef.current);
            }

            console.log("📤 البيانات المُرسلة:");
            for (let [key, value] of formDataSubmit.entries()) {
                console.log(key, value);
            }

            console.log("📤 Headers المُرسلة:", {
                "X-CSRF-TOKEN": csrfToken ? "YES" : "NO",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            });

            const response = await fetch(`/api/v1/account/update`, {
                method: "POST",
                credentials: "include", // ✅ Session cookies + CSRF
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken, // ✅ CSRF للـ web middleware
                },
                body: formDataSubmit, // ✅ FormData بدون Content-Type header
            });

            console.log("📡 Response status:", response.status);
            console.log("📡 Response headers:", [
                ...response.headers.entries(),
            ]);

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorData;

                if (contentType?.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = { message: await response.text() };
                }

                console.error("❌ Server Error:", errorData);

                // ✅ Laravel 422 validation errors
                if (response.status === 422 && errorData.errors) {
                    const fieldErrors: FormErrors = {};
                    Object.entries(errorData.errors).forEach(
                        ([field, messages]: [string, any]) => {
                            fieldErrors[field] = Array.isArray(messages)
                                ? messages[0]
                                : String(messages);
                        },
                    );
                    setErrors(fieldErrors);
                    toast.error(errorData.message || "يرجى تصحيح الأخطاء");
                    return;
                }

                toast.error(errorData.message || `خطأ ${response.status}`);
                return;
            }

            const result = await response.json();
            console.log("✅ نجح:", result);
            toast.success("تم تحديث الحساب بنجاح! 🎉");

            // ✅ إعادة تحميل البيانات
            await fetchUserData();
        } catch (error) {
            console.error("❌ Network Error:", error);
            toast.error("خطأ في الاتصال بالخادم");
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, getCsrfToken, fetchUserData, validateForm]);

    // ✅ حذف الحساب (محسن)
    const deleteAccount = useCallback(async () => {
        if (
            !window.confirm(
                "هل أنت متأكد من حذف الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!",
            )
        ) {
            return;
        }

        if (!window.confirm("هل أنت متأكد تماماً؟")) {
            return;
        }

        try {
            setIsSubmitting(true);
            const csrfToken = getCsrfToken();

            const response = await fetch(`/api/v1/account/delete`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: formData.current_password.trim(),
                    confirm_deletion: true,
                }),
            });

            if (response.ok) {
                toast.success("تم حذف الحساب بنجاح");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "فشل في الحذف");
            }
        } catch (error) {
            console.error("❌ خطأ الحذف:", error);
            toast.error("خطأ في الاتصال بالخادم");
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.current_password, getCsrfToken]);

    return {
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
        setFormData,
        fetchUserData,
    };
};
