<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Remove PrestaShop specific stuff and shop relationship (1-to-N the other way)
            if (Schema::hasColumn('categories', 'shop_id')) {
                $table->dropForeign(['shop_id']);
                $table->dropColumn('shop_id');
            }
            $table->dropColumn(['ps_category_id', 'parent_id', 'position', 'level_depth']);
            
            // Add platform specific fields
            $table->string('icon')->nullable()->after('name');
            $table->string('color')->nullable()->after('icon');
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['icon', 'color']);
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('ps_category_id')->nullable();
            $table->integer('parent_id')->nullable();
            $table->integer('position')->default(0);
            $table->integer('level_depth')->default(0);
        });
    }
};
