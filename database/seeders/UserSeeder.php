<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'harounsouper@live.fr'],
            [
                'name' => 'Admin GKH',
                'password' => Hash::make('1q2w3e4r'),
                'email_verified_at' => now(),
            ]
        );
    }
}
