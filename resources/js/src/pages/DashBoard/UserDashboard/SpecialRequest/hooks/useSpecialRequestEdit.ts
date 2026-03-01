// hooks/useSpecialRequestEdit.ts
import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

type SpecialRequestFormData = {
    whatsapp_number: string;
    name: string;
    age?: number;
    available_schedule: string; // textarea string
    memorized_parts?: string;
    parts_to_memorize?: string;
    daily_memorization?: "وجه" | "وجهين" | "أكثر";
};

interface SpecialRequest {
    id?: string;
    whatsapp_number: string;
    name: string;
    age?: number;
    available_schedule: string[]; // Backend يتوقع array
    memorized_parts?: string[];
    parts_to_memorize?: string[];
    daily_memorization?: "وجه" | "وجهين" | "أكثر";
}

interface UseSpecialRequestEditProps {
    specialRequestId?: string;
    onSuccess: () => void;
    onClose: () => void;
    initialUserData?: Partial<SpecialRequestFormData>;
}

export const useSpecialRequestEdit = ({
    specialRequestId,
    onSuccess,
    onClose,
    initialUserData = {},
}: UseSpecialRequestEditProps) => {
    const [loadingUser, setLoadingUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors: formErrors },
        reset,
        setValue,
        watch,
        getValues,
        setError,
        clearErrors,
    } = useForm<SpecialRequestFormData>({
        defaultValues: {
            whatsapp_number: initialUserData.whatsapp_number || "",
            name: initialUserData.name || "",
            available_schedule: "",
        },
    });

    //  Validation يدوي
    const validateForm = (data: SpecialRequestFormData): boolean => {
        // WhatsApp validation
        const whatsappRegex = /^01[0-9]{9}$/;
        if (!whatsappRegex.test(data.whatsapp_number.trim())) return false;

        // Name validation
        if (data.name.trim().length < 2 || data.name.trim().length > 100)
            return false;

        // Age validation
        if (data.age !== undefined && (data.age < 5 || data.age > 100))
            return false;

        // Schedule validation
        if (
            !data.available_schedule.trim() ||
            data.available_schedule.length < 10
        )
            return false;

        return true;
    };

    //  CSRF Token
    useEffect(() => {
        const getCsrfToken = () => {
            const metaToken = document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement;
            if (metaToken?.content) {
                setCsrfToken(metaToken.content);
                return;
            }

            const getCookie = (name: string): string => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2)
                    return parts.pop()?.split(";").shift() || "";
                return "";
            };

            setCsrfToken(getCookie("XSRF-TOKEN") || getCookie("csrf-token"));
        };

        getCsrfToken();
    }, []);

    //  تحميل من localStorage
    useEffect(() => {
        if (specialRequestId) {
            try {
                const savedData = localStorage.getItem(
                    `special_request_${specialRequestId}`,
                );
                if (savedData) {
                    const data = JSON.parse(savedData);
                    Object.entries(data).forEach(([key, value]) => {
                        setValue(
                            key as keyof SpecialRequestFormData,
                            value as any,
                        );
                    });
                }
            } catch (e) {
                console.error("خطأ في تحميل البيانات:", e);
            }
            setLoadingUser(false);
        }
    }, [specialRequestId, setValue]);

    //  حفظ تلقائي
    const watchedValues = watch();
    useEffect(() => {
        if (specialRequestId) {
            localStorage.setItem(
                `special_request_${specialRequestId}`,
                JSON.stringify(watchedValues),
            );
        }
    }, [watchedValues, specialRequestId]);

    //  الـ submit المهم - تحويل string → array
    const submitForm = useCallback(
        async (data: SpecialRequestFormData) => {
            if (!validateForm(data) || isSubmitting || !csrfToken) {
                toast.error("يرجى تصحيح البيانات أولاً");
                return;
            }

            try {
                setIsSubmitting(true);

                const formData = new FormData();

                //  البيانات الأساسية
                formData.append("whatsapp_number", data.whatsapp_number.trim());
                formData.append("name", data.name.trim());

                if (data.age && data.age > 0) {
                    formData.append("age", data.age.toString());
                }

                // 🔥🔥 الحل: تحويل textarea string → array للـ Backend
                const scheduleLines = data.available_schedule
                    .trim()
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);

                scheduleLines.forEach((line, index) => {
                    formData.append(`available_schedule[${index}]`, line);
                });

                //  باقي الحقول كـ arrays أو strings
                if (data.memorized_parts?.trim()) {
                    const memorizedLines = data.memorized_parts
                        .trim()
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line);
                    memorizedLines.forEach((line, index) => {
                        formData.append(`memorized_parts[${index}]`, line);
                    });
                }

                if (data.parts_to_memorize?.trim()) {
                    const partsLines = data.parts_to_memorize
                        .trim()
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line);
                    partsLines.forEach((line, index) => {
                        formData.append(`parts_to_memorize[${index}]`, line);
                    });
                }

                if (data.daily_memorization) {
                    formData.append(
                        "daily_memorization",
                        data.daily_memorization,
                    );
                }

                formData.append("_token", csrfToken);

                const url = specialRequestId
                    ? `/api/v1/special-requests/${specialRequestId}`
                    : `/api/v1/special-requests`;

                const method = specialRequestId ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    body: formData,
                    credentials: "same-origin",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    if (result.errors) {
                        Object.entries(result.errors).forEach(
                            ([field, message]: [string, any]) => {
                                if (typeof message === "string") {
                                    setError(field as any, {
                                        type: "manual",
                                        message,
                                    });
                                } else if (Array.isArray(message)) {
                                    setError(field as any, {
                                        type: "manual",
                                        message: message[0],
                                    });
                                }
                            },
                        );
                    }
                    throw new Error(result.message || `خطأ ${response.status}`);
                }

                toast.success(
                    specialRequestId
                        ? "تم تحديث الطلب بنجاح"
                        : "تم إرسال الطلب بنجاح",
                );

                if (specialRequestId) {
                    localStorage.removeItem(
                        `special_request_${specialRequestId}`,
                    );
                }

                reset();
                onSuccess();
            } catch (error: any) {
                toast.error(error.message || "حدث خطأ");
            } finally {
                setIsSubmitting(false);
            }
        },
        [csrfToken, specialRequestId, isSubmitting, onSuccess, reset, setError],
    );

    //  حذف
    const deleteRequest = useCallback(async () => {
        if (!specialRequestId || deleting || !csrfToken) return;

        if (!confirm("هل أنت متأكد؟")) return;

        try {
            setDeleting(true);
            const response = await fetch(
                `/api/v1/special-requests/${specialRequestId}`,
                {
                    method: "DELETE",
                    credentials: "same-origin",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) throw new Error("فشل في الحذف");

            toast.success("تم الحذف بنجاح");
            localStorage.removeItem(`special_request_${specialRequestId}`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("فشل في الحذف");
        } finally {
            setDeleting(false);
        }
    }, [specialRequestId, deleting, csrfToken, onSuccess, onClose]);

    return {
        register,
        handleSubmit,
        errors: formErrors,
        reset,
        setValue,
        loadingUser,
        isSubmitting,
        deleting,
        submitForm,
        deleteRequest,
        watch,
        getValues,
    };
};
