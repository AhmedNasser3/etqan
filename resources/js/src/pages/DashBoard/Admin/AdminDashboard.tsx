import { PiWhatsappLogoDuotone } from "react-icons/pi";
import CentersManagement from "./Center/CentersMangement";

const AdminDashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <div className="dashboard__features">
                <CentersManagement />
            </div>
        </div>
    );
};

export default AdminDashboard;
