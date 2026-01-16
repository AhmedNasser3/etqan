import EmailVerifyWidget from "../../../UserDashboard/widgets/EmailVerifyWidget";

const Profile: React.FC = () => {
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
                <div className="userProfile__doupleSide"></div>
            </div>
        </div>
    );
};

export default Profile;
