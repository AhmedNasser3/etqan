// TeacherStudentReports.tsx - واجهة تقارير الطلاب الكاملة للمعلمين
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Search,
    Filter,
    Download,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle,
    Star,
    Award,
    Plus,
    Eye,
    Loader2,
} from "lucide-react";

interface Student {
    student_id: number;
    student_name: string;
    student_email: string;
    student_phone: string;
    student_status: string;
    avatar?: string;
    id_number: string;
    grade_level: string;
    health_status: string;
    reading_level?: string;
    session_time?: string;
    guardian: {
        name: string;
        phone: string;
    };
    circle_name: string;
    progress: {
        completed_days: number;
        total_days: number;
        current_day: number;
        progress_percent: number;
        status: string;
    };
    points: {
        total: number;
        status: string;
    };
}

interface Achievement {
    id: number;
    points: number;
    points_action: "added" | "deducted";
    total_points: number;
    achievements: string[];
    reason: string;
    achievement_type: string;
    created_at_formatted: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
}

const TeacherStudentReports: React.FC = () => {
    // States
    const [students, setStudents] = useState<Student[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null,
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        status: "all",
        progress: "all",
        points: "all",
    });
    const [modal, setModal] = useState<
        "achievement" | "note" | "details" | null
    >(null);
    const [newAchievement, setNewAchievement] = useState({
        user_id: 0,
        points: 0,
        points_action: "added" as "added" | "deducted",
        reason: "",
        achievements: [] as string[],
        achievement_type: "",
    });
    const [newNote, setNewNote] = useState({
        note: "",
        note_type: "general" as
            | "general"
            | "progress"
            | "behavior"
            | "guardian",
    });

    // Load data
    const loadStudents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/teacher/students");
            setStudents(data.data);
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAchievements = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/teacher/achievements");
            setAchievements(data.data);
        } catch (error) {
            console.error("Error loading achievements:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStudents();
        loadAchievements();
    }, [loadStudents, loadAchievements]);

    // Filters
    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.student_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            student.id_number.includes(searchTerm) ||
            student.guardian.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            filters.status === "all" ||
            student.student_status === filters.status;
        const matchesProgress =
            filters.progress === "all" ||
            (filters.progress === "high" &&
                student.progress.progress_percent >= 70) ||
            (filters.progress === "low" &&
                student.progress.progress_percent < 30);
        const matchesPoints =
            filters.points === "all" ||
            (filters.points === "high" && student.points.total >= 50) ||
            (filters.points === "low" && student.points.total < 10);

        return (
            matchesSearch && matchesStatus && matchesProgress && matchesPoints
        );
    });

    // Actions
    const toggleStudentStatus = async (studentId: number) => {
        try {
            await axios.patch(`/api/teacher/students/${studentId}/status`);
            await loadStudents();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const addAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/teacher/achievements", newAchievement);
            setModal(null);
            await loadAchievements();
            await loadStudents();
            setNewAchievement({
                user_id: 0,
                points: 0,
                points_action: "added",
                reason: "",
                achievements: [],
                achievement_type: "",
            });
        } catch (error) {
            console.error("Error adding achievement:", error);
        }
    };

    const deleteAchievement = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإنجاز؟")) return;
        try {
            await axios.delete(`/api/teacher/achievements/${id}`);
            await loadAchievements();
            await loadStudents();
        } catch (error) {
            console.error("Error deleting achievement:", error);
        }
    };

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(
                `/api/teacher/students/${newAchievement.user_id}/note`,
                newNote,
            );
            setModal(null);
            setNewNote({ note: "", note_type: "general" });
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 70) return "bg-green-500";
        if (percent >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            تقارير الطلاب
                        </h1>
                        <p className="text-gray-600">
                            إدارة الطلاب والإنجازات والملاحظات
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModal("achievement")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus size={20} />
                            إضافة إنجاز
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all">
                            <Download size={20} />
                            تصدير PDF
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    إجمالي الطلاب
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {students.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    متوسط التقدم
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                    {Math.round(
                                        students.reduce(
                                            (sum, s) =>
                                                sum +
                                                s.progress.progress_percent,
                                            0,
                                        ) / students.length || 0,
                                    )}
                                    %
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    متوسط النقاط
                                </p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {Math.round(
                                        students.reduce(
                                            (sum, s) => sum + s.points.total,
                                            0,
                                        ) / students.length || 0,
                                    )}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    الإنجازات
                                </p>
                                <p className="text-3xl font-bold text-indigo-600">
                                    {achievements.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Edit3 className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-8 border border-white/50">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-1 max-w-md gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم، الرقم القومي، ولي الأمر..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">الحالة</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                            <select
                                value={filters.progress}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        progress: e.target.value,
                                    })
                                }
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                            >
                                <option value="all">التقدم</option>
                                <option value="high">عالي (70%+)</option>
                                <option value="low">منخفض (30%)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/50">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        الطالب
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        الصف / الحالة الصحية
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        ولي الأمر
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        الحلقة
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        التقدم
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        النقاط
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12"
                                        >
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                                            <p className="mt-2 text-gray-600">
                                                جاري تحميل البيانات...
                                            </p>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            لا توجد بيانات لعرضها
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr
                                            key={student.student_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {student.student_name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            {
                                                                student.student_name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.id_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {student.grade_level}
                                                </div>
                                                <span
                                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.health_status)}`}
                                                >
                                                    {student.health_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {student.guardian.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {student.guardian.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {student.circle_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getProgressColor(student.progress.progress_percent)} transition-all`}
                                                        style={{
                                                            width: `${Math.min(student.progress.progress_percent, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-sm font-medium mt-1">
                                                    {
                                                        student.progress
                                                            .progress_percent
                                                    }
                                                    %
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {
                                                        student.progress
                                                            .completed_days
                                                    }
                                                    /
                                                    {
                                                        student.progress
                                                            .total_days
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-2xl">
                                                    {student.points.total}
                                                </div>
                                                <div className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full w-fit">
                                                    {student.points.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(
                                                                student,
                                                            );
                                                            setModal("details");
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg hover:scale-105 transition-all"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setNewAchievement({
                                                                ...newAchievement,
                                                                user_id:
                                                                    student.student_id,
                                                            });
                                                            setModal(
                                                                "achievement",
                                                            );
                                                        }}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg hover:scale-105 transition-all"
                                                        title="إضافة إنجاز"
                                                    >
                                                        <Star size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            toggleStudentStatus(
                                                                student.student_id,
                                                            )
                                                        }
                                                        className={`p-2 rounded-lg hover:scale-105 transition-all ${
                                                            student.student_status ===
                                                            "active"
                                                                ? "text-red-600 hover:bg-red-50"
                                                                : "text-green-600 hover:bg-green-50"
                                                        }`}
                                                        title={
                                                            student.student_status ===
                                                            "active"
                                                                ? "إلغاء التفعيل"
                                                                : "تفعيل"
                                                        }
                                                    >
                                                        {student.student_status ===
                                                        "active" ? (
                                                            <XCircle
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <CheckCircle
                                                                size={18}
                                                            />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Achievements */}
                <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award size={24} className="text-yellow-500" />
                        آخر الإنجازات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.slice(0, 6).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            achievement.points_action ===
                                            "added"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {achievement.points_action === "added"
                                            ? "+{achievement.points}"
                                            : `-${Math.abs(achievement.points)}`}
                                    </div>
                                    <button
                                        onClick={() =>
                                            deleteAchievement(achievement.id)
                                        }
                                        className="text-gray-400 hover:text-red-500 p-1 -m-1 rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    {achievement.user.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {achievement.reason}
                                </p>
                                <div className="text-xs bg-white px-3 py-1 rounded-lg font-medium">
                                    إجمالي: {achievement.total_points} نقطة
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modal === "achievement" && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold">
                                إضافة إنجاز جديد
                            </h3>
                        </div>
                        <form
                            onSubmit={addAchievement}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الطالب
                                </label>
                                <input
                                    type="number"
                                    value={newAchievement.user_id}
                                    onChange={(e) =>
                                        setNewAchievement({
                                            ...newAchievement,
                                            user_id: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        النقاط
                                    </label>
                                    <input
                                        type="number"
                                        value={newAchievement.points}
                                        onChange={(e) =>
                                            setNewAchievement({
                                                ...newAchievement,
                                                points: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        النوع
                                    </label>
                                    <select
                                        value={newAchievement.points_action}
                                        onChange={(e) =>
                                            setNewAchievement({
                                                ...newAchievement,
                                                points_action: e.target
                                                    .value as
                                                    | "added"
                                                    | "deducted",
                                            })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="added">إضافة</option>
                                        <option value="deducted">خصم</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    السبب
                                </label>
                                <textarea
                                    value={newAchievement.reason}
                                    onChange={(e) =>
                                        setNewAchievement({
                                            ...newAchievement,
                                            reason: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-vertical"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                حفظ الإنجاز
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {modal === "details" && selectedStudent && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h3 className="text-2xl font-bold">
                                تفاصيل الطالب
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-center md:text-left">
                                    <div className="w-24 h-24 mx-auto md:mx-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                                        {selectedStudent.student_name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">
                                        {selectedStudent.student_name}
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div>
                                            الرقم القومي:{" "}
                                            {selectedStudent.id_number}
                                        </div>
                                        <div>
                                            الصف: {selectedStudent.grade_level}
                                        </div>
                                        <div>
                                            الحالة الصحية:{" "}
                                            {selectedStudent.health_status}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-2">
                                            <div
                                                className={`h-full ${getProgressColor(selectedStudent.progress.progress_percent)} transition-all`}
                                                style={{
                                                    width: `${Math.min(selectedStudent.progress.progress_percent, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">
                                                {
                                                    selectedStudent.progress
                                                        .progress_percent
                                                }
                                                %
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {
                                                    selectedStudent.progress
                                                        .completed_days
                                                }
                                                /
                                                {
                                                    selectedStudent.progress
                                                        .total_days
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                                        <div className="font-bold text-3xl text-center mb-2">
                                            {selectedStudent.points.total}
                                        </div>
                                        <div className="text-center text-sm bg-white px-3 py-1 rounded-full mx-auto w-fit font-medium">
                                            {selectedStudent.points.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                <div>
                                    <h5 className="font-semibold mb-3">
                                        ولي الأمر
                                    </h5>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <div className="font-medium">
                                            {selectedStudent.guardian.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {selectedStudent.guardian.phone}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-3">
                                        الحلقة
                                    </h5>
                                    <div className="bg-indigo-50 p-4 rounded-xl">
                                        <div className="font-medium">
                                            {selectedStudent.circle_name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                            <button
                                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                onClick={() => setModal(null)}
                            >
                                إغلاق
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                onClick={() => {
                                    setNewAchievement({
                                        ...newAchievement,
                                        user_id: selectedStudent.student_id,
                                    });
                                    setModal("achievement");
                                }}
                            >
                                إضافة إنجاز
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudentReports;
