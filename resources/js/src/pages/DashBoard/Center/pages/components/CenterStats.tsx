// components/CenterStats.tsx
import { useEffect, useRef, useState } from "react";
import { useCenterStats } from "../hooks/useCenterStats";

const CenterStats: React.FC = () => {
    const { students, episodes, progress, loading } = useCenterStats();
    const statsRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [counters, setCounters] = useState({
        students: 0,
        episodes: 0,
        progress: 0,
    });

    const animateCounter = (
        start: number,
        end: number,
        duration: number,
        setter: (value: number) => void,
    ) => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progressAnim = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progressAnim, 3);
            const current = Math.floor(start + (end - start) * easeProgress);
            setter(current);
            if (progressAnim < 1) requestAnimationFrame(step);
        };
        step();
    };

    const startAnimation = () => {
        if (hasAnimated || loading) return;
        animateCounter(0, students, 2000, (v) =>
            setCounters((p) => ({ ...p, students: v })),
        );
        animateCounter(0, episodes, 2000, (v) =>
            setCounters((p) => ({ ...p, episodes: v })),
        );
        animateCounter(0, progress, 2000, (v) =>
            setCounters((p) => ({ ...p, progress: v })),
        );
        setHasAnimated(true);
    };

    const formatNumber = (num: number, isPercent?: boolean) =>
        isPercent ? `${num}` : num.toLocaleString();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated && !loading)
                        startAnimation();
                });
            },
            { threshold: 0.3 },
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, [hasAnimated, loading, students, episodes, progress]);

    const statItems = loading
        ? [
              { value: "0", suffix: "+", label: "عدد الطلاب" },
              { value: "0", suffix: "+", label: "عدد الحلقات" },
              { value: "0", suffix: "%", label: "معدل التقدم" },
          ]
        : [
              {
                  value: formatNumber(counters.students),
                  suffix: "+",
                  label: "عدد الطلاب",
              },
              {
                  value: formatNumber(counters.episodes),
                  suffix: "+",
                  label: "عدد الحلقات",
              },
              {
                  value: formatNumber(counters.progress, true),
                  suffix: "%",
                  label: "معدل التقدم",
              },
          ];

    return (
        <div className="quran-stats" ref={statsRef}>
            <div className="quran-stats__inner">
                {statItems.map((stat, i) => (
                    <div key={i} className="quran-stats__card">
                        <div
                            className="quran-stats__card-glow"
                            aria-hidden="true"
                        />
                        <div className="quran-stats__number-row">
                            <span className="quran-stats__number">
                                {stat.value}
                            </span>
                            <span className="quran-stats__suffix">
                                {stat.suffix}
                            </span>
                        </div>
                        <p className="quran-stats__label">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CenterStats;
