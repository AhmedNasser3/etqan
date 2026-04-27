// CreateMosquePage.tsx
import toast from "react-hot-toast";
import { useMosqueFormCreate } from "../hooks/useMosqueFormCreate";
import { useEffect, useState, useCallback } from "react";

interface CreateMosquePageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateMosquePage: React.FC<CreateMosquePageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        centersData,
        usersData,
        loadingData,
        user,
    } = useMosqueFormCreate();

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // ✅ الحل النهائي - استخدم defaultValue بدل value
    const hasCenters = centersData.length > 0;
    const isDisabled = isSubmitting || loadingData || !hasCenters;

    const isCenterOwner = user?.role?.id === 1;
    const centerIsFixed = isCenterOwner && user?.center_id;
    const selectedCenterId = formData.center_id
        ? parseInt(formData.center_id)
        : null;
    const filteredSupervisors = selectedCenterId
        ? usersData.filter((u: any) => u.center_id === selectedCenterId)
        : [];

    useEffect(() => {
        console.log("MOSQUE PAGE DEBUG:", {
            centers: centersData.length,
            users: usersData.length,
            formData,
            logoPreview,
        });
    }, [centersData, usersData, formData, logoPreview]);
    const ICO: Record<string, JSX.Element> = {
        x: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    // ✅ FI مع defaultValue - هذا هو الحل النهائي!
    function FI({
        id,
        type = "text",
        placeholder = "",
        name = "",
        value = "",
        required = false,
    }: {
        id: string;
        type?: string;
        placeholder?: string;
        name: string;
        value: string;
        required?: boolean;
    }) {
        const hasError = errors[name as keyof typeof errors];
        return (
            <div>
                <input
                    id={id}
                    type={type}
                    name={name}
                    defaultValue={value} // ✅ defaultValue بدل value
                    placeholder={placeholder}
                    className={`fi2 ${hasError ? "border-red-300 bg-red-50" : ""}`}
                    onChange={handleInputChange}
                    required={required}
                    disabled={isSubmitting}
                    autoComplete="off"
                />
                {hasError && (
                    <p className="text-red-600 text-xs mt-1">{hasError}</p>
                )}
            </div>
        );
    }

    function FSel({
        id,
        opts,
        name = "",
        value = "",
        required = false,
    }: {
        id: string;
        opts: any[];
        name: string;
        value: string;
        required?: boolean;
    }) {
        const hasError = errors[name as keyof typeof errors];
        return (
            <div>
                <select
                    id={id}
                    name={name}
                    value={value}
                    className={`fi2 ${hasError ? "border-red-300 bg-red-50" : ""}`}
                    onChange={handleInputChange}
                    required={required}
                    disabled={isSubmitting}
                >
                    <option value="">اختر...</option>
                    {opts.map((o: any) => (
                        <option key={o.id} value={o.id}>
                            {o.name || o.circle_name}
                        </option>
                    ))}
                </select>
                {hasError && (
                    <p className="text-red-600 text-xs mt-1">{hasError}</p>
                )}
            </div>
        );
    }

    function FG({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) {
        return (
            <div style={{ marginBottom: 13 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "var(--n700)",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </label>
                {children}
            </div>
        );
    }

    function FR2({ children }: { children: React.ReactNode }) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 11,
                }}
            >
                {children}
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setLogoPreview(preview);
            handleInputChange({
                target: { name: "logo", value: file } as any,
            });
        }
    };

    const addMosqueFn = async () => {
        const formDataSubmit = new FormData();
        formDataSubmit.append(
            "mosque_name",
            (document.getElementById("mqName") as HTMLInputElement)?.value ||
                "",
        );
        formDataSubmit.append("center_id", formData.center_id || "");
        formDataSubmit.append("supervisor_id", formData.supervisor_id || "");

        const logoFileInput = document.getElementById(
            "mqLogo",
        ) as HTMLInputElement;
        if (logoFileInput?.files?.[0]) {
            formDataSubmit.append("logo", logoFileInput.files[0]);
        }
        formDataSubmit.append("notes", formData.notes || "");

        console.log(
            "MOSQUE SUBMIT FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const response = await fetch("/api/v1/super/mosques", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("SUBMIT ERROR:", errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.errors) {
                        const errorMessages = Object.values(
                            errorData.errors,
                        ).flat();
                        toast.error(errorMessages[0] || "خطأ في البيانات");
                        return;
                    }
                    toast.error(errorData.message || "حدث خطأ");
                    return;
                } catch (e) {
                    toast.error(`خطأ ${response.status}`);
                    return;
                }
            }

            const result = await response.json();
            onSuccess();
        } catch (error: any) {
            console.error("SUBMIT FAILED:", error);
            toast.error(error.message || "حدث خطأ");
        }
    };

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">اضافة مسجد جديد</span>
                        <button className="mx" onClick={onClose}>
                            <span
                                style={{
                                    width: 12,
                                    height: 12,
                                    display: "inline-flex",
                                }}
                            >
                                {ICO.x}
                            </span>
                        </button>
                    </div>
                    <div className="mb">
                        <FG label="اسم المسجد *">
                            <input
                                id="mqName"
                                name="mosque_name"
                                className="fi2"
                                required
                            />
                        </FG>

                        <FR2>
                            <FG label="المجمع *">
                                {centerIsFixed ? (
                                    <>
                                        <input
                                            id="mqCenter"
                                            type="hidden"
                                            name="center_id"
                                            value={formData.center_id || ""}
                                        />
                                        <div className="fi2 bg-green-50 border-green-300 text-green-800 p-3 rounded">
                                            {centersData[0]?.name ||
                                                centersData[0]?.circle_name ||
                                                "مجمعك"}
                                        </div>
                                    </>
                                ) : (
                                    <FSel
                                        id="mqCenter"
                                        opts={centersData}
                                        name="center_id"
                                        value={formData.center_id || ""}
                                        required
                                    />
                                )}
                            </FG>

                            <FG label="المشرف *">
                                <FSel
                                    id="mqSupervisor"
                                    opts={filteredSupervisors}
                                    name="supervisor_id"
                                    value={formData.supervisor_id || ""}
                                />
                            </FG>
                        </FR2>

                        <FG label="شعار المسجد">
                            <input
                                id="mqLogo"
                                name="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="fi2"
                                disabled={isSubmitting}
                            />
                            {logoPreview && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                    صورة محملة
                                </div>
                            )}
                        </FG>

                        <FG label="ملاحظات">
                            <input
                                id="mqNotes"
                                className="fi2"
                                name="notes"
                                placeholder="أي ملاحظات..."
                            />
                        </FG>
                    </div>
                    <div className="mf">
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                className="btn bs"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn bp"
                                onClick={addMosqueFn}
                                disabled={isDisabled}
                            >
                                {isSubmitting ? "جاري الحفظ..." : "حفظ المسجد"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateMosquePage;
