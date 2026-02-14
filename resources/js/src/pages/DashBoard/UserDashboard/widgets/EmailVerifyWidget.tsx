import { useAuthUser } from "./hooks/useAuthUser";

const EmailVerifyWidget: React.FC = () => {
    const { user, loading, error } = useAuthUser();

    return (
        <div className="userProfile__content">
            <div className="userProfile__text">
                <span>: البريد الالكتروني</span>
                <div className="userProfile__description">
                    {loading ? (
                        <p className="text-gray-500 animate-pulse">
                            جاري التحميل...
                        </p>
                    ) : error ? (
                        <p className="text-red-500 text-sm">{error}</p>
                    ) : user?.email ? (
                        <p className="font-medium">{user.email}</p>
                    ) : (
                        <p className="text-gray-500 italic">غير مسجل دخول</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerifyWidget;
