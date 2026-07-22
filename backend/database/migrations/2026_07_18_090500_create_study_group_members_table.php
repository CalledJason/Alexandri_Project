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
        Schema::create('study_group_members', function (Blueprint $table) {

            $table->ulid('id')->primary();
            $table->foreignUlid('study_group_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignUlid('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            
            $table->enum('role', [
                'owner',
                'member',
            ])->default('member');

            $table->timestamp('joined_at');
            $table->timestamps();

            $table->unique([
                'study_group_id',
                'user_id',
            ]);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_group_members');
    }
};
