import UserPlans from "./userPlans/UserPlans";
import UserProfile from "./widgets/userProfile";

const UserDashboard: React.FC = () => {
    return (
        <div className="userDashboard">
            <div className="userDashboard__features">
                <UserProfile />
                <UserPlans />
            </div>
        </div>
    );
};

export default UserDashboard;
