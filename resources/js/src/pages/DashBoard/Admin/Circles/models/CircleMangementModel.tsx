import { useState } from "react";
import { FiX } from "react-icons/fi";

interface CircleManagementModelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
}

const CircleManagementModel: React.FC<CircleManagementModelProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<FormData>(new FormData());

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const target = e.target;
        formData.set(target.name, target.value);
        setFormData(new FormData(formData));
    };

    if (!isOpen) return null;

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={onClose}
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>ربط حسابات الموظف</h1>
                                <p>
                                    يرجي ربط الحسابات المطلوبة لضمان استلام
                                    راتبك بشكل سليم
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div
                                className="ParentModel__container"
                                style={{ padding: "24px" }}
                            >
                                <div className="inputs">
                                    <div className="inputs__inner">
                                        <div className="inputs__container">
                                            {/* الحقول الأساسية */}
                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="circle_name">
                                                    اسم المجمع *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="circle_name"
                                                    id="circle_name"
                                                    placeholder="مجمع الإمام الشافعي"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="manager_name">
                                                    اسم المدير *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="manager_name"
                                                    id="manager_name"
                                                    placeholder="محمد أحمد محمد علي"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="manager_email">
                                                    بريد المدير *
                                                </label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="manager_email"
                                                    id="manager_email"
                                                    placeholder="manager@shaafi.com"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTPBirth">
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="country_code">
                                                        كود الدولة
                                                    </label>
                                                    <select
                                                        name="country_code"
                                                        id="country_code"
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    >
                                                        <option value="966">
                                                            966+
                                                        </option>
                                                        <option value="20">
                                                            20+
                                                        </option>
                                                        <option value="971">
                                                            971+
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="manager_phone">
                                                        رقم الجوال *
                                                    </label>
                                                    <input
                                                        required
                                                        type="tel"
                                                        name="manager_phone"
                                                        id="manager_phone"
                                                        placeholder="50 123 4567"
                                                        className="inputs__phone-input"
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="hosting_provider">
                                                    اسم الاستضافة الخاصة بك *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="hosting_provider"
                                                    id="hosting_provider"
                                                    placeholder="مثال: Hetzner, AWS, GoDaddy"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            {/* قسم منفصل للدومين (اختياري) */}
                                            <div className="inputs__domain-section">
                                                <h3
                                                    style={{
                                                        margin: "20px 0 10px 0",
                                                        color: "#666",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    ربط الدومين (اختياري)
                                                </h3>
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="domain">
                                                        اربط دومينك الخاص
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="domain"
                                                        id="domain"
                                                        placeholder="shaafi-circle.com"
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="circle_link">
                                                    رابط الموقع الحالي
                                                </label>
                                                <input
                                                    type="url"
                                                    name="circle_link"
                                                    id="circle_link"
                                                    placeholder="https://shaafi-circle.com"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="dns_nameservers">
                                                    معلومات الـ DNS (Name
                                                    Servers)
                                                </label>
                                                <textarea
                                                    name="dns_nameservers"
                                                    id="dns_nameservers"
                                                    rows={3}
                                                    placeholder="ns1.yourhost.com
ns2.yourhost.com"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="logo">
                                                    شعار المجمع (اختياري)
                                                </label>
                                                <input
                                                    type="url"
                                                    name="logo"
                                                    id="logo"
                                                    placeholder="https://example.com/logo.png"
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="notes">
                                                    ملاحظات إضافية
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    id="notes"
                                                    rows={3}
                                                    placeholder="ملاحظات حول النقل أو الربط..."
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__submitBtn">
                                                <button type="submit">
                                                    حفظ إعدادات المجمع
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircleManagementModel;
