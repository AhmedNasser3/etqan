import { useState } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiSave, FiTrash2, FiPlus } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";

const PayrollSettings: React.FC = () => {
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: "معلم",
            basicSalary: "5000",
            hourlyRate: "25",
            dailyAllowance: "50",
            deductions: [
                { id: 1, name: "تأخير", percentage: "2", fixed: "0" },
                { id: 2, name: "غياب", percentage: "5", fixed: "0" },
            ],
        },
        {
            id: 2,
            name: "مشرف تعليمي",
            basicSalary: "7000",
            hourlyRate: "35",
            dailyAllowance: "75",
            deductions: [{ id: 3, name: "غياب", percentage: "4", fixed: "0" }],
        },
        {
            id: 3,
            name: "مشرف مالي",
            basicSalary: "6500",
            hourlyRate: "0",
            dailyAllowance: "0",
            deductions: [],
        },
    ]);

    const [newRole, setNewRole] = useState({
        name: "",
        basicSalary: "",
        hourlyRate: "",
        dailyAllowance: "",
    });
    const [editingRole, setEditingRole] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const filteredRoles = roles.filter((role) => role.name.includes(search));

    const addRole = () => {
        setRoles((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: newRole.name,
                basicSalary: newRole.basicSalary,
                hourlyRate: newRole.hourlyRate,
                dailyAllowance: newRole.dailyAllowance,
                deductions: [],
            },
        ]);
        setNewRole({
            name: "",
            basicSalary: "",
            hourlyRate: "",
            dailyAllowance: "",
        });
    };

    const updateRole = (id: number) => {
        setRoles((prev) =>
            prev.map((role) =>
                role.id === id ? { ...role, ...newRole } : role,
            ),
        );
        setEditingRole(null);
        setNewRole({
            name: "",
            basicSalary: "",
            hourlyRate: "",
            dailyAllowance: "",
        });
    };

    const deleteDeduction = (roleId: number, deductionId: number) => {
        setRoles((prev) =>
            prev.map((role) =>
                role.id === roleId
                    ? {
                          ...role,
                          deductions: role.deductions.filter(
                              (d) => d.id !== deductionId,
                          ),
                      }
                    : role,
            ),
        );
    };

    const addDeduction = (roleId: number) => {
        const role = roles.find((r) => r.id === roleId);
        if (role) {
            role.deductions.push({
                id: Date.now(),
                name: `خصم ${role.deductions.length + 1}`,
                percentage: "0",
                fixed: "0",
            });
            setRoles([...roles]);
        }
    };

    return (
        <div className="teacherMotivate">
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            إعدادات الرواتب{" "}
                            <span>{filteredRoles.length} دور</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            يمكنك إضافة بدلات جديدة للمعلمين بناءً على ساعات
                            إضافية
                        </div>
                        <div className="plan__current">
                            <h2>قواعد الراتب الأساسي والخصومات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالدور..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <FiPlus className="mr-2" />
                                دور جديد
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    placeholder="اسم الدور"
                                    value={newRole.name}
                                    onChange={(e) =>
                                        setNewRole({
                                            ...newRole,
                                            name: e.target.value,
                                        })
                                    }
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    placeholder="الراتب الأساسي"
                                    value={newRole.basicSalary}
                                    onChange={(e) =>
                                        setNewRole({
                                            ...newRole,
                                            basicSalary: e.target.value,
                                        })
                                    }
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                                <input
                                    placeholder="الأجر بالساعة"
                                    value={newRole.hourlyRate}
                                    onChange={(e) =>
                                        setNewRole({
                                            ...newRole,
                                            hourlyRate: e.target.value,
                                        })
                                    }
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                                <input
                                    placeholder="بدل يومي"
                                    value={newRole.dailyAllowance}
                                    onChange={(e) =>
                                        setNewRole({
                                            ...newRole,
                                            dailyAllowance: e.target.value,
                                        })
                                    }
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <button
                                onClick={addRole}
                                disabled={!newRole.name}
                                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                إضافة الدور
                            </button>
                        </div>

                        <div className="plan__daily-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>الدور</th>
                                        <th>الراتب الأساسي</th>
                                        <th>الأجر/ساعة</th>
                                        <th>بدل يومي</th>
                                        <th>الخصومات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="plan__row hover:bg-gray-50"
                                        >
                                            <td className="font-bold">
                                                {role.name}
                                            </td>
                                            <td className="text-green-600 font-bold">
                                                ر.{role.basicSalary}
                                            </td>
                                            <td>ر.{role.hourlyRate}</td>
                                            <td>ر.{role.dailyAllowance}</td>
                                            <td>
                                                <div className="space-y-1">
                                                    {role.deductions.map(
                                                        (deduction) => (
                                                            <div
                                                                key={
                                                                    deduction.id
                                                                }
                                                                className="flex items-center justify-between text-xs bg-red-50 p-2 rounded"
                                                            >
                                                                <span>
                                                                    {
                                                                        deduction.name
                                                                    }
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span>
                                                                        {
                                                                            deduction.percentage
                                                                        }
                                                                        % / ر.
                                                                        {
                                                                            deduction.fixed
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteDeduction(
                                                                                role.id,
                                                                                deduction.id,
                                                                            )
                                                                        }
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <FiTrash2
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                    {role.deductions.length ===
                                                        0 && (
                                                        <span className="text-gray-500 text-xs italic">
                                                            لا توجد خصومات
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="teacherStudent__btns">
                                                    <button
                                                        onClick={() =>
                                                            addDeduction(
                                                                role.id,
                                                            )
                                                        }
                                                        className="teacherStudent__status-btn add-deduction-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                        title="إضافة خصم"
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingRole(
                                                                role.id,
                                                            );
                                                            setNewRole({
                                                                name: role.name,
                                                                basicSalary:
                                                                    role.basicSalary,
                                                                hourlyRate:
                                                                    role.hourlyRate,
                                                                dailyAllowance:
                                                                    role.dailyAllowance,
                                                            });
                                                        }}
                                                        className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 w-12 h-12 mr-1"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="teacherStudent__status-btn save-btn p-2 rounded-full border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 w-12 h-12">
                                                        <FiSave />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي الأدوار</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    {filteredRoles.length}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي الخصومات</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {roles.reduce(
                                        (sum, role) =>
                                            sum + role.deductions.length,
                                        0,
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <PiWhatsappLogoDuotone />
                                </i>
                            </div>
                            <div>
                                <h3>متوسط الراتب</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    ر.6,167
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        {" "}
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة التغطية</h1>
                            </div>
                            <p>100%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "100%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>عدد الخصومات النشطة</h1>
                            </div>
                            <p>5</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "62%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollSettings;
