<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function centerId(): int
    {
        $override = request()->header('X-Center-Id');
        if ($override && is_numeric($override)) {
            return (int) $override;
        }
        return (int) auth()->user()->center_id;
    }
}
