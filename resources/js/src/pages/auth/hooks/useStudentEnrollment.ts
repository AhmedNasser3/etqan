import { useState } from "react";
import { useParams } from "react-router-dom";

export const useStudentEnrollment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { centerSlug } = useParams<{ centerSlug?: string }>();

    // ============================================================
    // 🔍 MEGA DEBUGGER
    // ============================================================
    const megaDebug = async () => {
        const sep = "═".repeat(50);
        console.group(
            `%c🔍 MEGA DEBUG REPORT`,
            "color:#ff6b35;font-size:16px;font-weight:bold",
        );

        // 1. Environment
        console.group("📦 1. Environment");
        console.table({
            "Window Location": window.location.href,
            Origin: window.location.origin,
            Protocol: window.location.protocol,
            Host: window.location.host,
            Port: window.location.port || "80/443",
            Pathname: window.location.pathname,
            "Target URL": `${window.location.origin}/student/register`,
        });
        console.groupEnd();

        // 2. CSRF Token Check
        console.group("🔐 2. CSRF Token");
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        const metaToken = metaTag?.getAttribute("content");
        const xsrfCookie = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("XSRF-TOKEN="));
        const xsrfValue = xsrfCookie
            ? decodeURIComponent(xsrfCookie.split("=")[1])
            : null;
        const laravelSession = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("laravel_session="));

        console.table({
            "Meta Tag Found": !!metaTag,
            "Meta Token": metaToken
                ? `${metaToken.substring(0, 20)}...`
                : "❌ NOT FOUND",
            "XSRF-TOKEN Cookie": xsrfValue
                ? `${xsrfValue.substring(0, 20)}...`
                : "❌ NOT FOUND",
            "Laravel Session Cookie": laravelSession
                ? "✅ EXISTS"
                : "❌ NOT FOUND",
            "All Cookies": document.cookie || "❌ NO COOKIES",
        });
        console.groupEnd();

        // 3. CSRF Cookie Fetch Test
        console.group("🌐 3. Sanctum CSRF Cookie Test");
        try {
            console.log("⏳ Fetching /sanctum/csrf-cookie...");
            const csrfRes = await fetch("/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include",
            });
            console.table({
                Status: csrfRes.status,
                "Status Text": csrfRes.statusText,
                OK: csrfRes.ok,
                URL: csrfRes.url,
            });
            // Check cookies after fetch
            const xsrfAfter = document.cookie
                .split(";")
                .find((c) => c.trim().startsWith("XSRF-TOKEN="));
            console.log(
                "XSRF Cookie after fetch:",
                xsrfAfter ? "✅ SET" : "❌ STILL MISSING",
            );
        } catch (e: any) {
            console.error("❌ CSRF fetch FAILED:", e.message);
        }
        console.groupEnd();

        // 4. OPTIONS Preflight Test
        console.group("✈️ 4. CORS Preflight Test");
        try {
            const preflightRes = await fetch("/student/register", {
                method: "OPTIONS",
                credentials: "include",
                headers: {
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers":
                        "content-type,x-requested-with",
                    Origin: window.location.origin,
                },
            });
            const corsHeaders: Record<string, string> = {};
            preflightRes.headers.forEach((val, key) => {
                if (key.toLowerCase().startsWith("access-control")) {
                    corsHeaders[key] = val;
                }
            });
            console.table({
                "Preflight Status": preflightRes.status,
                "Allow-Origin":
                    preflightRes.headers.get("access-control-allow-origin") ||
                    "❌ MISSING",
                "Allow-Credentials":
                    preflightRes.headers.get(
                        "access-control-allow-credentials",
                    ) || "❌ MISSING",
                "Allow-Methods":
                    preflightRes.headers.get("access-control-allow-methods") ||
                    "❌ MISSING",
                "Allow-Headers":
                    preflightRes.headers.get("access-control-allow-headers") ||
                    "❌ MISSING",
            });
        } catch (e: any) {
            console.error("❌ OPTIONS preflight FAILED:", e.message);
        }
        console.groupEnd();

        // 5. Actual POST Test
        console.group("📤 5. Actual POST Request Test");
        const freshXsrf = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("XSRF-TOKEN="));
        const freshToken = freshXsrf
            ? decodeURIComponent(freshXsrf.split("=")[1])
            : metaToken || "";

        console.log(
            "🔑 Token being used:",
            freshToken ? `${freshToken.substring(0, 20)}...` : "❌ EMPTY",
        );

        const testPayload = {
            __debug_test: true,
            first_name: "تجربة",
            family_name: "اختبار",
            id_number: "9999999999",
            birth_date: "2000-01-01",
            grade_level: "elementary",
            gender: "male",
            student_email: `debug_${Date.now()}@test.com`,
            guardian_email: `guardian_${Date.now()}@test.com`,
            guardian_country_code: "966",
            guardian_phone: "500000000",
            health_status: "healthy",
        };

        try {
            console.log("⏳ Sending POST to /student/register...");
            const postRes = await fetch("/student/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": freshToken,
                    "X-XSRF-TOKEN": freshToken,
                },
                body: JSON.stringify(testPayload),
            });

            let responseBody: any = null;
            const rawText = await postRes.text();
            try {
                responseBody = JSON.parse(rawText);
            } catch {
                responseBody = rawText.substring(0, 500);
            }

            console.table({
                Status: postRes.status,
                "Status Text": postRes.statusText,
                OK: postRes.ok,
                "Content-Type": postRes.headers.get("content-type"),
            });

            if (postRes.status === 419) {
                console.error("🔴 419 = CSRF MISMATCH!");
                console.warn("Possible causes:");
                console.warn("  1. Route NOT in \$except list");
                console.warn(
                    "  2. VerifyCsrfToken middleware not loading \$except",
                );
                console.warn(
                    "  3. Different domain/port causing session isolation",
                );
                console.warn(
                    "  4. Laravel kernel not using your VerifyCsrfToken class",
                );
            }

            if (postRes.status === 422) {
                console.warn("⚠️ 422 = Validation Error (CSRF passed ✅)");
            }

            if (postRes.status === 200 || postRes.status === 201) {
                console.log("✅ SUCCESS! CSRF is working correctly");
            }

            console.log("📥 Response Body:", responseBody);

            // Response Headers
            const resHeaders: Record<string, string> = {};
            postRes.headers.forEach((val, key) => {
                resHeaders[key] = val;
            });
            console.log("📥 Response Headers:", resHeaders);
        } catch (e: any) {
            console.error("❌ POST request FAILED completely:", e.message);
            console.error("This usually means CORS is blocking the request");
        }
        console.groupEnd();

        // 6. Kernel & Middleware Check (via API)
        console.group("⚙️ 6. Laravel Config Check");
        try {
            const configRes = await fetch("/api/v1/debug-csrf-check", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (configRes.ok) {
                const configData = await configRes.json();
                console.log("Laravel Config:", configData);
            } else {
                console.warn(
                    "Debug endpoint not available (status:",
                    configRes.status,
                    ")",
                );
                console.info(
                    "Add this to routes/api.php to enable:\n" +
                        "Route::get('/debug-csrf-check', fn() => response()->json([\n" +
                        "  'csrf_except' => app(\\App\\Http\\Middleware\\VerifyCsrfToken::class)->except ?? 'N/A',\n" +
                        "  'session_driver' => config('session.driver'),\n" +
                        "  'session_domain' => config('session.domain'),\n" +
                        "  'cors_supports_credentials' => config('cors.supports_credentials'),\n" +
                        "  'sanctum_domains' => config('sanctum.stateful'),\n" +
                        "]));",
                );
            }
        } catch (e) {
            console.warn("Could not reach debug endpoint");
        }
        console.groupEnd();

        // 7. Final Diagnosis
        console.group("🩺 7. Auto Diagnosis");
        const issues: string[] = [];
        if (!metaToken && !freshXsrf)
            issues.push("❌ No CSRF token found anywhere");
        if (!laravelSession) issues.push("⚠️ No Laravel session cookie");
        if (window.location.port && window.location.port !== "8000") {
            issues.push(
                `⚠️ React on port ${window.location.port}, Laravel on 8000 — possible CORS issue`,
            );
        }
        if (issues.length === 0) {
            console.log(
                "✅ No obvious client-side issues found — check Laravel logs",
            );
            console.log("Run: tail -f storage/logs/laravel.log");
        } else {
            issues.forEach((i) => console.warn(i));
        }
        console.groupEnd();

        console.groupEnd();
        return { metaToken, xsrfValue, laravelSession };
    };

    // ============================================================
    // Normal Hook Logic
    // ============================================================
    const registerStudent = async (data: any) => {
        // جيب fresh token
        const xsrfCookie = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("XSRF-TOKEN="));
        const token = xsrfCookie
            ? decodeURIComponent(xsrfCookie.split("=")[1])
            : document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute("content") || "";

        const response = await fetch("/student/register", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": token,
                "X-XSRF-TOKEN": token,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        return result;
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        // 🔍 شغّل الـ debugger الأول
        console.log("🚀 handleSubmit triggered — running diagnostics first...");
        await megaDebug();

        try {
            const data: any = {};
            formData.forEach((value, key) => {
                data[key] = value === "" ? null : value;
            });

            if (
                centerSlug &&
                centerSlug !== "register" &&
                centerSlug !== "student"
            ) {
                data.center_slug = centerSlug;
            }

            console.log("📦 Final payload:", data);

            const response = await registerStudent(data);

            if (response.success) {
                setSuccess(true);
                setError(null);
                return { success: true, data: response.data };
            }
        } catch (err: any) {
            console.error("💥 Submit error:", err);
            const errorMessage = err.message || "حدث خطأ في التسجيل";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setError(null);
        setSuccess(false);
        setIsLoading(false);
    };

    return {
        handleSubmit,
        isLoading,
        error,
        success,
        setError,
        resetForm,
        megaDebug, // ✅ export عشان تقدر تناديها من أي حتة
    };
};
