import Features from "./home/Features";
import FinalCTA from "./home/FinalCTA";
import Home from "./home/Home";
import HowItWorksSection from "./home/HowItWorksSection";
import Security from "./home/Security";
import Stats from "./home/Stats";
import StudentTestimonials from "./home/StudentTestimonials";
import Testimonials from "./home/Testimonials";
import Trusted from "./home/Trusted";
const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <Home />
            <div className="dashboard__features">
                <Features />
            </div>
            <div className="dashboard__stats">
                <Stats />
            </div>
            <div className="dashboard__studentTestimonials">
                <StudentTestimonials />
            </div>
            <div className="dashboard__testimonials">
                <Testimonials />
            </div>
            <div className="dashboard__howItWorksSection">
                <HowItWorksSection />
            </div>
            <div className="dashboard__security">
                <Security />
            </div>
            <div className="dashboard__trusted">
                <Trusted />
            </div>
            <div className="dashboard__finalCTA">
                <FinalCTA />
            </div>
        </div>
    );
};

export default Dashboard;
