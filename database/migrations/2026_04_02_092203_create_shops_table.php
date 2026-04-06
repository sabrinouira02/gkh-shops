<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('admin_url')->nullable();
            $table->string('logo')->nullable();
            $table->text('api_key');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('status')->default('connecting'); // connecting, active, error
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
