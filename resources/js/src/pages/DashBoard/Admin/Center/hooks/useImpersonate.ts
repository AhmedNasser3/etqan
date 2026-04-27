import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const STORAGE_KEY = "impersonated_center";

// ✅ شغّل فور ما الملف يتحمل
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    try {
        const { center_id } = JSON.parse(saved);
        axios.defaults.headers.common["X-Center-Id"] = String(center_id);
    } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const useImpersonate = () => {
    const [loading, setLoading] = useState(false);

    const getStatus = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved)
                return {
                    impersonating: false,
                    center_id: null,
                    center_name: null,
                    subdomain: null,
                };
            return { impersonating: true, ...JSON.parse(saved) };
        } catch {
            return {
                impersonating: false,
                center_id: null,
                center_name: null,
                subdomain: null,
            };
        }
    };

    const enterCenter = async (
        centerId: number,
        centerName: string,
        subdomain: string,
    ) => {
        const data = {
            center_id: centerId,
            center_name: centerName,
            subdomain,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // ✅ header + query param مع بعض
        axios.defaults.headers.common["X-Center-Id"] = String(centerId);
        axios.defaults.params = { ...axios.defaults.params, _cid: centerId };

        setTimeout(() => {
            window.location.href = `/${subdomain}/center-dashboard`;
        }, 500);
    };

    const leaveCenter = () => {
        localStorage.removeItem(STORAGE_KEY);
        delete axios.defaults.headers.common["X-Center-Id"];
        toast.success("تم الخروج من المجمع");
        setTimeout(() => {
            window.location.href = "/admin-dashboard/admin-centers";
        }, 300);
    };

    return { loading, getStatus, enterCenter, leaveCenter };
};
