import { useAuthUser } from "./hooks/useAuthUser"; // ضبط المسار حسب مكان الهوك
import EmailVerifyWidget from "../../../UserDashboard/widgets/EmailVerifyWidget";
import Men from "../../../../../assets/images/facelessAvatar.png";

const Profile: React.FC = () => {
    const { user, loading } = useAuthUser();

    return <div className="userProfile"></div>;
};

export default Profile;
