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
        Schema::create('study_groups', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('owner_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('title', 100);
            $table->text('description');
            $table->string('location');
            $table->timestamp('meeting_time');
            $table->unsignedTinyInteger('max_members');
            $table->string('whatsapp_link')->nullable();

            $table->enum('visibility', [
                'public', 'private',
            ])->default('public');

            $table->enum('status', [
                'open',
                'ongoing',
                'finished',
                'cancelled',
            ])->default('open');

            $table->timestamp('expires_at');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_groups');
    }
};
