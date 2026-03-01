// components/GuardianChildren/StatsChart.tsx
import React from "react";

interface StatsChartProps {
    attendanceRate: number;
    totalPoints: number;
    bookingsCount: number;
}

const StatsChart: React.FC<StatsChartProps> = ({
    attendanceRate,
    totalPoints,
    bookingsCount,
}) => {
    return (
        <div className="stats-chart">
            <div
                className="attendance-circle"
                style={
                    { "--rate": `${attendanceRate}%` } as React.CSSProperties
                }
            >
                <span>{attendanceRate}%</span>
            </div>
            <div className="chart-labels">
                <div className="chart-label">
                    <div className="label-color attendance"></div>
                    <span>الحضور</span>
                </div>
                <div className="chart-label">
                    <div className="label-color points"></div>
                    <span>النقاط: {totalPoints}</span>
                </div>
                <div className="chart-label">
                    <div className="label-color bookings"></div>
                    <span>الحجوزات: {bookingsCount}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsChart;
