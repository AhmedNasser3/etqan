import UserMeetCard from "../userMeet/UserMeetCard";
import UserPlans from "../userPlans/UserPlans";

const Plans: React.FC = () => {
    return (
        <div className="userProfile__plans">
            <div>
                <UserPlans />
                <UserMeetCard />
            </div>
        </div>
    );
};

export default Plans;
