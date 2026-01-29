import { useState, useEffect, useRef } from "react";
import { FiX, FiSearch } from "react-icons/fi";

interface MosqueManagementModelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    isEdit?: boolean;
    defaultData?: any;
}

const MosqueManagementModel: React.FC<MosqueManagementModelProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isEdit = false,
    defaultData,
}) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [searchCircle, setSearchCircle] = useState("");
    const [searchSupervisor, setSearchSupervisor] = useState("");
    const [showCircleOptions, setShowCircleOptions] = useState(false);
    const [showSupervisorOptions, setShowSupervisorOptions] = useState(false);

    const circles = [
        "مجمع الإمام الشافعي",
        "مجمع الإمام مالك",
        "مجمع النور",
        "مجمع التقوى",
        "مجمع الرحمة",
    ];

    const supervisors = [
        "أحمد محمد صالح",
        "محمد علي حسن",
        "عبدالله خالد",
        "فاطمة أحمد علي",
        "سارة محمد خالد",
    ];

    useEffect(() => {
        if (isEdit && defaultData && formRef.current) {
            const formData = new FormData();
            formData.set("mosque_name", defaultData.name || "");
            formData.set("circle", defaultData.circle || "");
            formData.set("supervisor", defaultData.supervisor || "");
            formData.set("logo", defaultData.logo || "");

            const mosqueNameInput = formRef.current.querySelector(
                "#mosque_name",
            ) as HTMLInputElement;
            const circleInput = formRef.current.querySelector(
                'input[name="circle"]',
            ) as HTMLInputElement;
            const supervisorInput = formRef.current.querySelector(
                'input[name="supervisor"]',
            ) as HTMLInputElement;

            if (mosqueNameInput) mosqueNameInput.value = defaultData.name || "";
            if (circleInput) circleInput.value = defaultData.circle || "";
            if (supervisorInput)
                supervisorInput.value = defaultData.supervisor || "";

            setSearchCircle(defaultData.circle || "");
            setSearchSupervisor(defaultData.supervisor || "");
        } else if (formRef.current) {
            const formData = new FormData();
            const mosqueNameInput = formRef.current.querySelector(
                "#mosque_name",
            ) as HTMLInputElement;
            if (mosqueNameInput) mosqueNameInput.value = "";
            setSearchCircle("");
            setSearchSupervisor("");
        }
    }, [isEdit, defaultData]);

    const filteredCircles = circles.filter((circle) =>
        circle.includes(searchCircle),
    );

    const filteredSupervisors = supervisors.filter((supervisor) =>
        supervisor.includes(searchSupervisor),
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current) {
            onSubmit(new FormData(formRef.current));
        }
        onClose();
    };

    const handleSelectCircle = (circle: string) => {
        setSearchCircle(circle);
        const circleInput = formRef.current?.querySelector(
            'input[name="circle"]',
        ) as HTMLInputElement;
        if (circleInput) circleInput.value = circle;
        setShowCircleOptions(false);
    };

    const handleSelectSupervisor = (supervisor: string) => {
        setSearchSupervisor(supervisor);
        const supervisorInput = formRef.current?.querySelector(
            'input[name="supervisor"]',
        ) as HTMLInputElement;
        if (supervisorInput) supervisorInput.value = supervisor;
        setShowSupervisorOptions(false);
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
                                <p>2026-01-27 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>
                                    {isEdit
                                        ? "تعديل بيانات المسجد"
                                        : "إضافة مسجد جديد"}
                                </h1>
                                <p>
                                    {isEdit
                                        ? "قم بتعديل بيانات المسجد لضمان الدقة في السجلات"
                                        : "املأ البيانات التالية لإضافة مسجد جديد للنظام"}
                                </p>
                            </div>
                        </div>
                        <form ref={formRef} onSubmit={handleSubmit}>
                            <div
                                className="ParentModel__container"
                                style={{ padding: "24px" }}
                            >
                                <div className="inputs">
                                    <div className="inputs__inner">
                                        <div className="inputs__container">
                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="mosque_name">
                                                    اسم المسجد *
                                                </label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="mosque_name"
                                                    id="mosque_name"
                                                    placeholder="مسجد الإمام الشافعي"
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label>
                                                    المجمع التابع له *
                                                </label>
                                                <div className="search-select">
                                                    <div
                                                        className="search-select__input"
                                                        onClick={() =>
                                                            setShowCircleOptions(
                                                                !showCircleOptions,
                                                            )
                                                        }
                                                    >
                                                        <FiSearch size={18} />
                                                        <input
                                                            type="text"
                                                            value={searchCircle}
                                                            onChange={(e) =>
                                                                setSearchCircle(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="ابحث عن المجمع..."
                                                            readOnly={
                                                                !showCircleOptions
                                                            }
                                                        />
                                                    </div>
                                                    {showCircleOptions && (
                                                        <div className="search-select__options">
                                                            {filteredCircles.map(
                                                                (
                                                                    circle,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="search-select__option"
                                                                        onClick={() =>
                                                                            handleSelectCircle(
                                                                                circle,
                                                                            )
                                                                        }
                                                                    >
                                                                        {circle}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="hidden"
                                                        name="circle"
                                                    />
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label>المشرف الخاص به *</label>
                                                <div className="search-select">
                                                    <div
                                                        className="search-select__input"
                                                        onClick={() =>
                                                            setShowSupervisorOptions(
                                                                !showSupervisorOptions,
                                                            )
                                                        }
                                                    >
                                                        <FiSearch size={18} />
                                                        <input
                                                            type="text"
                                                            value={
                                                                searchSupervisor
                                                            }
                                                            onChange={(e) =>
                                                                setSearchSupervisor(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="ابحث عن المشرف..."
                                                            readOnly={
                                                                !showSupervisorOptions
                                                            }
                                                        />
                                                    </div>
                                                    {showSupervisorOptions && (
                                                        <div className="search-select__options">
                                                            {filteredSupervisors.map(
                                                                (
                                                                    supervisor,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="search-select__option"
                                                                        onClick={() =>
                                                                            handleSelectSupervisor(
                                                                                supervisor,
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            supervisor
                                                                        }
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="hidden"
                                                        name="supervisor"
                                                    />
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="logo">
                                                    شعار المسجد (اختياري)
                                                </label>
                                                <input
                                                    type="file"
                                                    name="logo"
                                                    id="logo"
                                                    accept="image/*"
                                                />
                                            </div>

                                            <div className="inputs__submitBtn">
                                                <button type="submit">
                                                    {isEdit
                                                        ? "حفظ التعديلات"
                                                        : "إضافة المسجد"}
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

export default MosqueManagementModel;
