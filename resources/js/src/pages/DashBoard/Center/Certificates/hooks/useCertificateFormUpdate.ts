import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface CertificateData {
    id: number;
    user_id: number;
    certificate_image: string;
    created_at: string;
    user: { id: number; name: string; center?: { id: number; name: string } };
    student?: {
        id: number;
        id_number: string;
        grade_level: string;
        circle: string;
        user_id: number;
        user_name?: string;
    } | null;
}

interface FormData {
    student_id?: number;
    certificate_image?: File | null;
}
interface FormErrors {
    student_id?: string;
    certificate_image?: string;
}
interface Student {
    id: number;
    user_id: number;
    id_number: string;
    grade_level: string;
    circle: string;
    user_name: string;
}

export const useCertificateFormUpdate = (certificateId: number) => {
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCertificate, setIsLoadingCertificate] = useState(true);
    const [studentsData, setStudentsData] = useState<Student[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [certificateData, setCertificateData] =
        useState<CertificateData | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );

    const hasFetchedStudents = useRef(false);
    const hasFetchedCertificate = useRef(false);
    const hasFetchedUser = useRef(false);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, files } = e.target as any;
            if (files && files[0])
                setFormData((prev) => ({ ...prev, [name]: files[0] }));
            else setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof FormErrors])
                setErrors((prev) => ({ ...prev, [name]: undefined }));
        },
        [errors],
    );

    const handleStudentChange = useCallback((studentId: number) => {
        setSelectedStudentId(studentId);
        setFormData((prev) => ({ ...prev, student_id: studentId }));
    }, []);

    const fetchUser = useCallback(async () => {
        if (hasFetchedUser.current) return;
        hasFetchedUser.current = true;
        try {
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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            let userData =
                result.user || result.current_user || result.auth?.user;
            if (!userData)
                userData = {
                    id: 1,
                    name: "المستخدم",
                    center: { id: 1, name: "مجمعك" },
                };
            setUser(userData);
        } catch (error) {
            console.error("❌ User fetch error:", error);
        }
    }, []);

    //  جلب الشهادة - الطالب ID=4 → user_id
    const fetchCertificate = useCallback(async () => {
        if (hasFetchedCertificate.current) {
            setIsLoadingCertificate(false);
            return;
        }
        hasFetchedCertificate.current = true;
        try {
            setIsLoadingCertificate(true);
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const response = await fetch(`/api/certificates/${certificateId}`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            console.log(" Certificate FULL data:", result);

            if (result.success && result.certificate) {
                setCertificateData(result.certificate);

                //  الطالب اللي ID بتاعه 4 → user_id مش student_id
                const currentStudentId =
                    result.certificate.student?.user_id ||
                    result.certificate.user_id ||
                    result.certificate.student_id;

                console.log("🔍 Certificate student data:", {
                    student: result.certificate.student,
                    user_id: result.certificate.user_id,
                    selected: currentStudentId,
                });

                if (currentStudentId) {
                    setSelectedStudentId(Number(currentStudentId));
                    console.log(
                        " Current student ID set (user_id):",
                        currentStudentId,
                    );
                }
            }
        } catch (error) {
            console.error("❌ Certificate fetch error:", error);
        } finally {
            setIsLoadingCertificate(false);
        }
    }, [certificateId]);

    const fetchStudentsData = useCallback(async () => {
        if (hasFetchedStudents.current) {
            setLoadingData(false);
            return;
        }
        hasFetchedStudents.current = true;
        try {
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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (result.success) {
                setStudentsData(result.students || []);
                console.log(" Students loaded:", result.students?.length || 0);
            }
        } catch (error) {
            console.error("❌ Students fetch error:", error);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
        fetchCertificate();
        fetchStudentsData();
    }, [certificateId, fetchUser, fetchCertificate, fetchStudentsData]);

    const isFullyLoaded =
        !loadingData && !isLoadingCertificate && !!certificateData;

    console.log("📊 Hook State:", {
        loadingData,
        isLoadingCertificate,
        hasCertificate: !!certificateData,
        selectedStudentId,
        studentsCount: studentsData.length,
        isFullyLoaded,
    });

    return {
        formData,
        errors,
        isSubmitting,
        isLoadingCertificate,
        handleInputChange,
        handleStudentChange,
        studentsData,
        loadingData,
        user,
        certificateData,
        selectedStudentId,
        isFullyLoaded,
        setIsSubmitting,
    };
};
