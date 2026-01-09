import { RiRobot2Fill } from "react-icons/ri";

import { FaStar } from "react-icons/fa";
import Medals from "../widgets/medals";

const UserProgress: React.FC = () => {
    return (
        <div className="userProgress">
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
            <div className="userProgress__inner">
                <div className="testimonials__mainTitle">
                    <h1>التقدم الخاص بك</h1>
                </div>
                <div className="suserProgress__container">
                    <div className="userProgress__case">
                        <div
                            className="userProfile__planTitle"
                            id="userProfile__lined"
                        >
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                        <div className="userProfile__planTitle">
                            <h1>سورة الصمد</h1>
                        </div>
                    </div>
                    <div className="testimonials__mainTitle">
                        <h1>ملاحظات المعلمين</h1>
                    </div>
                    <div className="userProfile__plan" id="userProfile__plan">
                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                راجع آية ٤٨ مرة تانية
                            </div>
                            <div className="plan__current">
                                <div className="plan__date-range">
                                    <div className="date-picker to">
                                        <label>إلى</label>
                                        <input type="date" value="" />
                                    </div>
                                    <div className="date-picker from">
                                        <label>من</label>
                                        <input type="date" value="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="userProgress__content">
                        <div className="userProgress__comments">
                            <div className="userProgress__title">
                                <h1>
                                    الحصة بتاريخ: <span>2026-01-06</span>
                                </h1>
                            </div>
                            <div className="userProgress__data">
                                <h4>سورة البقرة</h4>
                                <h2>
                                    محتوي الحصة :
                                    <span>حفظ من ايه 24 الي 31</span>
                                </h2>
                                <h2>مراجعة من ايه 10 الي ايه 24 </h2>
                            </div>
                            <div className="userProgress__comment">
                                <h1>تعليق المعلم :-</h1>
                                <h2>
                                    الطالب ممتاز ولم يقصر في الحفظ او اي شيئ
                                </h2>
                            </div>
                            <h1>تقييم مستوي الطالب لهذه الحصة </h1>
                            <div className="userProgress__rate">
                                <div className="testimonialsView__ratingStars">
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
                        <div className="userProgress__comments">
                            <div className="userProgress__title">
                                <h1>
                                    الحصة بتاريخ: <span>2026-01-06</span>
                                </h1>
                            </div>
                            <div className="userProgress__data">
                                <h4>سورة البقرة</h4>
                                <h2>
                                    محتوي الحصة :
                                    <span>حفظ من ايه 24 الي 31</span>
                                </h2>
                                <h2>مراجعة من ايه 10 الي ايه 24 </h2>
                            </div>
                            <div className="userProgress__comment">
                                <h1>تعليق المعلم :-</h1>
                                <h2 id="userProfile__commentBad">
                                    للاسف تقصير شديد من الطالب
                                </h2>
                            </div>
                            <h1>تقييم مستوي الطالب لهذه الحصة </h1>
                            <div className="userProgress__rate">
                                <div className="testimonialsView__ratingStars">
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
                        <div className="userProgress__comments">
                            <div className="userProgress__title">
                                <h1>
                                    الحصة بتاريخ: <span>2026-01-06</span>
                                </h1>
                            </div>
                            <div className="userProgress__data">
                                <h4>سورة البقرة</h4>
                                <h2>
                                    محتوي الحصة :
                                    <span>حفظ من ايه 24 الي 31</span>
                                </h2>
                                <h2>مراجعة من ايه 10 الي ايه 24 </h2>
                            </div>
                            <div className="userProgress__comment">
                                <h1>تعليق المعلم :-</h1>
                                <h2>
                                    الطالب ممتاز ولم يقصر في الحفظ او اي شيئ
                                </h2>
                            </div>
                            <h1>تقييم مستوي الطالب لهذه الحصة </h1>
                            <div className="userProgress__rate">
                                <div className="testimonialsView__ratingStars">
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
                        <div className="userProgress__comments">
                            <div className="userProgress__title">
                                <h1>
                                    الحصة بتاريخ: <span>2026-01-06</span>
                                </h1>
                            </div>
                            <div className="userProgress__data">
                                <h4>سورة البقرة</h4>
                                <h2>
                                    محتوي الحصة :
                                    <span>حفظ من ايه 24 الي 31</span>
                                </h2>
                                <h2>مراجعة من ايه 10 الي ايه 24 </h2>
                            </div>
                            <div className="userProgress__comment">
                                <h1>تعليق المعلم :-</h1>
                                <h2>
                                    الطالب ممتاز ولم يقصر في الحفظ او اي شيئ
                                </h2>
                            </div>
                            <h1>تقييم مستوي الطالب لهذه الحصة </h1>
                            <div className="userProgress__rate">
                                <div className="testimonialsView__ratingStars">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProgress;
