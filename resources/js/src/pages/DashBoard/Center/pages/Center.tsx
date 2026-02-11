// pages/Center.tsx
import { useFeaturedCenter } from "./hooks/useFeaturedCenter";
import { useAuthUser } from "../../../../layouts/hooks/useAuthUser"; // ✅ Hook جديد
import QURANN from "../../../../assets/images/qurann.png";
import Features from "../../home/Features";
import CenterStats from "./components/CenterStats";
import CenterStudentTestimonials from "./components/CenterStudentTestimonials";
import CenterTeacherTestimonials from "./components/CenterTeacherTestimonials";
import PlanCards from "../../UserDashboard/plans/models/PlanCards";
import FeaturedPlansCards from "./components/FeaturedPlansCards";

const CenterPage: React.FC = () => {
    const { name, loading: centerLoading, error } = useFeaturedCenter();
    const { user, loading: authLoading } = useAuthUser(); // ✅ استدعاء Auth Hook

    // ✅ Loading للـ center أو auth
    if (centerLoading || authLoading) {
        return (
            <div className="center-loading">
                <div>جاري تحميل المجمع...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="center-error">
                <div>خطأ: {error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="home">
                <img
                    className="img__cover"
                    src="https://static.vecteezy.com/system/resources/thumbnails/038/357/397/small/islamic-frame-design-free-png.png"
                    alt="إطار إسلامي"
                />
                <div className="home__inner">
                    <div className="home__images">
                        <img className="img__main" src={QURANN} alt="قرآن" />
                        <img
                            className="img__submain"
                            src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                            alt="إطار"
                        />
                        <img
                            className="img__submain_2"
                            src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                            alt="إطار"
                        />
                        <img
                            className="img__submain_3"
                            src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                            alt="إطار"
                        />
                    </div>
                    <div className="home__content">
                        <div className="home__title">
                            <h1>أهلاً بك في {name}</h1>
                            <p>
                                {name} ، مجمع قرآني مميز، عبارة عن منصة
                                إلكترونية مستقلة تتيح تعلم القرآن الكريم وتعليمه
                                للجميع حول العالم عبر وسائل التواصل الاجتماعي
                                المختلفة.
                            </p>
                        </div>
                        <div className="home__btns">
                            <button className="btn-primary">
                                <i>▶️ ابدأ التعلم</i>
                            </button>
                            <button className="btn-secondary">
                                <i>🔍 استكشف المعلمين</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Features />
            <CenterStats />
            <CenterStudentTestimonials />
            <CenterTeacherTestimonials />

            {/* ✅ الشرط: مسجل دخول = PlanCards | غير مسجل = FeaturedPlansCards */}
            {user ? <PlanCards type="available" /> : <FeaturedPlansCards />}
        </>
    );
};

export default CenterPage;
