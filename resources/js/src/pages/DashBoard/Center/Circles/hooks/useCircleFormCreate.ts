import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface CenterType {
    id: number;
    name: string;
}
interface MosqueType {
    id: number;
    name: string;
    center_id: number;
}
interface TeacherType {
    id: number;
    user_id: number;
    name: string;
    role: string;
    center_id: number;
}
interface FormData {
    name: string;
    center_id: string;
    mosque_id: string;
    teacher_id: string;
    notes?: string;
}
interface FormErrors {
    [key: string]: string;
}

// ── helpers ────────────────────────────────────────────────────────────────
function getPortalCenterId(): number | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? Number(id) : null;
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...extra,
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = String(centerId);
    return headers;
}

export const useCircleFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        center_id: "",
        mosque_id: "",
        teacher_id: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<MosqueType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const getCsrfToken = useCallback((): string => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") ?? ""
        );
    }, []);

    // ── يجيب الـ center_id من الـ portal أو من الـ user ──────────────────
    const resolveCenter = useCallback(
        (userData?: any): number | null => {
            const portalId = getPortalCenterId();
            if (portalId) return portalId;
            return userData?.center_id ?? user?.center_id ?? null;
        },
        [user],
    );

    // ── fetch user — لو portal مش محتاجه بس نجيبه للـ fallback ──────────
    const fetchUser = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("/api/user", {
                signal: abortControllerRef.current.signal,
                credentials: "include",
                headers: buildHeaders({ "X-CSRF-TOKEN": getCsrfToken() }),
            });
            if (response.ok) {
                const data = await response.json();
                const actualUser = data.user || data;
                setUser(actualUser);
                return actualUser;
            }
        } catch (error: any) {
            if (error.name !== "AbortError")
                console.error("❌ Failed to fetch user:", error);
        }
        return null;
    }, [getCsrfToken]);

    // ── load كل الداتا بناءً على center_id ───────────────────────────────
    const fetchAllCenterData = useCallback(async (centerId: number) => {
        setLoadingData(true);
        try {
            await Promise.all([
                fetchCenterMosques(centerId),
                fetchCenterTeachers(centerId),
                fetchCenters(centerId),
            ]);
        } finally {
            setLoadingData(false);
        }
    }, []);

    const fetchCenters = useCallback(
        async (centerId: number) => {
            try {
                const response = await fetch("/api/v1/centers", {
                    credentials: "include",
                    headers: buildHeaders({ "X-CSRF-TOKEN": getCsrfToken() }),
                });
                if (response.ok) {
                    const data = await response.json();
                    const center = (data.data || []).find(
                        (c: any) => c.id === centerId,
                    );
                    setCentersData(center ? [center] : []);
                }
            } catch (error) {
                console.error("❌ Failed to fetch centers:", error);
            }
        },
        [getCsrfToken],
    );

    const fetchCenterMosques = useCallback(
        async (centerId: number) => {
            try {
                const response = await fetch(
                    `/api/v1/centers/${centerId}/mosques`,
                    {
                        credentials: "include",
                        headers: buildHeaders({
                            "X-CSRF-TOKEN": getCsrfToken(),
                        }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    let mosques = Array.isArray(data.data) ? data.data : [];

                    // ── لو portal: اعرض المسجد المحدد في الرابط بس ──────────────
                    const portalMosqueId = (window as any).__PORTAL_MOSQUE_ID__;
                    if (portalMosqueId) {
                        mosques = mosques.filter(
                            (m: any) => m.id === Number(portalMosqueId),
                        );
                    }

                    setMosquesData(mosques);
                } else {
                    setMosquesData([]);
                }
            } catch {
                setMosquesData([]);
            }
        },
        [getCsrfToken],
    );
    const fetchCenterTeachers = useCallback(
        async (centerId: number) => {
            try {
                const response = await fetch(
                    `/api/v1/centers/${centerId}/teachers`,
                    {
                        credentials: "include",
                        headers: buildHeaders({
                            "X-CSRF-TOKEN": getCsrfToken(),
                        }),
                    },
                );
                if (response.ok) {
                    const data = await response.json();
                    setTeachersData(Array.isArray(data.data) ? data.data : []);
                } else {
                    setTeachersData([]);
                }
            } catch {
                setTeachersData([]);
            }
        },
        [getCsrfToken],
    );

    // ── initial load ──────────────────────────────────────────────────────
    useEffect(() => {
        const portalCenterId = getPortalCenterId();

        if (portalCenterId) {
            // portal mode — مش محتاج نجيب user
            setFormData((prev) => ({
                ...prev,
                center_id: String(portalCenterId),
            }));
            fetchAllCenterData(portalCenterId);
        } else {
            // normal mode — نجيب user الأول
            fetchUser().then((userData) => {
                const centerId = userData?.center_id;
                if (centerId) {
                    setFormData((prev) => ({
                        ...prev,
                        center_id: String(centerId),
                    }));
                    fetchAllCenterData(centerId);
                } else {
                    setLoadingData(false);
                }
            });
        }

        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "اسم الحلقة مطلوب";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.name]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            if (!validateForm()) return;
            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }
            if (isSubmitting) return;

            setIsSubmitting(true);
            try {
                const fd = new FormData();
                fd.append("name", formData.name);
                fd.append("center_id", formData.center_id);
                if (formData.mosque_id)
                    fd.append("mosque_id", formData.mosque_id);
                if (formData.teacher_id)
                    fd.append("teacher_id", formData.teacher_id);
                if (formData.notes?.trim())
                    fd.append("notes", formData.notes.trim());
                await onSubmit(fd);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, isSubmitting, validateForm],
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
    };
};
