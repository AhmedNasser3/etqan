import { PiWhatsappLogoDuotone } from "react-icons/pi";
import CentersManagement from "./Center/CentersMangement";
import StudentAffairsPlatform from "./StudentAffairsPlatform/StudentAffairsPlatform";
import TeachersAffairsPlatform from "./TeachersAffairsPlatform/TeachersAffairsPlatform";
import DomainRequestsAdminManagement from "./DomainRequestsAdminManagement/DomainRequestsAdminManagement";

const AdminDashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <div className="dashboard__features">
                <CentersManagement />
                <StudentAffairsPlatform />
                <TeachersAffairsPlatform />
                <DomainRequestsAdminManagement />
            </div>
        </div>
    );
};

export default AdminDashboard;
