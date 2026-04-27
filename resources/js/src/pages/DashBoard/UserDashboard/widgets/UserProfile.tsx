// UserProfile.tsx - الكود كامل مع كل الـ Widgets الجديدة
import React, { useState, useEffect } from "react";
import { useAuthUser } from "./hooks/useAuthUser";
import PlanCards from "../plans/models/PlanCards";
import UserMeetCard from "../userMeet/UserMeetCard";
import EmailVerifyWidget from "./EmailVerifyWidget";
import GuardianChildrenPage from "../GuardianChildren/GuardianChildrenPage";
import { ICO } from "../../icons"; // افترض موجود
import UserPlans from "../userPlans/UserPlans";

const UserProfile: React.FC = () => {
    const { user, loading } = useAuthUser();

    // ✅ بيانات تجريبية (استبدلها بالـ API calls)
    const [BADGES, setBADGES] = useState([
        {
            id: 1,
            name: "القارئ المتميز",
            icon: "📖",
            desc: "قراءة 10 أجزاء",
            earned: true,
            color: "#10b981",
        },
        {
            id: 2,
            name: "الحافظ البارع",
            icon: "⭐",
            desc: "حفظ 5 أجزاء",
            earned: true,
            color: "#f59e0b",
        },
        {
            id: 3,
            name: "الملتزم",
            icon: "👑",
            desc: "حضور 100%",
            earned: false,
            color: "#8b5cf6",
        },
        {
            id: 4,
            name: "النقاط الذهبية",
            icon: "💎",
            desc: "2500 نقطة",
            earned: false,
            color: "#ef4444",
        },
    ]);
    const earned = BADGES.filter((b) => b.earned).length;

    const STUDENT = {
        quranProgress: 42,
        pts: 1247,
        totalPts: 2500,
    };
    const attRate = "98%";
    const pres = 47;
    const ATT = Array(50).fill(0);

    const RECS = [
        {
            id: 1,
            date: "2026-03-29",
            surah: "الفاتحة",
            from: "1",
            to: "7",
            grade: "ممتاز",
            note: "تسميع رائع",
        },
        {
            id: 2,
            date: "2026-03-28",
            surah: "البقرة",
            from: "1",
            to: "5",
            grade: "جيد جداً",
            note: "تحسن ملحوظ",
        },
        {
            id: 3,
            date: "2026-03-27",
            surah: "آل عمران",
            from: "1",
            to: "3",
            grade: "جيد",
            note: "",
        },
    ];

    // ✅ Helper Components
    const PBar = ({
        pct,
        h = 6,
        color = "var(--g500)",
    }: {
        pct: number;
        h?: number;
        color?: string;
    }) => (
        <div
            style={{
                height: h,
                background: "var(--n100)",
                borderRadius: 100,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    height: "100%",
                    width: `${Math.min(pct, 100)}%`,
                    background: color,
                    borderRadius: 100,
                    transition: "width .6s ease",
                }}
            />
        </div>
    );

    const WG = ({ children }: { children: React.ReactNode }) => (
        <div className="widget">{children}</div>
    );
    const WH = ({ t, right }: { t: string; right?: React.ReactNode }) => (
        <div className="wh">
            <span className="wh-t">{t}</span>
            {right}
        </div>
    );
    const Chip = ({
        children,
        bg = "var(--n100)",
        col = "var(--n600)",
    }: {
        children: React.ReactNode;
        bg?: string;
        col?: string;
    }) => (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 9px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 700,
                background: bg,
                color: col,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </span>
    );

    const onBadges = () => {
        // افتح صفحة الأوسمة
        console.log("عرض الأوسمة");
    };

    // ✅ WelcomeCard Component
    const WelcomeCard = ({
        userData,
        isLoading,
    }: {
        userData?: any;
        isLoading?: boolean;
    }) => {
        const STUDENT_LOCAL = {
            name: "عبدالله القحطاني",
            email: "abdullah@example.com",
            progress: 85,
            pts: 247,
        };
        const attRate_LOCAL = "98%";

        return (
            <div className="welcome-card">
                <div className="wc-left">
                    <div className="wc-av">
                        {isLoading ? (
                            <div className="animate-pulse bg-gray-200 w-12 h-12 rounded-full" />
                        ) : (
                            userData?.name?.[0] || STUDENT_LOCAL.name[0]
                        )}
                    </div>
                    <div>
                        <div className="wc-name">
                            {isLoading ? (
                                <div className="animate-pulse bg-gray-200 h-6 w-64 rounded-md" />
                            ) : (
                                userData?.name || STUDENT_LOCAL.name
                            )}
                        </div>
                        <div className="wc-email" dir="ltr">
                            {isLoading ? (
                                <div className="animate-pulse bg-gray-200 h-4 w-48 rounded-md" />
                            ) : (
                                STUDENT_LOCAL.email
                            )}
                        </div>
                    </div>
                </div>
                <div className="wc-stats">
                    {[
                        {
                            l: "التقدم",
                            v:
                                (userData?.progress || STUDENT_LOCAL.progress) +
                                "%",
                        },
                        { l: "النقاط", v: STUDENT_LOCAL.pts },
                        { l: "الحضور", v: attRate_LOCAL },
                    ].map((s, i) => (
                        <div key={i} className="wc-stat">
                            <div className="wc-snum">{s.v}</div>
                            <div className="wc-slbl">{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // الشروط لعرض GuardianChildrenPage
    const isGuardian = user?.role?.name === "guardian" || user?.role_id === 2;
    const showGuardianChildren = isGuardian && !loading;

    return (
        <div
            className="content"
            id="contentArea"
            style={{ backgroundAttachment: "transparent", border: "none" }}
        >
            <div
                className="page-body"
                style={{ backgroundAttachment: "transparent", border: "none" }}
            >
                {/* ✅ WelcomeCard */}
                <div className="userProfile__features">
                    <WelcomeCard userData={user} isLoading={loading} />
                </div>
                <UserMeetCard />

                {/* ✅ BADGES PREVIEW */}
                <WG>
                    <WH
                        t="أوسمتي"
                        right={
                            <button className="pill-btn" onClick={onBadges}>
                                عرض الكل ({earned}/{BADGES.length})
                            </button>
                        }
                    />
                    <div className="wb">
                        <div className="badges-row">
                            {BADGES.map((b) => (
                                <div
                                    key={b.id}
                                    className={`badge-item${b.earned ? " earned" : " locked"}`}
                                    title={b.desc}
                                >
                                    <div
                                        className="badge-ico"
                                        style={{
                                            background: b.earned
                                                ? b.color
                                                : "var(--n100)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 22,
                                                filter: b.earned
                                                    ? "none"
                                                    : "grayscale(1) opacity(.3)",
                                            }}
                                        >
                                            {b.icon}
                                        </span>
                                        {b.earned && (
                                            <div className="badge-ck">
                                                {ICO.check}
                                            </div>
                                        )}
                                    </div>
                                    <div className="badge-lbl">{b.name}</div>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginTop: 10,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "var(--n500)",
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}
                            >
                                {earned}/{BADGES.length} وسام
                            </span>
                            <PBar
                                pct={(earned / BADGES.length) * 100}
                                h={5}
                                color="linear-gradient(90deg,var(--g300),var(--g500))"
                            />
                        </div>
                    </div>
                </WG>

                {/* ✅ MINI STATS */}
                <div className="grid3">
                    {[
                        {
                            t: "تقدم القرآن",
                            v: STUDENT.quranProgress + "%",
                            sub: "من المصحف الشريف",
                            c: "var(--g600)",
                            bar: STUDENT.quranProgress,
                            barColor:
                                "linear-gradient(90deg,var(--g300),var(--g500))",
                        },
                        {
                            t: "نقاطي",
                            v: STUDENT.pts + "",
                            sub: `من أصل ${STUDENT.totalPts}`,
                            c: "#7c3aed",
                            bar: (STUDENT.pts / STUDENT.totalPts) * 100,
                            barColor: "linear-gradient(90deg,#a78bfa,#7c3aed)",
                        },
                        {
                            t: "الحضور",
                            v: attRate + "%",
                            sub: `${pres} من ${ATT.length} جلسة`,
                            c: "var(--blue)",
                            bar: parseFloat(attRate),
                            barColor: "linear-gradient(90deg,#93c5fd,#3b82f6)",
                        },
                    ].map((s, i) => (
                        <WG key={i}>
                            <WH t={s.t} />
                            <div className="wb">
                                <div
                                    style={{
                                        fontSize: 34,
                                        fontWeight: 900,
                                        color: s.c,
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.v}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "var(--n400)",
                                        margin: "5px 0 10px",
                                    }}
                                >
                                    {s.sub}
                                </div>
                                <PBar pct={s.bar} h={8} color={s.barColor} />
                            </div>
                        </WG>
                    ))}
                </div>

                {/* ✅ LATEST REC */}
                <WG>
                    <UserPlans />
                </WG>

                {/* GuardianChildrenPage */}
                {showGuardianChildren && <GuardianChildrenPage />}
                {/*
            <PlanCards type="my-plans" />
            <PlanCards type="available" /> */}
            </div>
        </div>
    );
};

export default UserProfile;
