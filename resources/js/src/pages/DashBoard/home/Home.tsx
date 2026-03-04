import { MdUnfoldMore } from "react-icons/md";
import { BsSkipStartFill } from "react-icons/bs";
import QURANN from "../../../assets/images/qurann.png";
const Home: React.FC = () => {
    return (
        <div className="home">
            <img
                className="img__cover"
                src="https://static.vecteezy.com/system/resources/thumbnails/038/357/397/small/islamic-frame-design-free-png.png"
                alt=""
            />
            <div className="home__inner">
                <div className="home__images">
                    <img className="img__main" src={QURANN} alt="" />
                    <img
                        className="img__submain"
                        src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                        alt=""
                    />
                    <img
                        className="img__submain_2"
                        src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                        alt=""
                    />
                    <img
                        className="img__submain_3"
                        src="https://png.pngtree.com/png-vector/20221214/ourmid/pngtree-islamic-frame-with-gradient-blue-background-and-golden-border-png-image_6523794.png"
                        alt=""
                    />
                </div>
                <div className="home__content">
                    <div className="home__title">
                        <h1>
                            أهلاً بك في منصة سراج لخدمة القرآن الكريم والمجمعات
                            القرآنية
                        </h1>
                        <p>
                            تقاني مجمعات قرآنية، منصة متقدمة سراج إنشاء وإدارة
                            مجمعات قرآنية عالمية. صمم منصتك الإلكترونية المستقلة
                            بسهولة لتعليم وتعلم القرآن الكريم، وشاركها عبر جميع
                            وسائل التواصل الاجتماعي لتصل إلى الجميع حول العالم.
                        </p>
                    </div>
                    <div className="home__btns">
                        <a href="/center-register">
                            <button>
                                <i>
                                    <BsSkipStartFill />
                                </i>
                                انشيئ مجمعك الان
                            </button>
                        </a>
                        <button>
                            <i>
                                <MdUnfoldMore />
                            </i>
                            استكشف من نحن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
