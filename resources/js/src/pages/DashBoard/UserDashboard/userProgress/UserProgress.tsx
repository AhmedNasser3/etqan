// UserProgress.tsx - ديزاين جديد بأسلوب ProgressPage
import { RiRobot2Fill } from "react-icons/ri";
import { FaStar } from "react-icons/fa";
import { useStudentProgress } from "./hooks/useStudentProgress";
import Medals from "../widgets/medals";

// ✅ Helper Components من ProgressPage
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

const UserProgress: React.FC = () => {
    const { data, loading, error } = useStudentProgress();

    if (error)
        return (
            <div className="page-body">
                <WG>
                    <div className="wb">
                        <div className="text-red-500 text-center py-8 p-4 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    </div>
                </WG>
            </div>
        );

    const overallProgress = data?.overall_progress || 0;
    const lessons = data?.lessons || [];

    return (
        <div className="content">
            <div className="page-body">
                {/* ✅ رسالة تشجيعية في الأعلى */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#fefce8,#fef9c3)",
                        border: "1px solid #fcd34d",
                        borderRadius: 14,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 20,
                    }}
                >
                    <span style={{ fontSize: 28 }}>🏆</span>
                    <div>
                        <div
                            style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: "#92400e",
                            }}
                        >
                            تقدم رائع! استمر في التفوق
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#b45309",
                                marginTop: 2,
                            }}
                        >
                            كل حصة تقربك من الهدف الكبير
                        </div>
                    </div>
                </div>
                <Medals />
                <div className="grid2">
                    {/* ✅ مستوى التقدم */}
                    <WG>
                        <WH t="مستوى تقدم الطالب" />
                        <div className="wb">
                            <div
                                style={{
                                    fontSize: 44,
                                    fontWeight: 900,
                                    color: "var(--g600)",
                                    lineHeight: 1,
                                    marginBottom: 10,
                                }}
                            >
                                {overallProgress}%
                            </div>
                            <PBar
                                pct={overallProgress}
                                h={12}
                                color="linear-gradient(90deg,var(--g300),var(--g500))"
                            />
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 10,
                                    marginTop: 14,
                                }}
                            >
                                <div
                                    style={{
                                        background: "var(--n50)",
                                        border: "1px solid var(--n200)",
                                        borderRadius: 10,
                                        padding: "10px 12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "var(--n400)",
                                            fontWeight: 600,
                                            marginBottom: 3,
                                        }}
                                    >
                                        عدد الحصص
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 900,
                                            color: "var(--n900)",
                                        }}
                                    >
                                        {lessons.length}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        background: "var(--n50)",
                                        border: "1px solid var(--n200)",
                                        borderRadius: 10,
                                        padding: "10px 12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "var(--n400)",
                                            fontWeight: 600,
                                            marginBottom: 3,
                                        }}
                                    >
                                        التقييم الإجمالي
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 900,
                                            color: "var(--g600)",
                                        }}
                                    >
                                        ★★★☆☆
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WG>

                    {/* ✅ ملاحظات المعلمين */}
                    <WG>
                        <WH t="ملاحظات المعلمين" />
                        <div className="wb">
                            {lessons.length > 0 ? (
                                lessons.slice(0, 3).map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 10,
                                            padding: "10px 0",
                                            borderBottom:
                                                "1px solid var(--n100)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: "50%",
                                                background: "var(--g400)",
                                                flexShrink: 0,
                                                marginTop: 5,
                                            }}
                                        />
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: "var(--n800)",
                                                }}
                                            >
                                                {lesson.note ||
                                                    "لا توجد ملاحظات"}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--n400)",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {lesson.attendance_date}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Empty icon="📝" title="لا توجد ملاحظات بعد" />
                            )}
                        </div>
                    </WG>
                </div>

                {/* ✅ تفاصيل الحصص */}
                {lessons.length > 0 && (
                    <WG>
                        <WH t="آخر الحصص" />
                        <div className="wb">
                            <div
                                style={{
                                    display: "grid",
                                    gap: 12,
                                    maxHeight: 400,
                                    overflowY: "auto",
                                }}
                            >
                                {lessons.slice(0, 5).map((lesson: any) => {
                                    const filledStars = Math.floor(
                                        Number(lesson.rating) || 0,
                                    );
                                    return (
                                        <div
                                            key={lesson.id}
                                            style={{
                                                background: "var(--n50)",
                                                border: "1px solid var(--n200)",
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "var(--n900)",
                                                    }}
                                                >
                                                    {lesson.surah_name}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 2,
                                                    }}
                                                >
                                                    {Array(5)
                                                        .fill(0)
                                                        .map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                style={{
                                                                    fontSize: 14,
                                                                    color:
                                                                        i <
                                                                        filledStars
                                                                            ? "#fbbf24"
                                                                            : "#d1d5db",
                                                                }}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--n600)",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {lesson.attendance_date}
                                            </div>
                                            {lesson.new_memorization && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--g700)",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {lesson.new_memorization}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </WG>
                )}
            </div>
        </div>
    );
};

export default UserProgress;
