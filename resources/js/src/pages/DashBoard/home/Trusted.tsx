import { useEffect, useRef } from "react";
import { FaMosque, FaHeart, FaBookOpen } from "react-icons/fa";

const Trusted: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const items = container.children as HTMLElement[];
        let scrollAmount = 0;
        let animationId: number;
        const speed = 1;

        const animate = () => {
            scrollAmount += speed;
            const totalWidth = Array.from(items).reduce(
                (sum, item) => sum + (item as HTMLElement).offsetWidth + 48,
                0
            );

            if (scrollAmount >= totalWidth) {
                scrollAmount = 0;
            }

            container.style.transform = `translateX(-${scrollAmount}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="trusted">
            <div className="trusted__inner">
                <div className="trusted__container" ref={containerRef}>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaMosque className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>نور الإيمان</h2>
                        </div>
                    </div>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaHeart className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>حلقات الرحمة</h2>
                        </div>
                    </div>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaBookOpen className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>معهد القرآن</h2>
                        </div>
                    </div>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaMosque className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>نور الإيمان</h2>
                        </div>
                    </div>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaHeart className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>حلقات الرحمة</h2>
                        </div>
                    </div>
                    <div className="trusted__content">
                        <div className="trusted__img">
                            <i>
                                <FaBookOpen className="trusted__icon" />
                            </i>
                        </div>
                        <div className="trusted__title">
                            <h2>معهد القرآن</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trusted;
