// ============================================================
//  itqan-clean.tsx
//  لوحة تحكم إتقان — نسخة نظيفة مرتبة مع كومنتس واضحة
//  استخدام: استورد المكوّن الافتراضي ItqanApp في أي صفحة
//  مثال:    import ItqanApp from "./itqan-clean";
//           ...
//           <ItqanApp />
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// 1. TYPES — تعريف أنواع البيانات
// ============================================================
interface Teacher {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    perf: number;
    students: number;
    lastVisit: string;
    phone: string;
}
interface Student {
    id: number;
    name: string;
    idNum: string;
    circle: string;
    parent: string;
    parentPhone: string;
    att: number;
    fees: number;
    status: string;
    pts: number;
}
interface AttRecord {
    id: number;
    name: string;
    role: string;
    status: string;
    time: string;
    note: string;
}
interface Task {
    id: number;
    title: string;
    assignee: string;
    role: string;
    priority: string;
    due: string;
    done: boolean;
    notes: string;
}
interface Incentive {
    id: number;
    student: string;
    pts: number;
    type: string;
    cat: string;
    reason: string;
    date: string;
}
interface Mosque {
    id: number;
    name: string;
    center: string;
    supervisor: string;
    address: string;
    status: string;
}
interface Circle {
    id: number;
    name: string;
    center: string;
    teacher: string;
    status: string;
    students: number;
}
interface Plan {
    id: number;
    name: string;
    center: string;
    duration: string;
    days: number;
    status: string;
}
interface Schedule {
    id: number;
    circle: string;
    start: string;
    end: string;
    days: string;
    capacity: string;
}
interface SalaryRule {
    id: number;
    role: string;
    base: number;
    days: number;
}
interface CustomSalary {
    id: number;
    teacher: string;
    amount: number;
    role: string;
    status: string;
    note: string;
}
interface Finance {
    id: number;
    name: string;
    role: string;
    base: number;
    workDays: number;
    totalDays: number;
    deduction: number;
    due: number;
    status: string;
}
interface Req {
    id: number;
    student: string;
    phone: string;
    plan: string;
    circle: string;
    time: string;
    date: string;
    status: string;
}
interface Notif {
    ico: string;
    col: string;
    ico_col: string;
    txt: string;
    time: string;
    unread: boolean;
}
interface ChatMsg {
    me: boolean;
    from: string;
    text: string;
    time: string;
}
interface ChatRoom {
    id: string;
    name: string;
    type: string;
    av: string;
    color: string;
    online?: boolean;
    members?: string[];
    msgs: ChatMsg[];
    unread?: number;
}
interface AuditEntry {
    time: string;
    op: string;
    detail: string;
    ip: string;
    status: string;
}
interface ActivityEntry {
    bg: string;
    ic: string;
    txt: string;
    tm: string;
}
interface Pref {
    label: string;
    desc: string;
    on: boolean;
}

// ============================================================
// 2. INITIAL DATA — البيانات الابتدائية (غيّرها حسب احتياجك)
// ============================================================
const INITIAL_DATA = {
    me: {
        name: "أحمد ناصر مصطفي",
        email: "ahmed@itqan.sa",
        phone: "+966501234567",
        role: "مشرف عام",
        bio: "مشرف عام مجمع الجامع",
    },

    teachers: [
        {
            id: 1,
            name: "أحمد ناصر مصطفي",
            email: "ahmed@itqan.sa",
            role: "معلم قرآن",
            status: "نشط",
            perf: 95,
            students: 25,
            lastVisit: "2026-01-22",
            phone: "+966501234567",
        },
        {
            id: 2,
            name: "فاطمة عبدالله الزهراني",
            email: "fatima.zahrani@example.com",
            role: "مشرفة",
            status: "نشط",
            perf: 88,
            students: 22,
            lastVisit: "2026-01-21",
            phone: "+966509876543",
        },
        {
            id: 3,
            name: "عبدالرحمن خالد القحطاني",
            email: "abdulrahman@example.com",
            role: "معلم قرآن",
            status: "يحتاج متابعة",
            perf: 82,
            students: 28,
            lastVisit: "2026-01-20",
            phone: "+966507654321",
        },
        {
            id: 4,
            name: "سارة محمد الغامدي",
            email: "sara.ghamdi@example.com",
            role: "شؤون الطلاب",
            status: "نشط",
            perf: 91,
            students: 0,
            lastVisit: "2026-01-22",
            phone: "+966501112233",
        },
        {
            id: 5,
            name: "محمود علي الشهري",
            email: "mahmoud.shahri@example.com",
            role: "مالي",
            status: "نشط",
            perf: 96,
            students: 0,
            lastVisit: "2026-01-21",
            phone: "+966504443322",
        },
    ] as Teacher[],

    students: [
        {
            id: 1,
            name: "منصور ترك التميمي",
            idNum: "2035205233",
            circle: "حلقة الرحمن لتختيم القرآن",
            parent: "عبدالله التميمي",
            parentPhone: "9662035205235",
            att: 98,
            fees: 150,
            status: "نشط",
            pts: 50,
        },
        {
            id: 2,
            name: "محمد بن سلمان التميمي",
            idNum: "2385732057",
            circle: "حلقة رمضانية",
            parent: "سلمان التميمي",
            parentPhone: "2001063265713",
            att: 98,
            fees: 350,
            status: "نشط",
            pts: 20,
        },
        {
            id: 3,
            name: "Ahmed Nasser",
            idNum: "23872350321",
            circle: "—",
            parent: "Nasser Ali",
            parentPhone: "9662387235032",
            att: 92,
            fees: 100,
            status: "نشط",
            pts: 0,
        },
        {
            id: 4,
            name: "عمر سعد الحربي",
            idNum: "1087654321",
            circle: "حلقة الرحمن لتختيم القرآن",
            parent: "سعد الحربي",
            parentPhone: "966501234567",
            att: 85,
            fees: 200,
            status: "نشط",
            pts: 10,
        },
        {
            id: 5,
            name: "يوسف أحمد البلوي",
            idNum: "1098765432",
            circle: "حلقة رمضانية",
            parent: "أحمد البلوي",
            parentPhone: "966509876543",
            att: 76,
            fees: 150,
            status: "معلق",
            pts: 5,
        },
    ] as Student[],

    attendance: [
        {
            id: 1,
            name: "أحمد ناصر مصطفي",
            role: "معلم قرآن",
            status: "حاضر",
            time: "08:15",
            note: "",
        },
        {
            id: 2,
            name: "فاطمة عبدالله الزهراني",
            role: "مشرفة",
            status: "متأخر",
            time: "09:05",
            note: "ازدحام مروري",
        },
        {
            id: 3,
            name: "سارة محمد الغامدي",
            role: "شؤون الطلاب",
            status: "حاضر",
            time: "08:00",
            note: "",
        },
    ] as AttRecord[],

    tasks: [
        {
            id: 1,
            title: "مراجعة رواتب شهر مارس",
            assignee: "محمود الشهري",
            role: "مالي",
            priority: "عالية",
            due: "2026-03-25",
            done: false,
            notes: "مراجعة الخصومات والإضافات",
        },
        {
            id: 2,
            title: "إعداد تقرير حضور الأسبوع",
            assignee: "سارة الغامدي",
            role: "شؤون الطلاب",
            priority: "متوسطة",
            due: "2026-03-23",
            done: false,
            notes: "",
        },
        {
            id: 3,
            title: "تقييم أداء المعلمين للربع الأول",
            assignee: "أحمد ناصر",
            role: "مشرف",
            priority: "عالية",
            due: "2026-03-30",
            done: false,
            notes: "يشمل الأداء والحضور والتحضير",
        },
        {
            id: 4,
            title: "تحديث خطة تختيم القرآن",
            assignee: "فاطمة الزهراني",
            role: "معلم",
            priority: "منخفضة",
            due: "2026-04-01",
            done: true,
            notes: "",
        },
        {
            id: 5,
            title: "إضافة طلاب الدفعة الجديدة",
            assignee: "سارة الغامدي",
            role: "شؤون الطلاب",
            priority: "متوسطة",
            due: "2026-03-28",
            done: false,
            notes: "",
        },
        {
            id: 6,
            title: "تدقيق السجل المالي لشهر فبراير",
            assignee: "محمود الشهري",
            role: "مالي",
            priority: "عالية",
            due: "2026-03-22",
            done: true,
            notes: "",
        },
    ] as Task[],

    circles: [
        {
            id: 1,
            name: "حلقة الرحمن لتختيم القرآن",
            center: "مجمع الجامع",
            teacher: "أحمد ناصر مصطفي",
            status: "نشطة",
            students: 25,
        },
        {
            id: 2,
            name: "حلقة رمضانية",
            center: "مجمع الجامع",
            teacher: "عبدالرحمن القحطاني",
            status: "نشطة",
            students: 18,
        },
    ] as Circle[],

    plans: [
        {
            id: 1,
            name: "خطة حفظ 4 أحزاء (1 شهر)",
            center: "مجمع الجامع",
            duration: "1 شهر",
            days: 30,
            status: "نشطة",
        },
        {
            id: 2,
            name: "خطة تختيم القرآن (2 شهر)",
            center: "مجمع الجامع",
            duration: "2 شهر",
            days: 60,
            status: "نشطة",
        },
    ] as Plan[],

    incentives: [
        {
            id: 1,
            student: "منصور ترك التميمي",
            pts: 50,
            type: "إضافة",
            cat: "عام",
            reason: "طالب رائع ومثابر",
            date: "2026-03-10",
        },
        {
            id: 2,
            student: "محمد بن سلمان التميمي",
            pts: 20,
            type: "إضافة",
            cat: "حضور",
            reason: "انتظام مثالي في الحضور",
            date: "2026-03-05",
        },
        {
            id: 3,
            student: "عمر سعد الحربي",
            pts: 10,
            type: "إضافة",
            cat: "حفظ",
            reason: "إتقان حفظ الجزء الأول",
            date: "2026-02-28",
        },
    ] as Incentive[],

    mosques: [
        {
            id: 1,
            name: "مسجد الجامع الكبير",
            center: "مجمع الجامع",
            supervisor: "أحمد ناصر مصطفي",
            address: "حي الروضة",
            status: "في الانتظار",
        },
    ] as Mosque[],

    schedules: [
        {
            id: 1,
            circle: "حلقة الرحمن لتختيم القرآن",
            start: "14:30",
            end: "15:30",
            days: "يومي",
            capacity: "غير محدود",
        },
        {
            id: 2,
            circle: "حلقة رمضانية",
            start: "15:30",
            end: "17:00",
            days: "إثنين/خميس",
            capacity: "غير محدود",
        },
    ] as Schedule[],

    salaryRules: [
        { id: 1, role: "مدرس", base: 4500, days: 26 },
        { id: 2, role: "مشرف", base: 5000, days: 28 },
        { id: 3, role: "محفز", base: 2000, days: 22 },
        { id: 4, role: "شؤون الطلاب", base: 4200, days: 31 },
        { id: 5, role: "مالي", base: 3300, days: 26 },
    ] as SalaryRule[],

    customSalaries: [
        {
            id: 1,
            teacher: "أحمد ناصر مصطفي",
            amount: 5600,
            role: "معلم",
            status: "نشط",
            note: "راتب خاص",
        },
        {
            id: 2,
            teacher: "فاطمة عبدالله الزهراني",
            amount: 4800,
            role: "مشرفة",
            status: "نشط",
            note: "",
        },
    ] as CustomSalary[],

    finance: [
        {
            id: 1,
            name: "أحمد ناصر مصطفي",
            role: "معلم",
            base: 5600,
            workDays: 22,
            totalDays: 26,
            deduction: 200,
            due: 5400,
            status: "مدفوع",
        },
        {
            id: 2,
            name: "فاطمة الزهراني",
            role: "مشرفة",
            base: 4800,
            workDays: 24,
            totalDays: 28,
            deduction: 0,
            due: 4800,
            status: "مدفوع",
        },
        {
            id: 3,
            name: "سارة الغامدي",
            role: "شؤون الطلاب",
            base: 4200,
            workDays: 20,
            totalDays: 31,
            deduction: 300,
            due: 3900,
            status: "معلق",
        },
        {
            id: 4,
            name: "محمود الشهري",
            role: "مالي",
            base: 3300,
            workDays: 25,
            totalDays: 26,
            deduction: 0,
            due: 3300,
            status: "مدفوع",
        },
    ] as Finance[],

    reqs: [
        {
            id: 1,
            student: "منصور ترك التميمي",
            phone: "9662035205235",
            plan: "خطة حفظ 4 أحزاء (1 شهر)",
            circle: "حلقة الرحمن",
            time: "3:30م - 4:30م",
            date: "2026-03-14",
            status: "pending",
        },
        {
            id: 2,
            student: "منصور ترك التميمي",
            phone: "9662035205235",
            plan: "خطة تختيم القرآن (2 شهر)",
            circle: "حلقة الرحمن",
            time: "2:30م - 3:30م",
            date: "2026-03-02",
            status: "pending",
        },
    ] as Req[],

    audit: [
        {
            time: "14/3/2026 1:06م",
            op: "تعديل مسجد",
            detail: "مسجد (ID:1) — حذف",
            ip: "127.0.0.1",
            status: "success",
        },
        {
            time: "14/3/2026 12:50م",
            op: "إنشاء مسجد",
            detail: "مسجد (ID:1) — إنشاء",
            ip: "127.0.0.1",
            status: "success",
        },
        {
            time: "10/3/2026 4:36ص",
            op: "إنشاء مستخدم",
            detail: "مستخدم (ID:24)",
            ip: "127.0.0.1",
            status: "success",
        },
        {
            time: "10/3/2026 4:36ص",
            op: "إنشاء طالب",
            detail: "طالب (ID:6)",
            ip: "127.0.0.1",
            status: "success",
        },
        {
            time: "1/3/2026 2:58م",
            op: "إنشاء مستخدم",
            detail: "مستخدم (ID:20)",
            ip: "127.0.0.1",
            status: "success",
        },
        {
            time: "1/3/2026 2:28م",
            op: "إنشاء طالب",
            detail: "طالب (ID:4)",
            ip: "127.0.0.1",
            status: "success",
        },
    ] as AuditEntry[],

    notifs: [
        {
            ico: "user",
            col: "#dcfce7",
            ico_col: "var(--g600)",
            txt: "<strong>طلب انضمام جديد</strong><br>منصور التميمي — خطة 4 أحزاء",
            time: "منذ 14 دقيقة",
            unread: true,
        },
        {
            ico: "clip",
            col: "#dbeafe",
            ico_col: "#2563eb",
            txt: "<strong>طلب انضمام ثانٍ</strong><br>منصور التميمي — خطة تختيم القرآن",
            time: "منذ ساعة",
            unread: true,
        },
        {
            ico: "star",
            col: "#fef3c7",
            ico_col: "#d97706",
            txt: "<strong>إنجاز طالب</strong><br>منصور التميمي — 50 نقطة",
            time: "10 مارس",
            unread: false,
        },
        {
            ico: "money",
            col: "#d1fae5",
            ico_col: "#15724e",
            txt: "<strong>رواتب مدفوعة</strong><br>أحمد ناصر — 5,400 ر.س",
            time: "1 مارس",
            unread: false,
        },
        {
            ico: "warn",
            col: "#fee2e2",
            ico_col: "#ef4444",
            txt: "<strong>تحذير: مسجد محذوف</strong>",
            time: "14 مارس",
            unread: false,
        },
    ] as Notif[],

    chatRooms: [
        {
            id: "r-gen",
            name: "عام",
            type: "group",
            av: "ع",
            color: "#1e8f61",
            online: true,
            members: ["أنا", "أحمد", "فاطمة", "عبدالرحمن", "سارة", "محمود"],
            unread: 0,
            msgs: [
                {
                    me: false,
                    from: "فاطمة",
                    text: "السلام عليكم، الطلاب جاهزون",
                    time: "08:15",
                },
                {
                    me: true,
                    from: "أنت",
                    text: "وعليكم السلام، سأكون هناك بعد 10 دقائق",
                    time: "08:17",
                },
                {
                    me: false,
                    from: "عبدالرحمن",
                    text: "بارك الله فيكم جميعاً",
                    time: "08:18",
                },
            ],
        },
        {
            id: "r-fin",
            name: "المالية",
            type: "group",
            av: "م",
            color: "#6366f1",
            online: true,
            members: ["أنا", "محمود", "أحمد"],
            unread: 1,
            msgs: [
                {
                    me: false,
                    from: "محمود",
                    text: "تم إعداد تقرير الرواتب",
                    time: "09:00",
                },
            ],
        },
        {
            id: "dm-1",
            name: "فاطمة الزهراني",
            type: "dm",
            av: "فا",
            color: "#ec4899",
            online: true,
            unread: 0,
            msgs: [
                {
                    me: false,
                    from: "فاطمة",
                    text: "هل يمكنني إضافة طالب جديد؟",
                    time: "07:45",
                },
                {
                    me: true,
                    from: "أنت",
                    text: "نعم، يمكنك ذلك من قسم شؤون الطلاب",
                    time: "07:47",
                },
            ],
        },
    ] as ChatRoom[],

    actLog: [
        {
            bg: "#d1fae5",
            ic: "#15724e",
            txt: "<strong>طالب جديد</strong> — منصور التميمي",
            tm: "منذ ساعة",
        },
        {
            bg: "#dbeafe",
            ic: "#2563eb",
            txt: "<strong>حلقة جديدة</strong> — حلقة النور",
            tm: "منذ يومين",
        },
        {
            bg: "#fef3c7",
            ic: "#d97706",
            txt: "<strong>مهمة مكتملة</strong> — تحديث الخطة",
            tm: "منذ 3 أيام",
        },
    ] as ActivityEntry[],

    prefs: [
        {
            label: "إشعارات الحضور",
            desc: "تنبيه عند تسجيل حضور جديد",
            on: true,
        },
        {
            label: "إشعارات الطلبات",
            desc: "تنبيه عند وصول طلب انضمام",
            on: true,
        },
        {
            label: "تقارير أسبوعية",
            desc: "ملخص أسبوعي بالبريد الإلكتروني",
            on: false,
        },
        {
            label: "الوضع الداكن",
            desc: "تفعيل السمة الداكنة (قريباً)",
            on: false,
        },
    ] as Pref[],

    attRunning: false,
    attStart: 0,
};

