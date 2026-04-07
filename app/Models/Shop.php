<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
        'admin_url',
        'logo',
        'api_key',
        'description',
        'is_active',
        'status',
        'last_sync_at',
        'category_id',
    ];

    /**
     * Get the category that owns the shop.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected $casts = [
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute()
    {
        return $this->logo ? \Storage::disk('public')->url($this->logo) : null;
    }

    // Encrypting api_key instead of hashing if we need to retrieve it.
    // For now, I'll use standard string because we need to use it.
}
