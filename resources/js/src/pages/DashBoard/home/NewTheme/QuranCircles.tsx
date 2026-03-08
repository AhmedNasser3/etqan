// QuranCirclesMock.tsx - نفس تصميم Complexes.tsx مع بيانات وهمية للحلقات
import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiBookOpenDuotone } from "react-icons/pi";
import { useMemo, useCallback, useState, useEffect } from "react";
import Img from "../../../../assets/images/logo.png";

interface Circle {
    id: number;
    title: string;
    description: string;
    subdomain: string;
    mosque_name: string;
    stats: Array<{
        label: string;
        value: string | number;
    }>;
}

// بيانات وهمية للحلقات
const MOCK_CIRCLES: Circle[] = [
    {
        id: 1,
        title: "حلقة الإمام البخاري",
        description:
            "حلقة تحفيظ متميزة للقرآن الكريم مع أفضل المدرسين وأحدث المناهج",
        subdomain: "imam-bukhari",
        mosque_name: "مسجد الإمام البخاري",
        stats: [
            { label: "الطلاب", value: "247" },
            { label: "المعلمين", value: "12" },
            { label: "الحفاظ", value: "189" },
            { label: "القراءات", value: "7" },
        ],
    },
    {
        id: 2,
        title: "حلقة الإمام مسلم",
        description: "برنامج تحفيظ شامل مع تركيز على التجويد والقراءات السبع",
        subdomain: "imam-muslim",
        mosque_name: "مسجد الإمام مسلم",
        stats: [
            { label: "الطلاب", value: "156" },
            { label: "المعلمين", value: "8" },
            { label: "الحفاظ", value: "124" },
            { label: "المصاحف", value: "32" },
        ],
    },
    {
        id: 3,
        title: "حلقة الإمام النووي",
        description: "حلقة خاصة للتحفيظ المتقدم مع منهجية علمية حديثة",
        subdomain: "imam-nawawi",
        mosque_name: "مسجد الإمام النووي",
        stats: [
            { label: "الطلاب", value: "89" },
            { label: "المعلمين", value: "6" },
            { label: "الحفاظ", value: "76" },
            { label: "المراجعات", value: "450" },
        ],
    },
    {
        id: 4,
        title: "حلقة الإمام أحمد",
        description: "حلقة تحفيظ مكثفة للكبار والصغار مع أجواء روحانية مميزة",
        subdomain: "imam-ahmad",
        mosque_name: "مسجد الإمام أحمد",
        stats: [
            { label: "الطلاب", value: "312" },
            { label: "المعلمين", value: "15" },
            { label: "الحفاظ", value: "267" },
            { label: "القراءات", value: "10" },
        ],
    },
];

const QuranCirclesMock: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [circles] = useState(MOCK_CIRCLES);
    const totalCircles = MOCK_CIRCLES.length;
    const [useDemoData] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const getIconForStat = useCallback((label: string): React.ReactNode => {
        switch (label) {
            case "الطلاب":
                return <PiStudentDuotone className="text-xl" />;
            case "المعلمين":
                return <PiChalkboardTeacherDuotone className="text-xl" />;
            case "الخطط":
                return <GrPlan className="text-xl" />;
            case "حلقات":
            case "المصاحف":
            case "القراءات":
            case "الحفاظ":
                return <PiBookOpenDuotone className="text-xl" />;
            default:
                return <PiBookOpenDuotone className="text-xl" />;
        }
    }, []);

    const circlesWithIcons = useMemo(() => {
        return circles.map((circle) => ({
            ...circle,
            stats: circle.stats.map((stat) => ({
                ...stat,
                icon: getIconForStat(stat.label),
            })),
        }));
    }, [circles, getIconForStat]);

    const goToCircle = (subdomain: string) => {
        console.log(`الانتقال إلى حلقة: ${subdomain}`);
        alert(`تم الانتقال إلى حلقة: ${subdomain.toUpperCase()}`);
    };

    const refetch = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("تم تحديث القائمة بنجاح!");
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="navbar">
                        <div className="navbar__inner">
                            <div className="navbar__loading">
                                <div className="loading-spinner">
                                    <div className="spinner-circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="complexes">
            <div className="testimonials__mainTitle">
                <button className="text-2xl font-bold text-purple-600">
                    جميع حلقات تحفيظ القرآن ({totalCircles})
                </button>
                <h1>حلقات تحفيظ القرآن الكريم</h1>{" "}
            </div>

            <div className="complexes__inner">
                {circlesWithIcons.map((circle, index) => (
                    <button
                        onClick={() => goToCircle(circle.subdomain)}
                        className="w-full"
                        key={circle.id || index}
                    >
                        <div className="complexes__container">
                            <div className="complexes__data">
                                <div className="complexes__img">
                                    <img src={Img} alt={circle.title} />
                                </div>
                                <div className="complexes__text">
                                    <div className="complexes__title">
                                        <h2>{circle.title}</h2>
                                    </div>
                                    <div className="complexes__description">
                                        <p>{circle.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="complexes__footer">
                                <div className="complexes__footerContainer">
                                    <div className="complexes__footerData">
                                        {circle.stats.map((stat, statIndex) => (
                                            <div
                                                key={`${circle.id}-stat-${statIndex}`}
                                                className="complexes__footerBoxs"
                                            >
                                                <div className="complexes__footerTitle">
                                                    <h1>{stat.label}</h1>
                                                    <div className="complexes__footerIcon">
                                                        <i>{stat.icon}</i>
                                                    </div>
                                                </div>
                                                <div className="complexes__footerDescription">
                                                    <p>
                                                        {stat.label}:{" "}
                                                        <span>
                                                            {stat.value}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="complexes__footerBtContainer">
                                        <div
                                            className="complexes__footerBtn"
                                            id={`complexes__footerBtnView`}
                                        >
                                            <button
                                                onClick={() =>
                                                    goToCircle(circle.subdomain)
                                                }
                                                className="w-full"
                                            >
                                                مشاهدة التفاصيل
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuranCirclesMock;
