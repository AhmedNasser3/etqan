import React from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import {
    useUpdateMeetingForm,
    MeetingType,
} from "../hooks/useUpdateMeetingForm";

interface UpdateMeetingModalProps {
    meeting: MeetingType | null;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateMeetingModal: React.FC<UpdateMeetingModalProps> = ({
    meeting,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        teachers,
        students,
        centers,
        schedules,
        planDetails,
        loadingTeachers,
        loadingStudents,
        loadingCenters,
        loadingSchedules,
        loadingPlanDetails,
        handleInputChange,
        submitForm,
    } = useUpdateMeetingForm(meeting);

    const handleSubmit = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    if (!meeting) return null;

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
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>تعديل ميتينج بين المعلم والطالب</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل الميتينج</h1>
                                <p>قم بتحديث تفاصيل الميتينج المحدد</p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* معلومات الميتينج الحالية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
                                    <h3 className="font-semibold text-blue-800 mb-2">
                                        معلومات الميتينج الحالية:
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">
                                                المعلم:
                                            </span>
                                            <span className="font-medium ml-2">
                                                {meeting.teacher.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">
                                                الطالب:
                                            </span>
                                            <span className="font-medium ml-2">
                                                {meeting.student.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">
                                                الكود:
                                            </span>
                                            <span className="font-mono bg-white px-2 py-1 rounded text-xs ml-2">
                                                {meeting.meeting_code}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">
                                                الرابط:
                                            </span>
                                            <span className="text-blue-600 underline ml-2 text-xs truncate">
                                                {meeting.jitsi_meeting_url}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* المعلم */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        المعلم{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="teacher_id"
                                        value={formData.teacher_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.teacher_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingTeachers
                                        }
                                    >
                                        <option value={0}>
                                            -- اختر المعلم --
                                        </option>
                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.teacher_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الطالب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        الطالب{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="student_id"
                                        value={formData.student_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                            errors.student_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingStudents
                                        }
                                    >
                                        <option value={0}>
                                            -- اختر الطالب --
                                        </option>
                                        {students.map((student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.student_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.student_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المركز */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        المركز{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="center_id"
                                        value={formData.center_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                            errors.center_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingCenters
                                        }
                                    >
                                        <option value={0}>
                                            -- اختر المركز --
                                        </option>
                                        {centers.map((center) => (
                                            <option
                                                key={center.id}
                                                value={center.id}
                                            >
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.center_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.center_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* جدول الحصة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        جدول الحصة{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="plan_circle_schedule_id"
                                        value={formData.plan_circle_schedule_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.plan_circle_schedule_id ||
                                            loadingSchedules
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingSchedules ||
                                            formData.center_id === 0
                                        }
                                    >
                                        <option value={0}>
                                            -- اختر جدول الحصة --
                                        </option>
                                        {schedules.map((schedule) => (
                                            <option
                                                key={schedule.id}
                                                value={schedule.id}
                                            >
                                                {schedule.schedule_date} -{" "}
                                                {schedule.start_time}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_circle_schedule_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.plan_circle_schedule_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* تفاصيل خطة الطالب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        تفاصيل خطة الطالب{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="student_plan_detail_id"
                                        value={formData.student_plan_detail_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                            errors.student_plan_detail_id ||
                                            loadingPlanDetails
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingPlanDetails ||
                                            formData.plan_circle_schedule_id ===
                                                0
                                        }
                                    >
                                        <option value={0}>
                                            -- اختر تفاصيل الخطة --
                                        </option>
                                        {planDetails.map((detail) => (
                                            <option
                                                key={detail.id}
                                                value={detail.id}
                                            >
                                                يوم {detail.day_number}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.student_plan_detail_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.student_plan_detail_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* تاريخ الميتينج */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        تاريخ الميتينج{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="meeting_date"
                                        value={formData.meeting_date}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.meeting_date
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.meeting_date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.meeting_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* وقت البداية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>
                                        وقت البداية{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="meeting_start_time"
                                        value={formData.meeting_start_time}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.meeting_start_time
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.meeting_start_time && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.meeting_start_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-vertical"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        "تحديث الميتينج"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateMeetingModal;
