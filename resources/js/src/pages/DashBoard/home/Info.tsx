import { useEffect, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";
import img1 from "../../../assets/images/Untitled-1.png";
import { IoCreateOutline } from "react-icons/io5";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { PiStepsFill } from "react-icons/pi";

const Info: React.FC = () => {
    return (
        <div className="Info">
            <div className="Info__container">
                <div className="Info__title">
                    <h1>حلول سراج تدعمك بكل خطوة من مشوارك التعليمي</h1>
                </div>
                <div className="Info__content">
                    <div className="Info__data">
                        <div className="Info__imgs">
                            <img src={img1} alt="" />
                        </div>
                        <div className="Info__text">
                            <div className="Info__textTitle">
                                <h4>
                                    انشاء وادارة المجمع
                                    <i>
                                        <IoCreateOutline />
                                    </i>
                                </h4>
                            </div>
                            <div className="Info__dataText">
                                <h1>انطلاقتك التعليمية سهلة عندنا. </h1>
                                <h4>
                                    لا تحتاج لخبرة سابقة أو تفرغ تام لتبدأ مع
                                    سراج
                                </h4>
                                <p className="dot">
                                    ادارة بكل التفاصيل مجمعك
                                    <i>
                                        <TbEaseInOutControlPoints />
                                    </i>
                                </p>
                                <p className="dot">
                                    اضف موظفينك , خططك, المواعيد, المرتبات
                                    موظفينك, تقارير شاملة للمجمع, صفحة ولي امر,
                                    حضور ذكي ...
                                    <i>
                                        <MdOutlineManageAccounts />
                                    </i>
                                </p>
                                <p className="dot">
                                    خطوات سهلة وسريعة لانشاء مجمعك
                                    <i>
                                        <PiStepsFill />
                                    </i>
                                </p>
                            </div>
                            <div className="Info__btn">
                                <a href="/center-register">
                                    <button>انشيئ مجمعك الأن</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Info;
