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
    {
        title: "مجمع الملك فهد لطباعة المصحف",
        description:
            "أكبر مجمع لطباعة وتوزيع المصاحف الشريفة في العالم، ينتج ملايين النسخ سنوياً بأعلى معايير الجودة والدقة.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMQpLentR96boXCSpy9Qvzf5TttQjgggkjhg&s",
        stats: [
            { label: "الطلاب", value: "1,250", icon: <PiStudentDuotone /> },
            {
                label: "المعلمين",
                value: "85",
                icon: <PiChalkboardTeacherDuotone />,
            },
            { label: "الخطط", value: "45", icon: <GrPlan /> },
            { label: "المصاحف", value: "50M", icon: <PiBookOpenDuotone /> },
        ],
    },
    {
        title: "مركز الإمام الشافعي",
        description:
            "مركز متخصص في تدريس القراءات العشر وعلوم التجويد، يقدم إجازات بالسند المتصل للإمام الشافعي رحمه الله.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5l66UixhcLVRMdW9S9CriXaQlN5CAubKrF9xR3KiBaXEDP218t3fpcHFH60QNqXF3f1s&usqp=CAU",
        stats: [
            { label: "الطلاب", value: "320", icon: <PiStudentDuotone /> },
            {
                label: "المعلمين",
                value: "22",
                icon: <PiChalkboardTeacherDuotone />,
            },
            { label: "الخطط", value: "12", icon: <GrPlan /> },
            { label: "القراءات", value: "10", icon: <PiBookOpenDuotone /> },
        ],
    },
    {
        title: "مجمع الإمام البخاري",
        description:
            "مجمع قرآني يركز على حفظ القرآن الكريم وتدريسه للأطفال والكبار، مع برامج تدريبية متخصصة.",
        img: "https://mir-s3-cdn-cf.behance.net/projects/404/df8b43228755373.Y3JvcCw4MDgsNjMyLDAsMA.png",
        stats: [
            { label: "الطلاب", value: "180", icon: <PiStudentDuotone /> },
            {
                label: "المعلمين",
                value: "15",
                icon: <PiChalkboardTeacherDuotone />,
            },
            { label: "الخطط", value: "8", icon: <GrPlan /> },
            { label: "الحفاظ", value: "45", icon: <PiBookOpenDuotone /> },
        ],
    },
];
const TestimonialsProfileComplexes: React.FC = () => {
    return (
        <div className="complexes">
            <div className="testimonials__mainTitle">
                <h1>المجمعات التي يعمل بها المعلم</h1>
            </div>
            <div className="complexes__inner">
                {complexesData.map((complex, index) => (
                    <div key={index} className="complexes__container">
                        <div className="complexes__data">
                            <div className="complexes__img">
                                <img src={complex.img} alt={complex.title} />
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
                                                    <i>{stat.icon}</i>
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
                                    <div
                                        className="complexes__footerBtn"
                                        id={`complexes__footerBtnView`}
                                    >
                                        <button>مشاهدة التفاصيل</button>
                                    </div>
                                    <div className="complexes__footerBtn">
                                        <button>الاشتراك مع هذا المجمع</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialsProfileComplexes;
