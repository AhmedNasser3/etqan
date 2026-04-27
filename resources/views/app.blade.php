<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="إتقان — منصة إدارة الحلقات والمجمعات القرآنية. الحل الرقمي الأمثل لإدارة المجمعات القرآنية والدور النسائية. تتبع الحضور، التقارير، غرف التسميع، والخطط التعليمية.">
    <meta name="keywords" content="منصة قرآنية، إدارة مجمع قرآني، حلقات تحفيظ، برنامج مجمع قرآني، نظام حلقات، دور نسائية قرآنية">
    <title>إتقان — نظام إدارة الحلقات والمجمعات القرآنية</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.20.2/xlsx.full.min.js"></script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body>
    <div id="app"></div>

</body>
</html>
