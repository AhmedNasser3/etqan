import { Student } from "./studentsData";

export const getProgressClass = (progress: number): string => {
    if (progress >= 70) return "teacherStudent__progress-badge green";
    if (progress >= 50) return "teacherStudent__progress-badge orange";
    return "teacherStudent__progress-badge red";
};

export const getStatusText = (status: Student["status"]): string => {
    return status === "active" ? "نشط" : "متوقف";
};