// ============================================================
// 3. HELPERS — دوال مساعدة
// ============================================================
const COLORS = [
    "#1e8f61,#0f5439",
    "#c9996a,#a8733f",
    "#6366f1,#4338ca",
    "#8b5cf6,#6d28d9",
    "#f59e0b,#d97706",
    "#059669,#047857",
    "#ec4899,#be185d",
    "#0ea5e9,#0369a1",
];
// gc: يعيد لون gradient حسب الرقم
const gc = (i: number) => COLORS[i % COLORS.length];
// uid: يولّد رقم عشوائي كـ ID مؤقت
const uid = () => Math.floor(Math.random() * 90000) + 10000;
// nowStr: التاريخ والوقت الحالي كنص
function nowStr() {
    const n = new Date();
    return `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}
// nowTimeStr: الوقت الحالي فقط
function nowTimeStr() {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}
// fmtSec: تحويل ثوانٍ إلى HH:MM:SS
function fmtSec(s: number) {
    const h = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60),
        sec = s % 60;
    return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}
// gv: قراءة قيمة حقل input/select/textarea من DOM
function gv(id: string, fallback = ""): string {
    const el = document.getElementById(id) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;
    return el ? el.value.trim() : fallback;
}

// ============================================================
// 4. SMALL REUSABLE COMPONENTS — مكونات صغيرة معاد استخدامها
// ============================================================

// Av: صورة رمزية من الأحرف الأولى للاسم
function Av({
    name,
    size = 28,
    idx = 0,
}: {
    name: string;
    size?: number;
    idx?: number;
}) {
    const letters =
        name
            .trim()
            .split(" ")
            .map((w) => w[0] || "")
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?";
    const grad = gc(idx);
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${grad})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: Math.round(size * 0.38),
                flexShrink: 0,
            }}
        >
            {letters}
        </div>
    );
}

// Badge: شارة ملونة للحالة أو التصنيف
function Badge({ txt, cls }: { txt: string; cls: string }) {
    const map: Record<string, React.CSSProperties> = {
        "bg-g": { background: "var(--g100)", color: "var(--g700)" },
        "bg-r": { background: "#fee2e2", color: "#ef4444" },
        "bg-a": { background: "#fef3c7", color: "#92400e" },
        "bg-b": { background: "#dbeafe", color: "#1d4ed8" },
        "bg-n": { background: "var(--n100)", color: "var(--n500)" },
        "bg-p": { background: "#ede9fe", color: "#6d28d9" },
        "bg-br": { background: "#f5e8d5", color: "#a8733f" },
    };
    return (
        <span className="badge" style={map[cls] || {}}>
            {txt}
        </span>
    );
}

// BadgeStatus: شارة تلقائية حسب نص الحالة
function BadgeStatus({ s }: { s: string }) {
    if (s === "نشط" || s === "نشطة" || s === "مدفوع" || s === "حاضر")
        return <Badge txt={s} cls="bg-g" />;
    if (s === "معلق" || s === "متأخر") return <Badge txt={s} cls="bg-a" />;
    if (s === "غائب" || s === "يحتاج متابعة")
        return <Badge txt={s} cls="bg-r" />;
    return <Badge txt={s} cls="bg-n" />;
}

// ProgBar: شريط تقدم مئوي
function ProgBar({ pct }: { pct: number }) {
    return (
        <div className="prog-wrap">
            <div className="prog-bg">
                <div className="prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <span
                style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--n600)",
                    minWidth: 28,
                }}
            >
                {pct}%
            </span>
        </div>
    );
}

// TaskItemComp: عنصر مهمة واحدة (يُستخدم في صفحة المهام وفي الـ overview)
function TaskItemComp({
    t,
    mini = false,
    onToggle,
    onEdit,
    onDel,
}: {
    t: Task;
    mini?: boolean;
    onToggle?: (id: number) => void;
    onEdit?: () => void;
    onDel?: () => void;
}) {
    const prCls =
        t.priority === "عالية"
            ? "pr-h"
            : t.priority === "متوسطة"
              ? "pr-m"
              : "pr-l";
    const isOver = !t.done && new Date(t.due) < new Date();
    return (
        <div className={`task-item${t.done ? " done" : ""}`}>
            {/* زر التحديد */}
            <div
                className={`task-cb${t.done ? " on" : ""}`}
                onClick={() => onToggle?.(t.id)}
            >
                {t.done && (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        width={9}
                        height={9}
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
            {/* تفاصيل المهمة */}
            <div style={{ flex: 1 }}>
                <div className="task-t">{t.title}</div>
                <div className="task-meta">
                    <span>{t.assignee}</span>
                    <span
                        style={
                            isOver
                                ? { color: "var(--red)", fontWeight: 700 }
                                : {}
                        }
                    >
                        الموعد: {t.due}
                        {isOver ? " (متأخرة)" : ""}
                    </span>
                    <span className={`pr ${prCls}`}>{t.priority}</span>
                </div>
            </div>
            {/* أزرار الإجراءات — تختفي في الوضع المصغّر */}
            {!mini && (
                <div className="td-actions">
                    {onEdit && (
                        <button className="btn bs bxs" onClick={onEdit}>
                            تعديل
                        </button>
                    )}
                    {onDel && (
                        <button className="btn bd bxs" onClick={onDel}>
                            حذف
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// مساعدات نموذج المودال (FG=حقل, FI=input, FSel=select, FTA=textarea, FR2=صفَّين)
function FG({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 13 }}>
            <label
                style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--n700)",
                    marginBottom: 4,
                }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}
function FI({
    id,
    type = "text",
    placeholder = "",
    defaultValue = "",
    onChange,
}: {
    id: string;
    type?: string;
    placeholder?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
}) {
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="fi2"
            onChange={(e) => onChange?.(e.target.value)}
        />
    );
}
function FSel({
    id,
    opts,
    defaultValue = "",
}: {
    id: string;
    opts: string[];
    defaultValue?: string;
}) {
    return (
        <select id={id} className="fi2" defaultValue={defaultValue}>
            {opts.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    );
}
function FTA({
    id,
    placeholder = "",
    defaultValue = "",
}: {
    id: string;
    placeholder?: string;
    defaultValue?: string;
}) {
    return (
        <textarea
            id={id}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="fi2 ta"
            style={{ resize: "vertical", minHeight: 75 }}
        />
    );
}
function FR2({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}
        >
            {children}
        </div>
    );
}

// ============================================================
// 5. SVG ICONS — الأيقونات
// ============================================================
const ICO: Record<string, JSX.Element> = {
    grid: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    check: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    clip: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
    ),
    globe: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10z" />
        </svg>
    ),
    users: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    book: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    money: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    student: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
        </svg>
    ),
    star: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    mosque: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    log: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
    ),
    person: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    cal: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    rules: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    custom: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
    ),
    clipboard: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" />
        </svg>
    ),
    search: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    bell: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    chat: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    x: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    send: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon
                points="22 2 15 22 11 13 2 9 22 2"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    ),
    trash: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    ),
    info: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    menu: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
};

// ============================================================
// 6. NAVIGATION CONFIG — قائمة التنقل الجانبية
// ============================================================
const NAV_ITEMS = [
    {
        sec: "الرئيسية",
        items: [
            { id: "overview", lbl: "لوحة التحكم", ico: "grid", badge: null },
            { id: "attendance", lbl: "سجل الحضور", ico: "check", badge: null },
            {
                id: "tasks",
                lbl: "المهام",
                ico: "clip",
                badge: { n: 4, cls: "red" },
            },
        ],
    },
    {
        sec: "الأكاديمية",
        items: [
            { id: "circles", lbl: "إدارة الحلقات", ico: "globe", badge: null },
            { id: "plans", lbl: "إدارة الخطط", ico: "book", badge: null },
            {
                id: "student-requests",
                lbl: "طلبات الطلاب",
                ico: "clipboard",
                badge: { n: 2, cls: "red" },
            },
            { id: "schedules", lbl: "مواعيد الحلقات", ico: "cal", badge: null },
        ],
    },
    {
        sec: "الموظفون",
        items: [
            {
                id: "teachers",
                lbl: "المعلمون والموظفون",
                ico: "users",
                badge: null,
            },
            {
                id: "educational",
                lbl: "متابعة الأداء",
                ico: "star",
                badge: null,
            },
            { id: "finance", lbl: "اللوحة المالية", ico: "money", badge: null },
            {
                id: "salary-rules",
                lbl: "قواعد الرواتب",
                ico: "rules",
                badge: null,
            },
            {
                id: "custom-salary",
                lbl: "الرواتب المخصصة",
                ico: "custom",
                badge: null,
            },
        ],
    },
    {
        sec: "إدارة الطلاب",
        items: [
            {
                id: "students",
                lbl: "شؤون الطلاب",
                ico: "student",
                badge: { n: 5, cls: "grn" },
            },
            { id: "incentives", lbl: "التحفيزات", ico: "star", badge: null },
            { id: "mosques", lbl: "إدارة المساجد", ico: "mosque", badge: null },
            {
                id: "audit",
                lbl: "سجل الإجراءات",
                ico: "log",
                badge: { n: 6, cls: "grn" },
            },
        ],
    },
    {
        sec: "الحساب",
        items: [
            {
                id: "account",
                lbl: "إعدادات الحساب",
                ico: "person",
                badge: null,
            },
        ],
    },
];

// عنوان كل صفحة يظهر في الـ topbar
const PAGE_TITLES: Record<string, string> = {
    overview: "لوحة التحكم",
    attendance: "سجل الحضور",
    tasks: "المهام",
    circles: "إدارة الحلقات",
    plans: "إدارة الخطط",
    "student-requests": "طلبات الطلاب",
    schedules: "مواعيد الحلقات",
    teachers: "المعلمون والموظفون",
    educational: "متابعة الأداء",
    finance: "اللوحة المالية",
    "salary-rules": "قواعد الرواتب",
    "custom-salary": "الرواتب المخصصة",
    students: "شؤون الطلاب",
    incentives: "التحفيزات",
    mosques: "إدارة المساجد",
    audit: "سجل الإجراءات",
    account: "إعدادات الحساب",
};

// ============================================================
// 7. TOAST COUNTER — عداد الـ toast (خارج المكوّن عشان لا يُعاد تعيينه)
// ============================================================
interface ToastItem {
    id: number;
    msg: string;
    type: string;
}
let toastCount = 0;

// ============================================================
// 8. MAIN APP COMPONENT — المكوّن الرئيسي
// ============================================================
export default function ItqanApp() {
    // ─── STATE ───────────────────────────────────────────────
    const [data, setData] = useState(() =>
        JSON.parse(JSON.stringify(INITIAL_DATA)),
    );
    const [page, setPage] = useState("overview");
    const [sidebarMini, setSidebarMini] = useState(false);
    const [mobileSB, setMobileSB] = useState(false);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [chatMsg, setChatMsg] = useState("");
    const [roomsVisible, setRoomsVisible] = useState(true);
    const [roomSearch, setRoomSearch] = useState("");
    const [clock, setClock] = useState({ t: "", d: "" });
    const [attTimer, setAttTimer] = useState("00:00:00");
    const [attRunning, setAttRunning] = useState(false);
    const [attStart, setAttStart] = useState(0);
    const [modal, setModal] = useState<{ type: string; param?: number } | null>(
        null,
    );
    const [confirm, setConfirm] = useState<{
        title: string;
        desc: string;
        cb: () => void;
    } | null>(null);
    const [reqTab, setReqTab] = useState("pending");
    const [teacherFilter, setTeacherFilter] = useState("active");
    const [searchQ, setSearchQ] = useState("");
    const [tableFilter, setTableFilter] = useState<Record<string, string>>({});
    const msgsRef = useRef<HTMLDivElement>(null);

    // ─── mut: دالة تعديل الـ state بطريقة آمنة (deep copy) ──
    const mut = useCallback((fn: (d: typeof data) => void) => {
        setData((prev: typeof data) => {
            const next = JSON.parse(JSON.stringify(prev));
            fn(next);
            return next;
        });
    }, []);

    // ─── TOAST ───────────────────────────────────────────────
    const toast = useCallback((msg: string, type = "inf") => {
        const id = ++toastCount;
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(
            () => setToasts((prev) => prev.filter((t) => t.id !== id)),
            3400,
        );
    }, []);

    // ─── AUDIT LOG ───────────────────────────────────────────
    const addAudit = useCallback(
        (op: string, detail: string) => {
            mut((d) =>
                d.audit.unshift({
                    time: nowStr(),
                    op,
                    detail,
                    ip: "127.0.0.1",
                    status: "success",
                }),
            );
        },
        [mut],
    );

    // ─── CLOCK: يُحدّث الساعة كل ثانية ──────────────────────
    useEffect(() => {
        const DAYS = [
            "الأحد",
            "الاثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
        ];
        const MONTHS = [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
        ];
        const tick = () => {
            const n = new Date();
            const t = [n.getHours(), n.getMinutes(), n.getSeconds()]
                .map((v) => String(v).padStart(2, "0"))
                .join(":");
            setClock({
                t,
                d: `${DAYS[n.getDay()]} ${n.getDate()} ${MONTHS[n.getMonth()]}`,
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // ─── ATTENDANCE TIMER ────────────────────────────────────
    useEffect(() => {
        if (!attRunning) {
            setAttTimer("00:00:00");
            return;
        }
        const id = setInterval(
            () =>
                setAttTimer(fmtSec(Math.floor((Date.now() - attStart) / 1000))),
            1000,
        );
        return () => clearInterval(id);
    }, [attRunning, attStart]);

    // ─── AUTO SCROLL للرسائل ─────────────────────────────────
    useEffect(() => {
        if (msgsRef.current)
            msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }, [activeRoom, data.chatRooms]);

    // ─── KEYBOARD SHORTCUTS ──────────────────────────────────
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.altKey && e.key === "k") {
                e.preventDefault();
                (
                    document.getElementById("gSearch") as HTMLInputElement
                )?.focus();
            }
            if (e.altKey && e.key === "h") setPage("overview");
            if (e.altKey && e.key === "s") setPage("students");
            if (e.altKey && e.key === "t") setPage("tasks");
            if (e.key === "Escape") {
                setModal(null);
                setConfirm(null);
                setChatOpen(false);
                setNotifOpen(false);
            }
        };
        document.addEventListener("keydown", h);
        return () => document.removeEventListener("keydown", h);
    }, []);

    // nav: التنقل بين الصفحات
    const nav = (id: string) => {
        setPage(id);
        setMobileSB(false);
    };

    // ─── ATTENDANCE ACTIONS ──────────────────────────────────
    const toggleAtt = () => {
        if (!attRunning) {
            const s = Date.now();
            setAttStart(s);
            setAttRunning(true);
            toast("تم بدء جلسة الحضور", "ok");
            addAudit("بدء جلسة الحضور", "");
        } else {
            setAttRunning(false);
            toast("تم إيقاف جلسة الحضور", "inf");
            addAudit("إيقاف جلسة الحضور", "");
        }
    };

    // ─── CHAT ACTIONS ────────────────────────────────────────
    const loadRoom = (id: string) => {
        setActiveRoom(id);
        mut((d) => {
            const r = d.chatRooms.find((x: ChatRoom) => x.id === id);
            if (r) r.unread = 0;
        });
    };
    const sendMsg = () => {
        if (!chatMsg.trim() || !activeRoom) return;
        const txt = chatMsg.trim();
        mut((d) => {
            const r = d.chatRooms.find((x: ChatRoom) => x.id === activeRoom);
            if (r)
                r.msgs.push({
                    me: true,
                    from: "أنت",
                    text: txt,
                    time: nowTimeStr(),
                });
        });
        setChatMsg("");
        // رد تلقائي وهمي بعد لحظة
        setTimeout(
            () => {
                const replies = [
                    "جزاك الله خيراً ✨",
                    "تم الإحاطة",
                    "سيتم التنفيذ إن شاء الله",
                    "شكراً للمتابعة 🙏",
                ];
                const names = data.teachers.map(
                    (t: Teacher) => t.name.split(" ")[0],
                );
                mut((d) => {
                    const r = d.chatRooms.find(
                        (x: ChatRoom) => x.id === activeRoom,
                    );
                    if (r)
                        r.msgs.push({
                            me: false,
                            from: names[
                                Math.floor(Math.random() * names.length)
                            ],
                            text: replies[
                                Math.floor(Math.random() * replies.length)
                            ],
                            time: nowTimeStr(),
                        });
                });
            },
            900 + Math.random() * 1100,
        );
    };

    // عدادات الإشعارات غير المقروءة
    const unreadCount = data.notifs.filter((n: Notif) => n.unread).length;
    const chatUnread = data.chatRooms.reduce(
        (a: number, r: ChatRoom) => a + (r.unread || 0),
        0,
    );

    // ─── CRUD: إضافة ────────────────────────────────────────
    const addStudentFn = () => {
        const name = gv("nsName");
        if (!name) {
            toast("اسم الطالب مطلوب", "err");
            return;
        }
        mut((d) =>
            d.students.push({
                id: uid(),
                name,
                idNum: gv("nsId"),
                circle: gv("nsCircle") || "—",
                parent: gv("nsParent"),
                parentPhone: gv("nsPhone"),
                att: 100,
                fees: parseInt(gv("nsFees")) || 0,
                status: "نشط",
                pts: 0,
            }),
        );
        addAudit("إضافة طالب", name);
        setModal(null);
        nav("students");
        toast("تم إضافة الطالب: " + name, "ok");
    };
    const addCircleFn = () => {
        const name = gv("ecName");
        if (!name) {
            toast("اسم الحلقة مطلوب", "err");
            return;
        }
        mut((d) =>
            d.circles.push({
                id: uid(),
                name,
                center: gv("ecCenter") || "مجمع الجامع",
                teacher: gv("ecTeacher") || "—",
                status: "نشطة",
                students: 0,
            }),
        );
        addAudit("إضافة حلقة", name);
        setModal(null);
        nav("circles");
        toast("تم إنشاء الحلقة", "ok");
    };
    const addPlanFn = () => {
        const name = gv("pName");
        if (!name) {
            toast("اسم الخطة مطلوب", "err");
            return;
        }
        mut((d) =>
            d.plans.push({
                id: uid(),
                name,
                center: gv("pCenter") || "مجمع الجامع",
                duration: gv("pDur") || "1 شهر",
                days: 30,
                status: "نشطة",
            }),
        );
        addAudit("إضافة خطة", name);
        setModal(null);
        nav("plans");
        toast("تم إنشاء الخطة", "ok");
    };
    const addTeacherFn = () => {
        const name = gv("etName");
        if (!name) {
            toast("الاسم مطلوب", "err");
            return;
        }
        mut((d) =>
            d.teachers.push({
                id: uid(),
                name,
                email: gv("etEmail"),
                role: gv("etRole") || "معلم قرآن",
                status: "نشط",
                perf: 90,
                students: 0,
                lastVisit: new Date().toISOString().split("T")[0],
                phone: gv("etPhone"),
            }),
        );
        addAudit("إضافة موظف", name);
        setModal(null);
        nav("teachers");
        toast("تم إضافة الموظف", "ok");
    };
    const addTaskFn = () => {
        const title = gv("tTitle");
        if (!title) {
            toast("عنوان المهمة مطلوب", "err");
            return;
        }
        mut((d) =>
            d.tasks.unshift({
                id: uid(),
                title,
                assignee: gv("tAssignee") || "—",
                role: gv("tRole") || "مشرف",
                priority: gv("tPriority") || "متوسطة",
                due: gv("tDue") || new Date().toISOString().split("T")[0],
                done: false,
                notes: gv("tNotes"),
            }),
        );
        addAudit("إضافة مهمة", title);
        setModal(null);
        nav("tasks");
        toast("تم إضافة المهمة", "ok");
    };
    const recordAttFn = () => {
        const name = gv("atEmp");
        mut((d) =>
            d.attendance.push({
                id: uid(),
                name,
                role:
                    d.teachers.find((t: Teacher) => t.name === name)?.role ||
                    "موظف",
                status: gv("atSt") || "حاضر",
                time: gv("atTime") || nowTimeStr(),
                note: gv("atNote"),
            }),
        );
        addAudit("تسجيل حضور", name + " (" + gv("atSt") + ")");
        setModal(null);
        nav("attendance");
        toast("تم تسجيل الحضور", "ok");
    };
    const addScheduleFn = () => {
        mut((d) =>
            d.schedules.push({
                id: uid(),
                circle: gv("scCircle"),
                start: gv("scStart"),
                end: gv("scEnd"),
                days: gv("scDays") || "يومي",
                capacity: gv("scCap") || "غير محدود",
            }),
        );
        setModal(null);
        nav("schedules");
        toast("تم إضافة الموعد", "ok");
    };
    const addIncentiveFn = () => {
        const student = gv("incStudent"),
            pts = parseInt(gv("incPts")) || 0;
        mut((d) => {
            d.incentives.push({
                id: uid(),
                student,
                pts,
                type: gv("incType") || "إضافة",
                cat: gv("incCat") || "عام",
                reason: gv("incReason"),
                date: new Date().toISOString().split("T")[0],
            });
            const st = d.students.find((s: Student) => s.name === student);
            if (st) st.pts += pts;
        });
        addAudit("إضافة إنجاز", student);
        setModal(null);
        nav("incentives");
        toast("تم إضافة الإنجاز", "ok");
    };
    const addMosqueFn = () => {
        const name = gv("mqName");
        if (!name) {
            toast("اسم المسجد مطلوب", "err");
            return;
        }
        mut((d) =>
            d.mosques.push({
                id: uid(),
                name,
                center: gv("mqCenter") || "مجمع الجامع",
                supervisor: gv("mqSup"),
                address: gv("mqAddr"),
                status: "في الانتظار",
            }),
        );
        addAudit("إضافة مسجد", name);
        setModal(null);
        nav("mosques");
        toast("تم إرسال المسجد للاعتماد", "inf");
    };
    const addSalaryRuleFn = () => {
        mut((d) =>
            d.salaryRules.push({
                id: uid(),
                role: gv("srRole") || "مدرس",
                base: parseInt(gv("srBase")) || 0,
                days: parseInt(gv("srDays")) || 26,
            }),
        );
        setModal(null);
        nav("salary-rules");
        toast("تم إضافة قاعدة الراتب", "ok");
    };
    const addCustomSalaryFn = () => {
        mut((d) =>
            d.customSalaries.push({
                id: uid(),
                teacher: gv("csTeacher"),
                amount: parseInt(gv("csAmount")) || 0,
                role: "معلم",
                status: gv("csStatus") || "نشط",
                note: gv("csNote"),
            }),
        );
        setModal(null);
        nav("custom-salary");
        toast("تم إضافة الراتب المخصص", "ok");
    };

    // ─── CRUD: حذف ───────────────────────────────────────────
    const delStudent = (id: number) =>
        setConfirm({
            title: "حذف الطالب",
            desc: "هل أنت متأكد؟",
            cb: () => {
                const s = data.students.find((x: Student) => x.id === id);
                mut(
                    (d) =>
                        (d.students = d.students.filter(
                            (x: Student) => x.id !== id,
                        )),
                );
                addAudit("حذف طالب", s?.name || "");
                nav("students");
                toast("تم الحذف", "ok");
            },
        });
    const delTeacher = (id: number) =>
        setConfirm({
            title: "حذف الموظف",
            desc: "هل أنت متأكد؟",
            cb: () => {
                const t = data.teachers.find((x: Teacher) => x.id === id);
                mut(
                    (d) =>
                        (d.teachers = d.teachers.filter(
                            (x: Teacher) => x.id !== id,
                        )),
                );
                addAudit("حذف موظف", t?.name || "");
                nav("teachers");
                toast("تم الحذف", "ok");
            },
        });
    const delCircle = (id: number) =>
        setConfirm({
            title: "حذف الحلقة",
            desc: "",
            cb: () => {
                mut(
                    (d) =>
                        (d.circles = d.circles.filter(
                            (x: Circle) => x.id !== id,
                        )),
                );
                nav("circles");
                toast("تم الحذف", "ok");
            },
        });
    const delTask = (id: number) =>
        setConfirm({
            title: "حذف المهمة",
            desc: "",
            cb: () => {
                mut(
                    (d) => (d.tasks = d.tasks.filter((x: Task) => x.id !== id)),
                );
                nav("tasks");
                toast("تم الحذف", "ok");
            },
        });
    const delMosque = (id: number) =>
        setConfirm({
            title: "حذف المسجد",
            desc: "",
            cb: () => {
                mut(
                    (d) =>
                        (d.mosques = d.mosques.filter(
                            (x: Mosque) => x.id !== id,
                        )),
                );
                nav("mosques");
                toast("تم الحذف", "ok");
            },
        });
    const delSchedule = (id: number) => {
        mut(
            (d) =>
                (d.schedules = d.schedules.filter(
                    (x: Schedule) => x.id !== id,
                )),
        );
        toast("تم الحذف", "ok");
    };
    const delIncentive = (id: number) => {
        mut(
            (d) =>
                (d.incentives = d.incentives.filter(
                    (x: Incentive) => x.id !== id,
                )),
        );
        nav("incentives");
        toast("تم الحذف", "ok");
    };
    const delSalaryRule = (id: number) => {
        mut(
            (d) =>
                (d.salaryRules = d.salaryRules.filter(
                    (x: SalaryRule) => x.id !== id,
                )),
        );
        toast("تم الحذف", "ok");
    };
    const delCustomSalary = (id: number) => {
        mut(
            (d) =>
                (d.customSalaries = d.customSalaries.filter(
                    (x: CustomSalary) => x.id !== id,
                )),
        );
        toast("تم الحذف", "ok");
    };
    const delAtt = (id: number) => {
        mut(
            (d) =>
                (d.attendance = d.attendance.filter(
                    (x: AttRecord) => x.id !== id,
                )),
        );
        toast("تم الحذف", "ok");
    };

    // ─── CRUD: إجراءات أخرى ──────────────────────────────────
    const toggleTask = (id: number) =>
        mut((d) => {
            const t = d.tasks.find((x: Task) => x.id === id);
            if (t) {
                t.done = !t.done;
                if (t.done) toast("تم إكمال: " + t.title, "ok");
            }
        });
    const suspendTeacher = (id: number) => {
        mut((d) => {
            const t = d.teachers.find((x: Teacher) => x.id === id);
            if (t) t.status = "موقوف";
        });
        toast("تم إيقاف الحساب", "warn");
        nav("teachers");
    };
    const activateTeacher = (id: number) => {
        mut((d) => {
            const t = d.teachers.find((x: Teacher) => x.id === id);
            if (t) t.status = "نشط";
        });
        toast("تم تفعيل الحساب", "ok");
        nav("teachers");
    };
    const payEmployee = (id: number) => {
        const f = data.finance.find((x: Finance) => x.id === id);
        mut((d) => {
            const ff = d.finance.find((x: Finance) => x.id === id);
            if (ff) ff.status = "مدفوع";
        });
        toast("تم صرف راتب: " + (f?.name || ""), "ok");
    };
    const payAll = () => {
        mut((d) => d.finance.forEach((f: Finance) => (f.status = "مدفوع")));
        toast("تم صرف جميع الرواتب", "ok");
    };
    const acceptReq = (id: number) => {
        mut((d) => {
            const r = d.reqs.find((x: Req) => x.id === id);
            if (r) {
                r.status = "accepted";
                addAudit("قبول طلب", r.student);
            }
        });
        toast("تم القبول", "ok");
    };
    const rejectReq = (id: number) => {
        mut((d) => {
            const r = d.reqs.find((x: Req) => x.id === id);
            if (r) {
                r.status = "rejected";
                addAudit("رفض طلب", r.student);
            }
        });
        toast("تم الرفض", "warn");
    };
    const markAllRead = () => {
        mut((d) => d.notifs.forEach((n: Notif) => (n.unread = false)));
        toast("تم تعليم الكل كمقروء", "ok");
    };
    const markRead = (i: number) => mut((d) => (d.notifs[i].unread = false));
    const togglePref = (i: number) => {
        mut((d) => (d.prefs[i].on = !d.prefs[i].on));
        toast(
            data.prefs[i].label +
                " — " +
                (data.prefs[i].on ? "معطّل" : "مفعّل"),
            "inf",
        );
    };
    const saveAccount = () => {
        mut((d) => {
            d.me.name = gv("accName", d.me.name);
            d.me.email = gv("accEmail", d.me.email);
            d.me.phone = gv("accPhone", d.me.phone);
            d.me.role = gv("accRole", d.me.role);
            d.me.bio = gv("accBio", d.me.bio);
        });
        addAudit("تعديل الحساب", "البيانات الشخصية");
        toast("تم حفظ إعدادات الحساب", "ok");
    };
    const savePw = () => {
        const n = gv("accPwNew"),
            c = gv("accPwCon");
        if (!n) {
            toast("كلمة المرور الجديدة مطلوبة", "err");
            return;
        }
        if (n !== c) {
            toast("كلمتا المرور غير متطابقتين", "err");
            return;
        }
        toast("تم تحديث كلمة المرور بنجاح", "ok");
    };

    // فلترة الموظفين حسب الحالة
    const filteredTeachers =
        teacherFilter === "active"
            ? data.teachers.filter((t: Teacher) => t.status !== "موقوف")
            : data.teachers.filter((t: Teacher) => t.status === "موقوف");

    // ============================================================
    // 9. PAGE RENDERER — عرض محتوى كل صفحة
    // ============================================================
    const renderPage = () => {
        const d = data;
        const pres = d.attendance.filter(
            (a: AttRecord) => a.status === "حاضر",
        ).length;
        const late = d.attendance.filter(
            (a: AttRecord) => a.status === "متأخر",
        ).length;
        const abs = d.attendance.filter(
            (a: AttRecord) => a.status === "غائب",
        ).length;
        const total = d.attendance.length;
        const rate = total ? Math.round(((pres + late) / total) * 100) : 0;
        const pendTasks = d.tasks.filter((t: Task) => !t.done).length;
        const totalDue = d.finance.reduce(
            (a: number, f: Finance) => a + f.due,
            0,
        );
        const today = new Date();

        switch (page) {
            // ── لوحة التحكم الرئيسية ──
            case "overview":
                return (
                    <div>
                        {/* بطاقة جلسة الحضور */}
                        <div className="dark-hero" style={{ marginBottom: 13 }}>
                            <div className="dhi">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 12,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 800,
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "var(--g300)",
                                                    width: 16,
                                                    height: 16,
                                                    display: "inline-flex",
                                                }}
                                            >
                                                {ICO.check}
                                            </span>{" "}
                                            جلسة الحضور
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "9.5px",
                                                color: "rgba(255,255,255,.35)",
                                                marginTop: 2,
                                            }}
                                        >
                                            {today.toLocaleDateString("ar-SA", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        {attRunning && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 5,
                                                    background:
                                                        "rgba(255,255,255,.08)",
                                                    padding: "3px 10px",
                                                    borderRadius: 100,
                                                    fontSize: 10,
                                                    color: "rgba(255,255,255,.8)",
                                                }}
                                            >
                                                <span className="pulse-dot" />{" "}
                                                جارية
                                            </div>
                                        )}
                                        <button
                                            className="btn bp bsm"
                                            onClick={toggleAtt}
                                            style={
                                                attRunning
                                                    ? {
                                                          background:
                                                              "var(--red)",
                                                      }
                                                    : {}
                                            }
                                        >
                                            {attRunning
                                                ? "إيقاف الجلسة"
                                                : "بدء الجلسة"}
                                        </button>
                                    </div>
                                </div>
                                <div className="att-stats">
                                    {[
                                        { n: pres, l: "حاضر" },
                                        { n: late, l: "متأخر", c: "#fbbf24" },
                                        { n: abs, l: "غائب", c: "#f87171" },
                                        {
                                            n: rate ? rate + "%" : "—",
                                            l: "النسبة",
                                        },
                                    ].map((s, i) => (
                                        <div key={i} className="att-stat">
                                            <div
                                                className="att-stat-n"
                                                style={
                                                    s.c ? { color: s.c } : {}
                                                }
                                            >
                                                {s.n}
                                            </div>
                                            <div className="att-stat-l">
                                                {s.l}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        background: "rgba(0,0,0,.2)",
                                        borderRadius: 9,
                                        padding: "10px 14px",
                                    }}
                                >
                                    <div>
                                        <div className="att-timer-big">
                                            {attTimer}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 9,
                                                color: "rgba(255,255,255,.4)",
                                            }}
                                        >
                                            مدة الجلسة
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            className="btn bsm"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,.1)",
                                                color: "#fff",
                                            }}
                                            onClick={() => nav("attendance")}
                                        >
                                            عرض التفاصيل
                                        </button>
                                        <button
                                            className="btn bsm"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,.08)",
                                                color: "#fff",
                                            }}
                                            onClick={() =>
                                                toast(
                                                    "تم تصدير تقرير الحضور",
                                                    "ok",
                                                )
                                            }
                                        >
                                            تصدير PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* بطاقات KPI */}
                        <div className="kpi-grid">
                            {[
                                {
                                    ico: "student",
                                    cls: "ic-g",
                                    trend: "t-up",
                                    trv: "▲ 2",
                                    n: d.students.length,
                                    l: "إجمالي الطلاب",
                                },
                                {
                                    ico: "globe",
                                    cls: "ic-b",
                                    trend: "t-fl",
                                    trv: "● 0%",
                                    n: d.circles.filter(
                                        (c: Circle) => c.status === "نشطة",
                                    ).length,
                                    l: "الحلقات النشطة",
                                },
                                {
                                    ico: "clip",
                                    cls: "ic-a",
                                    trend: pendTasks > 3 ? "t-up" : "t-fl",
                                    trv: pendTasks + " معلقة",
                                    n: d.tasks.length,
                                    l: "المهام الكلية",
                                },
                                {
                                    ico: "money",
                                    cls: "ic-p",
                                    trend: "t-up",
                                    trv: "▲ 5%",
                                    n: totalDue.toLocaleString(),
                                    l: "المستحقات (ر.س)",
                                },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div className="kpi-top">
                                        <div className={`kpi-ico ${k.cls}`}>
                                            {ICO[k.ico]}
                                        </div>
                                        <span
                                            className={`kpi-trend ${k.trend}`}
                                        >
                                            {k.trv}
                                        </span>
                                    </div>
                                    <div className="kpi-num">{k.n}</div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="g2">
                            {/* إجراءات سريعة */}
                            <div className="widget">
                                <div className="wh">
                                    <span className="wh-l">إجراءات سريعة</span>
                                </div>
                                <div className="wb">
                                    <div className="g3">
                                        {[
                                            {
                                                lbl: "طالب جديد",
                                                ico: "student",
                                                fn: () =>
                                                    setModal({
                                                        type: "addStudent",
                                                    }),
                                                col: "var(--g100)",
                                                icol: "var(--g600)",
                                            },
                                            {
                                                lbl: "حلقة جديدة",
                                                ico: "globe",
                                                fn: () =>
                                                    setModal({
                                                        type: "addCircle",
                                                    }),
                                                col: "#dbeafe",
                                                icol: "#2563eb",
                                            },
                                            {
                                                lbl: "تسجيل حضور",
                                                ico: "check",
                                                fn: () =>
                                                    setModal({
                                                        type: "recordAtt",
                                                    }),
                                                col: "var(--g100)",
                                                icol: "var(--g600)",
                                            },
                                            {
                                                lbl: "مهمة جديدة",
                                                ico: "clip",
                                                fn: () =>
                                                    setModal({
                                                        type: "addTask",
                                                    }),
                                                col: "#fef3c7",
                                                icol: "#d97706",
                                            },
                                            {
                                                lbl: "إنجاز طالب",
                                                ico: "star",
                                                fn: () =>
                                                    setModal({
                                                        type: "addIncentive",
                                                    }),
                                                col: "#ede9fe",
                                                icol: "#7c3aed",
                                            },
                                            {
                                                lbl: "الطلبات المعلقة",
                                                ico: "clipboard",
                                                fn: () =>
                                                    nav("student-requests"),
                                                col: "#fee2e2",
                                                icol: "#ef4444",
                                            },
                                        ].map((q, i) => (
                                            <div
                                                key={i}
                                                onClick={q.fn}
                                                style={{
                                                    background: "var(--n50)",
                                                    border: "1px solid var(--n200)",
                                                    borderRadius: 9,
                                                    padding: 11,
                                                    textAlign: "center",
                                                    cursor: "pointer",
                                                    transition: ".15s",
                                                }}
                                                onMouseEnter={(e) => {
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.background = q.col;
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.borderColor =
                                                        q.icol + "30";
                                                }}
                                                onMouseLeave={(e) => {
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.background =
                                                        "var(--n50)";
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.borderColor =
                                                        "var(--n200)";
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 30,
                                                        height: 30,
                                                        background: q.col,
                                                        borderRadius: 7,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        margin: "0 auto 6px",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: q.icol,
                                                            width: 14,
                                                            height: 14,
                                                            display:
                                                                "inline-flex",
                                                        }}
                                                    >
                                                        {ICO[q.ico]}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: "var(--n600)",
                                                    }}
                                                >
                                                    {q.lbl}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* الحلقات النشطة */}
                            <div className="widget">
                                <div className="wh">
                                    <span className="wh-l">الحلقات النشطة</span>
                                    <button
                                        className="btn bp bsm"
                                        onClick={() => nav("circles")}
                                    >
                                        إدارة الكل
                                    </button>
                                </div>
                                <div style={{ padding: "0 14px" }}>
                                    {d.circles.map((c: Circle, i: number) => (
                                        <div
                                            key={c.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 9,
                                                padding: "9px 0",
                                                borderBottom:
                                                    "1px solid var(--n100)",
                                            }}
                                        >
                                            <Av
                                                name={c.name}
                                                size={34}
                                                idx={i}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: "11.5px",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {c.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: "var(--n400)",
                                                    }}
                                                >
                                                    {c.teacher} · {c.students}{" "}
                                                    طالب
                                                </div>
                                            </div>
                                            <BadgeStatus s={c.status} />
                                            <button
                                                className="btn bs bxs"
                                                onClick={() =>
                                                    toast(
                                                        "تعديل الحلقة قريباً",
                                                        "inf",
                                                    )
                                                }
                                            >
                                                تعديل
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* المهام المعلقة */}
                        <div className="widget">
                            <div className="wh">
                                <span className="wh-l">المهام المعلقة</span>
                                <button
                                    className="btn bp bsm"
                                    onClick={() => nav("tasks")}
                                >
                                    الكل
                                </button>
                            </div>
                            <div className="wb">
                                {d.tasks
                                    .filter((t: Task) => !t.done)
                                    .slice(0, 4)
                                    .map((t: Task) => (
                                        <TaskItemComp
                                            key={t.id}
                                            t={t}
                                            mini
                                            onToggle={toggleTask}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                );

            // ── سجل الحضور ──
            case "attendance":
                return (
                    <div>
                        <div className="dark-hero" style={{ marginBottom: 13 }}>
                            <div className="dhi">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: "#fff",
                                        }}
                                    >
                                        جلسة الحضور
                                    </div>
                                    <button
                                        className="btn bp bsm"
                                        onClick={toggleAtt}
                                        style={
                                            attRunning
                                                ? { background: "var(--red)" }
                                                : {}
                                        }
                                    >
                                        {attRunning
                                            ? "إيقاف الجلسة"
                                            : "بدء الجلسة"}
                                    </button>
                                </div>
                                <div className="att-stats">
                                    {[
                                        { n: pres, l: "حاضر" },
                                        { n: late, l: "متأخر", c: "#fbbf24" },
                                        { n: abs, l: "غائب", c: "#f87171" },
                                        {
                                            n: rate ? rate + "%" : "—",
                                            l: "النسبة",
                                        },
                                    ].map((s, i) => (
                                        <div key={i} className="att-stat">
                                            <div
                                                className="att-stat-n"
                                                style={
                                                    s.c ? { color: s.c } : {}
                                                }
                                            >
                                                {s.n}
                                            </div>
                                            <div className="att-stat-l">
                                                {s.l}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        background: "rgba(0,0,0,.2)",
                                        borderRadius: 9,
                                        padding: "10px 14px",
                                    }}
                                >
                                    <div className="att-timer-big">
                                        {attTimer}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            color: "rgba(255,255,255,.4)",
                                        }}
                                    >
                                        مدة الجلسة الحالية
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div>
                                    <div className="wh-l">سجل الحضور</div>
                                    <div className="wh-s">
                                        {today.toLocaleDateString("ar-SA", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                                <div className="flx">
                                    <button
                                        className="btn bp bsm"
                                        onClick={() =>
                                            setModal({ type: "recordAtt" })
                                        }
                                    >
                                        + تسجيل
                                    </button>
                                    <button
                                        className="btn bs bsm"
                                        onClick={() =>
                                            toast("تم تصدير تقرير الحضور", "ok")
                                        }
                                    >
                                        تصدير PDF
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الموظف</th>
                                            <th>الدور</th>
                                            <th>الحالة</th>
                                            <th>الوقت</th>
                                            <th>ملاحظات</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.attendance.length ? (
                                            d.attendance.map(
                                                (a: AttRecord, i: number) => (
                                                    <tr key={a.id}>
                                                        <td>
                                                            <div className="tu">
                                                                <Av
                                                                    name={
                                                                        a.name
                                                                    }
                                                                    size={26}
                                                                    idx={i}
                                                                />
                                                                <div
                                                                    style={{
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {a.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                txt={a.role}
                                                                cls="bg-b"
                                                            />
                                                        </td>
                                                        <td>
                                                            <BadgeStatus
                                                                s={a.status}
                                                            />
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            {a.time}
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontSize: 11,
                                                                color: "var(--n500)",
                                                            }}
                                                        >
                                                            {a.note || "—"}
                                                        </td>
                                                        <td>
                                                            <div className="td-actions">
                                                                <button
                                                                    className="btn bs bxs"
                                                                    onClick={() =>
                                                                        toast(
                                                                            "تعديل الحضور قريباً",
                                                                            "inf",
                                                                        )
                                                                    }
                                                                >
                                                                    تعديل
                                                                </button>
                                                                <button
                                                                    className="btn bd bxs"
                                                                    onClick={() =>
                                                                        delAtt(
                                                                            a.id,
                                                                        )
                                                                    }
                                                                >
                                                                    حذف
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className="empty">
                                                        <p>
                                                            لا توجد سجلات حضور
                                                        </p>
                                                        <button
                                                            className="btn bp bsm"
                                                            onClick={() =>
                                                                setModal({
                                                                    type: "recordAtt",
                                                                })
                                                            }
                                                        >
                                                            تسجيل الآن
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            // ── المهام ──
            case "tasks": {
                const total2 = d.tasks.length,
                    pend2 = d.tasks.filter((t: Task) => !t.done).length,
                    done2 = d.tasks.filter((t: Task) => t.done).length,
                    over2 = d.tasks.filter(
                        (t: Task) => !t.done && new Date(t.due) < today,
                    ).length;
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                { n: total2, l: "إجمالي المهام" },
                                { n: pend2, l: "معلقة" },
                                { n: done2, l: "مكتملة" },
                                { n: over2, l: "متأخرة" },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div className="kpi-num">{k.n}</div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="g2">
                            <div className="widget">
                                <div className="wh">
                                    <div className="wh-l">قائمة المهام</div>
                                    <div className="flx">
                                        <input
                                            className="fi"
                                            placeholder="بحث..."
                                            onChange={(e) =>
                                                setTableFilter((p) => ({
                                                    ...p,
                                                    taskQ: e.target.value,
                                                }))
                                            }
                                            style={{ width: 140 }}
                                        />
                                        <button
                                            className="btn bp bsm"
                                            onClick={() =>
                                                setModal({ type: "addTask" })
                                            }
                                        >
                                            + مهمة
                                        </button>
                                    </div>
                                </div>
                                <div className="wb">
                                    {d.tasks
                                        .filter(
                                            (t: Task) =>
                                                !tableFilter.taskQ ||
                                                t.title.includes(
                                                    tableFilter.taskQ,
                                                ) ||
                                                t.assignee.includes(
                                                    tableFilter.taskQ,
                                                ),
                                        )
                                        .map((t: Task) => (
                                            <TaskItemComp
                                                key={t.id}
                                                t={t}
                                                onToggle={toggleTask}
                                                onEdit={() =>
                                                    toast(
                                                        "تعديل المهمة قريباً",
                                                        "inf",
                                                    )
                                                }
                                                onDel={() => delTask(t.id)}
                                            />
                                        ))}
                                </div>
                            </div>
                            <div className="widget">
                                <div className="wh">
                                    <div className="wh-l">الإحصائيات</div>
                                </div>
                                <div className="wb">
                                    <div
                                        style={{
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            color: "var(--n400)",
                                            marginBottom: 8,
                                        }}
                                    >
                                        حسب الأولوية
                                    </div>
                                    {["عالية", "متوسطة", "منخفضة"].map((p) => {
                                        const c = d.tasks.filter(
                                                (t: Task) => t.priority === p,
                                            ).length,
                                            pct = total2
                                                ? Math.round((c / total2) * 100)
                                                : 0;
                                        return (
                                            <div
                                                key={p}
                                                className="prog-wrap"
                                                style={{ marginBottom: 7 }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "10.5px",
                                                        color: "var(--n600)",
                                                        minWidth: 50,
                                                    }}
                                                >
                                                    {p}
                                                </span>
                                                <div className="prog-bg">
                                                    <div
                                                        className="prog-fill"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background:
                                                                p === "عالية"
                                                                    ? "var(--red)"
                                                                    : p ===
                                                                        "متوسطة"
                                                                      ? "var(--amber)"
                                                                      : "var(--g500)",
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: "10.5px",
                                                        fontWeight: 700,
                                                        color: "var(--n600)",
                                                        minWidth: 18,
                                                    }}
                                                >
                                                    {c}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // ── الحلقات ──
            case "circles":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">إدارة الحلقات</div>
                            <div className="flx">
                                <input
                                    className="fi"
                                    placeholder="بحث..."
                                    onChange={(e) =>
                                        setTableFilter((p) => ({
                                            ...p,
                                            circleQ: e.target.value,
                                        }))
                                    }
                                    style={{ width: 160 }}
                                />
                                <button
                                    className="btn bp bsm"
                                    onClick={() =>
                                        setModal({ type: "addCircle" })
                                    }
                                >
                                    + حلقة جديدة
                                </button>
                            </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>الحلقة</th>
                                        <th>المجمع</th>
                                        <th>المعلم</th>
                                        <th>الحالة</th>
                                        <th>الطلاب</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.circles
                                        .filter(
                                            (c: Circle) =>
                                                !tableFilter.circleQ ||
                                                c.name.includes(
                                                    tableFilter.circleQ,
                                                ),
                                        )
                                        .map((c: Circle, i: number) => (
                                            <tr key={c.id}>
                                                <td>
                                                    <div className="tu">
                                                        <Av
                                                            name={c.name}
                                                            size={26}
                                                            idx={i}
                                                        />
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {c.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{c.center}</td>
                                                <td>{c.teacher}</td>
                                                <td>
                                                    <BadgeStatus s={c.status} />
                                                </td>
                                                <td>{c.students}</td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bs bxs"
                                                            onClick={() =>
                                                                toast(
                                                                    "تعديل الحلقة قريباً",
                                                                    "inf",
                                                                )
                                                            }
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() =>
                                                                delCircle(c.id)
                                                            }
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── الخطط ──
            case "plans":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">إدارة الخطط</div>
                            <div className="flx">
                                <input
                                    className="fi"
                                    placeholder="بحث..."
                                    style={{ width: 160 }}
                                />
                                <button
                                    className="btn bp bsm"
                                    onClick={() =>
                                        setModal({ type: "addPlan" })
                                    }
                                >
                                    + خطة جديدة
                                </button>
                            </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>اسم الخطة</th>
                                        <th>المجمع</th>
                                        <th>المدة</th>
                                        <th>الأيام</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.plans.map((p: Plan, i: number) => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700 }}>
                                                {p.name}
                                            </td>
                                            <td>{p.center}</td>
                                            <td>{p.duration}</td>
                                            <td>{p.days} يوم</td>
                                            <td>
                                                <BadgeStatus s={p.status} />
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            toast(
                                                                "تعديل الخطة قريباً",
                                                                "inf",
                                                            )
                                                        }
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() => {
                                                            mut(
                                                                (d2) =>
                                                                    (d2.plans =
                                                                        d2.plans.filter(
                                                                            (
                                                                                x: Plan,
                                                                            ) =>
                                                                                x.id !==
                                                                                p.id,
                                                                        )),
                                                            );
                                                            toast(
                                                                "تم الحذف",
                                                                "ok",
                                                            );
                                                        }}
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── طلبات الطلاب ──
            case "student-requests": {
                const list = d.reqs.filter((r: Req) => r.status === reqTab);
                return (
                    <div>
                        <div
                            style={{
                                display: "flex",
                                gap: 9,
                                marginBottom: 12,
                            }}
                        >
                            {[
                                {
                                    n: d.reqs.filter(
                                        (r: Req) => r.status === "pending",
                                    ).length,
                                    l: "معلقة",
                                    c: "var(--amber)",
                                },
                                {
                                    n: d.reqs.filter(
                                        (r: Req) => r.status === "accepted",
                                    ).length,
                                    l: "مقبولة",
                                    c: "var(--g500)",
                                },
                                {
                                    n: d.reqs.filter(
                                        (r: Req) => r.status === "rejected",
                                    ).length,
                                    l: "مرفوضة",
                                    c: "var(--red)",
                                },
                            ].map((k, i) => (
                                <div
                                    key={i}
                                    className="kpi"
                                    style={{ flex: 1 }}
                                >
                                    <div
                                        className="kpi-num"
                                        style={{ color: k.c }}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">طلبات الانضمام</div>
                                <div className="tabs">
                                    {["pending", "accepted", "rejected"].map(
                                        (f) => (
                                            <div
                                                key={f}
                                                className={`tab${reqTab === f ? " on" : ""}`}
                                                onClick={() => setReqTab(f)}
                                            >
                                                {f === "pending"
                                                    ? "معلقة"
                                                    : f === "accepted"
                                                      ? "مقبولة"
                                                      : "مرفوضة"}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الطالب</th>
                                            <th>الخطة</th>
                                            <th>الحلقة</th>
                                            <th>الوقت</th>
                                            <th>تاريخ الطلب</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.length ? (
                                            list.map((r: Req, i: number) => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <div className="tu">
                                                            <Av
                                                                name={r.student}
                                                                size={26}
                                                                idx={i}
                                                            />
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {r.student}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: "var(--n400)",
                                                                    }}
                                                                >
                                                                    {r.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {r.plan}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {r.circle}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {r.time}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {r.date}
                                                    </td>
                                                    <td>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn bp bxs"
                                                                onClick={() =>
                                                                    acceptReq(
                                                                        r.id,
                                                                    )
                                                                }
                                                            >
                                                                قبول
                                                            </button>
                                                            <button
                                                                className="btn bd bxs"
                                                                onClick={() =>
                                                                    rejectReq(
                                                                        r.id,
                                                                    )
                                                                }
                                                            >
                                                                رفض
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className="empty">
                                                        <p>لا توجد طلبات</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }

            // ── المواعيد ──
            case "schedules":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">مواعيد الحلقات</div>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    setModal({ type: "addSchedule" })
                                }
                            >
                                + موعد جديد
                            </button>
                        </div>
                        {d.schedules.map((s: Schedule) => (
                            <div
                                key={s.id}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    padding: "10px 14px",
                                    borderBottom: "1px solid var(--n100)",
                                }}
                            >
                                <div
                                    style={{
                                        minWidth: 55,
                                        background: "var(--g50)",
                                        border: "1px solid var(--g100)",
                                        borderRadius: 9,
                                        padding: 7,
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 900,
                                            color: "var(--g700)",
                                        }}
                                    >
                                        {s.start}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        → {s.end}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {s.circle}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "10.5px",
                                            color: "var(--n400)",
                                        }}
                                    >
                                        {s.days} · سعة: {s.capacity}
                                    </div>
                                </div>
                                <Badge txt="نشطة" cls="bg-g" />
                                <div className="td-actions">
                                    <button
                                        className="btn bs bxs"
                                        onClick={() =>
                                            toast("تعديل الموعد قريباً", "inf")
                                        }
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        className="btn bd bxs"
                                        onClick={() => delSchedule(s.id)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{ padding: "12px 14px" }}>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    setModal({ type: "addSchedule" })
                                }
                            >
                                + إضافة موعد
                            </button>
                        </div>
                    </div>
                );

            // ── الموظفون ──
            case "teachers":
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                { n: d.teachers.length, l: "إجمالي الموظفين" },
                                {
                                    n: d.teachers.filter(
                                        (t: Teacher) => t.status === "نشط",
                                    ).length,
                                    l: "نشطون",
                                    c: "var(--g500)",
                                },
                                {
                                    n: d.teachers.filter(
                                        (t: Teacher) =>
                                            t.status === "يحتاج متابعة",
                                    ).length,
                                    l: "يحتاج متابعة",
                                    c: "var(--amber)",
                                },
                                {
                                    n: d.teachers.filter(
                                        (t: Teacher) => t.status === "موقوف",
                                    ).length,
                                    l: "موقوف",
                                    c: "var(--red)",
                                },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div
                                        className="kpi-num"
                                        style={k.c ? { color: k.c } : {}}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">قائمة الموظفين</div>
                                <div className="flx">
                                    <input
                                        className="fi"
                                        placeholder="بحث..."
                                        onChange={(e) =>
                                            setTableFilter((p) => ({
                                                ...p,
                                                teacherQ: e.target.value,
                                            }))
                                        }
                                        style={{ width: 160 }}
                                    />
                                    <div className="tabs">
                                        <div
                                            className={`tab${teacherFilter === "active" ? " on" : ""}`}
                                            onClick={() =>
                                                setTeacherFilter("active")
                                            }
                                        >
                                            نشطون
                                        </div>
                                        <div
                                            className={`tab${teacherFilter === "suspended" ? " on" : ""}`}
                                            onClick={() =>
                                                setTeacherFilter("suspended")
                                            }
                                        >
                                            موقوفون
                                        </div>
                                    </div>
                                    <button
                                        className="btn bp bsm"
                                        onClick={() =>
                                            setModal({ type: "addTeacher" })
                                        }
                                    >
                                        + موظف جديد
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الموظف</th>
                                            <th>البريد</th>
                                            <th>الدور</th>
                                            <th>الحالة</th>
                                            <th>الأداء</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers
                                            .filter(
                                                (t: Teacher) =>
                                                    !tableFilter.teacherQ ||
                                                    t.name.includes(
                                                        tableFilter.teacherQ,
                                                    ),
                                            )
                                            .map((t: Teacher, i: number) => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div className="tu">
                                                            <Av
                                                                name={t.name}
                                                                size={26}
                                                                idx={i}
                                                            />
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {t.name}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: "var(--n400)",
                                                                    }}
                                                                >
                                                                    {t.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {t.email}
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            txt={t.role}
                                                            cls={
                                                                t.role ===
                                                                    "مشرفة" ||
                                                                t.role ===
                                                                    "مشرف"
                                                                    ? "bg-p"
                                                                    : t.role ===
                                                                        "مالي"
                                                                      ? "bg-b"
                                                                      : "bg-g"
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <BadgeStatus
                                                            s={t.status}
                                                        />
                                                    </td>
                                                    <td>
                                                        <ProgBar pct={t.perf} />
                                                    </td>
                                                    <td>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn bs bxs"
                                                                onClick={() =>
                                                                    toast(
                                                                        "تعديل " +
                                                                            t.name,
                                                                        "inf",
                                                                    )
                                                                }
                                                            >
                                                                تعديل
                                                            </button>
                                                            {t.status !==
                                                            "موقوف" ? (
                                                                <button
                                                                    className="btn bxs"
                                                                    style={{
                                                                        background:
                                                                            "#fef3c7",
                                                                        color: "#92400e",
                                                                    }}
                                                                    onClick={() =>
                                                                        suspendTeacher(
                                                                            t.id,
                                                                        )
                                                                    }
                                                                >
                                                                    إيقاف
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn bxs"
                                                                    style={{
                                                                        background:
                                                                            "var(--g100)",
                                                                        color: "var(--g700)",
                                                                    }}
                                                                    onClick={() =>
                                                                        activateTeacher(
                                                                            t.id,
                                                                        )
                                                                    }
                                                                >
                                                                    تفعيل
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn bd bxs"
                                                                onClick={() =>
                                                                    delTeacher(
                                                                        t.id,
                                                                    )
                                                                }
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            // ── متابعة الأداء ──
            case "educational":
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                { n: d.teachers.length, l: "إجمالي المعلمين" },
                                {
                                    n: d.teachers.filter(
                                        (t: Teacher) => t.status === "نشط",
                                    ).length,
                                    l: "أداء ممتاز",
                                    c: "var(--g500)",
                                },
                                {
                                    n: d.teachers.filter(
                                        (t: Teacher) =>
                                            t.status === "يحتاج متابعة",
                                    ).length,
                                    l: "يحتاج متابعة",
                                    c: "var(--amber)",
                                },
                                {
                                    n:
                                        Math.round(
                                            d.teachers.reduce(
                                                (a: number, t: Teacher) =>
                                                    a + t.perf,
                                                0,
                                            ) / d.teachers.length,
                                        ) + "%",
                                    l: "متوسط الأداء",
                                },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div
                                        className="kpi-num"
                                        style={k.c ? { color: k.c } : {}}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">لوحة متابعة الأداء</div>
                                <input
                                    className="fi"
                                    placeholder="بحث..."
                                    style={{ width: 160 }}
                                />
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>المعلم</th>
                                            <th>الدور</th>
                                            <th>الحلقة</th>
                                            <th>الأداء</th>
                                            <th>الطلاب</th>
                                            <th>آخر زيارة</th>
                                            <th>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.teachers.map(
                                            (t: Teacher, i: number) => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div className="tu">
                                                            <Av
                                                                name={t.name}
                                                                size={26}
                                                                idx={i}
                                                            />
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {t.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            txt={t.role}
                                                            cls="bg-g"
                                                        />
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        حفظ الجزء 30
                                                    </td>
                                                    <td>
                                                        <ProgBar pct={t.perf} />
                                                    </td>
                                                    <td>{t.students}</td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {t.lastVisit}
                                                    </td>
                                                    <td>
                                                        <BadgeStatus
                                                            s={t.status}
                                                        />
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            // ── اللوحة المالية ──
            case "finance": {
                const totalDue2 = d.finance.reduce(
                    (a: number, f: Finance) => a + f.due,
                    0,
                );
                const paidDue = d.finance
                    .filter((f: Finance) => f.status === "مدفوع")
                    .reduce((a: number, f: Finance) => a + f.due, 0);
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                {
                                    n: totalDue2.toLocaleString(),
                                    l: "إجمالي المستحقات (ر.س)",
                                },
                                {
                                    n: paidDue.toLocaleString(),
                                    l: "مدفوعة",
                                    c: "var(--g500)",
                                },
                                {
                                    n: (totalDue2 - paidDue).toLocaleString(),
                                    l: "معلقة",
                                    c: "var(--amber)",
                                },
                                { n: d.finance.length, l: "عدد الموظفين" },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div
                                        className="kpi-num"
                                        style={k.c ? { color: k.c } : {}}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">ملخص الرواتب الشهرية</div>
                                <div className="flx">
                                    <button
                                        className="btn bp bsm"
                                        onClick={payAll}
                                    >
                                        صرف الكل
                                    </button>
                                    <button
                                        className="btn bs bsm"
                                        onClick={() =>
                                            toast(
                                                "تم تصدير تقرير الرواتب",
                                                "ok",
                                            )
                                        }
                                    >
                                        تصدير Excel
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الموظف</th>
                                            <th>الدور</th>
                                            <th>الراتب</th>
                                            <th>الدوام</th>
                                            <th>الخصم</th>
                                            <th>المستحق</th>
                                            <th>الحالة</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.finance.map(
                                            (f: Finance, i: number) => (
                                                <tr key={f.id}>
                                                    <td>
                                                        <div className="tu">
                                                            <Av
                                                                name={f.name}
                                                                size={26}
                                                                idx={i}
                                                            />
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {f.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            txt={f.role}
                                                            cls="bg-b"
                                                        />
                                                    </td>
                                                    <td>
                                                        {f.base.toLocaleString()}{" "}
                                                        ر.س
                                                    </td>
                                                    <td>
                                                        {f.workDays}/
                                                        {f.totalDays}
                                                    </td>
                                                    <td
                                                        style={{
                                                            color: "var(--red)",
                                                        }}
                                                    >
                                                        - {f.deduction} ر.س
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--g600)",
                                                        }}
                                                    >
                                                        {f.due.toLocaleString()}{" "}
                                                        ر.س
                                                    </td>
                                                    <td>
                                                        <BadgeStatus
                                                            s={f.status}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn bp bxs"
                                                                onClick={() =>
                                                                    payEmployee(
                                                                        f.id,
                                                                    )
                                                                }
                                                            >
                                                                دفع
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }

            // ── قواعد الرواتب ──
            case "salary-rules":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">قواعد الرواتب</div>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    setModal({ type: "addSalaryRule" })
                                }
                            >
                                + قاعدة جديدة
                            </button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>الدور</th>
                                        <th>الراتب الأساسي</th>
                                        <th>أيام العمل</th>
                                        <th>اليومي</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.salaryRules.map((r: SalaryRule) => (
                                        <tr key={r.id}>
                                            <td>
                                                <Badge
                                                    txt={r.role}
                                                    cls="bg-b"
                                                />
                                            </td>
                                            <td style={{ fontWeight: 700 }}>
                                                {r.base.toLocaleString()} ر.س
                                            </td>
                                            <td>{r.days} يوم</td>
                                            <td>
                                                {Math.round(r.base / r.days)}{" "}
                                                ر.س
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            delSalaryRule(r.id)
                                                        }
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── الرواتب المخصصة ──
            case "custom-salary":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">الرواتب المخصصة للمعلمين</div>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    setModal({ type: "addCustomSalary" })
                                }
                            >
                                + راتب مخصص
                            </button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>المعلم</th>
                                        <th>الراتب المخصص</th>
                                        <th>الدور</th>
                                        <th>الحالة</th>
                                        <th>ملاحظات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.customSalaries.map(
                                        (c: CustomSalary, i: number) => (
                                            <tr key={c.id}>
                                                <td>
                                                    <div className="tu">
                                                        <Av
                                                            name={c.teacher}
                                                            size={26}
                                                            idx={i}
                                                        />
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {c.teacher}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        fontWeight: 700,
                                                        color: "var(--g600)",
                                                    }}
                                                >
                                                    {c.amount.toLocaleString()}{" "}
                                                    ر.س
                                                </td>
                                                <td>
                                                    <Badge
                                                        txt={c.role}
                                                        cls="bg-b"
                                                    />
                                                </td>
                                                <td>
                                                    <BadgeStatus s={c.status} />
                                                </td>
                                                <td style={{ fontSize: 11 }}>
                                                    {c.note || "—"}
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() =>
                                                                delCustomSalary(
                                                                    c.id,
                                                                )
                                                            }
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── شؤون الطلاب ──
            case "students":
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                { n: d.students.length, l: "إجمالي الطلاب" },
                                {
                                    n: d.students.filter(
                                        (s: Student) => s.status === "نشط",
                                    ).length,
                                    l: "نشطون",
                                    c: "var(--g500)",
                                },
                                {
                                    n: d.students.filter(
                                        (s: Student) => s.status === "معلق",
                                    ).length,
                                    l: "معلقون",
                                    c: "var(--amber)",
                                },
                                {
                                    n:
                                        Math.round(
                                            d.students.reduce(
                                                (a: number, s: Student) =>
                                                    a + s.att,
                                                0,
                                            ) / d.students.length,
                                        ) + "%",
                                    l: "متوسط الحضور",
                                },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div
                                        className="kpi-num"
                                        style={k.c ? { color: k.c } : {}}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">قائمة الطلاب</div>
                                <div className="flx">
                                    <input
                                        className="fi"
                                        placeholder="بحث..."
                                        onChange={(e) =>
                                            setTableFilter((p) => ({
                                                ...p,
                                                studentQ: e.target.value,
                                            }))
                                        }
                                        style={{ width: 180 }}
                                    />
                                    <button
                                        className="btn bp bsm"
                                        onClick={() =>
                                            setModal({ type: "addStudent" })
                                        }
                                    >
                                        + طالب جديد
                                    </button>
                                    <button
                                        className="btn bs bsm"
                                        onClick={() =>
                                            toast(
                                                "تم تصدير بيانات الطلاب",
                                                "ok",
                                            )
                                        }
                                    >
                                        تصدير Excel
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الطالب</th>
                                            <th>الهوية</th>
                                            <th>الحلقة</th>
                                            <th>ولي الأمر</th>
                                            <th>الحضور</th>
                                            <th>المصروفات</th>
                                            <th>النقاط</th>
                                            <th>الحالة</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.students
                                            .filter(
                                                (s: Student) =>
                                                    !tableFilter.studentQ ||
                                                    s.name.includes(
                                                        tableFilter.studentQ,
                                                    ) ||
                                                    s.idNum.includes(
                                                        tableFilter.studentQ,
                                                    ),
                                            )
                                            .map((s: Student, i: number) => (
                                                <tr key={s.id}>
                                                    <td>
                                                        <div className="tu">
                                                            <Av
                                                                name={s.name}
                                                                size={26}
                                                                idx={i}
                                                            />
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {s.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {s.idNum}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {s.circle}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {s.parent}
                                                        <br />
                                                        <span
                                                            style={{
                                                                color: "var(--n400)",
                                                                fontSize: 10,
                                                            }}
                                                        >
                                                            {s.parentPhone}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <ProgBar pct={s.att} />
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--g600)",
                                                        }}
                                                    >
                                                        {s.fees} ر.س
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "var(--purple)",
                                                        }}
                                                    >
                                                        {s.pts} نقطة
                                                    </td>
                                                    <td>
                                                        <BadgeStatus
                                                            s={s.status}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn bs bxs"
                                                                onClick={() =>
                                                                    setModal({
                                                                        type: "viewStudent",
                                                                        param: i,
                                                                    })
                                                                }
                                                            >
                                                                عرض
                                                            </button>
                                                            <button
                                                                className="btn bd bxs"
                                                                onClick={() =>
                                                                    delStudent(
                                                                        s.id,
                                                                    )
                                                                }
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            // ── التحفيزات ──
            case "incentives":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">
                                إدارة التحفيزات والإنجازات
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    setModal({ type: "addIncentive" })
                                }
                            >
                                + إنجاز جديد
                            </button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>الطالب</th>
                                        <th>النقاط</th>
                                        <th>النوع</th>
                                        <th>التصنيف</th>
                                        <th>السبب</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.incentives.map(
                                        (inc: Incentive, i: number) => (
                                            <tr key={inc.id}>
                                                <td>
                                                    <div className="tu">
                                                        <Av
                                                            name={inc.student}
                                                            size={26}
                                                            idx={i}
                                                        />
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {inc.student}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        fontWeight: 700,
                                                        color: "var(--g600)",
                                                    }}
                                                >
                                                    +{inc.pts}
                                                </td>
                                                <td>
                                                    <Badge
                                                        txt={inc.type}
                                                        cls="bg-g"
                                                    />
                                                </td>
                                                <td>
                                                    <Badge
                                                        txt={inc.cat}
                                                        cls="bg-p"
                                                    />
                                                </td>
                                                <td style={{ fontSize: 11 }}>
                                                    {inc.reason}
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: "10.5px",
                                                        color: "var(--n400)",
                                                    }}
                                                >
                                                    {inc.date}
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() =>
                                                                delIncentive(
                                                                    inc.id,
                                                                )
                                                            }
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── المساجد ──
            case "mosques":
                return (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">إدارة المساجد</div>
                            <button
                                className="btn bp bsm"
                                onClick={() => setModal({ type: "addMosque" })}
                            >
                                + مسجد جديد
                            </button>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>المسجد</th>
                                        <th>المجمع</th>
                                        <th>المشرف</th>
                                        <th>العنوان</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {d.mosques.length ? (
                                        d.mosques.map((m: Mosque) => (
                                            <tr key={m.id}>
                                                <td style={{ fontWeight: 700 }}>
                                                    {m.name}
                                                </td>
                                                <td>{m.center}</td>
                                                <td>{m.supervisor}</td>
                                                <td>{m.address}</td>
                                                <td>
                                                    <BadgeStatus s={m.status} />
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() =>
                                                                delMosque(m.id)
                                                            }
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="empty">
                                                    <p>لا يوجد مساجد</p>
                                                    <button
                                                        className="btn bp bsm"
                                                        onClick={() =>
                                                            setModal({
                                                                type: "addMosque",
                                                            })
                                                        }
                                                    >
                                                        إضافة مسجد
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // ── سجل الإجراءات ──
            case "audit":
                return (
                    <div>
                        <div className="kpi-grid">
                            {[
                                { n: d.audit.length, l: "إجمالي الأحداث" },
                                {
                                    n: d.audit.filter(
                                        (a: AuditEntry) =>
                                            a.status === "success",
                                    ).length,
                                    l: "نجحت",
                                    c: "var(--g500)",
                                },
                                { n: 0, l: "فشلت", c: "var(--red)" },
                                { n: "127.0.0.1", l: "آخر IP" },
                            ].map((k, i) => (
                                <div key={i} className="kpi">
                                    <div
                                        className="kpi-num"
                                        style={k.c ? { color: k.c } : {}}
                                    >
                                        {k.n}
                                    </div>
                                    <div className="kpi-lbl">{k.l}</div>
                                </div>
                            ))}
                        </div>
                        <div className="widget">
                            <div className="wh">
                                <div className="wh-l">سجل التدقيق الكامل</div>
                                <div className="flx">
                                    <input
                                        className="fi"
                                        placeholder="بحث..."
                                        style={{ width: 160 }}
                                    />
                                    <button
                                        className="btn bs bsm"
                                        onClick={() =>
                                            toast("تم تصدير السجل", "ok")
                                        }
                                    >
                                        تصدير Excel
                                    </button>
                                    <button
                                        className="btn bd bsm"
                                        onClick={() =>
                                            setConfirm({
                                                title: "مسح السجل",
                                                desc: "سيتم مسح كل السجلات نهائياً",
                                                cb: () => {
                                                    mut((d) => (d.audit = []));
                                                    toast("تم مسح السجل", "ok");
                                                },
                                            })
                                        }
                                    >
                                        مسح الكل
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>الوقت</th>
                                            <th>العملية</th>
                                            <th>التفاصيل</th>
                                            <th>IP</th>
                                            <th>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.audit.map(
                                            (a: AuditEntry, i: number) => (
                                                <tr key={i}>
                                                    <td
                                                        style={{
                                                            fontSize: "10.5px",
                                                            color: "var(--n400)",
                                                        }}
                                                    >
                                                        {a.time}
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {a.op}
                                                    </td>
                                                    <td
                                                        style={{ fontSize: 11 }}
                                                    >
                                                        {a.detail}
                                                    </td>
                                                    <td>
                                                        <code
                                                            style={{
                                                                fontSize: 10,
                                                                background:
                                                                    "var(--n100)",
                                                                padding:
                                                                    "2px 6px",
                                                                borderRadius: 4,
                                                            }}
                                                        >
                                                            {a.ip}
                                                        </code>
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            txt={
                                                                a.status ===
                                                                "success"
                                                                    ? "نجح"
                                                                    : "فشل"
                                                            }
                                                            cls={
                                                                a.status ===
                                                                "success"
                                                                    ? "bg-g"
                                                                    : "bg-r"
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            // ── إعدادات الحساب ──
            case "account":
                return (
                    <div>
                        <div className="profile-header">
                            <div
                                className="pav-big"
                                onClick={() =>
                                    toast("ميزة تغيير الصورة قريباً", "inf")
                                }
                            >
                                {d.me.name[0]}
                                <div className="pav-edit">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        width={10}
                                        height={10}
                                    >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <div className="profile-name">{d.me.name}</div>
                                <div className="profile-role">
                                    {d.me.role} · مجمع الجامع
                                </div>
                                <div className="ps">
                                    {[
                                        { n: 847, l: "يوم في المنصة" },
                                        { n: 3, l: "مجمعات" },
                                        { n: d.audit.length, l: "إجراء مسجّل" },
                                        {
                                            n: d.tasks.filter(
                                                (t: Task) => t.done,
                                            ).length,
                                            l: "مهمة مكتملة",
                                        },
                                    ].map((s, i) => (
                                        <div key={i} className="ps-item">
                                            <div className="ps-num">{s.n}</div>
                                            <div className="ps-l">{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="g2">
                            <div>
                                <div className="widget">
                                    <div className="wh">
                                        <div className="wh-l">
                                            المعلومات الشخصية
                                        </div>
                                    </div>
                                    <div className="wb">
                                        <FG label="الاسم الكامل">
                                            <FI
                                                id="accName"
                                                defaultValue={d.me.name}
                                            />
                                        </FG>
                                        <FR2>
                                            <FG label="البريد الإلكتروني">
                                                <FI
                                                    id="accEmail"
                                                    type="email"
                                                    defaultValue={d.me.email}
                                                />
                                            </FG>
                                            <FG label="رقم الجوال">
                                                <FI
                                                    id="accPhone"
                                                    type="tel"
                                                    defaultValue={d.me.phone}
                                                />
                                            </FG>
                                        </FR2>
                                        <FG label="الدور">
                                            <FSel
                                                id="accRole"
                                                opts={[
                                                    "مشرف عام",
                                                    "مشرف",
                                                    "معلم",
                                                    "مالي",
                                                ]}
                                                defaultValue={d.me.role}
                                            />
                                        </FG>
                                        <FG label="نبذة عني">
                                            <FTA
                                                id="accBio"
                                                defaultValue={d.me.bio}
                                            />
                                        </FG>
                                        <button
                                            className="btn bp"
                                            onClick={saveAccount}
                                        >
                                            حفظ التغييرات
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div
                                    className="widget"
                                    style={{ marginBottom: 12 }}
                                >
                                    <div className="wh">
                                        <div className="wh-l">
                                            الأمان وكلمة المرور
                                        </div>
                                    </div>
                                    <div className="wb">
                                        <FG label="كلمة المرور الحالية">
                                            <FI id="accPwOld" type="password" />
                                        </FG>
                                        <FR2>
                                            <FG label="كلمة المرور الجديدة">
                                                <FI
                                                    id="accPwNew"
                                                    type="password"
                                                />
                                            </FG>
                                            <FG label="تأكيد كلمة المرور">
                                                <FI
                                                    id="accPwCon"
                                                    type="password"
                                                />
                                            </FG>
                                        </FR2>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: 10,
                                                background: "var(--g50)",
                                                border: "1px solid var(--g100)",
                                                borderRadius: 9,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    التحقق الثنائي (2FA)
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: "var(--n400)",
                                                    }}
                                                >
                                                    حماية إضافية لحسابك
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 7,
                                                }}
                                            >
                                                <Badge txt="مفعّل" cls="bg-g" />
                                                <button className="btn bs bsm">
                                                    إدارة
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="btn bp"
                                            onClick={savePw}
                                        >
                                            تحديث كلمة المرور
                                        </button>
                                    </div>
                                </div>
                                <div className="widget">
                                    <div className="wh">
                                        <div className="wh-l">
                                            الإشعارات والتفضيلات
                                        </div>
                                    </div>
                                    <div
                                        className="wb"
                                        style={{ padding: "0 14px" }}
                                    >
                                        {d.prefs.map((p: Pref, i: number) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    padding: "10px 0",
                                                    borderBottom:
                                                        "1px solid var(--n100)",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {p.label}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "var(--n400)",
                                                        }}
                                                    >
                                                        {p.desc}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`sw${p.on ? " on" : ""}`}
                                                    onClick={() =>
                                                        togglePref(i)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="empty">
                        <p>الصفحة غير موجودة</p>
                    </div>
                );
        }
    };

    // ============================================================
    // 10. MODAL RENDERER — عرض نوافذ الإضافة/التفاصيل
    // ============================================================
    const renderModal = () => {
        if (!modal) return null;
        const { type, param } = modal;
        const teacherNames = data.teachers.map((t: Teacher) => t.name);
        const studentNames = data.students.map((s: Student) => s.name);
        const circleNames = data.circles.map((c: Circle) => c.name);

        interface ModalConfig {
            title: string;
            body: JSX.Element;
            foot: JSX.Element;
            size?: string;
        }
        const configs: Record<string, ModalConfig> = {
            // ── إضافة طالب ──
            addStudent: {
                title: "إضافة طالب جديد",
                body: (
                    <>
                        <FR2>
                            <FG label="الاسم الكامل">
                                <FI
                                    id="nsName"
                                    placeholder="منصور ترك التميمي"
                                />
                            </FG>
                            <FG label="رقم الهوية">
                                <FI id="nsId" placeholder="1234567890" />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="الحلقة">
                                <FSel
                                    id="nsCircle"
                                    opts={[...circleNames, "—"]}
                                />
                            </FG>
                            <FG label="اسم ولي الأمر">
                                <FI id="nsParent" />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="جوال ولي الأمر">
                                <FI id="nsPhone" type="tel" />
                            </FG>
                            <FG label="المصروفات (ر.س)">
                                <FI id="nsFees" type="number" />
                            </FG>
                        </FR2>
                        <FG label="ملاحظات">
                            <FTA id="nsNote" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addStudentFn}>
                            إضافة الطالب
                        </button>
                    </>
                ),
            },

            // ── إضافة حلقة ──
            addCircle: {
                title: "حلقة قرآنية جديدة",
                body: (
                    <>
                        <FG label="اسم الحلقة">
                            <FI
                                id="ecName"
                                placeholder="مثال: حلقة النور للتحفيظ"
                            />
                        </FG>
                        <FR2>
                            <FG label="المجمع">
                                <FSel id="ecCenter" opts={["مجمع الجامع"]} />
                            </FG>
                            <FG label="المعلم">
                                <FSel
                                    id="ecTeacher"
                                    opts={["—", ...teacherNames]}
                                />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="نوع الحلقة">
                                <FSel
                                    id="ecType"
                                    opts={["تحفيظ", "مراجعة", "مختلط"]}
                                />
                            </FG>
                            <FG label="الحد الأقصى">
                                <FI id="ecMax" type="number" placeholder="30" />
                            </FG>
                        </FR2>
                        <FG label="وصف الحلقة">
                            <FTA id="ecDesc" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addCircleFn}>
                            إنشاء الحلقة
                        </button>
                    </>
                ),
            },

            // ── إضافة خطة ──
            addPlan: {
                title: "خطة دراسية جديدة",
                body: (
                    <>
                        <FG label="اسم الخطة">
                            <FI
                                id="pName"
                                placeholder="مثال: خطة حفظ الجزء 29"
                            />
                        </FG>
                        <FR2>
                            <FG label="المجمع">
                                <FSel id="pCenter" opts={["مجمع الجامع"]} />
                            </FG>
                            <FG label="المدة">
                                <FI id="pDur" placeholder="1 شهر" />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="الهدف اليومي (أسطر)">
                                <FI id="pHifz" type="number" placeholder="5" />
                            </FG>
                            <FG label="المراجعة (أوجه)">
                                <FI
                                    id="pReview"
                                    type="number"
                                    placeholder="2"
                                />
                            </FG>
                        </FR2>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addPlanFn}>
                            إنشاء الخطة
                        </button>
                    </>
                ),
            },

            // ── إضافة موظف ──
            addTeacher: {
                title: "إضافة موظف/معلم جديد",
                body: (
                    <>
                        <FR2>
                            <FG label="الاسم الكامل">
                                <FI id="etName" />
                            </FG>
                            <FG label="البريد الإلكتروني">
                                <FI id="etEmail" type="email" />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="الدور">
                                <FSel
                                    id="etRole"
                                    opts={[
                                        "معلم قرآن",
                                        "مشرف",
                                        "مشرفة",
                                        "محفز",
                                        "مالي",
                                        "شؤون الطلاب",
                                    ]}
                                />
                            </FG>
                            <FG label="رقم الجوال">
                                <FI id="etPhone" type="tel" />
                            </FG>
                        </FR2>
                        <FG label="كلمة المرور المؤقتة">
                            <FI id="etPw" type="password" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addTeacherFn}>
                            إضافة
                        </button>
                    </>
                ),
            },

            // ── إضافة مهمة ──
            addTask: {
                title: "مهمة جديدة",
                body: (
                    <>
                        <FG label="عنوان المهمة">
                            <FI
                                id="tTitle"
                                placeholder="مثال: مراجعة الرواتب"
                            />
                        </FG>
                        <FR2>
                            <FG label="المسند إليه">
                                <FI id="tAssignee" />
                            </FG>
                            <FG label="الدور">
                                <FSel
                                    id="tRole"
                                    opts={[
                                        "مشرف",
                                        "معلم",
                                        "مالي",
                                        "محفز",
                                        "شؤون الطلاب",
                                    ]}
                                />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="الأولوية">
                                <FSel
                                    id="tPriority"
                                    opts={["عالية", "متوسطة", "منخفضة"]}
                                />
                            </FG>
                            <FG label="الموعد">
                                <FI id="tDue" type="date" />
                            </FG>
                        </FR2>
                        <FG label="تفاصيل المهمة">
                            <FTA id="tNotes" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addTaskFn}>
                            إضافة المهمة
                        </button>
                    </>
                ),
            },

            // ── تسجيل حضور ──
            recordAtt: {
                title: "تسجيل حضور",
                body: (
                    <>
                        <FG label="الموظف">
                            <FSel id="atEmp" opts={teacherNames} />
                        </FG>
                        <FR2>
                            <FG label="الحالة">
                                <FSel
                                    id="atSt"
                                    opts={["حاضر", "متأخر", "غائب"]}
                                />
                            </FG>
                            <FG label="وقت الحضور">
                                <FI id="atTime" type="time" />
                            </FG>
                        </FR2>
                        <FG label="ملاحظات">
                            <FI id="atNote" type="text" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={recordAttFn}>
                            تسجيل
                        </button>
                    </>
                ),
            },

            // ── إضافة موعد ──
            addSchedule: {
                title: "إضافة موعد حلقة",
                body: (
                    <>
                        <FG label="الحلقة">
                            <FSel id="scCircle" opts={circleNames} />
                        </FG>
                        <FR2>
                            <FG label="وقت البداية">
                                <FI id="scStart" type="time" />
                            </FG>
                            <FG label="وقت النهاية">
                                <FI id="scEnd" type="time" />
                            </FG>
                        </FR2>
                        <FG label="الأيام">
                            <FI id="scDays" placeholder="يومي، إثنين/خميس..." />
                        </FG>
                        <FG label="السعة القصوى">
                            <FI id="scCap" placeholder="غير محدود" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addScheduleFn}>
                            حفظ الموعد
                        </button>
                    </>
                ),
            },

            // ── إضافة إنجاز ──
            addIncentive: {
                title: "إضافة إنجاز طالب",
                body: (
                    <>
                        <FG label="الطالب">
                            <FSel id="incStudent" opts={studentNames} />
                        </FG>
                        <FR2>
                            <FG label="النقاط">
                                <FI
                                    id="incPts"
                                    type="number"
                                    placeholder="50"
                                />
                            </FG>
                            <FG label="النوع">
                                <FSel id="incType" opts={["إضافة", "خصم"]} />
                            </FG>
                        </FR2>
                        <FR2>
                            <FG label="التصنيف">
                                <FSel
                                    id="incCat"
                                    opts={["عام", "حفظ", "حضور", "سلوك"]}
                                />
                            </FG>
                            <FG label="السبب">
                                <FI id="incReason" />
                            </FG>
                        </FR2>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addIncentiveFn}>
                            حفظ الإنجاز
                        </button>
                    </>
                ),
            },

            // ── إضافة مسجد ──
            addMosque: {
                title: "إضافة مسجد جديد",
                body: (
                    <>
                        <FG label="اسم المسجد">
                            <FI id="mqName" placeholder="مسجد الرحمن" />
                        </FG>
                        <FR2>
                            <FG label="المجمع">
                                <FSel id="mqCenter" opts={["مجمع الجامع"]} />
                            </FG>
                            <FG label="المشرف">
                                <FSel id="mqSup" opts={teacherNames} />
                            </FG>
                        </FR2>
                        <FG label="العنوان">
                            <FI id="mqAddr" placeholder="الحي، المدينة" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addMosqueFn}>
                            إرسال للاعتماد
                        </button>
                    </>
                ),
            },

            // ── قاعدة راتب ──
            addSalaryRule: {
                title: "قاعدة راتب جديدة",
                body: (
                    <>
                        <FG label="الدور">
                            <FSel
                                id="srRole"
                                opts={[
                                    "مدرس",
                                    "مشرف",
                                    "محفز",
                                    "شؤون الطلاب",
                                    "مالي",
                                ]}
                            />
                        </FG>
                        <FR2>
                            <FG label="الراتب الأساسي (ر.س)">
                                <FI
                                    id="srBase"
                                    type="number"
                                    placeholder="4500"
                                />
                            </FG>
                            <FG label="أيام العمل">
                                <FI
                                    id="srDays"
                                    type="number"
                                    placeholder="26"
                                />
                            </FG>
                        </FR2>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addSalaryRuleFn}>
                            إضافة
                        </button>
                    </>
                ),
            },

            // ── راتب مخصص ──
            addCustomSalary: {
                title: "راتب مخصص جديد",
                body: (
                    <>
                        <FG label="المعلم">
                            <FSel id="csTeacher" opts={teacherNames} />
                        </FG>
                        <FR2>
                            <FG label="الراتب المخصص (ر.س)">
                                <FI id="csAmount" type="number" />
                            </FG>
                            <FG label="الحالة">
                                <FSel id="csStatus" opts={["نشط", "غير نشط"]} />
                            </FG>
                        </FR2>
                        <FG label="ملاحظات">
                            <FI id="csNote" type="text" />
                        </FG>
                    </>
                ),
                foot: (
                    <>
                        <button
                            className="btn bs"
                            onClick={() => setModal(null)}
                        >
                            إلغاء
                        </button>
                        <button className="btn bp" onClick={addCustomSalaryFn}>
                            إضافة
                        </button>
                    </>
                ),
            },

            // ── عرض ملف طالب ──
            viewStudent: (() => {
                const s = data.students[param ?? 0];
                if (!s)
                    return {
                        title: "ملف الطالب",
                        body: <p>لا يوجد</p>,
                        foot: (
                            <button
                                className="btn bs"
                                onClick={() => setModal(null)}
                            >
                                إغلاق
                            </button>
                        ),
                    };
                return {
                    title: "ملف الطالب",
                    size: "lg",
                    body: (
                        <>
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: 18,
                                }}
                            >
                                <Av name={s.name} size={64} idx={param ?? 0} />
                                <div style={{ marginTop: 9 }}>
                                    <div
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {s.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        {s.circle || "غير محدد"}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4,1fr)",
                                    gap: 9,
                                    marginBottom: 14,
                                }}
                            >
                                {[
                                    {
                                        n: s.att + "%",
                                        l: "الحضور",
                                        bg: "var(--g50)",
                                        bc: "var(--g100)",
                                        c: "var(--g600)",
                                    },
                                    {
                                        n: s.fees + " ر.س",
                                        l: "المصروفات",
                                        bg: "var(--n100)",
                                        bc: "var(--n200)",
                                        c: "var(--n900)",
                                    },
                                    {
                                        n: s.pts,
                                        l: "النقاط",
                                        bg: "#ede9fe",
                                        bc: "#ddd6fe",
                                        c: "#7c3aed",
                                    },
                                    {
                                        n: s.idNum,
                                        l: "رقم الهوية",
                                        bg: "var(--n100)",
                                        bc: "var(--n200)",
                                        c: "var(--n900)",
                                    },
                                ].map((k, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            textAlign: "center",
                                            background: k.bg,
                                            borderRadius: 9,
                                            padding: 11,
                                            border: `1px solid ${k.bc}`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 19,
                                                fontWeight: 900,
                                                color: k.c,
                                            }}
                                        >
                                            {k.n}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "var(--n400)",
                                            }}
                                        >
                                            {k.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    background: "var(--n50)",
                                    borderRadius: 9,
                                    padding: 11,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "10.5px",
                                        fontWeight: 700,
                                        color: "var(--n400)",
                                        marginBottom: 6,
                                    }}
                                >
                                    ولي الأمر
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>
                                    {s.parent}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "var(--n400)",
                                    }}
                                >
                                    {s.parentPhone}
                                </div>
                            </div>
                        </>
                    ),
                    foot: (
                        <>
                            <button
                                className="btn bs"
                                onClick={() => setModal(null)}
                            >
                                إغلاق
                            </button>
                        </>
                    ),
                };
            })(),
        };

        const cfg = configs[type];
        if (!cfg) return null;
        return (
            <div
                className="ov on"
                onClick={(e) => {
                    if (e.target === e.currentTarget) setModal(null);
                }}
            >
                <div className={`modal${cfg.size ? " " + cfg.size : ""}`}>
                    <div className="mh">
                        <span className="mh-t">{cfg.title}</span>
                        <button className="mx" onClick={() => setModal(null)}>
                            <span
                                style={{
                                    width: 12,
                                    height: 12,
                                    display: "inline-flex",
                                }}
                            >
                                {ICO.x}
                            </span>
                        </button>
                    </div>
                    <div className="mb">{cfg.body}</div>
                    <div className="mf">{cfg.foot}</div>
                </div>
            </div>
        );
    };

    // ============================================================
    // 11. MAIN RENDER — التركيب النهائي للـ UI
    // ============================================================
    return (
        <>
            {/* ── CSS مضمّن في الصفحة ── */}
            <style>{CSS}</style>

            <div style={{ direction: "rtl" }} className="app">
                {/* ── خلفية لوحة الإشعارات ── */}
                {notifOpen && (
                    <div
                        className="np-bg on"
                        onClick={() => setNotifOpen(false)}
                    />
                )}

                {/* ── لوحة الإشعارات ── */}
                <div className={`np${notifOpen ? " on" : ""}`}>
                    <div className="np-head">
                        <span className="np-t">الإشعارات</span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                className="btn bs bxs"
                                onClick={markAllRead}
                            >
                                تعليم كمقروء
                            </button>
                            <button
                                className="mx"
                                onClick={() => setNotifOpen(false)}
                            >
                                <span
                                    style={{
                                        width: 12,
                                        height: 12,
                                        display: "inline-flex",
                                    }}
                                >
                                    {ICO.x}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="np-list">
                        {data.notifs.map((n: Notif, i: number) => (
                            <div
                                key={i}
                                className={`npi${n.unread ? " unread" : ""}`}
                                onClick={() => markRead(i)}
                            >
                                <div
                                    className="npi-ico"
                                    style={{ background: n.col }}
                                >
                                    <span
                                        style={{
                                            color: n.ico_col,
                                            width: 14,
                                            height: 14,
                                            display: "inline-flex",
                                        }}
                                    >
                                        {n.ico === "user"
                                            ? ICO.person
                                            : n.ico === "star"
                                              ? ICO.star
                                              : n.ico === "money"
                                                ? ICO.money
                                                : n.ico === "clip"
                                                  ? ICO.clip
                                                  : ICO.info}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        className="npi-tx"
                                        dangerouslySetInnerHTML={{
                                            __html: n.txt,
                                        }}
                                    />
                                    <div className="npi-tm">{n.time}</div>
                                </div>
                                {n.unread && <div className="npi-dot" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── نافذة التأكيد (حذف / إجراء خطير) ── */}
                {confirm && (
                    <div
                        className="conf-ov on"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 3000,
                            background: "rgba(0,0,0,.5)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className="conf-box">
                            <div className="conf-ico">
                                <span
                                    style={{
                                        width: 22,
                                        height: 22,
                                        display: "inline-flex",
                                        color: "var(--red)",
                                    }}
                                >
                                    {ICO.trash}
                                </span>
                            </div>
                            <div className="conf-t">{confirm.title}</div>
                            <div className="conf-d">
                                {confirm.desc ||
                                    "هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع."}
                            </div>
                            <div className="conf-acts">
                                <button
                                    className="btn bd"
                                    onClick={() => {
                                        confirm.cb();
                                        setConfirm(null);
                                    }}
                                >
                                    تأكيد
                                </button>
                                <button
                                    className="btn bs"
                                    onClick={() => setConfirm(null)}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── المودال ── */}
                {renderModal()}

                {/* ── Toast notifications ── */}
                <div
                    id="toasts"
                    style={{
                        position: "fixed",
                        bottom: 72,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 4000,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        pointerEvents: "none",
                    }}
                >
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            className={`toast ${t.type}`}
                            style={{ pointerEvents: "all" }}
                        >
                            <span
                                style={{
                                    width: 13,
                                    height: 13,
                                    display: "inline-flex",
                                    flexShrink: 0,
                                }}
                            >
                                {t.type === "ok" ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                        width={13}
                                        height={13}
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : t.type === "err" ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        width={13}
                                        height={13}
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                ) : t.type === "warn" ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        width={13}
                                        height={13}
                                    >
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line
                                            x1="12"
                                            y1="17"
                                            x2="12.01"
                                            y2="17"
                                        />
                                    </svg>
                                ) : (
                                    ICO.info
                                )}
                            </span>
                            {t.msg}
                        </div>
                    ))}
                </div>

                {/* ── Overlay موبايل للـ Sidebar ── */}
                {mobileSB && (
                    <div
                        className="sb-overlay on"
                        onClick={() => setMobileSB(false)}
                    />
                )}

                {/* ══════════════════════════════════════════════════
            SIDEBAR — الشريط الجانبي
        ══════════════════════════════════════════════════ */}
                <aside
                    className={`sb${sidebarMini ? " mini" : ""}${mobileSB ? " mobile-open" : ""}`}
                >
                    {/* Logo + طي الـ sidebar */}
                    <div
                        className="sb-brand"
                        onClick={() => setSidebarMini((p) => !p)}
                        title="طي القائمة"
                    >
                        <div className="sb-logo">
                            <svg viewBox="0 0 24 24" fill="#fff">
                                <path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                            </svg>
                        </div>
                        <span className="sb-brand-name sb-lbl">
                            إتقان<span style={{ color: "var(--g400)" }}>.</span>
                        </span>
                    </div>
                    {/* معلومات المجمع */}
                    <div className="sb-academy sb-lbl">
                        <div
                            style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--g400)",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 3,
                            }}
                        >
                            المجمع الحالي
                        </div>
                        <div className="sba-n">مجمع الجامع</div>
                        <div className="sba-r">أحمد ناصر مصطفي · مشرف عام</div>
                    </div>
                    {/* روابط التنقل */}
                    <div className="sb-scroll">
                        <nav className="sb-nav">
                            {NAV_ITEMS.map((sec) => (
                                <div key={sec.sec}>
                                    <div className="sb-section sb-lbl">
                                        {sec.sec}
                                    </div>
                                    <nav className="sb-nav">
                                        {sec.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`sb-nav-item${page === item.id ? " on" : ""}`}
                                                onClick={() => nav(item.id)}
                                            >
                                                <span
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        display: "inline-flex",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {ICO[item.ico]}
                                                </span>
                                                <span className="sb-lbl">
                                                    {item.lbl}
                                                </span>
                                                {item.badge && (
                                                    <span
                                                        className={`sb-badge ${item.badge.cls}`}
                                                    >
                                                        {item.badge.n}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            ))}
                        </nav>
                    </div>
                    {/* معلومات المستخدم في الأسفل */}
                    <div className="sb-bottom">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                className="sb-user"
                                onClick={() => nav("account")}
                                style={{ flex: 1 }}
                            >
                                <div className="sb-av">أ</div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="sb-uname sb-lbl">
                                        {data.me.name
                                            .split(" ")
                                            .slice(0, 2)
                                            .join(" ")}
                                    </div>
                                    <div className="sb-uemail sb-lbl">
                                        مشرف عام
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ══════════════════════════════════════════════════
            MAIN AREA — المنطقة الرئيسية
        ══════════════════════════════════════════════════ */}
                <div className="main-area">
                    {/* TOPBAR */}
                    <div className="topbar">
                        {/* زر القائمة في الموبايل */}
                        <button
                            className="topbar-hamburger"
                            onClick={() => setMobileSB((p) => !p)}
                            style={{ display: "flex" }}
                        >
                            <span
                                style={{
                                    width: 16,
                                    height: 16,
                                    display: "inline-flex",
                                }}
                            >
                                {ICO.menu}
                            </span>
                        </button>
                        {/* عنوان الصفحة */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <div className="tb-title">
                                {PAGE_TITLES[page] || page}
                            </div>
                        </div>
                        {/* بحث سريع */}
                        <div className="tb-search">
                            <span
                                style={{
                                    width: 13,
                                    height: 13,
                                    display: "inline-flex",
                                    color: "var(--n400)",
                                    flexShrink: 0,
                                }}
                            >
                                {ICO.search}
                            </span>
                            <input
                                id="gSearch"
                                placeholder="بحث سريع... (Alt+K)"
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 12,
                                    color: "var(--n800)",
                                    width: "100%",
                                }}
                            />
                        </div>
                        {/* الساعة */}
                        <div className="clk">
                            <div className="clk-t">{clock.t}</div>
                            <div className="clk-d">{clock.d}</div>
                        </div>
                        {/* زر الإشعارات */}
                        <button
                            className="tb-icon"
                            onClick={() => setNotifOpen((p) => !p)}
                            title="الإشعارات"
                            style={{ position: "relative" }}
                        >
                            <span
                                style={{
                                    width: 15,
                                    height: 15,
                                    display: "inline-flex",
                                }}
                            >
                                {ICO.bell}
                            </span>
                            {unreadCount > 0 && (
                                <div className="tb-dot">{unreadCount}</div>
                            )}
                        </button>
                    </div>

                    {/* محتوى الصفحة */}
                    <div className="content">{renderPage()}</div>
                </div>

                {/* ══════════════════════════════════════════════════
            CHAT — زر الدردشة والنافذة المنبثقة
        ══════════════════════════════════════════════════ */}
                {/* زر الدردشة العائم (FAB) */}
                <button
                    className={`chat-fab${chatOpen ? " open" : ""}`}
                    onClick={() => {
                        setChatOpen((p) => !p);
                        if (!chatOpen && !activeRoom && data.chatRooms.length)
                            loadRoom(data.chatRooms[0].id);
                    }}
                >
                    <span
                        style={{
                            width: 22,
                            height: 22,
                            display: "inline-flex",
                            color: "#fff",
                        }}
                    >
                        {ICO.chat}
                    </span>
                    {chatUnread > 0 && !chatOpen && (
                        <div className="cfab-badge">{chatUnread}</div>
                    )}
                </button>

                {/* نافذة الدردشة */}
                <div className={`chat-wrap${chatOpen ? " open" : ""}`}>
                    <div className="chat-inner">
                        {/* رأس نافذة الدردشة */}
                        <div className="chat-topbar">
                            <button
                                className="chat-back"
                                onClick={() => setChatOpen(false)}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "var(--n900)",
                                    }}
                                >
                                    الدردشة الداخلية
                                </div>
                                <div
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--n400)",
                                    }}
                                >
                                    مجمع الجامع · 4 متصلون الآن
                                </div>
                            </div>
                            <button
                                className="tb-btn"
                                onClick={() => setRoomsVisible((p) => !p)}
                                title="إظهار/إخفاء القائمة"
                            >
                                <span
                                    style={{
                                        width: 14,
                                        height: 14,
                                        display: "inline-flex",
                                    }}
                                >
                                    {ICO.chat}
                                </span>
                            </button>
                        </div>

                        <div className="chat-layout">
                            {/* قائمة الغرف */}
                            {roomsVisible && (
                                <div className="rooms-panel">
                                    <div className="rooms-header">
                                        <div className="rooms-search">
                                            <span
                                                style={{
                                                    width: 13,
                                                    height: 13,
                                                    display: "inline-flex",
                                                    color: "var(--n400)",
                                                }}
                                            >
                                                {ICO.search}
                                            </span>
                                            <input
                                                placeholder="بحث..."
                                                value={roomSearch}
                                                onChange={(e) =>
                                                    setRoomSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                style={{
                                                    width: "100%",
                                                    background: "none",
                                                    border: "none",
                                                    fontSize: 11,
                                                    direction: "rtl",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="rooms-list">
                                        {["group", "dm"].map((type) => {
                                            const filtered =
                                                data.chatRooms.filter(
                                                    (r: ChatRoom) =>
                                                        r.type === type &&
                                                        (!roomSearch ||
                                                            r.name.includes(
                                                                roomSearch,
                                                            )),
                                                );
                                            return (
                                                <div key={type}>
                                                    <div className="rooms-sec-label">
                                                        {type === "group"
                                                            ? "المجموعات"
                                                            : "محادثات مباشرة"}
                                                    </div>
                                                    {filtered.map(
                                                        (r: ChatRoom) => {
                                                            const last =
                                                                r.msgs[
                                                                    r.msgs
                                                                        .length -
                                                                        1
                                                                ];
                                                            return (
                                                                <div
                                                                    key={r.id}
                                                                    className={`room-item${r.id === activeRoom ? " active" : ""}`}
                                                                    onClick={() =>
                                                                        loadRoom(
                                                                            r.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <div
                                                                        className="room-av"
                                                                        style={{
                                                                            background:
                                                                                r.color,
                                                                        }}
                                                                    >
                                                                        {r.av}
                                                                        {r.online && (
                                                                            <div className="online-dot" />
                                                                        )}
                                                                    </div>
                                                                    <div className="room-info">
                                                                        <div className="room-name">
                                                                            {
                                                                                r.name
                                                                            }
                                                                        </div>
                                                                        <div className="room-prev">
                                                                            {last
                                                                                ? last.text
                                                                                : ""}
                                                                        </div>
                                                                    </div>
                                                                    <div className="room-meta">
                                                                        <div className="room-time">
                                                                            {last
                                                                                ? last.time
                                                                                : ""}
                                                                        </div>
                                                                        {(r.unread ||
                                                                            0) >
                                                                            0 && (
                                                                            <div className="room-unread">
                                                                                {
                                                                                    r.unread
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* منطقة الرسائل */}
                            <div className="chat-msgs-area">
                                {!activeRoom ? (
                                    <div className="chat-empty-state">
                                        <div className="icon">
                                            <span
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    display: "inline-flex",
                                                    color: "var(--n300)",
                                                }}
                                            >
                                                {ICO.chat}
                                            </span>
                                        </div>
                                        <h3>اختر محادثة للبدء</h3>
                                        <p>اختر مجموعة أو شخصاً من القائمة</p>
                                    </div>
                                ) : (
                                    (() => {
                                        const room = data.chatRooms.find(
                                            (r: ChatRoom) =>
                                                r.id === activeRoom,
                                        );
                                        if (!room) return null;
                                        return (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flex: 1,
                                                    flexDirection: "column",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {/* رأس الغرفة */}
                                                <div className="chat-room-header">
                                                    <div
                                                        className="crh-av"
                                                        style={{
                                                            background:
                                                                room.color,
                                                        }}
                                                    >
                                                        {room.av}
                                                        {room.online && (
                                                            <div className="online-dot" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="crh-name">
                                                            {room.name}
                                                        </div>
                                                        <div className="crh-sub">
                                                            {room.type ===
                                                            "group" ? (
                                                                `مجموعة · ${(room.members || []).length} أعضاء`
                                                            ) : room.online ? (
                                                                <span
                                                                    style={{
                                                                        color: "var(--g500)",
                                                                    }}
                                                                >
                                                                    ● متصل الآن
                                                                </span>
                                                            ) : (
                                                                "غير متصل"
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* الرسائل */}
                                                <div
                                                    className="msgs-list"
                                                    ref={msgsRef}
                                                >
                                                    <div className="msg-date-divider">
                                                        <span>اليوم</span>
                                                    </div>
                                                    {room.msgs.map(
                                                        (
                                                            m: ChatMsg,
                                                            i: number,
                                                        ) => {
                                                            const isFirst =
                                                                i === 0 ||
                                                                room.msgs[i - 1]
                                                                    .from !==
                                                                    m.from;
                                                            const isLast =
                                                                i ===
                                                                    room.msgs
                                                                        .length -
                                                                        1 ||
                                                                room.msgs[i + 1]
                                                                    .from !==
                                                                    m.from;
                                                            return (
                                                                <div key={i}>
                                                                    {isFirst && (
                                                                        <div
                                                                            className={`msg-group ${m.me ? "me" : "them"}`}
                                                                        >
                                                                            {!m.me && (
                                                                                <div className="msg-sender">
                                                                                    {
                                                                                        m.from
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    <div
                                                                        className={`msg-group ${m.me ? "me" : "them"}`}
                                                                    >
                                                                        <div className="msg-bubble">
                                                                            {
                                                                                m.text
                                                                            }
                                                                        </div>
                                                                        {isLast && (
                                                                            <div className="msg-footer">
                                                                                <span>
                                                                                    {
                                                                                        m.time
                                                                                    }
                                                                                </span>
                                                                                {m.me && (
                                                                                    <span className="read-ticks">
                                                                                        ✓✓
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                                {/* حقل الكتابة */}
                                                <div className="chat-input-bar">
                                                    <div className="chat-input-box">
                                                        <textarea
                                                            className="chat-textarea"
                                                            placeholder="اكتب رسالتك هنا..."
                                                            value={chatMsg}
                                                            onChange={(e) =>
                                                                setChatMsg(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                        "Enter" &&
                                                                    !e.shiftKey
                                                                ) {
                                                                    e.preventDefault();
                                                                    sendMsg();
                                                                }
                                                            }}
                                                            rows={1}
                                                        />
                                                    </div>
                                                    <button
                                                        className="chat-send"
                                                        onClick={sendMsg}
                                                    >
                                                        <span
                                                            style={{
                                                                width: 13,
                                                                height: 13,
                                                                display:
                                                                    "inline-flex",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            {ICO.send}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* end .app */}
        </>
    );
}

// ============================================================
// 12. CSS — كل التصميم في متغير واحد
//     (لتغيير الألوان الأساسية: عدّل متغيرات --g في :root)
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

/* ── متغيرات الألوان والأبعاد ── */
:root{
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;--g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;--g800:#083524;
  --br100:#f5e8d5;--br200:#e8cba8;--br300:#c9996a;--br400:#a8733f;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;--n300:#cbd5e1;--n400:#94a3b8;--n500:#64748b;--n600:#475569;--n700:#334155;--n800:#1e293b;--n900:#0f172a;--n950:#060f1e;
  --red:#ef4444;--amber:#f59e0b;--blue:#3b82f6;--purple:#8b5cf6;
  --sw:256px;--th:60px;
  --ease:cubic-bezier(.4,0,.2,1);--spring:cubic-bezier(.34,1.56,.64,1);
}

/* ── reset ── */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{font-size:13.5px;-webkit-tap-highlight-color:transparent;}
body,#root{font-family:'Tajawal',sans-serif;background:var(--n50);color:var(--n800);direction:rtl;overflow:hidden;height:100vh;height:100dvh;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--n200);border-radius:4px;}
button{font-family:'Tajawal',sans-serif;cursor:pointer;border:none;outline:none;}
input,select,textarea{font-family:'Tajawal',sans-serif;outline:none;}

/* ── انيميشن ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
@keyframes bounceIn{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.4)}50%{box-shadow:0 0 0 5px transparent}}
@keyframes tIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes mIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}

/* ── LAYOUT ── */
.app{display:flex;height:100vh;}
.main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}

/* ── SIDEBAR ── */
.sb{width:var(--sw);flex-shrink:0;background:linear-gradient(180deg,var(--n950) 0%,#0a1628 100%);display:flex;flex-direction:column;height:100vh;overflow:hidden;z-index:100;transition:width .28s var(--ease);position:relative;}
.sb::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(30,143,97,.1) 0%,transparent 60%);pointer-events:none;}
.sb.mini{width:54px;}
.sb.mini .sb-lbl,.sb.mini .sb-badge,.sb.mini .sb-academy,.sb.mini .sb-section,.sb.mini .sb-uname,.sb.mini .sb-uemail,.sb.mini .sb-brand-name{display:none;}
.sb.mini .sb-nav-item{justify-content:center;padding:10px 0;}
.sb.mini .sb-user{justify-content:center;}
.sb-brand{padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:9px;cursor:pointer;transition:.2s var(--ease);flex-shrink:0;}
.sb-brand:hover{background:rgba(255,255,255,.04);}
.sb-logo{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--g400),var(--g700));display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-brand-name{font-size:16px;font-weight:900;color:#fff;white-space:nowrap;}
.sb-academy{margin:7px 8px 3px;padding:8px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:9px;}
.sba-n{font-size:11px;font-weight:700;color:#fff;}.sba-r{font-size:10px;color:var(--g300);margin-top:1px;}
.sb-scroll{flex:1;overflow-y:auto;padding-bottom:6px;}
.sb-section{padding:11px 14px 3px;font-size:9px;font-weight:700;color:rgba(255,255,255,.22);text-transform:uppercase;letter-spacing:.8px;white-space:nowrap;}
.sb-nav{display:flex;flex-direction:column;gap:1px;padding:0 5px;}
.sb-nav-item{display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:6px;font-size:11.5px;font-weight:600;color:rgba(255,255,255,.48);cursor:pointer;transition:all .18s var(--ease);position:relative;white-space:nowrap;user-select:none;overflow:hidden;}
.sb-nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.82);}
.sb-nav-item:active{transform:scale(.96);}
.sb-nav-item.on{background:rgba(30,143,97,.2);color:var(--g300);}
.sb-nav-item.on::before{content:'';position:absolute;right:0;top:22%;bottom:22%;width:3px;background:var(--g400);border-radius:3px 0 0 3px;}
.sb-badge{margin-right:auto;font-size:9px;font-weight:700;padding:1px 5px;border-radius:100px;flex-shrink:0;}
.sb-badge.red{background:rgba(239,68,68,.22);color:#fca5a5;}
.sb-badge.grn{background:rgba(30,143,97,.22);color:var(--g300);}
.sb-bottom{padding:7px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;}
.sb-user{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:9px;cursor:pointer;transition:.15s;}
.sb-user:hover{background:rgba(255,255,255,.06);}
.sb-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g600));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;}
.sb-uname{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-uemail{font-size:9.5px;color:rgba(255,255,255,.32);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* ── TOPBAR ── */
.topbar{height:var(--th);border-bottom:1px solid var(--n200);display:flex;align-items:center;gap:8px;padding:0 18px;flex-shrink:0;background:var(--n0);position:sticky;top:0;z-index:50;}
.tb-title{font-size:14px;font-weight:800;color:var(--n900);white-space:nowrap;}
.tb-search{display:flex;align-items:center;gap:7px;background:var(--n100);border:1.5px solid var(--n200);border-radius:9px;padding:6px 12px;min-width:200px;max-width:280px;flex:1;transition:.18s;}
.tb-search:focus-within{border-color:var(--g400);background:var(--n0);}
.tb-icon{width:34px;height:34px;border-radius:9px;background:var(--n100);border:1px solid var(--n200);display:flex;align-items:center;justify-content:center;color:var(--n500);transition:.15s;position:relative;}
.tb-icon:hover{background:var(--n200);color:var(--n800);}
.tb-dot{position:absolute;top:4px;right:4px;width:16px;height:16px;border-radius:50%;background:var(--red);color:#fff;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid var(--n0);}
.clk{text-align:center;line-height:1.2;}
.clk-t{font-size:15px;font-weight:900;color:var(--n800);font-variant-numeric:tabular-nums;}
.clk-d{font-size:9px;color:var(--n400);}

/* ── CONTENT AREA ── */
.content{flex:1;overflow-y:auto;padding:16px;animation:pgIn .3s var(--ease);}

/* ── GRID LAYOUTS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;}

/* ── KPI CARDS ── */
.kpi{background:var(--n0);border:1px solid var(--n200);border-radius:12px;padding:14px;transition:.18s var(--ease);animation:fadeUp .3s var(--ease);}
.kpi:hover{box-shadow:0 4px 20px rgba(0,0,0,.06);transform:translateY(-1px);}
.kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.kpi-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
.kpi-ico svg{width:16px;height:16px;}
.ic-g{background:var(--g100);color:var(--g600);}
.ic-b{background:#dbeafe;color:#2563eb;}
.ic-a{background:#fef3c7;color:#d97706;}
.ic-p{background:#ede9fe;color:#7c3aed;}
.kpi-trend{font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;}
.t-up{background:#dcfce7;color:var(--g600);}
.t-dn{background:#fee2e2;color:var(--red);}
.t-fl{background:var(--n100);color:var(--n500);}
.kpi-num{font-size:22px;font-weight:900;color:var(--n900);letter-spacing:-.5px;}
.kpi-lbl{font-size:10px;color:var(--n400);margin-top:2px;font-weight:600;}

/* ── WIDGET (بطاقة محتوى) ── */
.widget{background:var(--n0);border:1px solid var(--n200);border-radius:12px;overflow:hidden;margin-bottom:12px;animation:fadeUp .3s var(--ease);}
.wh{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--n100);}
.wh-l{font-size:13px;font-weight:800;color:var(--n900);}
.wh-s{font-size:10px;color:var(--n400);margin-top:1px;}
.wb{padding:14px;}

/* ── DARK HERO CARD (بطاقة الحضور الداكنة) ── */
.dark-hero{background:linear-gradient(135deg,var(--n950) 0%,#0a2218 100%);border-radius:14px;padding:2px;overflow:hidden;}
.dhi{padding:18px;background:radial-gradient(ellipse at 30% -20%,rgba(30,143,97,.25) 0%,transparent 60%);}
.att-stats{display:flex;gap:12px;margin-bottom:12px;}
.att-stat{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:9px 12px;text-align:center;}
.att-stat-n{font-size:22px;font-weight:900;color:#fff;}
.att-stat-l{font-size:9px;color:rgba(255,255,255,.45);margin-top:1px;}
.att-timer-big{font-size:28px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:2px;}
.pulse-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;animation:pulse 1.5s infinite;}

/* ── TABLES ── */
table{width:100%;border-collapse:collapse;}
th,td{padding:10px 14px;text-align:right;border-bottom:1px solid var(--n100);}
th{font-size:10.5px;font-weight:700;color:var(--n500);background:var(--n50);}
td{font-size:12px;color:var(--n700);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:var(--n50);}
.tu{display:flex;align-items:center;gap:8px;}
.td-actions{display:flex;gap:5px;flex-wrap:wrap;}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;transition:all .15s var(--ease);}
.btn:active{transform:scale(.96);}
.bp{background:var(--g500);color:#fff;}.bp:hover{background:var(--g600);}
.bs{background:var(--n100);color:var(--n700);border:1px solid var(--n200);}.bs:hover{background:var(--n200);}
.bd{background:#fee2e2;color:var(--red);}.bd:hover{background:#fecaca;}
.bsm{font-size:11px;padding:5px 11px;}
.bxs{font-size:10.5px;padding:4px 9px;}

/* ── BADGES ── */
.badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px;display:inline-flex;align-items:center;}

/* ── FORM INPUTS ── */
.fi{padding:6px 11px;border:1.5px solid var(--n200);border-radius:8px;font-size:12px;background:var(--n0);color:var(--n800);transition:.18s;}
.fi:focus{border-color:var(--g400);box-shadow:0 0 0 3px rgba(30,143,97,.12);}
.fi2{width:100%;padding:8px 11px;border:1.5px solid var(--n200);border-radius:8px;font-size:12px;background:var(--n0);color:var(--n800);direction:rtl;transition:.18s;}
.fi2:focus{border-color:var(--g400);box-shadow:0 0 0 3px rgba(30,143,97,.12);}
.fi2.ta{display:block;}

/* ── TABS ── */
.tabs{display:flex;gap:3px;background:var(--n100);padding:3px;border-radius:8px;}
.tab{padding:4px 11px;border-radius:6px;font-size:11px;font-weight:700;color:var(--n500);cursor:pointer;transition:.15s;}
.tab:hover{color:var(--n800);}
.tab.on{background:var(--n0);color:var(--g600);box-shadow:0 1px 4px rgba(0,0,0,.08);}

/* ── PROGRESS BAR ── */
.prog-wrap{display:flex;align-items:center;gap:7px;}
.prog-bg{flex:1;height:6px;background:var(--n100);border-radius:100px;overflow:hidden;}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--g400),var(--g600));border-radius:100px;transition:width .4s var(--ease);}

/* ── EMPTY STATE ── */
.empty{text-align:center;padding:36px 20px;color:var(--n400);}
.empty p{font-size:13px;margin-bottom:12px;}

/* ── MODAL ── */
.ov{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(6px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .22s;}
.ov.on{opacity:1;pointer-events:all;}
.modal{background:var(--n0);border-radius:16px;width:100%;max-width:460px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;animation:mIn .25s var(--ease);}
.modal.lg{max-width:580px;}
.mh{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--n100);}
.mh-t{font-size:14px;font-weight:800;color:var(--n900);}
.mx{width:26px;height:26px;border-radius:6px;background:var(--n100);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--n500);transition:.15s;}
.mx:hover{background:var(--n200);}
.mb{padding:16px 18px;overflow-y:auto;flex:1;}
.mf{display:flex;gap:8px;justify-content:flex-end;padding:12px 18px;border-top:1px solid var(--n100);}

/* ── CONFIRM BOX ── */
.conf-box{background:var(--n0);border-radius:16px;padding:24px;max-width:360px;width:90%;text-align:center;animation:bounceIn .3s var(--spring);}
.conf-ico{width:52px;height:52px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}
.conf-t{font-size:15px;font-weight:800;color:var(--n900);margin-bottom:6px;}
.conf-d{font-size:11.5px;color:var(--n500);margin-bottom:18px;line-height:1.55;}
.conf-acts{display:flex;gap:9px;justify-content:center;}

/* ── TOAST ── */
.toast{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;font-size:12px;font-weight:700;min-width:200px;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:tIn .28s var(--spring);}
.toast.ok{background:var(--g600);color:#fff;}
.toast.err{background:var(--red);color:#fff;}
.toast.warn{background:#d97706;color:#fff;}
.toast.inf{background:var(--n800);color:#fff;}

/* ── NOTIFICATION PANEL ── */
.np-bg{position:fixed;inset:0;z-index:149;background:rgba(0,0,0,.25);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .22s;}
.np-bg.on{opacity:1;pointer-events:all;}
.np{position:fixed;top:0;left:0;width:320px;height:100vh;background:var(--n0);border-right:1px solid var(--n200);z-index:150;transform:translateX(-100%);transition:transform .28s var(--ease);display:flex;flex-direction:column;box-shadow:4px 0 30px rgba(0,0,0,.1);}
.np.on{transform:translateX(0);}
.np-head{padding:14px 16px;border-bottom:1px solid var(--n200);display:flex;align-items:center;justify-content:space-between;}
.np-t{font-size:14px;font-weight:800;color:var(--n900);}
.np-list{flex:1;overflow-y:auto;}
.npi{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-bottom:1px solid var(--n100);cursor:pointer;transition:.15s;}
.npi:hover{background:var(--n50);}
.npi.unread{background:var(--g50);}
.npi-ico{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.npi-tx{font-size:11.5px;line-height:1.5;color:var(--n700);}
.npi-tm{font-size:10px;color:var(--n400);margin-top:3px;}
.npi-dot{width:7px;height:7px;border-radius:50%;background:var(--g500);flex-shrink:0;margin-top:4px;}

/* ── CHAT FAB ── */
.chat-fab{position:fixed;bottom:22px;left:22px;width:52px;height:52px;border-radius:50%;background:var(--g500);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(30,143,97,.45);transition:all .22s var(--spring);z-index:200;}
.chat-fab:hover{background:var(--g600);transform:scale(1.07);}
.chat-fab.open{background:var(--n800);}
.cfab-badge{position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;font-size:9px;font-weight:800;padding:2px 5px;border-radius:100px;border:2px solid var(--n0);}

/* ── CHAT WINDOW ── */
.chat-wrap{position:fixed;bottom:88px;left:22px;width:520px;height:480px;background:var(--n0);border:1px solid var(--n200);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.15);overflow:hidden;display:flex;flex-direction:column;z-index:200;opacity:0;pointer-events:none;transform:translateY(12px) scale(.97);transition:all .25s var(--spring);}
.chat-wrap.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1);}
.chat-inner{display:flex;flex-direction:column;height:100%;}
.chat-topbar{padding:10px 14px;border-bottom:1px solid var(--n200);display:flex;align-items:center;gap:9px;flex-shrink:0;background:var(--n50);}
.chat-back{width:28px;height:28px;border-radius:7px;background:var(--n100);border:1px solid var(--n200);display:flex;align-items:center;justify-content:center;color:var(--n500);cursor:pointer;transition:.15s;}
.chat-back svg{width:14px;height:14px;}
.tb-btn{width:28px;height:28px;border-radius:6px;background:var(--n100);border:1px solid var(--n200);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--n500);}
.chat-layout{flex:1;display:flex;overflow:hidden;}
.rooms-panel{width:240px;flex-shrink:0;border-left:1px solid var(--n200);display:flex;flex-direction:column;background:var(--n50);overflow:hidden;transition:width .22s;}
.rooms-header{border-bottom:1px solid var(--n200);}
.rooms-search{padding:8px;display:flex;align-items:center;gap:6px;}
.rooms-search input{flex:1;padding:5px 9px;background:var(--n0);border:1.5px solid var(--n200);border-radius:7px;font-size:11px;direction:rtl;}
.rooms-list{flex:1;overflow-y:auto;}
.rooms-sec-label{padding:6px 8px 2px;font-size:9px;font-weight:700;color:var(--n400);text-transform:uppercase;letter-spacing:.5px;}
.room-item{display:flex;align-items:center;gap:6px;padding:8px;cursor:pointer;border-bottom:1px solid var(--n100);transition:.14s;}
.room-item:hover{background:var(--n100);}
.room-item.active{background:var(--g50);border-right:2px solid var(--g500);}
.room-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;position:relative;}
.room-info{flex:1;min-width:0;}
.room-name{font-size:11px;font-weight:700;color:var(--n900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.room-prev{font-size:9.5px;color:var(--n400);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.room-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
.room-time{font-size:9px;color:var(--n400);}
.room-unread{background:var(--red);color:#fff;font-size:8.5px;font-weight:700;padding:1px 5px;border-radius:100px;}
.online-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;border:1.5px solid var(--n0);position:absolute;bottom:0;right:0;}
.chat-msgs-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.chat-empty-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--n400);}
.chat-empty-state .icon{width:64px;height:64px;border-radius:50%;background:var(--n100);display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
.chat-empty-state h3{font-size:13px;font-weight:800;color:var(--n700);}
.chat-empty-state p{font-size:11px;text-align:center;line-height:1.6;}
.chat-room-header{padding:10px 14px;border-bottom:1px solid var(--n200);display:flex;align-items:center;gap:9px;flex-shrink:0;background:var(--n0);}
.crh-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;position:relative;}
.crh-name{font-size:12.5px;font-weight:800;color:var(--n900);}
.crh-sub{font-size:9.5px;color:var(--n400);}
.msgs-list{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:2px;}
.msg-date-divider{text-align:center;margin:8px 0;font-size:10px;color:var(--n400);}
.msg-date-divider span{background:var(--n100);padding:2px 10px;border-radius:100px;}
.msg-group{display:flex;flex-direction:column;margin-bottom:4px;}
.msg-group.me{align-items:flex-end;}
.msg-group.them{align-items:flex-start;}
.msg-sender{font-size:10px;font-weight:700;color:var(--n500);margin-bottom:2px;padding:0 4px;}
.msg-bubble{max-width:75%;padding:8px 12px;border-radius:14px;font-size:12px;line-height:1.55;}
.msg-group.me .msg-bubble{background:var(--g500);color:#fff;border-bottom-left-radius:3px;}
.msg-group.them .msg-bubble{background:var(--n100);color:var(--n800);border-bottom-right-radius:3px;}
.msg-footer{display:flex;align-items:center;gap:4px;font-size:9.5px;padding:2px 4px;}
.msg-group.me .msg-footer{color:rgba(255,255,255,.6);justify-content:flex-end;flex-direction:row-reverse;}
.msg-group.them .msg-footer{color:var(--n400);}
.read-ticks{font-size:11px;color:var(--g300);}
.chat-input-bar{padding:10px 12px;border-top:1px solid var(--n200);display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
.chat-input-box{flex:1;background:var(--n100);border:1.5px solid var(--n200);border-radius:14px;padding:8px 12px;display:flex;align-items:flex-end;gap:6px;transition:.18s;}
.chat-input-box:focus-within{border-color:var(--g400);background:var(--n0);}
.chat-textarea{flex:1;background:none;border:none;font-size:12px;color:var(--n800);resize:none;max-height:110px;direction:rtl;line-height:1.5;}
.chat-send{width:36px;height:36px;border-radius:50%;background:var(--g500);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.14s;flex-shrink:0;}
.chat-send:hover{background:var(--g600);}

/* ── TASKS ── */
.task-item{display:flex;align-items:flex-start;gap:9px;padding:10px;border:1px solid var(--n200);border-radius:9px;margin-bottom:7px;transition:all .18s var(--ease);}
.task-item:hover{border-color:var(--g200);background:var(--g50);transform:translateX(-2px);box-shadow:0 2px 10px rgba(30,143,97,.07);}
.task-item.done{opacity:.5;}
.task-item.done .task-t{text-decoration:line-through;color:var(--n400);}
.task-cb{width:17px;height:17px;border-radius:4px;border:2px solid var(--n300);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.14s;margin-top:1px;}
.task-cb.on{background:var(--g500);border-color:var(--g500);}
.task-t{font-size:12px;font-weight:700;color:var(--n800);}
.task-meta{font-size:10.5px;color:var(--n400);display:flex;gap:9px;flex-wrap:wrap;margin-top:2px;}
.pr{font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:100px;}
.pr-h{background:#fee2e2;color:var(--red);}
.pr-m{background:#fef3c7;color:#92400e;}
.pr-l{background:var(--g100);color:var(--g700);}

/* ── ACCOUNT / PROFILE ── */
.profile-header{background:var(--n0);border:1px solid var(--n200);border-radius:14px;padding:20px;display:flex;align-items:center;gap:16px;margin-bottom:12px;}
.pav-big{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,var(--g400),var(--g600));display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;position:relative;cursor:pointer;flex-shrink:0;}
.pav-edit{position:absolute;bottom:0;right:0;width:20px;height:20px;border-radius:50%;background:var(--g500);border:2px solid var(--n0);display:flex;align-items:center;justify-content:center;}
.profile-name{font-size:16px;font-weight:900;color:var(--n900);}
.profile-role{font-size:11px;color:var(--n400);margin-top:1px;}
.ps{display:flex;gap:18px;margin-top:9px;flex-wrap:wrap;}
.ps-item{display:flex;flex-direction:column;gap:2px;}
.ps-num{font-size:15px;font-weight:900;color:var(--n900);}
.ps-l{font-size:9.5px;color:var(--n400);}

/* ── TOGGLE SWITCH ── */
.sw{width:36px;height:20px;border-radius:100px;background:var(--n300);cursor:pointer;position:relative;transition:.2s;flex-shrink:0;}
.sw.on{background:var(--g500);}
.sw::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:3px;right:3px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.sw.on::after{right:calc(100% - 17px);}

/* ── MOBILE SIDEBAR OVERLAY ── */
.sb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:99;display:none;}
.sb-overlay.on{display:block;animation:fadeIn .22s var(--ease);}
.topbar-hamburger{width:36px;height:36px;border-radius:9px;background:var(--n100);border:1px solid var(--n200);align-items:center;justify-content:center;color:var(--n600);transition:.18s;display:none;}

/* ── RESPONSIVE ── */
@media(max-width:1024px){.kpi-grid{grid-template-columns:repeat(2,1fr);}.g2{grid-template-columns:1fr;}}
@media(max-width:768px){
  body{overflow:auto;}
  :root{--sw:256px;}
  .sb{position:fixed;transform:translateX(100%);z-index:300;transition:transform .3s var(--ease);}
  .sb.mobile-open{transform:translateX(0);}
  .topbar-hamburger{display:flex !important;}
  .content{padding:10px;}
  .kpi-grid{grid-template-columns:1fr 1fr;}
  .tb-search{display:none;}
  .clk{display:none;}
}
`;
