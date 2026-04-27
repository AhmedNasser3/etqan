import { useState, useEffect, useCallback } from "react";
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
    name: string;
    role: string;
    center_id?: number;
}
interface CircleData {
    id: number;
    name: string;
    center_id: number;
    mosque_id?: number;
    teacher_id?: number;
    notes?: string;
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

export const useCircleFormUpdate = (circleId: number) => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        center_id: "",
        mosque_id: "",
        teacher_id: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCircle, setIsLoadingCircle] = useState(true);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<MosqueType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [circleData, setCircleData] = useState<CircleData | null>(null);

    const getCsrf = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? "";

    // ── جيب بيانات الحلقة ────────────────────────────────────────────────
    useEffect(() => {
        if (!circleId) return;

        fetch(`/api/v1/centers/circles/${circleId}`, {
            credentials: "include",
            headers: buildHeaders(),
        })
            .then((r) => r.json())
            .then((circle) => {
                setCircleData(circle);
                setFormData({
                    name: circle.name || "",
                    center_id: circle.center_id?.toString() || "",
                    mosque_id: circle.mosque_id?.toString() || "",
                    teacher_id: circle.teacher_id?.toString() || "",
                    notes: circle.notes || "",
                });
            })
            .catch(() => toast.error("فشل في تحميل الحلقة"))
            .finally(() => setIsLoadingCircle(false));
    }, [circleId]);

    // ── جيب الداتا بناءً على center_id ───────────────────────────────────
    useEffect(() => {
        const portalCenterId = getPortalCenterId();
        const centerId =
            portalCenterId || user?.center_id || circleData?.center_id;
        if (!centerId) return;

        setLoadingData(true);

        // اسم المجمع
        fetch("/api/v1/centers", {
            credentials: "include",
            headers: buildHeaders({ "X-CSRF-TOKEN": getCsrf() }),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) return;
                const center = (data.data || []).find(
                    (c: any) => c.id === centerId,
                );
                setCentersData(center ? [center] : []);
            });

        // المساجد
        fetch(`/api/v1/centers/${centerId}/mosques`, {
            credentials: "include",
            headers: buildHeaders(),
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((data) => setMosquesData(data.data || []));

        // المعلمين
        fetch(`/api/v1/centers/${centerId}/teachers`, {
            credentials: "include",
            headers: buildHeaders(),
        })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((data) => setTeachersData(data.data || []))
            .finally(() => setLoadingData(false));
    }, [user?.center_id, circleData?.center_id]);

    // ── جيب الـ user لو مش portal ─────────────────────────────────────────
    useEffect(() => {
        if (getPortalCenterId()) return; // portal mode — مش محتاج
        fetch("/api/user", { credentials: "include", headers: buildHeaders() })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) setUser(data.user || data);
            });
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
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (fd: FormData) => Promise<void>) => {
            if (!validateForm()) return;
            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }
            if (isSubmitting) return;

            setIsSubmitting(true);
            try {
                const fd = new FormData();
                fd.append("_method", "PUT");
                fd.append("name", formData.name);
                fd.append("center_id", formData.center_id);
                if (formData.mosque_id)
                    fd.append("mosque_id", formData.mosque_id);
                if (formData.teacher_id)
                    fd.append("teacher_id", formData.teacher_id);
                if (formData.notes) fd.append("notes", formData.notes);
                await onSubmit(fd);
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
        isLoadingCircle,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
        circleData,
    };
};
