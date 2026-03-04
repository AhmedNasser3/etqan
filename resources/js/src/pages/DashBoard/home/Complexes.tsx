// Complexes.tsx - نفس الديزاين + useCenters hook 🚀
import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiBookOpenDuotone } from "react-icons/pi";
import { useMemo, useCallback } from "react";
import useCenters from "./hooks/useCenters";

const Complexes: React.FC = () => {
    const {
        centers,
        loading,
        error,
        refetch,
        goToCenter,
        totalCenters,
        useDemoData,
        toggleDemoMode,
    } = useCenters();

    //  دالة الـ icons زي القديم
    const getIconForStat = useCallback((label: string): React.ReactNode => {
        switch (label) {
            case "الطلاب":
                return <PiStudentDuotone className="text-xl" />;
            case "المعلمين":
                return <PiChalkboardTeacherDuotone className="text-xl" />;
            case "الخطط":
                return <GrPlan className="text-xl" />;
            case "الكتب":
            case "المصاحف":
            case "القراءات":
            case "الحفاظ":
                return <PiBookOpenDuotone className="text-xl" />;
            default:
                return <PiBookOpenDuotone className="text-xl" />;
        }
    }, []);

    //  Centers مع الـ icons
    const centersWithIcons = useMemo(() => {
        return centers.map((center) => ({
            ...center,
            stats: center.stats.map((stat) => ({
                ...stat,
                icon: getIconForStat(stat.label),
            })),
        }));
    }, [centers, getIconForStat]);

    //  Loading
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
            {/*  نفس Header القديم */}
            <div className="testimonials__mainTitle">
                <button className="text-2xl font-bold text-purple-600">
                    جميع المجمعات ({totalCenters})
                </button>
                {useDemoData && (
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full ml-2">
                        🧪 تجريبي
                    </span>
                )}
                <h1>اكتشف المجمعات</h1>
            </div>

            {/*  نفس الـ Layout القديم */}
            <div className="complexes__inner">
                {centersWithIcons.map((complex, index) => (
                    <button
                        onClick={() => goToCenter(complex.subdomain)}
                        className="w-full"
                    >
                        <div
                            key={complex.id || index}
                            className="complexes__container"
                        >
                            <div className="complexes__data">
                                <div className="complexes__img">
                                    <img
                                        src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                                        alt={complex.title}
                                    />
                                </div>
                                <div className="complexes__text">
                                    <div className="complexes__title">
                                        <h2>{complex.title}</h2>
                                    </div>
                                    <div className="complexes__description">
                                        <p>{complex.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/*  نفس الـ Footer القديم */}
                            <div className="complexes__footer">
                                <div className="complexes__footerContainer">
                                    <div className="complexes__footerData">
                                        {complex.stats.map(
                                            (stat, statIndex) => (
                                                <div
                                                    key={`${complex.id}-stat-${statIndex}`}
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
                                            ),
                                        )}
                                    </div>

                                    {/*  نفس الأزرار القديمة + الـ functionality الجديد */}
                                    <div className="complexes__footerBtContainer">
                                        <div
                                            className="complexes__footerBtn"
                                            id={`complexes__footerBtnView`}
                                        >
                                            <button
                                                onClick={() =>
                                                    goToCenter(
                                                        complex.subdomain,
                                                    )
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

export default Complexes;
