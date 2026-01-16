import { useState, useEffect } from "react";
import facelessAvatar from "../../../../../assets/images/facelessAvatar.png";

export interface Student {
    id: number;
    img: string;
    name: string;
    title: string;
    progress: number;
    status: "active" | "paused";
    reward: number;
}

export const useStudentsData = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dateFrom, setDateFrom] = useState(
        sevenDaysAgo.toISOString().split("T")[0]
    );
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
    const [studentsData, setStudentsData] = useState<Student[]>([
        {
            id: 1,
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
            name: "محمد أحمد العتيبي",
            title: "طالب حفظ قرآن - الجزء الثلاثون",
            progress: 98,
            status: "active",
            reward: 0,
        },
        {
            id: 2,
            img: "https://static.vecteezy.com/system/resources/thumbnails/070/221/098/small_2x/confident-saudi-arabian-man-in-traditional-attire-portrait-against-isolated-backdrop-presenting-png.png",
            name: "عبدالله صالح القحطاني",
            title: "طالب تجويد - المرتل",
            progress: 85,
            status: "active",
            reward: 0,
        },
        {
            id: 3,
            img: facelessAvatar,
            name: "خالد محمد الدوسري",
            title: "حافظ قرآن كريم - المجود",
            progress: 92,
            status: "active",
            reward: 0,
        },
        {
            id: 4,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "أحمد سعود الشمري",
            title: "طالب تلاوة - السور القصيرة",
            progress: 45,
            status: "paused",
            reward: 0,
        },
        {
            id: 5,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            name: "سعيد عبدالرحمن الحربي",
            title: "طالب حفظ - الجزء الخامس",
            progress: 67,
            status: "active",
            reward: 0,
        },
        {
            id: 6,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "يوسف ناصر الغامدي",
            title: "طالب تجويد - القراءات السبع",
            progress: 78,
            status: "paused",
            reward: 0,
        },
        {
            id: 7,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "عمر فيصل الزهراني",
            title: "حافظ قرآن - المرتل المتقن",
            progress: 88,
            status: "active",
            reward: 0,
        },
    ]);
    const [filteredData, setFilteredData] = useState<Student[]>(studentsData);

    const fetchStudentsData = () => {
        const filtered = studentsData.filter((item) => true);
        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchStudentsData();
    }, [dateFrom, dateTo, studentsData]);

    return {
        studentsData,
        setStudentsData,
        filteredData,
        setFilteredData,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
    };
};
