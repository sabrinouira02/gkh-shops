<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\ActivityLog;
use App\Services\PrestaShopService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    protected $prestaShopService;

    public function __construct(PrestaShopService $prestaShopService)
    {
        $this->prestaShopService = $prestaShopService;
    }

    public function index()
    {
        $shops = Shop::where('is_active', true)->get();
        $shops_stats = [];

        foreach ($shops as $shop) {
            $shops_stats[] = [
                'id' => $shop->id,
                'name' => $shop->name,
                'total_standard' => 0, // Disabled for now
                'total_special' => 0,  // Disabled for now
                'total_customers' => 0, // Disabled for now
            ];
        }

        // Get the latest administrative actions
        $recent_activities = ActivityLog::with('user', 'shop')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'shops_stats' => $shops_stats,
            'total_engaged' => 0,
            'total_customers_count' => 0,
            'recent_activities' => $recent_activities,
        ]);
    }
}
