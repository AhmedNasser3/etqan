import UserProfile from "./widgets/userProfile";

const UserDashboard: React.FC = () => {
    return (
        <div className="userDashboard">
            <div className="userDashboard__features">
                <UserProfile />
            </div>
        </div>
    );
};

export default UserDashboard;
