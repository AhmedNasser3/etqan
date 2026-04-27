// hooks/useCertificateFormCreate.ts - النسخة المُصححة
import {
    useRef,
    useState,
    useEffect,
    useCallback,
    useRef as useRefHook,
} from "react";
import toast from "react-hot-toast";

interface Student {
    id: number;
    user_id: number;
    id_number: string;
    grade_level: string;
    circle: string;
    user_name: string;
}

interface FormData {
    user_id: string;
}

interface FormErrors {
    user_id?: string;
}

export const useCertificateFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({ user_id: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentsData, setStudentsData] = useState<Student[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);

    //  Prevent multiple calls
    const hasFetched = useRefHook(false);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.user_id) {
            newErrors.user_id = "يرجى اختيار طالب";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.user_id]);

    const submitForm = useCallback(
        (submitHandler: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;
            setIsSubmitting(true);
            submitHandler(formData);
        },
        [formData, validateForm],
    );

    const fetchStudents = useCallback(async () => {
        //  Prevent multiple calls (React Strict Mode fix)
        if (hasFetched.current) {
            console.log("⏭️ تم جلب البيانات من قبل");
            setLoadingData(false);
            return;
        }

        try {
            console.log("🔄 جاري جلب الطلاب...");
            hasFetched.current = true;
            setLoadingData(true);

            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/certificates", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            const result = await response.json();
            console.log(" بيانات الطلاب:", result);

            if (result.success) {
                setStudentsData(result.students || []);

                const userData = localStorage.getItem("user");
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }
        } catch (error) {
            console.error("❌ خطأ:", error);
            setStudentsData([]);
        } finally {
            console.log("🏁 انتهى التحميل");
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    console.log("📊 الحالة الحالية:", {
        loadingData,
        studentsCount: studentsData.length,
        hasFetched: hasFetched.current,
    });

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        studentsData,
        loadingData,
        user,
    };
};
