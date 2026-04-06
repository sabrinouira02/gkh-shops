<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('categories', \App\Http\Controllers\CategoryController::class);


    // Shops Management
    Route::prefix('shops')->name('shops.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ShopController::class, 'index'])->name('index');


        Route::get('/create', [\App\Http\Controllers\ShopController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\ShopController::class, 'store'])->name('store');
        Route::get('/{shop}', [\App\Http\Controllers\ShopController::class, 'show'])->name('show');
        Route::get('/{shop}/categories', [\App\Http\Controllers\ShopController::class, 'categories'])->name('categories');
        Route::get('/{shop}/categories/{id}', [\App\Http\Controllers\ShopController::class, 'categoryShow'])->name('categories.show');
        Route::get('/{shop}/categories/{id}/edit', [\App\Http\Controllers\ShopController::class, 'categoryEdit'])->name('categories.edit');
        Route::put('/{shop}/categories/{id}', [\App\Http\Controllers\ShopController::class, 'categoryUpdate'])->name('categories.update');
        Route::delete('/{shop}/categories/{id}', [\App\Http\Controllers\ShopController::class, 'categoryDestroy'])->name('categories.destroy');
        Route::get('/{shop}/products', [\App\Http\Controllers\ShopController::class, 'products'])->name('products');

        Route::get('/{shop}/products/{id}', [\App\Http\Controllers\ShopController::class, 'productShow'])->name('products.show');
        Route::get('/{shop}/products/{id}/edit', [\App\Http\Controllers\ShopController::class, 'productEdit'])->name('products.edit');
        Route::put('/{shop}/products/{id}', [\App\Http\Controllers\ShopController::class, 'productUpdate'])->name('products.update');
        Route::delete('/{shop}/products/{id}', [\App\Http\Controllers\ShopController::class, 'productDestroy'])->name('products.destroy');
        Route::post('/{shop}/products/{id}/copy', [\App\Http\Controllers\ShopController::class, 'productCopyTo'])->name('products.copy');
        Route::get('/{shop}/orders', [\App\Http\Controllers\ShopController::class, 'orders'])->name('orders');
        Route::get('/{shop}/orders/{id}', [\App\Http\Controllers\ShopController::class, 'orderShow'])->name('orders.show');
        Route::get('/{shop}/customers', [\App\Http\Controllers\ShopController::class, 'customers'])->name('customers');
        Route::get('/{shop}/customers/{id}', [\App\Http\Controllers\ShopController::class, 'customerShow'])->name('customers.show');
        Route::get('/{shop}/customers/{id}/edit', [\App\Http\Controllers\ShopController::class, 'customerEdit'])->name('customers.edit');
        Route::put('/{shop}/customers/{id}', [\App\Http\Controllers\ShopController::class, 'customerUpdate'])->name('customers.update');
        Route::delete('/{shop}/customers/{id}', [\App\Http\Controllers\ShopController::class, 'customerDestroy'])->name('customers.destroy');
        
        // Address management
        Route::get('/{shop}/addresses/{id}/edit', [\App\Http\Controllers\ShopController::class, 'addressEdit'])->name('addresses.edit');
        Route::put('/{shop}/addresses/{id}', [\App\Http\Controllers\ShopController::class, 'addressUpdate'])->name('addresses.update');
        Route::delete('/{shop}/addresses/{id}', [\App\Http\Controllers\ShopController::class, 'addressDestroy'])->name('addresses.destroy');
        Route::post('/{shop}/employees', [\App\Http\Controllers\ShopController::class, 'employeeStore'])->name('employees.store');
        Route::delete('/{shop}/employees/{id}', [\App\Http\Controllers\ShopController::class, 'employeeDestroy'])->name('employees.destroy');
        Route::put('/{shop}/employees/{id}', [\App\Http\Controllers\ShopController::class, 'employeeUpdate'])->name('employees.update');

        Route::put('/{shop}/groups/{id}', [\App\Http\Controllers\ShopController::class, 'groupUpdate'])->name('groups.update');
        Route::delete('/{shop}/groups/{id}', [\App\Http\Controllers\ShopController::class, 'groupDestroy'])->name('groups.destroy');

        Route::get('/{shop}/edit', [\App\Http\Controllers\ShopController::class, 'edit'])->name('edit');
        Route::put('/{shop}', [\App\Http\Controllers\ShopController::class, 'update'])->name('update');
        Route::delete('/{shop}', [\App\Http\Controllers\ShopController::class, 'destroy'])->name('destroy');
        Route::post('/{shop}/test', [\App\Http\Controllers\ShopController::class, 'testConnection'])->name('test');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';