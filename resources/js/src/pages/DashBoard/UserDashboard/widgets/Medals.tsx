// Medals.tsx - مُصحح مع الأوسمة الجديدة فقط حسب عدد الحصص
import { FaMedal } from "react-icons/fa";
import { ReactNode, useState } from "react";
import { useStudentProgress } from "../userProgress/hooks/useStudentProgress";

interface MedalProps {
    icon: ReactNode;
    title: string;
    tooltip: string;
}

const Medals: React.FC = () => {
    // ✅ استخدام useStudentProgress hook
    const { data, loading } = useStudentProgress();
    const totalLessons = data?.lessons?.length || 0;

    // ✅ الأوسمة الجديدة فقط حسب عدد الحصص (بدون الأوسمة القديمة)
    const getMedals = (): MedalProps[] => {
        const medals: MedalProps[] = [];

        if (totalLessons >= 1) {
            medals.push({
                icon: <FaMedal className="text-gray-400 text-lg" />,
                title: "إكمال 1 حصة",
                tooltip: `مبروك! أكملت ${totalLessons} حصة${totalLessons > 1 ? "s" : ""}`,
            });
        }
        if (totalLessons >= 10) {
            medals.push({
                icon: <FaMedal className="text-blue-500 text-lg" />,
                title: "إكمال 10 حصص",
                tooltip: `مبروك! أكملت ${totalLessons} حصة${totalLessons > 1 ? "s" : ""}`,
            });
        }
        if (totalLessons >= 50) {
            medals.push({
                icon: <FaMedal className="text-green-500 text-xl" />,
                title: "إكمال 50 حصة",
                tooltip: `مبروك! أكملت ${totalLessons} حصة${totalLessons > 1 ? "s" : ""}`,
            });
        }
        if (totalLessons >= 100) {
            medals.push({
                icon: <FaMedal className="text-purple-500 text-xl" />,
                title: "إكمال 100 حصة",
                tooltip: `مبروك! أكملت ${totalLessons} حصة${totalLessons > 1 ? "s" : ""}`,
            });
        }
        if (totalLessons >= 300) {
            medals.push({
                icon: <FaMedal className="text-yellow-400 text-2xl" />,
                title: "إكمال 300 حصة - البطل",
                tooltip: `مبروك! أكملت ${totalLessons} حصص - أنت البطل الأعلى!`,
            });
        }

        return medals;
    };

    const medals = getMedals();

    if (loading) {
        return (
            <div className="userProfile__medal">
                <div className="userProfile__medalContainer">
                    <div className="userProfile__medalContent loading">
                        <div className="userProfile__medalTitle">
                            <div className="loading-skeleton"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="userProfile__medal">
            <div className="userProfile__medalContainer">
                {medals.length > 0 ? (
                    medals.map((medal, index) => (
                        <MedalItem
                            key={index}
                            icon={medal.icon}
                            title={medal.title}
                            tooltip={medal.tooltip}
                        />
                    ))
                ) : (
                    <div className="userProfile__medalContent empty">
                        <div className="userProfile__medalTitle">
                            <FaMedal className="text-gray-300 text-lg" />
                        </div>
                        <div className="tooltip">
                            أكمل أول حصة لتحصل على وسام!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MedalItem: React.FC<{
    icon: ReactNode;
    title: string;
    tooltip: string;
}> = ({ icon, title, tooltip }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="userProfile__medalContent"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="userProfile__medalTitle">
                <i>{icon}</i>
            </div>
            {showTooltip && <div className="tooltip">{tooltip}</div>}
        </div>
    );
};

export default Medals;
