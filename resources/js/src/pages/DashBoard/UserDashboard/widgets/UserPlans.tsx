import { RiRobot2Fill } from "react-icons/ri";
import { SiBookstack } from "react-icons/si";
import { GrStatusGood } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";

const UserPlans: React.FC = () => {
    return (
        <div className="userProfile__plan">
            <div className="plan__header">
                <div className="plan__current">
                    <h2>خطتك اليومية</h2>
                    <div className="plan__progress">
                        <i>
                            <SiBookstack />
                        </i>{" "}
                        البقرة ٥١-٥٥ <span>٤٨٪</span>
                    </div>
                </div>
                <div className="plan__ai-suggestion">
                    <i>
                        <RiRobot2Fill />
                    </i>{" "}
                    راجع آية ٤٨ مرة تانية
                </div>
            </div>

            <div className="plan__daily-table">
                <table>
                    <thead>
                        <tr>
                            <th>اليوم</th>
                            <th>الحفظ الجديد</th>
                            <th>المراجعة</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="plan__row completed">
                            <td>الأحد</td>
                            <td>البقرة ٤٦-٥٠</td>
                            <td>البقرة ١-١٠</td>
                            <td>
                                <span>
                                    <i>
                                        <GrStatusGood />
                                    </i>{" "}
                                    مكتمل
                                </span>
                            </td>
                        </tr>
                        <tr className="plan__row active">
                            <td>الإثنين</td>
                            <td>البقرة ٥١-٥٥</td>
                            <td>البقرة ١١-٢٠</td>
                            <td>
                                <span>
                                    <i>
                                        <PiTimerDuotone />
                                    </i>{" "}
                                    قيد التنفيذ
                                </span>
                            </td>
                        </tr>
                        <tr className="plan__row pending">
                            <td>الثلاثاء</td>
                            <td>البقرة ٥٦-٦٠</td>
                            <td>البقرة ٢١-٣٠</td>
                            <td>
                                <span>
                                    <i>
                                        <PiTimerDuotone />
                                    </i>
                                    قيد الانتظار
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i>
                            <GoGoal />
                        </i>
                    </div>
                    <div>
                        <h3>هدف اليوم</h3>
                        <p>البقرة ٥١-٥٥</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i>
                            <FaStar />
                        </i>
                    </div>
                    <div>
                        <h3>نقاط اليوم</h3>
                        <p>٢٥/٥٠</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i>
                            <PiWhatsappLogoDuotone />
                        </i>
                    </div>
                    <div>
                        <h3>تم إرسالها</h3>
                        <p>على الواتساب</p>
                    </div>
                </div>
            </div>

            <div className="plan__progress-bar">
                <div className="progress-label">
                    <span>الجزء الثاني: ٦٠٪</span>
                    <span>القرآن كامل: ٢٥٪</span>
                </div>
                <div className="progress-fill"></div>
            </div>
        </div>
    );
};

export default UserPlans;
