import { useEffect, useRef, useState } from "react";

const Stats: React.FC = () => {
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
        setter: (value: number) => void
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

        animateCounter(0, 12345, 2000, (value) =>
            setCounters((prev) => ({ ...prev, students: value }))
        );

        animateCounter(0, 567, 2000, (value) =>
            setCounters((prev) => ({ ...prev, episodes: value }))
        );

        animateCounter(0, 92, 2000, (value) =>
            setCounters((prev) => ({ ...prev, progress: value }))
        );

        setHasAnimated(true);
    };

    const formatNumber = (num: number, isPercent?: boolean) => {
        return isPercent ? `${num}` : num.toLocaleString();
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
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    return (
        <div className="stats" ref={statsRef}>
            <div className="stats__inner">
                <div className="stats__container">
                    <div className="stats__content">
                        <div className="stats__data">
                            <h2>{formatNumber(counters.students)}</h2>
                            <span>+</span>
                        </div>
                        <h2>عدد الطلاب</h2>
                    </div>
                    <div className="stats__content">
                        <div className="stats__data">
                            <h2>{formatNumber(counters.episodes)}</h2>
                            <span>+</span>
                        </div>
                        <h2>عدد الحلقات</h2>
                    </div>
                    <div className="stats__content">
                        <div className="stats__data">
                            <h2>{formatNumber(counters.progress, true)}</h2>
                            <span>%</span>
                        </div>
                        <h2>معدل التقدم</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
