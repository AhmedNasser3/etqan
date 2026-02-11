import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

interface TeacherTestimonial {
    id: number;
    img: string;
    rating: number;
    name: string;
    title: string;
}

interface CenterTeachersData {
    teachers: TeacherTestimonial[];
    loading: boolean;
    error: string | null;
    totalTeachers: number;
}

export const useCenterTeachers = () => {
    const { centerSlug } = useParams<{ centerSlug?: string }>();
    const [data, setData] = useState<CenterTeachersData>({
        teachers: [],
        loading: true,
        error: null,
        totalTeachers: 0,
    });

    const fetchTeachers = useCallback(async (slug: string) => {
        try {
            setData((prev) => ({ ...prev, loading: true, error: null }));

            const response = await fetch(`/api/featured?slug=${slug}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();

            const teachersData = Array.isArray(result.teacher_testimonials)
                ? result.teacher_testimonials
                : [];

            setData({
                teachers: teachersData as TeacherTestimonial[],
                totalTeachers: teachersData.length,
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error("useCenterTeachers error:", error);

            setData({
                teachers: [
                    {
                        id: 1,
                        img: "https://via.placeholder.com/100x100",
                        rating: 4.5,
                        name: "الشيخ محمد البريدي",
                        title: "قارئ القرآن الكريم",
                    },
                    {
                        id: 2,
                        img: "https://via.placeholder.com/100x100",
                        rating: 4.8,
                        name: "د/ أحمد السعدي",
                        title: "أستاذ التجويد",
                    },
                ],
                totalTeachers: 2,
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "فشل في تحميل المعلمين",
            });
        }
    }, []);

    useEffect(() => {
        const slug = centerSlug;
        if (slug) {
            fetchTeachers(slug);
        }
    }, [centerSlug, fetchTeachers]);

    const refetch = useCallback(() => {
        if (centerSlug) {
            fetchTeachers(centerSlug);
        }
    }, [centerSlug, fetchTeachers]);

    return {
        ...data,
        refetch,
        hasTeachers: data.teachers.length > 0,
    };
};
