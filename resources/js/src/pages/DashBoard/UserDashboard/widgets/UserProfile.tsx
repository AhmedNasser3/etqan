import EmailVerifyWidget from "./EmailVerifyWidget";
import Medals from "./medals";
import UserPlans from "./UserPlans";

const UserProfile: React.FC = () => {
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
                                        <h1>عبدالله القحطاني</h1>
                                    </div>
                                    <div className="testimonialsView__ratingStars"></div>
                                </div>
                                <img
                                    src="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                    alt="المعلم"
                                />
                            </div>
                        </div>
                    </div>
                    <EmailVerifyWidget />
                </div>
                <div className="userProfile__doupleSide">
                    <Medals />
                    <div className="userProfile__progress">
                        <div className="userProfile__progressContainer">
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>مستوي تقدم الطالب</h1>
                                </div>
                                <p>98%</p>
                                <div className="userProfile__progressBar">
                                    <span></span>
                                </div>
                            </div>
                            {/* <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>مستوي تقدم الطالب</h1>
                                </div>
                                <p>23%</p>
                                <div
                                    className="userProfile__progressBar"
                                    id="userProfile__low"
                                >
                                    <span></span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
                <UserPlans />
            </div>
        </div>
    );
};

export default UserProfile;
