// hooks/useStudentAffairsUpdate.ts - ✅ مُصحح كامل
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface StudentData {
    id: number;
    name: string;
    idNumber: string;
    age: string;
    grade: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
    guardian_phone_formatted: string;
}

interface FormData {
    id?: number;
    id_number: string;
    grade_level: string;
    circle: string;
    status: string;
    health_status?: string;
    reading_level?: string;
    session_time?: string;
    notes?: string;
    attendance_rate?: string;
}

interface FormErrors {
    [key: string]: string;
}

interface Stats {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    totalBalance: number;
    paymentRate: number;
}

export const useStudentAffairsUpdate = (studentId?: number) => {
    const [formData, setFormData] = useState<FormData>({
        id_number: "",
        grade_level: "",
        circle: "",
        status: "نشط",
        health_status: "",
        reading_level: "",
        session_time: "",
        notes: "",
        attendance_rate: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [grades, setGrades] = useState<string[]>([]);

    // جلب بيانات المستخدم
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    // ✅ تحميل بيانات الطالب - مُصحح للـ Backend الجديد
    const loadStudentData = useCallback(async () => {
        if (!studentId) return;

        try {
            setLoadingData(true);
            console.log("🔍 جاري تحميل بيانات الطالب:", studentId);

            const response = await fetch(
                `/api/v1/student-affairs/${studentId}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            console.log("📡 استجابة الخادم:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ بيانات الطالب:", data);

                // ✅ مطابقة مع استجابة Backend الجديد
                if (data.success && data.data) {
                    const student = data.data;
                    setStudentData({
                        id: student.id,
                        name: student.name,
                        idNumber: student.id_number,
                        grade: student.grade_level,
                        circle: student.circle,
                        status: student.status,
                        guardianName: student.guardian_name || "غير محدد",
                        guardianPhone: student.guardian_phone || "",
                        attendanceRate: "95%",
                        balance: "ر.0",
                        img: "https://via.placeholder.com/150?text=Student",
                        guardian_phone_formatted: "",
                        age: "غير محدد",
                    });

                    setFormData({
                        id: student.id,
                        id_number: student.id_number || "",
                        grade_level: student.grade_level || "",
                        circle: student.circle || "",
                        status: student.status || "نشط",
                        health_status: student.health_status || "",
                        reading_level: student.reading_level || "",
                        session_time: student.session_time || "",
                        notes: student.notes || "",
                    });
                    setGrades(data.grades || []);
                } else {
                    toast.error(data.message || "الطالب غير موجود");
                    setStudentData(null);
                }
            } else {
                const errorText = await response.text();
                console.error("❌ خطأ الخادم:", response.status, errorText);
                toast.error("فشل في تحميل بيانات الطالب");
                setStudentData(null);
            }
        } catch (error: any) {
            console.error("❌ Failed to fetch student data:", error);
            toast.error("فشل في تحميل بيانات الطالب");
            setStudentData(null);
        } finally {
            setLoadingData(false);
        }
    }, [studentId]);

    // تحميل البيانات عند تغيير studentId
    useEffect(() => {
        if (studentId) {
            loadStudentData();
        }
    }, [studentId, loadStudentData]);

    // تغيير البيانات
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    // التحقق من صحة البيانات
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.id_number.trim())
            newErrors.id_number = "رقم الهوية مطلوب";
        if (!formData.grade_level.trim()) newErrors.grade_level = "الصف مطلوب";
        if (!formData.circle.trim()) newErrors.circle = "الحلقة مطلوبة";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // ✅ إرسال النموذج - مُصحح للـ Backend
    const submitForm = useCallback(async () => {
        if (!validateForm() || !studentId) return false;

        setIsSubmitting(true);
        try {
            console.log("📤 إرسال البيانات:", formData);

            const response = await fetch(
                `/api/v1/student-affairs/${studentId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            console.log("📡 استجابة التحديث:", response.status);

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message || "تم تحديث بيانات الطالب بنجاح");
                return true;
            } else {
                try {
                    const error = await response.json();
                    toast.error(error.message || "حدث خطأ في التحديث");
                } catch {
                    toast.error("حدث خطأ في التحديث");
                }
            }
        } catch (error) {
            console.error("❌ Update error:", error);
            toast.error("فشل في تحديث البيانات");
        } finally {
            setIsSubmitting(false);
        }
        return false;
    }, [formData, validateForm, studentId]);

    // تسديد المصروفات - معطل
    const payBalance = useCallback(
        async (amount: number, notes?: string) => {
            if (!studentId) return false;

            toast.error("خاصية الدفع غير مفعلة حالياً");
            return false;
        },
        [studentId],
    );

    // تحديث الحضور - معطل
    const updateAttendance = useCallback(
        async (rate: number) => {
            if (!studentId) return false;

            toast.error("تحديث الحضور غير مفعل حالياً");
            return false;
        },
        [studentId],
    );

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentData,
        grades,
        handleInputChange,
        submitForm,
        payBalance,
        updateAttendance,
        loadStudentData,
        user,
    };
};
