// data.ts
export interface Student {
    id: number;
    name: string;
    sessionDate: string;
    sessionTime: string;
    attendance: "present" | "absent" | "late";
    recitation: "memorized" | "partial" | "failed" | "pending";
    points: number;
    notes: string;
    level: string;
}

export interface UpcomingSession {
    id: number;
    date: string;
    day: string;
    time: string;
    studentsCount: number;
    students: string[];
}

export const studentsData: Student[] = [
    {
        id: 1,
        name: "أحمد محمد",
        sessionDate: "2026/01/08",
        sessionTime: "10:00 - 10:30",
        attendance: "present",
        recitation: "memorized",
        points: 95,
        notes: "ممتاز - حفظ كامل",
        level: "جزء عم",
    },
    {
        id: 2,
        name: "محمد علي",
        sessionDate: "2026/01/08",
        sessionTime: "10:00 - 10:30",
        attendance: "present",
        recitation: "memorized",
        points: 85,
        notes: "جيد جداً",
        level: "جزء تبارك",
    },
    {
        id: 3,
        name: "عبدالله أحمد",
        sessionDate: "2026/01/08",
        sessionTime: "10:00 - 10:30",
        attendance: "present",
        recitation: "memorized",
        points: 70,
        notes: "الحصة الرابعة - مكتملة",
        level: "سورة البقرة",
    },
    {
        id: 4,
        name: "خالد سالم",
        sessionDate: "2026/01/08",
        sessionTime: "11:00 - 11:20",
        attendance: "present",
        recitation: "memorized",
        points: 92,
        notes: "ممتاز جداً",
        level: "جزء عم",
    },
    {
        id: 5,
        name: "يوسف حسن",
        sessionDate: "2026/01/08",
        sessionTime: "11:00 - 11:20",
        attendance: "present",
        recitation: "partial",
        points: 60,
        notes: "تحسن ملحوظ",
        level: "سورة البقرة",
    },
    {
        id: 6,
        name: "عمر محمود",
        sessionDate: "2026/01/08",
        sessionTime: "14:00 - 14:15",
        attendance: "present",
        recitation: "memorized",
        points: 88,
        notes: "حصة فردية ممتازة",
        level: "جزء تبارك",
    },
    {
        id: 7,
        name: "زيد أحمد",
        sessionDate: "2026/01/08",
        sessionTime: "14:00 - 14:15",
        attendance: "present",
        recitation: "pending",
        points: 88,
        notes: "حصة فردية ممتازة",
        level: "جزء تبارك",
    },
];

export const upcomingSessionsData: UpcomingSession[] = [
    {
        id: 1,
        date: "2026/01/12",
        day: "الأحد",
        time: "09:30 - 10:00",
        studentsCount: 4,
        students: ["أحمد محمد", "محمد علي", "عبدالله أحمد", "خالد سالم"],
    },
    {
        id: 2,
        date: "2026/01/12",
        day: "الأحد",
        time: "11:00 - 11:20",
        studentsCount: 2,
        students: ["يوسف حسن", "عمر محمود"],
    },
    {
        id: 3,
        date: "2026/01/13",
        day: "الإثنين",
        time: "10:00 - 10:30",
        studentsCount: 5,
        students: [
            "أحمد محمد",
            "محمد علي",
            "خالد سالم",
            "عمر محمود",
            "زيد أحمد",
        ],
    },
    {
        id: 4,
        date: "2026/01/13",
        day: "الإثنين",
        time: "14:00 - 14:15",
        studentsCount: 1,
        students: ["يوسف حسن"],
    },
    {
        id: 5,
        date: "2026/01/14",
        day: "الثلاثاء",
        time: "09:30 - 10:00",
        studentsCount: 3,
        students: ["عبدالله أحمد", "خالد سالم", "محمد علي"],
    },
];
