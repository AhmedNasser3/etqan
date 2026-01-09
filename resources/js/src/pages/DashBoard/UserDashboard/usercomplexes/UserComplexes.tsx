import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiBookOpenDuotone } from "react-icons/pi";

const complexesData = [
    {
        title: "مجمع القرآن الكريم بالشارقة",
        description:
            "مجمع القرآن الكريم بالشارقة صرح حضاري عالمي يُعنى بخدمة القرآن وعلومه، يضم متاحف قرآنية متخصصة، ومكتبة علمية، وبرامج تعليمية وإجازات بالسند المتصل، في بيئة تجمع بين الأصالة والتقنية الحديثة.",
        img: "https://yt3.googleusercontent.com/n6vRPQ0akipMZ1zkcCvEWUpU1reKrNfNESHncsQJsDFiIyPkQeEZuc-DXRnQ1pKIci7XFh_Oow=s900-c-k-c0x00ffffff-no-rj",
        stats: [
            { label: "الطلاب", value: "63", icon: <PiStudentDuotone /> },
            {
                label: "المعلمين",
                value: "4",
                icon: <PiChalkboardTeacherDuotone />,
            },
            { label: "الخطط", value: "19", icon: <GrPlan /> },
            { label: "الكتب", value: "1,200", icon: <PiBookOpenDuotone /> },
        ],
    },
];

const UserComplexes: React.FC = () => {
    return (
        <div className="usercomplexes">
            <div className="complexes">
                <div className="testimonials__mainTitle">
                    <h1>المجمجع الخاص بك</h1>
                </div>
                <div className="complexes__inner">
                    {complexesData.map((complex, index) => (
                        <div
                            key={index}
                            className="complexes__container"
                            id="userProfile__footerBtContainer"
                        >
                            <div className="complexes__data">
                                <div className="complexes__img">
                                    <img
                                        src={complex.img}
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
                            <div className="complexes__footer">
                                <div className="complexes__footerContainer">
                                    <div className="complexes__footerData">
                                        {complex.stats.map(
                                            (stat, statIndex) => (
                                                <div
                                                    key={statIndex}
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
                                            )
                                        )}
                                    </div>
                                    <div className="complexes__footerBtContainer">
                                        {/* <div
                                            className="complexes__footerBtn"
                                            id={`complexes__footerBtnView`}
                                        >
                                            <button>مشاهدة التفاصيل</button>
                                        </div>
                                        <div className="complexes__footerBtn">
                                            <button>
                                                الاشتراك مع هذا المجمع
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserComplexes;
