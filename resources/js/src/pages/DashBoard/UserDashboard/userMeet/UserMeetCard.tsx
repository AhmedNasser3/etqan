import { FaStar } from "react-icons/fa";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import { FiBookOpen } from "react-icons/fi";

const UserMeetCard: React.FC = () => {
    return (
        <div className="userProfile__meet">
            <div className="userProfile__inner">
                <div className="userProfile__meetContainer">
                    <div className="userProfile__meet">
                        <div className="userProfile__meetImg">
                            <img
                                src="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                alt=""
                            />
                        </div>
                        <div className="userProfile__meetContent">
                            <div className="userProfile__meetName">
                                <h1>أ/عبدالله القحطاني</h1>
                            </div>
                            <div className="userProfile__rating">
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                            </div>
                        </div>
                    </div>
                    <div className="userProfile__meetDetails">
                        <div className="userProfile__meetDate">
                            <h1> الحصة بعد:</h1>
                            <span>6 ساعات و 22 دقيقة.</span>
                        </div>
                        <div className="userProfile__meetConatin">
                            <div className="userProfile__meetDescription">
                                <h2 className="userProfile__meetDescription active">
                                    محتوي الحصة
                                </h2>
                                <h2>
                                    <span>1</span>- حفظ سورة البقرة من ايه 51
                                    الي 60
                                </h2>
                                <h2>
                                    <span>2</span>-تسميع سورة البقرة من ايه 41
                                    الي 51{" "}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="userProfile__meetBtn">
                        <div className="userProfile__meetBtnUrl">
                            <i>
                                <IoCopy />
                            </i>
                            <h1>http://127.0.0.1:8000/user-dashboard</h1>
                        </div>
                        <button>
                            دخول الحصة
                            <i>
                                <SiGoogledisplayandvideo360 />
                            </i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMeetCard;
