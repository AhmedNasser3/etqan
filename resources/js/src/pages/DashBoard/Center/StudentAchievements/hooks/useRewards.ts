// hooks/useRewards.ts
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

export interface Reward {
    id: number;
    name: string;
    description?: string;
    points_cost: number;
    is_active: boolean;
}

export const useRewards = () => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRewards = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/rewards");
            setRewards(res.data.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRewards();
    }, []);

    const createReward = async (data: Omit<Reward, "id">) => {
        const res = await axios.post("/api/rewards", data);
        setRewards((prev) => [...prev, res.data.data]);
        return res.data;
    };

    const updateReward = async (id: number, data: Partial<Reward>) => {
        const res = await axios.put(`/api/rewards/${id}`, data);
        setRewards((prev) =>
            prev.map((r) => (r.id === id ? res.data.data : r)),
        );
        return res.data;
    };

    const deleteReward = async (id: number) => {
        await axios.delete(`/api/rewards/${id}`);
        setRewards((prev) => prev.filter((r) => r.id !== id));
    };

    return {
        rewards,
        loading,
        createReward,
        updateReward,
        deleteReward,
        refetch: fetchRewards,
    };
};
