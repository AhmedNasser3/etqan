"""
AI Service - Ollama (مجاني 100% - مفتوح المصدر)
================================================
التثبيت:
    pip install fastapi uvicorn ollama requests

تشغيل Ollama أولاً:
    curl -fsSL https://ollama.com/install.sh | sh
    ollama pull llama3.1:8b       # ~5GB - الأفضل للعربي
    ollama pull mistral:7b         # بديل ممتاز
    ollama pull llama3.2:3b        # لو RAM أقل من 8GB

تشغيل هذا السيرفر:
    python ai_service.py
    # أو
    uvicorn ai_service:app --host 0.0.0.0 --port 8001 --reload
"""

import json
import re
import logging
from typing import Optional

import ollama
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── إعداد اللوجر ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# ── إعداد التطبيق ─────────────────────────────────────────────
app = FastAPI(
    title="Quran Plan AI Service",
    description="توليد خطط حفظ القرآن باستخدام Ollama - مجاني 100%",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # في الـ production غيّرها لدومين Laravel بس
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── الموديل المستخدم ───────────────────────────────────────────
# غيّر هنا لو عندك RAM أقل: "llama3.2:3b" أو "mistral:7b"
DEFAULT_MODEL = "llama3.1:8b"


# ══════════════════════════════════════════════════════════════
#  Pydantic Models
# ══════════════════════════════════════════════════════════════

class GeneratePlanRequest(BaseModel):
    surah_name:    str   = Field(..., example="البقرة")
    surah_number:  int   = Field(..., ge=1, le=114)
    total_pages:   int   = Field(..., ge=1)
    total_verses:  int   = Field(..., ge=1)
    start_page:    int   = Field(..., ge=1)
    pages_per_day: float = Field(..., ge=0.5, le=10)
    include_review: bool = True
    model:         Optional[str] = None   # اختياري - يتجاوز DEFAULT_MODEL


class DayPlan(BaseModel):
    day:               int
    new_memorization:  str
    review_memorization: Optional[str] = None
    verse_from:        Optional[int]   = None
    verse_to:          Optional[int]   = None
    notes:             Optional[str]   = None


class GeneratedPlan(BaseModel):
    title:      str
    summary:    str
    total_days: int
    advice:     str
    days:       list[DayPlan]


class GeneratePlanResponse(BaseModel):
    success: bool
    plan:    Optional[GeneratedPlan] = None
    error:   Optional[str]           = None
    model_used: Optional[str]        = None


# ══════════════════════════════════════════════════════════════
#  بناء الـ Prompt
# ══════════════════════════════════════════════════════════════

def build_prompt(
    surah_name:    str,
    surah_number:  int,
    total_pages:   int,
    total_verses:  int,
    start_page:    int,
    pages_per_day: float,
    include_review: bool,
) -> str:
    review_note = (
        "يجب تضمين مراجعة للمحفوظ السابق في كل يوم."
        if include_review
        else "لا داعي لتضمين المراجعة."
    )

    return f"""أنت خبير في تعليم القرآن الكريم وتخطيط برامج الحفظ.

مهمتك: إنشاء خطة حفظ تفصيلية دقيقة لسورة "{surah_name}" (السورة رقم {surah_number}).

معلومات السورة:
- عدد الصفحات في المصحف (برواية حفص): {total_pages} صفحة
- عدد الآيات: {total_verses} آية
- تبدأ من الصفحة: {start_page} في المصحف الشريف

متطلبات الخطة:
- عدد الصفحات المطلوب حفظها يومياً: {pages_per_day} صفحة
- {review_note}
- قسّم الآيات بشكل منطقي يراعي مواضع الوقف الطبيعية والمعنى
- اجعل كل يوم متوازناً قدر الإمكان من حيث الكمية

أرجع الرد بصيغة JSON فقط بالشكل التالي (لا تضف أي نص خارج الـ JSON):

{{
  "title": "عنوان الخطة",
  "summary": "ملخص الخطة في جملة واحدة",
  "total_days": 10,
  "advice": "نصيحة مختصرة للحافظ",
  "days": [
    {{
      "day": 1,
      "new_memorization": "الآيات 1-3 (من بسم الله إلى اهدنا الصراط)",
      "review_memorization": "مراجعة المحفوظ السابق",
      "verse_from": 1,
      "verse_to": 3,
      "notes": "ملاحظة مفيدة عن هذا الجزء"
    }}
  ]
}}

مهم جداً:
- اذكر الآيات بدقة (من آية X إلى آية Y)
- أشر إلى الآيات المشهورة أو صعبة النطق
- اجعل النصائح عملية ومفيدة
- أرجع JSON نظيفاً فقط بدون markdown أو أي نص إضافي"""


# ══════════════════════════════════════════════════════════════
#  تنظيف وتحليل رد الـ AI
# ══════════════════════════════════════════════════════════════

def parse_ai_response(content: str) -> dict:
    """تنظيف JSON من أي markdown أو نص زيادة"""
    clean = content.strip()

    # إزالة markdown code blocks
    clean = re.sub(r"```json\s*", "", clean)
    clean = re.sub(r"```\s*", "", clean)
    clean = clean.strip()

    # استخراج أول JSON object لو في نص قبله
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if match:
        clean = match.group(0)

    data = json.loads(clean)

    if "days" not in data:
        raise ValueError("الرد لا يحتوي على قائمة الأيام")

    return data


# ══════════════════════════════════════════════════════════════
#  Endpoints
# ══════════════════════════════════════════════════════════════

@app.get("/health")
def health_check():
    """التحقق من أن السيرفر والـ Ollama شغالين"""
    try:
        models = ollama.list()
        available = [m["name"] for m in models.get("models", [])]
        return {
            "status": "ok",
            "ollama": "connected",
            "available_models": available,
            "default_model": DEFAULT_MODEL,
            "model_ready": any(DEFAULT_MODEL in m for m in available),
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ollama": "disconnected",
            "error": str(e),
            "hint": "شغّل Ollama: ollama serve",
        }


@app.post("/generate-plan", response_model=GeneratePlanResponse)
def generate_plan(req: GeneratePlanRequest):
    """
    توليد خطة حفظ قرآنية باستخدام Ollama
    بدون أي API Key أو رسوم
    """
    model = req.model or DEFAULT_MODEL
    log.info(f"Generating plan: سورة {req.surah_name} | {req.pages_per_day} ص/يوم | model={model}")

    prompt = build_prompt(
        surah_name=req.surah_name,
        surah_number=req.surah_number,
        total_pages=req.total_pages,
        total_verses=req.total_verses,
        start_page=req.start_page,
        pages_per_day=req.pages_per_day,
        include_review=req.include_review,
    )

    try:
        response = ollama.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            options={
                "temperature": 0.3,      # منخفض عشان يكون دقيق في الأرقام والآيات
                "num_predict": 8192,     # كافي حتى لسورة البقرة
                "top_p": 0.9,
            },
        )

        raw_content = response["message"]["content"]
        log.info(f"Raw response length: {len(raw_content)} chars")

        plan_data = parse_ai_response(raw_content)

        log.info(f"Plan generated: {plan_data.get('total_days')} يوم")

        return GeneratePlanResponse(
            success=True,
            plan=plan_data,
            model_used=model,
        )

    except json.JSONDecodeError as e:
        log.error(f"JSON parse error: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"فشل في تحليل رد الذكاء الاصطناعي: {str(e)}",
        )
    except Exception as e:
        log.error(f"Generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"خطأ في توليد الخطة: {str(e)}",
        )


@app.get("/models")
def list_models():
    """قائمة الموديلات المتاحة على Ollama"""
    try:
        models = ollama.list()
        return {
            "models": [
                {
                    "name": m["name"],
                    "size_gb": round(m.get("size", 0) / 1e9, 1),
                }
                for m in models.get("models", [])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama غير متاح: {str(e)}")


# ══════════════════════════════════════════════════════════════
#  تشغيل مباشر
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 55)
    print("  Quran Plan AI Service - Powered by Ollama")
    print("  مجاني 100% | مفتوح المصدر | بدون API Keys")
    print("=" * 55)
    print(f"  الموديل الافتراضي : {DEFAULT_MODEL}")
    print("  Health check      : http://localhost:8001/health")
    print("  API Docs          : http://localhost:8001/docs")
    print("=" * 55)

    uvicorn.run(
        "ai_service:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
    )
