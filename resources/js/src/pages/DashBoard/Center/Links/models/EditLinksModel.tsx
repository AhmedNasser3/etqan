import { FiX } from "react-icons/fi";

interface EditLinksModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditLinksModel: React.FC<EditLinksModelProps> = ({ isOpen, onClose }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClose();
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
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle">
                                    تعديل رابط
                                </h1>
                                <p>
                                    لماذا؟
                                    <span>
                                        يمكنك تغيير الرابط اذا تم مشاركته بشكل
                                        خاطيئ او تعطيله{" "}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <div
                                className="inputs__verifyOTPBirth"
                                style={{ gap: "0", margin: "0" }}
                            >
                                <div className="inputs__email">
                                    <label>دومينك</label>
                                    <input
                                        style={{
                                            borderRadius: "0",
                                            border: "1px solid #f3f3f3",
                                            background: "#f3f3f3",
                                            color: "#5c5c5c",
                                        }}
                                        required
                                        type="text"
                                        name="staff_name"
                                        id="staff_name"
                                        placeholder="https://etqan.center/"
                                        disabled
                                    />
                                </div>
                                <div className="inputs__email">
                                    <label> تحديث الرابط *</label>
                                    <input
                                        style={{ borderRadius: "0" }}
                                        required
                                        type="text"
                                        name="staff_name"
                                        id="staff_name"
                                        placeholder="staff/login"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditLinksModel;
