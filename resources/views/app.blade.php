<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet"/>
    <link rel="shortcut icon" src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png" type="image/x-icon">
    <title>إتقان</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.20.2/xlsx.full.min.js"></script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
