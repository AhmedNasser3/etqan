import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";
import img1 from "../../../../assets/images/Untitled-1.png";
import { IoCreateOutline } from "react-icons/io5";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { PiStepsFill } from "react-icons/pi";
import { FaMosque } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { MdConfirmationNumber } from "react-icons/md";
import { FaHeartCirclePlus } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

const StatsN: React.FC = () => {
    const [counters, setCounters] = useState({
        students: 0,
        episodes: 0,
        progress: 0,
    });
    const statsRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    const animateCounter = (
        start: number,
        end: number,
        duration: number,
        setter: (value: number) => void,
    ) => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // smooth easing
            const current = Math.floor(start + (end - start) * easeProgress);

            setter(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        step();
    };

    const startAnimation = () => {
        if (hasAnimated) return;

        // ✅ أرقام واقعية
        animateCounter(0, 15623, 2000, (value) =>
            setCounters((prev) => ({ ...prev, students: value })),
        );

        animateCounter(0, 847, 2000, (value) =>
            setCounters((prev) => ({ ...prev, episodes: value })),
        );

        animateCounter(0, 97, 2000, (value) =>
            setCounters((prev) => ({ ...prev, progress: value })),
        );

        setHasAnimated(true);
    };

    const formatNumber = (num: number, isPercent?: boolean) => {
        return isPercent ? `${num}%` : num.toLocaleString();
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        startAnimation();
                    }
                });
            },
            { threshold: 0.3 },
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    return (
        <div className="Info" style={{ padding: "0 15%" }} ref={statsRef}>
            <div className="Info__container">
                <div className="Info__content" id="Info__content">
                    <div className="stats__container">
                        <div className="stats__content">
                            <div className="stats__data">
                                <h2>{formatNumber(counters.students)}</h2>
                                <span>+</span>
                                <span>
                                    <FaUser />
                                </span>
                            </div>
                            <h2>عدد الطلاب</h2>
                        </div>
                        <div className="stats__content">
                            <div className="stats__data">
                                <h2>{formatNumber(counters.episodes)}</h2>
                                <span>+</span>
                                <span>
                                    <FaMosque />
                                </span>
                            </div>
                            <h2>عدد المساجد لدينا</h2>
                        </div>
                        <div className="stats__content">
                            <div className="stats__data">
                                <h2>{formatNumber(counters.progress, true)}</h2>
                                <span>+</span>
                                <span>
                                    <FaHeartCirclePlus />
                                </span>
                            </div>
                            <h2>الجهات المستفيدة</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsN;
