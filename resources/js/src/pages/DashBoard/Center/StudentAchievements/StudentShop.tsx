// StudentShop.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../../../../contexts/ToastContext";

interface Reward {
    id: number;
    name: string;
    description?: string;
    points_cost: number;
}

interface Purchase {
    reward_name: string;
    points_spent: number;
    purchased_at: string;
}

interface ShopData {
    total_points: number;
    rewards: Reward[];
    purchases: Purchase[];
}

const StudentShop: React.FC = () => {
    const { notifySuccess, notifyError } = useToast();
    const [data, setData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<number | null>(null);
    const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

    const fetchShop = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/student/shop");
            setData(res.data);
        } catch {
            notifyError("فشل في تحميل المتجر");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop();
    }, []);

    const handlePurchase = async (reward: Reward) => {
        setBuying(reward.id);
        try {
            const res = await axios.post("/api/student/purchase", {
                reward_id: reward.id,
            });
            notifySuccess(res.data.message);
            // تحديث النقاط محلياً
            setData((prev) =>
                prev
                    ? {
                          ...prev,
                          total_points: res.data.total_points,
                          purchases: [
                              {
                                  reward_name: reward.name,
                                  points_spent: reward.points_cost,
                                  purchased_at: new Date().toLocaleString("ar"),
                              },
                              ...prev.purchases,
                          ],
                      }
                    : prev,
            );
        } catch (err: any) {
            notifyError(err?.response?.data?.message || "فشل في الاستبدال");
        } finally {
            setBuying(null);
            setConfirmReward(null);
        }
    };

    if (loading) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                        <p>جاري تحميل المتجر...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* مودال تأكيد الشراء */}
            {confirmReward && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box">
                        <div className="conf-t">استبدال جائزة 🎁</div>
                        <div className="conf-d">
                            هل تريد استبدال{" "}
                            <strong>{confirmReward.points_cost}</strong> نقطة
                            مقابل <strong>{confirmReward.name}</strong>؟
                            <br />
                            نقاطك الحالية: <strong>{data?.total_points}</strong>
                        </div>
                        <div className="conf-acts">
                            <button
                                className="btn bp"
                                disabled={buying === confirmReward.id}
                                onClick={() => handlePurchase(confirmReward)}
                            >
                                {buying === confirmReward.id
                                    ? "جاري..."
                                    : "تأكيد"}
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setConfirmReward(null)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="content" id="contentArea">
                {/* رصيد النقاط */}
                <div
                    className="widget"
                    style={{ marginBottom: 16, textAlign: "center" }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 900,
                            color: "var(--primary, #7c3aed)",
                        }}
                    >
                        {data?.total_points ?? 0}
                    </div>
                    <div style={{ fontSize: 16, color: "var(--n500)" }}>
                        نقاطك الحالية
                    </div>
                </div>

                {/* الجوائز المتاحة */}
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">🎁 الجوائز المتاحة</div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 16,
                            padding: "12px 0",
                        }}
                    >
                        {data?.rewards && data.rewards.length > 0 ? (
                            data.rewards.map((reward) => {
                                const canAfford =
                                    (data?.total_points ?? 0) >=
                                    reward.points_cost;
                                return (
                                    <div
                                        key={reward.id}
                                        style={{
                                            border: "1px solid var(--n200)",
                                            borderRadius: 12,
                                            padding: 16,
                                            textAlign: "center",
                                            opacity: canAfford ? 1 : 0.6,
                                            transition: "box-shadow .2s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 36,
                                                marginBottom: 8,
                                            }}
                                        >
                                            🎁
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: 16,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {reward.name}
                                        </div>
                                        {reward.description && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--n500)",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {reward.description}
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 700,
                                                color: "#7c3aed",
                                                marginBottom: 12,
                                            }}
                                        >
                                            {reward.points_cost} نقطة
                                        </div>
                                        <button
                                            className="btn bp bsm"
                                            disabled={
                                                !canAfford ||
                                                buying === reward.id
                                            }
                                            style={{ width: "100%" }}
                                            onClick={() =>
                                                setConfirmReward(reward)
                                            }
                                        >
                                            {canAfford
                                                ? "استبدال"
                                                : "نقاط غير كافية"}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div
                                style={{
                                    gridColumn: "1/-1",
                                    textAlign: "center",
                                    padding: 32,
                                }}
                            >
                                <p style={{ color: "var(--n500)" }}>
                                    لا توجد جوائز متاحة حالياً
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* سجل المشتريات */}
                {data?.purchases && data.purchases.length > 0 && (
                    <div className="widget" style={{ marginTop: 16 }}>
                        <div className="wh">
                            <div className="wh-l">📜 سجل الاستبدال</div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>الجائزة</th>
                                        <th>النقاط المخصومة</th>
                                        <th>التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.purchases.map((p, i) => (
                                        <tr key={i}>
                                            <td>{p.reward_name}</td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: "#fee2e2",
                                                        color: "#991b1b",
                                                    }}
                                                >
                                                    -{p.points_spent}
                                                </span>
                                            </td>
                                            <td>{p.purchased_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StudentShop;
