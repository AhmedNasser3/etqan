// hooks/useTeacherStudents.ts
import { useState, useEffect } from "react";
import axios from "axios";

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: "active" | "paused";
    progress?: number;
}

interface TeacherStudentsResponse {
    teacher_id: number;
    teacher_user_id: number;
    student_details_count: number;
    total_unique_students: number;
    students: Student[];
}

export const useTeacherStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/v1/teacher/unique-students");
            const data: TeacherStudentsResponse = response.data;

            // تحويل البيانات للشكل المطلوب
            const formattedStudents: Student[] = data.students.map(
                (student) => ({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    avatar:
                        student.avatar || "/assets/images/facelessAvatar.png",
                    status: student.status === "active" ? "active" : "paused",
                    progress: Math.floor(Math.random() * 50) + 45, // مؤقت لحد ما نجيب التقدم
                }),
            );

            setStudents(formattedStudents);
            setTotalCount(data.total_unique_students);
        } catch (err) {
            setError("فشل في جلب بيانات الطلاب");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentStatus = async (studentId: number) => {
        try {
            await axios.post(
                `/api/v1/teacher/students/${studentId}/toggle-status`,
            );

            // تحديث الحالة محلياً
            setStudents((prev) =>
                prev.map((student) =>
                    student.id === studentId
                        ? {
                              ...student,
                              status:
                                  student.status === "active"
                                      ? "paused"
                                      : "active",
                          }
                        : student,
                ),
            );
        } catch (err) {
            setError("فشل في تحديث حالة الطالب");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return {
        students,
        totalCount,
        loading,
        error,
        refetch: fetchStudents,
        toggleStudentStatus,
    };
};
