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
        Schema::create('major_tag', function (Blueprint $table) {
            $table->foreignUlid('major_id')
                ->constrained('majors')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignUlid('tag_id')
                ->constrained('tags')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->primary(['major_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('major_tag');
    }
};
