import { GrSecure } from "react-icons/gr";
import { FaShieldHalved } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { MdSettingsApplications } from "react-icons/md";
import { SiAdobeaudition } from "react-icons/si";
import { FaCloud } from "react-icons/fa";

const Security: React.FC = () => {
    return (
        <div className="security">
            <div className="security__inner">
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <GrSecure />
                        </i>
                        <h2> %عزل بيانات المجمعات 100</h2>
                    </div>
                </div>
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <FaShieldHalved />
                        </i>
                        <h2>OTP + 2FA غير قابل للنسخ </h2>
                    </div>
                </div>
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <FaUsers />
                        </i>
                        <h2>يدعم آلاف الطلاب</h2>
                    </div>
                </div>
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <MdSettingsApplications />
                        </i>
                        <h2> PWA يشتغل أوفلاين</h2>
                    </div>
                </div>
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <SiAdobeaudition />
                        </i>
                        <h2>Audit Log لكل عملية</h2>
                    </div>
                </div>
                <div className="security__content">
                    <div className="security__data">
                        <i>
                            <FaCloud />
                        </i>
                        <h2> Cloud جاهز للـ</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
