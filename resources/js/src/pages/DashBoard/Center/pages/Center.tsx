// pages/Center.tsx
import { useFeaturedCenter } from "./hooks/useFeaturedCenter";
import { useAuthUser } from "../../../../layouts/hooks/useAuthUser";
import Features from "../../home/Features";
import CenterStats from "./components/CenterStats";
import CenterStudentTestimonials from "./components/CenterStudentTestimonials";
import CenterTeacherTestimonials from "./components/CenterTeacherTestimonials";
import PlanCards from "../../UserDashboard/plans/models/PlanCards";
import FeaturedPlansCards from "./components/FeaturedPlansCards";

const QuranVisual: React.FC = () => (
    <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="bookClip">
                <rect x="240" y="60" width="200" height="280" rx="6" />
            </clipPath>
            <linearGradient id="spineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0f2d1c" />
                <stop offset="100%" stopColor="#1a4a2e" />
            </linearGradient>
        </defs>

        {/* Background geometric pattern */}
        <g opacity="0.04">
            <g transform="translate(80,80)">
                <line
                    x1="0"
                    y1="-55"
                    x2="0"
                    y2="55"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="-55"
                    y1="0"
                    x2="55"
                    y2="0"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="-39"
                    y1="-39"
                    x2="39"
                    y2="39"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="39"
                    y1="-39"
                    x2="-39"
                    y2="39"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <polygon
                    points="0,-48 9,-14 44,-14 17,9 27,44 0,24 -27,44 -17,9 -44,-14 -9,-14"
                    fill="none"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
            </g>
            <g transform="translate(600,340)">
                <line
                    x1="0"
                    y1="-55"
                    x2="0"
                    y2="55"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="-55"
                    y1="0"
                    x2="55"
                    y2="0"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="-39"
                    y1="-39"
                    x2="39"
                    y2="39"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <line
                    x1="39"
                    y1="-39"
                    x2="-39"
                    y2="39"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
                <polygon
                    points="0,-48 9,-14 44,-14 17,9 27,44 0,24 -27,44 -17,9 -44,-14 -9,-14"
                    fill="none"
                    stroke="#2d6b45"
                    strokeWidth="0.8"
                />
            </g>
            <g transform="translate(590,90)">
                <line
                    x1="0"
                    y1="-40"
                    x2="0"
                    y2="40"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="-40"
                    y1="0"
                    x2="40"
                    y2="0"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="-28"
                    y1="-28"
                    x2="28"
                    y2="28"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="28"
                    y1="-28"
                    x2="-28"
                    y2="28"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <circle
                    cx="0"
                    cy="0"
                    r="32"
                    fill="none"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill="none"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
            </g>
            <g transform="translate(90,330)">
                <line
                    x1="0"
                    y1="-40"
                    x2="0"
                    y2="40"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="-40"
                    y1="0"
                    x2="40"
                    y2="0"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="-28"
                    y1="-28"
                    x2="28"
                    y2="28"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <line
                    x1="28"
                    y1="-28"
                    x2="-28"
                    y2="28"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <circle
                    cx="0"
                    cy="0"
                    r="32"
                    fill="none"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
                <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill="none"
                    stroke="#c8a84b"
                    strokeWidth="0.7"
                />
            </g>
        </g>

        {/* Floating particles */}
        <circle cx="160" cy="140" r="2.5" fill="#c8a84b" opacity="0.35" />
        <circle cx="520" cy="180" r="2" fill="#2d6b45" opacity="0.3" />
        <circle cx="140" cy="290" r="1.8" fill="#c8a84b" opacity="0.3" />
        <circle cx="540" cy="280" r="2.5" fill="#c8a84b" opacity="0.35" />
        <circle cx="180" cy="360" r="1.5" fill="#2d6b45" opacity="0.25" />
        <circle cx="500" cy="100" r="2" fill="#2d6b45" opacity="0.3" />

        {/* Shadow under book */}
        <ellipse
            cx="340"
            cy="370"
            rx="110"
            ry="14"
            fill="#1a4a2e"
            opacity="0.12"
        />

        {/* Left cover spine */}
        <path
            d="M220,75 Q228,68 236,75 L236,355 Q228,362 220,355 Z"
            fill="url(#spineGrad)"
        />

        {/* Left page */}
        <rect x="236" y="75" width="100" height="280" fill="#faf6ef" />
        <g stroke="#c8b89a" strokeWidth="0.4" opacity="0.6">
            {[
                105, 118, 131, 144, 157, 170, 183, 196, 209, 222, 235, 248, 261,
                274, 287, 300, 313,
            ].map((y) => (
                <line key={y} x1="252" y1={y} x2="328" y2={y} />
            ))}
        </g>
        <rect
            x="244"
            y="83"
            width="84"
            height="264"
            rx="2"
            fill="none"
            stroke="#c8a84b"
            strokeWidth="0.8"
            opacity="0.5"
        />
        <rect
            x="248"
            y="87"
            width="76"
            height="256"
            rx="1"
            fill="none"
            stroke="#c8a84b"
            strokeWidth="0.4"
            opacity="0.4"
        />
        <g stroke="#c8a84b" strokeWidth="0.7" fill="none" opacity="0.7">
            <path d="M244,83 Q252,83 252,91" />
            <path d="M328,83 Q328,83 320,91" />
            <path d="M244,347 Q252,347 252,339" />
            <path d="M328,347 Q320,347 320,339" />
        </g>
        {/* Bismillah simulation */}
        <g transform="translate(286,115)" opacity="0.75">
            <path
                d="M-22,0 Q-11,-8 0,-6 Q11,-8 22,0"
                stroke="#2d4a1e"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M-18,4 Q-9,-2 0,0 Q9,-2 18,4"
                stroke="#2d4a1e"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
            />
            <circle cx="-14" cy="7" r="1.5" fill="#2d4a1e" />
            <circle cx="14" cy="7" r="1.5" fill="#2d4a1e" />
            <circle cx="0" cy="8" r="1.2" fill="#2d4a1e" />
        </g>
        {/* Left medallion */}
        <g transform="translate(286,215)">
            <circle
                cx="0"
                cy="0"
                r="22"
                fill="none"
                stroke="#c8a84b"
                strokeWidth="0.8"
                opacity="0.6"
            />
            <circle
                cx="0"
                cy="0"
                r="16"
                fill="none"
                stroke="#c8a84b"
                strokeWidth="0.5"
                opacity="0.5"
            />
            <g stroke="#c8a84b" strokeWidth="0.6" opacity="0.5">
                <line x1="0" y1="-22" x2="0" y2="22" />
                <line x1="-22" y1="0" x2="22" y2="0" />
                <line x1="-15" y1="-15" x2="15" y2="15" />
                <line x1="15" y1="-15" x2="-15" y2="15" />
            </g>
            <circle cx="0" cy="0" r="6" fill="#c8a84b" opacity="0.3" />
        </g>

        {/* Spine */}
        <rect
            x="332"
            y="68"
            width="16"
            height="294"
            rx="2"
            fill="url(#spineGrad)"
        />
        <rect
            x="334"
            y="72"
            width="12"
            height="2"
            rx="1"
            fill="#c8a84b"
            opacity="0.7"
        />
        <rect
            x="334"
            y="352"
            width="12"
            height="2"
            rx="1"
            fill="#c8a84b"
            opacity="0.7"
        />
        <rect
            x="335"
            y="205"
            width="10"
            height="1"
            rx="0.5"
            fill="#c8a84b"
            opacity="0.5"
        />

        {/* Right page */}
        <rect x="348" y="75" width="100" height="280" fill="#faf6ef" />
        <g stroke="#c8b89a" strokeWidth="0.4" opacity="0.6">
            {[
                105, 118, 131, 144, 157, 170, 183, 196, 209, 222, 235, 248, 261,
                274, 287, 300, 313,
            ].map((y) => (
                <line key={y} x1="356" y1={y} x2="432" y2={y} />
            ))}
        </g>
        <rect
            x="356"
            y="83"
            width="84"
            height="264"
            rx="2"
            fill="none"
            stroke="#c8a84b"
            strokeWidth="0.8"
            opacity="0.5"
        />
        <rect
            x="360"
            y="87"
            width="76"
            height="256"
            rx="1"
            fill="none"
            stroke="#c8a84b"
            strokeWidth="0.4"
            opacity="0.4"
        />
        <g stroke="#c8a84b" strokeWidth="0.7" fill="none" opacity="0.7">
            <path d="M356,83 Q364,83 364,91" />
            <path d="M440,83 Q440,83 432,91" />
            <path d="M356,347 Q364,347 364,339" />
            <path d="M440,347 Q432,347 432,339" />
        </g>
        <rect
            x="368"
            y="100"
            width="56"
            height="3"
            rx="1.5"
            fill="#c8a84b"
            opacity="0.5"
        />
        <rect
            x="374"
            y="109"
            width="44"
            height="2"
            rx="1"
            fill="#c8a84b"
            opacity="0.3"
        />
        {/* Right medallion */}
        <g transform="translate(398,215)">
            <circle
                cx="0"
                cy="0"
                r="22"
                fill="none"
                stroke="#c8a84b"
                strokeWidth="0.8"
                opacity="0.6"
            />
            <circle
                cx="0"
                cy="0"
                r="16"
                fill="none"
                stroke="#c8a84b"
                strokeWidth="0.5"
                opacity="0.5"
            />
            <g stroke="#c8a84b" strokeWidth="0.6" opacity="0.5">
                <line x1="0" y1="-22" x2="0" y2="22" />
                <line x1="-22" y1="0" x2="22" y2="0" />
                <line x1="-15" y1="-15" x2="15" y2="15" />
                <line x1="15" y1="-15" x2="-15" y2="15" />
            </g>
            <circle cx="0" cy="0" r="6" fill="#c8a84b" opacity="0.3" />
        </g>

        {/* Right cover spine */}
        <path
            d="M448,75 Q456,68 464,75 L464,355 Q456,362 448,355 Z"
            fill="url(#spineGrad)"
        />

        {/* Page curls */}
        <path
            d="M236,355 Q242,360 248,355 Q242,348 236,355 Z"
            fill="#e8e0d0"
            opacity="0.6"
        />
        <path
            d="M448,355 Q442,360 436,355 Q442,348 448,355 Z"
            fill="#e8e0d0"
            opacity="0.6"
        />

        {/* Bookmark ribbon */}
        <path
            d="M418,68 L418,130 L408,120 L398,130 L398,68 Z"
            fill="#c8a84b"
            opacity="0.85"
        />
        <line
            x1="398"
            y1="78"
            x2="418"
            y2="78"
            stroke="#faf6ef"
            strokeWidth="0.5"
            opacity="0.5"
        />

        {/* Crescent moon */}
        <g transform="translate(340,38)">
            <path
                d="M-12,0 A14,14 0 1 1 12,0 A10,10 0 1 0 -12,0 Z"
                fill="#c8a84b"
                opacity="0.9"
            />
            <circle cx="18" cy="-6" r="2" fill="#c8a84b" opacity="0.7" />
        </g>

        {/* Stars */}
        <g fill="#c8a84b" opacity="0.5">
            <polygon
                transform="translate(200,55) scale(0.7)"
                points="0,-8 2,-3 7,-3 3,1 5,6 0,3 -5,6 -3,1 -7,-3 -2,-3"
            />
            <polygon
                transform="translate(480,48) scale(0.7)"
                points="0,-8 2,-3 7,-3 3,1 5,6 0,3 -5,6 -3,1 -7,-3 -2,-3"
            />
            <polygon
                transform="translate(170,200) scale(0.5)"
                points="0,-8 2,-3 7,-3 3,1 5,6 0,3 -5,6 -3,1 -7,-3 -2,-3"
            />
            <polygon
                transform="translate(510,240) scale(0.5)"
                points="0,-8 2,-3 7,-3 3,1 5,6 0,3 -5,6 -3,1 -7,-3 -2,-3"
            />
        </g>
    </svg>
);

