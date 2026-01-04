import { useState } from "react";

const Sidebar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);

    return (
        <div className="sidebar">
            <div
                className={`sidebar__features ${isRotated ? "rotated" : ""}`}
            ></div>
        </div>
    );
};

export default Sidebar;
