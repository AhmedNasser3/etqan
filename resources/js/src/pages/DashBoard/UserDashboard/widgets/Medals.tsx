// Medals.tsx - ديزاين بأسلوب BadgesFullPage
import { FaMedal } from "react-icons/fa";
import { ReactNode, useState } from "react";
import { useStudentProgress } from "../userProgress/hooks/useStudentProgress";

// ✅ Helper Components من BadgesFullPage
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

const Empty = ({ icon, title }: { icon: string; title: string }) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            color: "var(--n400)",
        }}
    >
        <span style={{ fontSize: 48, marginBottom: 12 }}>{icon}</span>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
    </div>
);

const Chip = ({
    children,
    bg = "var(--g100)",
    col = "var(--g700)",
}: {
    children: React.ReactNode;
    bg?: string;
    col?: string;
}) => (
    <div
        style={{
            background: bg,
            color: col,
            padding: "4px 8px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
        }}
    >
        {children}
    </div>
);

interface MedalProps {
    id: string;
    icon: ReactNode;
    name: string;
    desc: string;
    color: string;
    earned: boolean;
    earnedDate?: string;
}

const Medals: React.FC = () => {
    const { data, loading } = useStudentProgress();
    const totalLessons = data?.lessons?.length || 0;

    // ✅ الأوسمة حسب عدد الحصص
    const getMedals = (): MedalProps[] => {
        const medals: MedalProps[] = [
            {
                id: "1",
                icon: "🥉",
                name: "أول خطوة",
                desc: "إكمال الحصة الأولى",
                color: "#10b981",
                earned: totalLessons >= 1,
                earnedDate: totalLessons >= 1 ? "اليوم" : undefined,
            },
            {
                id: "10",
                icon: "🥈",
                name: "الثبات",
                desc: "إكمال 10 حصص",
                color: "#3b82f6",
                earned: totalLessons >= 10,
                earnedDate: totalLessons >= 10 ? "أسبوعين" : undefined,
            },
            {
                id: "50",
                icon: "🥇",
                name: "المثابرة",
                desc: "إكمال 50 حصة",
                color: "#f59e0b",
                earned: totalLessons >= 50,
                earnedDate: totalLessons >= 50 ? "شهر" : undefined,
            },
            {
                id: "100",
                icon: "🏆",
                name: "النجم",
                desc: "إكمال 100 حصة",
                color: "#8b5cf6",
                earned: totalLessons >= 100,
                earnedDate: totalLessons >= 100 ? "3 شهور" : undefined,
            },
            {
                id: "300",
                icon: "👑",
                name: "البطل الأعلى",
                desc: "إكمال 300 حصة",
                color: "#ef4444",
                earned: totalLessons >= 300,
                earnedDate: totalLessons >= 300 ? "سنة" : undefined,
            },
        ];
        return medals;
    };

    const medals = getMedals();
    const earnedCount = medals.filter((m) => m.earned).length;

    if (loading) {
        return (
            <div className="page-body">
                <WG>
                    <WH t="الأوسمة" />
                    <div className="wb">
                        <div className="ld text-center py-4">
                            جاري تحميل الأوسمة...
                        </div>
                    </div>
                </WG>
            </div>
        );
    }

    return (
        <div className="page-body">
            {/* ✅ رسالة التشجيع للحصة الأولى */}
            {earnedCount === 0 && (
                <div className="mb-4">
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg,#fefce8,#fef9c3)",
                            border: "1px solid #fcd34d",
                            borderRadius: 14,
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                        }}
                    >
                        <span style={{ fontSize: 28 }}>🏅</span>
                        <div>
                            <div
                                style={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                    color: "#92400e",
                                }}
                            >
                                أكمل أول حصة لتحصل على وسام!
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#b45309",
                                    marginTop: 2,
                                }}
                            >
                                تقدّمك يُسعدنا — استمر!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <WG>
                <WH
                    t="أوسمتي"
                    right={
                        <Chip bg="var(--g100)" col="var(--g700)">
                            {earnedCount}/{medals.length}
                        </Chip>
                    }
                />
                <div className="wb">
                    <PBar
                        pct={(earnedCount / medals.length) * 100}
                        h={8}
                        color="linear-gradient(90deg,var(--g300),var(--g500))"
                    />
                    <div
                        style={{
                            fontSize: 12,
                            color: "var(--n400)",
                            marginTop: 6,
                            marginBottom: 16,
                        }}
                    >
                        {earnedCount} من {medals.length} وسام مكتسب
                    </div>

                    <div className="badges-full-grid">
                        {medals.map((medal) => (
                            <div
                                key={medal.id}
                                className={`bfc${medal.earned ? " earned" : ""}`}
                            >
                                <div
                                    className="bfc-ico"
                                    style={{
                                        background: medal.earned
                                            ? medal.color
                                            : "var(--n100)",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 36,
                                            filter: medal.earned
                                                ? "none"
                                                : "grayscale(1) opacity(.3)",
                                        }}
                                    >
                                        {medal.icon}
                                    </span>
                                    {medal.earned && (
                                        <div className="bfc-ck">✅</div>
                                    )}
                                    {!medal.earned && (
                                        <div className="bfc-lock">🔒</div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: medal.earned
                                            ? "var(--n900)"
                                            : "var(--n400)",
                                    }}
                                >
                                    {medal.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "var(--n400)",
                                        lineHeight: 1.4,
                                        textAlign: "center",
                                    }}
                                >
                                    {medal.desc}
                                </div>
                                {medal.earned && medal.earnedDate && (
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "var(--g600)",
                                            fontWeight: 700,
                                        }}
                                    >
                                        ✓ {medal.earnedDate}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </WG>
        </div>
    );
};

export default Medals;
