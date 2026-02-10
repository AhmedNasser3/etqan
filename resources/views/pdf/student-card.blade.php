<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>بطاقة الطالب</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', Arial, sans-serif; }
        .card { border: 3px solid #007bff; border-radius: 15px; }
        .student-photo { width: 120px; height: 150px; object-fit: cover; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
        @page { margin: 20px; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-lg">
                    <!-- Header -->
                    <div class="header p-4 text-center">
                        <h2 class="mb-2">🕌 بطاقة الطالب</h2>
                        <h4>مركز التقييم الإيماني</h4>
                    </div>

                    <div class="row g-0">
                        <!-- Photo -->
                        <div class="col-md-4 text-center p-4 border-end">
                            <img src="{{ $student->user->avatar ?? 'https://via.placeholder.com/120x150?text=صورة' }}"
                                 alt="صورة الطالب" class="student-photo img-thumbnail">
                            <h5 class="mt-2">{{ $student->user->name ?? $student->name ?? 'غير محدد' }}</h5>
                        </div>

                        <!-- Info -->
                        <div class="col-md-8 p-4">
                            <div class="row">
                                <div class="col-6">
                                    <strong>رقم الهوية:</strong><br>
                                    <span class="badge bg-primary fs-6">{{ $student->id_number }}</span>
                                </div>
                                <div class="col-6">
                                    <strong>الصف:</strong><br>
                                    {{ $student->grade_level ?? 'غير محدد' }}
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-6">
                                    <strong>المرحلة:</strong><br>
                                    {{ $student->circle ?? 'غير محدد' }}
                                </div>
                                <div class="col-6">
                                    <strong>الحالة الصحية:</strong><br>
                                    {{ $student->health_status ?? 'سليم' }}
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-12">
                                    <strong>تاريخ التسجيل:</strong><br>
                                    {{ $student->created_at?->format('Y-m-d') }}
                                </div>
                            </div>

                            <hr class="my-3">

                            <div class="row">
                                <div class="col-6">
                                    <strong>ولي الأمر:</strong><br>
                                    {{ $student->guardian->name ?? 'غير محدد' }}
                                </div>
                                <div class="col-6">
                                    <strong>تليفون:</strong><br>
                                    <a href="tel:{{ $student->guardian->phone ?? $student->user->phone ?? '' }}"
                                       class="text-decoration-none">{{ $student->guardian->phone ?? $student->user->phone ?? 'غير محدد' }}</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="card-footer text-center bg-light">
                        <p class="mb-0">تم إصدار هذه البطاقة بواسطة نظام إدارة الطلاب</p>
                        <small class="text-muted">{{ now()->format('Y-m-d H:i') }}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
