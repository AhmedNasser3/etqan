import Footer from "@/src/layouts/Footer";
import CenterAdd from "./home/CenterAdd";
import Complexes from "./home/Complexes";
import ContactForm from "./home/contactForm";
import Features from "./home/Features";
import FinalCTA from "./home/FinalCTA";
import Home from "./home/Home";
import HowItWorksSection from "./home/HowItWorksSection";
import PlatformShowcase from "./home/PlatformShowcase";
import Security from "./home/Security";
import Stats from "./home/Stats";
import StudentTestimonials from "./home/StudentTestimonials";
import Testimonials from "./home/Testimonials";
import Trusted from "./home/Trusted";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import SHero from "./home/SHero";
import Info from "./home/Info";

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <SHero />
            <div className="dashboard__features">
                <Features />
            </div>
            <Info />
            <div className="dashboard__stats">
                <CenterAdd />
            </div>
            <div className="dashboard__stats">
                <Stats />
            </div>
            {/* <Home /> */}
            <div className="dashboard__howItWorksSection">
                <HowItWorksSection />
            </div>
            <div className="dashboard__stats">
                <PlatformShowcase />
            </div>
            {/* <div className="dashboard__studentTestimonials">
                <StudentTestimonials />
            </div> */}
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
            {/* <div className="dashboard__testimonials">
                <Testimonials />
            </div> */}
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
            <Footer />
        </div>
    );
};

export default Dashboard;
