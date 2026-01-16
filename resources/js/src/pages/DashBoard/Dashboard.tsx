import Complexes from "./home/Complexes";
import ContactForm from "./home/contactForm";
import Features from "./home/Features";
import FinalCTA from "./home/FinalCTA";
import Home from "./home/Home";
import HowItWorksSection from "./home/HowItWorksSection";
import Security from "./home/Security";
import Stats from "./home/Stats";
import StudentTestimonials from "./home/StudentTestimonials";
import Testimonials from "./home/Testimonials";
import Trusted from "./home/Trusted";
import { PiWhatsappLogoDuotone } from "react-icons/pi";

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
            <div className="dashboard__howItWorksSection">
                <HowItWorksSection />
            </div>
            <div className="dashboard__security">
                <Security />
            </div>
            {/* <div className="dashboard__trusted">
                <Trusted />
            </div> */}
            <div className="dashboard__finalCTA">
                <FinalCTA />
            </div>
            <div className="dashboard__complexes">
                <Complexes />
            </div>
            <div className="dashboard__testimonials">
                <Testimonials />
            </div>
            <div className="dashboard__ContactForm">
                <i>
                    <ContactForm />
                </i>
            </div>
            <div className="dashboard__WhatsApp">
                <i>
                    <PiWhatsappLogoDuotone />
                </i>
            </div>
        </div>
    );
};

export default Dashboard;
