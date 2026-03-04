import { useEffect, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";
import img1 from "../../../assets/images/gadwel.png";
import img2 from "../../../assets/images/attendance.png";
import img3 from "../../../assets/images/analysis.png";

const SHero: React.FC = () => {
    const [counter, setCounter] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        controls.start("visible");
    }, [controls]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const startCounter = () => {
            interval = setInterval(() => {
                setCounter((prev) => {
                    if (prev >= 318) {
                        clearInterval(interval!);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 30);
        };

        const timeout = setTimeout(startCounter, 1000);
        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <>
            <img src={img2} alt="" className="img-2" />
            <img src={img3} alt="" className="img-3" />

            <motion.section
                className="SHero"
                initial="hidden"
                animate={controls}
                variants={containerVariants}
            >
                <div className="SHero__inner">
                    <div className="SHero__container">
                        <motion.div
                            className="SHero__imgs"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* الصورة الكبيرة */}
                            <motion.img
                                src={img1}
                                alt="سراج - منصة تعليم ذكية"
                                className="img__main"
                                whileHover={{
                                    scale: 1.05,
                                    y: -10,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                            />

                            {/* الصور الصغيرة فوق الصورة الكبيرة */}
                            <motion.div
                                className="SHero__small-images"
                                initial={{ y: -50, opacity: 0 }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        delay: 0.5,
                                        duration: 1,
                                        staggerChildren: 0.3,
                                    },
                                }}
                            >
                                <motion.img
                                    src={img2}
                                    alt="الحضور"
                                    className="small-img small-img-1"
                                    whileHover={{ scale: 1.1, rotate: 3 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                    }}
                                />

                                <motion.img
                                    src={img3}
                                    alt="الاجتماعات"
                                    className="small-img small-img-2"
                                    whileHover={{ scale: 1.1, rotate: -3 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                    }}
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="SHero__sec2"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="SHero__header"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="SHero__sec2Title">
                                    <motion.i
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <BsPatchCheckFill />
                                    </motion.i>
                                    <h2>
                                        + {counter.toLocaleString()} مجمع نشط
                                        على منصتنا{" "}
                                    </h2>
                                </div>

                                <div className="SHero__Title">
                                    <motion.h1 variants={itemVariants}>
                                        سراج ... تعليم ذكي وسهل
                                    </motion.h1>
                                </div>

                                <motion.div
                                    className="SHero__description"
                                    variants={itemVariants}
                                >
                                    <p>
                                        أنشئ مجمعك التعليمي في دقائق، واربط
                                        طلابك بمجموعة متكاملة من الحلول
                                        التعليمية الذكية للخطط والتعليم.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="SHero__btns"
                                    variants={itemVariants}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="primary-btn"
                                    >
                                        <a href="/center-register">
                                            أنشئ مجمعك الآن
                                        </a>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="secondary-btn"
                                    >
                                        تجربة المنصة
                                    </motion.button>
                                </motion.div>

                                <motion.p variants={itemVariants}>
                                    مصممة لأصحاب المجمعات التعليمية.
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        </>
    );
};

export default SHero;
