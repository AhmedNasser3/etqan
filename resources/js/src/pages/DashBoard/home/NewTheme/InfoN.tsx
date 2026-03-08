import { useEffect, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";
import img1 from "../../../../assets/images/Untitled-1.png";
import { IoCreateOutline } from "react-icons/io5";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { PiStepsFill } from "react-icons/pi";
import { FaMosque } from "react-icons/fa6";

const InfoN: React.FC = () => {
    return (
        <div className="Info" style={{ padding: "0 15%" }}>
            <div className="Info__container">
                <div className="Info__title">
                    <h1>الحل الشامل لإدارة الحلقات القرآنية بتقنية حديثة</h1>
                </div>
                <div className="Info__content" id="Info__content">
                    <div className="Info__data">
                        <div className="Info__imgs">
                            <span>
                                <FaMosque />
                            </span>
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
                                <h1>إدارة مجمعك القرآني تبدأ بخطوة واحدة </h1>
                                <h4>
                                    ادير مجمعك القرآني من جوالك في دقائق يومياً
                                </h4>
                                <p className="dot">
                                    امكانية ادارة جميع تفاصيل مجمعك
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

export default InfoN;
