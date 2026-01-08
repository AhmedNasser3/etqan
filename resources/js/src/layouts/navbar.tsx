import { FaHome } from "react-icons/fa";
import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { HiLogin } from "react-icons/hi";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { MdCallMade } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";

const Navbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});

    const toggleDropdown = (key: string) => {
        setDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const closeAllDropdowns = () => {
        setDropdowns({});
    };

    return (
        <div
            className={`navbar ${isRotated ? "active" : ""}`}
            onClick={closeAllDropdowns}
        >
            <div className="navbar__inner">
                <div className="navbar__container">
                    <div
                        className={`navbar__toggle ${
                            isRotated ? "rotated" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRotated(!isRotated);
                            document
                                .querySelector(".sidebar")
                                ?.classList.toggle("active");
                            document
                                .querySelector(".navbar")
                                ?.classList.toggle("active");
                        }}
                    >
                        <i>
                            <VscListFlat />
                        </i>
                    </div>
                    <div className="navbar__profileName">
                        <div className="navbar__profile">
                            <span>A</span>
                        </div>
                        <h4
                            className="navbar__link"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown("profile");
                            }}
                        >
                            <i>
                                <IoIosArrowDown
                                    className={`navbar__arrow ${
                                        dropdowns.profile ? "flipped" : ""
                                    }`}
                                />{" "}
                            </i>
                            احمد ناصر
                            <ul
                                className={`navbar__dropdown ${
                                    dropdowns.profile ? "dropped" : ""
                                }`}
                                id="navbar__profileDropDown"
                            >
                                <a href="user-dashboard">
                                    <li>
                                        <FaUserAlt />
                                        حسابي
                                    </li>
                                </a>
                                <a href="#">
                                    <li>
                                        <IoSettings />
                                        اعدادات
                                    </li>
                                </a>
                                <a href="#">
                                    <li>
                                        <BsTable />
                                        جدول
                                    </li>
                                </a>
                            </ul>
                        </h4>
                        <a
                            href="/login"
                            id="navbar__active"
                            className="navbar__link"
                        >
                            <HiLogin />
                            تسجيل الدخول
                        </a>
                    </div>
                </div>

                <div className="navbar__links">
                    <ul>
                        <li>
                            <a
                                href="/"
                                id="navbar__active"
                                className="navbar__link"
                            >
                                <FaHome />
                                الرئيسية
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                برنامج الحفظ والتلاوة
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                الدورات والبرامج
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                الخرائط الذهنية
                            </a>
                        </li>

                        <li className="navbar__dropdown-item">
                            <a
                                className="navbar__link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown("platform");
                                }}
                            >
                                <IoIosArrowDown
                                    className={`navbar__arrow ${
                                        dropdowns.platform ? "flipped" : ""
                                    }`}
                                />
                                عن منصة اتقان
                            </a>
                            <ul
                                className={`navbar__dropdown ${
                                    dropdowns.platform ? "dropped" : ""
                                }`}
                            >
                                <li>
                                    <MdCallMade />
                                    تواصل معنا
                                </li>
                                <li>
                                    <FaCircleQuestion />
                                    من نحن
                                </li>
                            </ul>
                        </li>

                        <li className="navbar__dropdown-item">
                            <a
                                className="navbar__link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown("register");
                                }}
                            >
                                <IoIosArrowDown
                                    className={`navbar__arrow ${
                                        dropdowns.register ? "flipped" : ""
                                    }`}
                                />
                                التسجيل
                            </a>
                            <ul
                                className={`navbar__dropdown ${
                                    dropdowns.register ? "dropped" : ""
                                }`}
                            >
                                <a href="">
                                    <li>
                                        <LuUserRoundPlus />
                                        تسجيل مستخدم جديد
                                    </li>
                                </a>
                                <a href="#">
                                    <li>
                                        <HiLogin />
                                        تسجيل دخول
                                    </li>
                                </a>
                            </ul>
                        </li>

                        <li>
                            <a href="#" className="navbar__link">
                                <IoIosArrowDown />
                                مقرأة التليجرام
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="navbar__user">
                    <img
                        src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                        alt="لوجو"
                    />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
