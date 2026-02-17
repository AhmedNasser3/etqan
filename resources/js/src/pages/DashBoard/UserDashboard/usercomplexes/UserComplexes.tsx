// UserComplexes.tsx - ديناميكية مع الهوك
import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { PiCirclesThreeDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiMosqueDuotone } from "react-icons/pi";
import { useUserComplex } from "./hooks/useUserComplex";

const UserComplexes: React.FC = () => {
    const { data, loading, error } = useUserComplex();

    if (loading) {
        return (
            <div className="usercomplexes">
                <div className="complexes">
                    <div className="testimonials__mainTitle">
                        <h1>المجمع الخاص بك</h1>
                    </div>
                    <div className="text-center py-12 text-gray-500">
                        جاري تحميل بيانات المجمع...
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data?.success) {
        return (
            <div className="usercomplexes">
                <div className="complexes">
                    <div className="testimonials__mainTitle">
                        <h1>المجمع الخاص بك</h1>
                    </div>
                    <div className="text-center py-12 text-red-500 bg-red-50 p-8 rounded-lg">
                        {error || "لا يوجد مجمع مرتبط بحسابك"}
                    </div>
                </div>
            </div>
        );
    }

    const complex = data.complex;

    // ✅ Map icons حسب الـ label
    const getIcon = (label: string) => {
        switch (label) {
            case "الطلاب":
                return <PiStudentDuotone />;
            case "المعلمين":
                return <PiChalkboardTeacherDuotone />;
            case "الحلقات":
                return <PiCirclesThreeDuotone />;
            case "الخطط":
                return <GrPlan />;
            case "المساجد":
                return <PiMosqueDuotone />;
            default:
                return <PiMosqueDuotone />;
        }
    };

    return (
        <div className="usercomplexes">
            <div className="complexes">
                <div className="testimonials__mainTitle">
                    <h1>المجمع الخاص بك</h1>
                </div>
                <div className="complexes__inner">
                    <div
                        className="complexes__container"
                        id="userProfile__footerBtContainer"
                    >
                        <div className="complexes__data">
                            <div className="complexes__img">
                                <img src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png" />
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
                        <div className="complexes__footer">
                            <div className="complexes__footerContainer">
                                <div className="complexes__footerData">
                                    {complex.stats.map((stat, statIndex) => (
                                        <div
                                            key={statIndex}
                                            className="complexes__footerBoxs"
                                        >
                                            <div className="complexes__footerTitle">
                                                <h1>{stat.label}</h1>
                                                <div className="complexes__footerIcon">
                                                    <i>{getIcon(stat.label)}</i>
                                                </div>
                                            </div>
                                            <div className="complexes__footerDescription">
                                                <p>
                                                    {stat.label}:{" "}
                                                    <span>{stat.value}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="complexes__footerBtContainer">
                                    {/* الأزرار محطوطة comment زي الأصلي */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserComplexes;
