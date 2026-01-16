import UserMeetCard from "../UserDashboard/userMeet/UserMeetCard";
import Profile from "./widgets/dashboard/profile";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import TeacherTodayCircle from "./widgets/TeacherTodayCircle/TeacherTodayCircle";
const TeacherDashboard: React.FC = () => {
    return (
        <div className="teacherDashboard">
            <div className="teacherDashboard__inner">
                <Profile />
                <div className="userProfile__plan">
                    <div
                        className="testimonials__mainTitle"
                        style={{ marginBottom: "0" }}
                    >
                        <h1>حلقتي اليوم</h1>
                    </div>
                    <div className="userProfile__meet" style={{ padding: "0" }}>
                        <div
                            className="userProfile__inner"
                            style={{ width: "100%" }}
                        >
                            <div className="userProfile__meetContainer">
                                <div className="userProfile__meet">
                                    <div className="userProfile__meetImg">
                                        <img
                                            src="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                            alt=""
                                        />
                                    </div>
                                    <div className="userProfile__meetContent"></div>
                                </div>
                                <div className="userProfile__meetDetails">
                                    <div className="userProfile__meetDate">
                                        <h1> الحصة بعد:</h1>
                                        <span>6 ساعات و 22 دقيقة.</span>
                                    </div>
                                    <div className="userProfile__meetDate">
                                        <h1>الطالب/</h1>
                                        <span>عبدالله القحطاني</span>
                                    </div>
                                    <div className="userProfile__meetConatin">
                                        <div className="userProfile__meetDescription">
                                            <h2 className="userProfile__meetDescription active">
                                                محتوي الحصة
                                            </h2>
                                            <h2>
                                                <span>1</span>- حفظ سورة البقرة
                                                من ايه 51 الي 60
                                            </h2>
                                            <h2>
                                                <span>2</span>-تسميع سورة البقرة
                                                من ايه 41 الي 51{" "}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="userProfile__meetBtn">
                                    <div className="userProfile__meetBtnUrl">
                                        <i>
                                            <IoCopy />
                                        </i>
                                        <h1>
                                            http://127.0.0.1:8000/user-dashboard
                                        </h1>
                                    </div>
                                    <a
                                        className="userProfile__button"
                                        href="https://meet.jit.si/halaqa-teacher-abc123"
                                    >
                                        <button>
                                            دخول الحصة
                                            <i>
                                                <SiGoogledisplayandvideo360 />
                                            </i>
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <TeacherTodayCircle />
            </div>
        </div>
    );
};

export default TeacherDashboard;
