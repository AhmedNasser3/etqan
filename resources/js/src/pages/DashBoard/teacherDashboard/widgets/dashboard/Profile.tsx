import { useAuthUser } from "./hooks/useAuthUser"; // ضبط المسار حسب مكان الهوك
import EmailVerifyWidget from "../../../UserDashboard/widgets/EmailVerifyWidget";

const Profile: React.FC = () => {
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
                                            <h1 className="animate-pulse bg-gray-200 h-8 w-48 rounded">
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
                                    src={
                                        user?.avatar ||
                                        "https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                    }
                                    alt="المستخدم"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                    <EmailVerifyWidget />
                </div>
                <div className="userProfile__doupleSide"></div>
            </div>
        </div>
    );
};

export default Profile;
