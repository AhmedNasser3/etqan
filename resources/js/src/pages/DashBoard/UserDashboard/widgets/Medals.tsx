import { LiaCertificateSolid } from "react-icons/lia";
import { PiCertificateDuotone } from "react-icons/pi";
import { ReactNode, useState } from "react";
import {
    FaStar,
    FaCalendarCheck,
    FaBookOpen,
    FaTrophy,
    FaChartLine,
    FaUsers,
    FaGift,
    FaMicrophone,
} from "react-icons/fa";

interface MedalProps {
    icon: ReactNode;
    title: string;
    tooltip: string;
}

const Medals: React.FC = () => {
    const medals: MedalProps[] = [
        {
            icon: <LiaCertificateSolid />,
            title: "متميز",
            tooltip: "متميز في الحفظ والتسميع",
        },
        {
            icon: <PiCertificateDuotone />,
            title: "حاصل على شهادة",
            tooltip: "شهادة إتمام الختمة",
        },
        {
            icon: <FaStar />,
            title: "نجم الحلقة",
            tooltip: "أعلى نقاط في الحلقة هذا الأسبوع",
        },
        {
            icon: <FaCalendarCheck />,
            title: "حضور مثالي",
            tooltip: "100% حضور بدون غياب",
        },
        {
            icon: <FaBookOpen />,
            title: "ختمة كاملة",
            tooltip: "إتمام حفظ القرآن كاملاً",
        },
        {
            icon: <FaTrophy />,
            title: "بطل التسميع",
            tooltip: "أفضل تقييم في التسميع الشهري",
        },
        {
            icon: <FaChartLine />,
            title: "الأسرع تقدماً",
            tooltip: "أعلى نسبة تقدم في الحفظ",
        },
        {
            icon: <FaUsers />,
            title: "لوحة الشرف",
            tooltip: "المركز الأول في ترتيب الحلقة",
        },
        {
            icon: <FaGift />,
            title: "مكافأة الشهر",
            tooltip: "فاز بسحب هدايا التحفيز",
        },
        {
            icon: <FaMicrophone />,
            title: "تسميع مميز",
            tooltip: "أفضل تسجيل تسميع عن بعد",
        },
    ];

    return (
        <div className="userProfile__medal">
            <div className="userProfile__medalContainer">
                {medals.map((medal, index) => (
                    <MedalItem
                        key={index}
                        icon={medal.icon}
                        title={medal.title}
                        tooltip={medal.tooltip}
                    />
                ))}
            </div>
        </div>
    );
};

const MedalItem: React.FC<MedalProps> = ({ icon, title, tooltip }) => {
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
