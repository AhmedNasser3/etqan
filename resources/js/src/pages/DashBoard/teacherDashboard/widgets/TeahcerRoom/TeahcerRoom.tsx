const TeacherRoom: React.FC = () => {
    return (
        <div className="teacherRoom">
            <div className="TeacherRoom__inner">
                <div className="teacherRoom__view">
                    <iframe
                        src="https://meet.jit.si/halaqa-teacher-abc123"
                        frameBorder="0"
                        width="100%"
                        height="800"
                        allow="camera; microphone; speaker; display-capture"
                        style={{ borderRadius: "8px" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TeacherRoom;