const CenterPage: React.FC = () => {
    const { name, loading: centerLoading, error } = useFeaturedCenter();
    const { user, loading: authLoading } = useAuthUser();

    if (centerLoading || authLoading) {
        return (
            <div className="quran-loading">
                <div className="quran-loading__spinner">
                    <div className="quran-loading__ring" />
                    <div className="quran-loading__ring quran-loading__ring--delay" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quran-error">
                <span className="quran-error__icon">⚠</span>
                <p>خطأ: {error}</p>
            </div>
        );
    }

    return (
        <>
            <section className="quran-hero">
                <div className="quran-hero__bg-pattern" aria-hidden="true" />
                <div
                    className="quran-hero__glow quran-hero__glow--left"
                    aria-hidden="true"
                />
                <div
                    className="quran-hero__glow quran-hero__glow--right"
                    aria-hidden="true"
                />

                <div className="quran-hero__inner">
                    <div className="quran-hero__visual">
                        <QuranVisual />
                    </div>

                    <div className="quran-hero__content">
                        <div className="quran-hero__badge">مجمع قرآني مميز</div>
                        <h1 className="quran-hero__title">
                            أهلاً بك في
                            <br />
                            <span className="quran-hero__title-name">
                                {name}
                            </span>
                        </h1>
                        <p className="quran-hero__desc">
                            {name} ، منصة إلكترونية مستقلة تتيح تعلم القرآن
                            الكريم وتعليمه للجميع حول العالم عبر وسائل التواصل
                            الاجتماعي المختلفة.
                        </p>
                        <div className="quran-hero__actions">
                            <button className="quran-btn quran-btn--primary">
                                <span className="quran-btn__icon">▶</span>
                                ابدأ التعلم
                            </button>
                            <a
                                href="#plan-cards-container"
                                className="quran-btn quran-btn--secondary"
                            >
                                استكشف الحلقات
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Features />
            <CenterStats />
            {user ? <PlanCards type="available" /> : <FeaturedPlansCards />}
            <CenterStudentTestimonials />
            <CenterTeacherTestimonials />
        </>
    );
};

export default CenterPage;
