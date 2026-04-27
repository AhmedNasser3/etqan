import UserMeetCard from "../userMeet/UserMeetCard";
import UserPlans from "../userPlans/UserPlans";

const Plans: React.FC = () => {
    return (
        <div>
            <div className="content">
                <UserMeetCard />
            </div>
            <UserPlans />
        </div>
    );
};

export default Plans;
