import { useAuthUser } from "./hooks/useAuthUser"; // ضبط المسار حسب مكان الهوك
import PlanCards from "../plans/models/PlanCards";
import Schedules from "../plans/models/Sheduls";
import UserMeetCard from "../userMeet/UserMeetCard";
import EmailVerifyWidget from "./EmailVerifyWidget";
import Medals from "./medals";
import Men from "../../../../assets/images/facelessAvatar.png";

const UserProfile: React.FC = () => {
    const { user, loading } = useAuthUser();

    return (
        <div className="userProfile">
            <div className="userProfile__features">
                <div className="testimonialsView__header">
                    <div className="testimonialsView__img">
                        <div className="testimonialsView__data">
                            <div className="testimonialsView__img">
                                <div className="testimonialsView__imgBg">
                                    <img
                                        hidden
                                        className="wave-bg"
                                        src="https://png.pngtree.com/thumb_back/fw800/background/20251004/pngtree-elegant-green-islamic-background-with-ornamental-arch-image_19763723.webp"
                                        alt=""
                                    />
                                </div>

                                <div className="testimonialsView__rating">
                                    <div className="testimonialsView__name">
                                        {loading ? (
                                            <h1 className="animate-pulse bg-gray-200 h-8 w-64 rounded-md">
                                                جاري التحميل...
                                            </h1>
                                        ) : (
                                            <h1>
                                                {user?.name ||
                                                    "عبدالله القحطاني"}
                                            </h1>
                                        )}
                                    </div>
                                    <div className="testimonialsView__ratingStars"></div>
                                </div>

                                {/* ✅ صورة اليوزر */}
                                <img
                                    src={Men}
                                    alt="المستخدم"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                    <EmailVerifyWidget />
                </div>

                {/* خططي الخاصة */}

                <div className="userProfile__doupleSide">
                    <Medals />
                    <div className="userProfile__progress">
                        <div className="userProfile__progressContainer">
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>مستوى تقدم الطالب</h1>
                                </div>
                                <p>98%</p>
                                <div className="userProfile__progressBar">
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Schedules /> */}
            <UserMeetCard />
            <PlanCards type="my-plans" />
            {/* ✅ خطط متاحة للحجز */}
            <PlanCards type="available" />
        </div>
    );
};

export default UserProfile;
