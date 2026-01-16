import Medals from "../widgets/medals";

const Certificate: React.FC = () => {
    return (
        <div className="certification">
            <div className="certification__features">
                <div className="testimonialsView__certificate">
                    <div className="testimonials__mainTitle">
                        <h1>اوسمة حصل عليها الطالب</h1>
                    </div>
                    <Medals />
                    <div className="testimonials__mainTitle">
                        <h1>شهادات الطالب التي حصل عليها</h1>
                    </div>
                    <div className="testimonialsView__certificateContainer">
                        <div className="testimonialsView__certificatDetails">
                            <div className="testimonialsView__certificateImg">
                                <img
                                    src="https://mir-s3-cdn-cf.behance.net/project_modules/hd/b49ae443516815.57f2a3ae629e0.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="testimonialsView__certificateTitle">
                                <h1>شهادة ختم القرأن</h1>
                                <div className="testimonialsView__certificateDescription">
                                    <p>
                                        شهادة تختيم وحفظ القرأن كاملا من موثقة
                                        من مجمع التوحيد بيدين
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonialsView__certificatDetails">
                            <div className="testimonialsView__certificateImg">
                                <img
                                    src="https://noords.net/wp-content/uploads/2021/06/%D8%A3%D8%AD%D9%85%D8%AF-%D9%86%D8%B9%D8%B3%D8%A7%D9%86%D9%8A-scaled.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="testimonialsView__certificateTitle">
                                <h1>شهادة ختم القرأن</h1>
                                <div className="testimonialsView__certificateDescription">
                                    <p>
                                        شهادة تختيم وحفظ القرأن كاملا من موثقة
                                        من مجمع التوحيد بيدين
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonialsView__certificatDetails">
                            <div className="testimonialsView__certificateImg">
                                <img
                                    src="https://khamsat.hsoubcdn.com/images/services/3709485/698916228a7e2a1eb23803024a7fa671.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="testimonialsView__certificateTitle">
                                <h1>شهادة ختم القرأن</h1>
                                <div className="testimonialsView__certificateDescription">
                                    <p>
                                        شهادة تختيم وحفظ القرأن كاملا من موثقة
                                        من مجمع التوحيد بيدين
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonialsView__certificatDetails">
                            <div className="testimonialsView__certificateImg">
                                <img
                                    src="https://api.osoulworld.com/media/psd_image/ALFORQAN.JPG"
                                    alt=""
                                />
                            </div>
                            <div className="testimonialsView__certificateTitle">
                                <h1>شهادة ختم القرأن</h1>
                                <div className="testimonialsView__certificateDescription">
                                    <p>
                                        شهادة تختيم وحفظ القرأن كاملا من موثقة
                                        من مجمع التوحيد بيدين
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
