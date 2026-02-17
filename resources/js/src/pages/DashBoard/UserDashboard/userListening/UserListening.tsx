import { RiRobot2Fill } from "react-icons/ri";
import { SiBookstack } from "react-icons/si";
import { GrStatusGood } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { useState, useEffect } from "react";
import UserMeetCard from "../userMeet/UserMeetCard";
import UserProgress from "../userProgress/UserProgress";
import UserPlans from "../userPlans/UserPlans";
const UserListening: React.FC = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dateFrom, setDateFrom] = useState(
        sevenDaysAgo.toISOString().split("T")[0],
    );
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);

    return (
        <div className="userProfile__plan">
            <UserMeetCard />
            <UserPlans />
            <UserProgress />
        </div>
    );
};

export default UserListening;
