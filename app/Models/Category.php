<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon',
        'color',
        'description',
        'active'
    ];

    /**
     * Get the shops for this category.
     */
    public function shops()
    {
        return $this->hasMany(Shop::class);
    }
}
