import { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

interface AttendanceModelProps {
    isOpen: boolean;
    onClose: () => void;
    staffName: string;
}

const AttendanceModel: React.FC<AttendanceModelProps> = ({
    isOpen,
    onClose,
    staffName,
}) => {
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("تم حفظ الملاحظات بنجاح!");
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
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>الموظف: {staffName}</h1>
                                <p>
                                    كتابة ملاحظة عن الموظف توضح ما اذا كان مقصر
                                    ام لا
                                </p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="text-lg font-semibold mb-4 block">
                                        الملاحظات
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="اكتب ملاحظاتك هنا..."
                                        rows={8}
                                        className="ParentModel__comment w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="submit"
                                    form="attendanceForm"
                                    className="w-full"
                                    onClick={handleSubmit}
                                >
                                    حفظ الملاحظات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModel;
