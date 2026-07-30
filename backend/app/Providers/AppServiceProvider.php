<?php

namespace App\Providers;

use App\Models\JoinRequest;
use App\Models\Notification;
use App\Models\StudyGroup;
use App\Policies\JoinRequestPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\StudyGroupPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(
            StudyGroup::class,
            StudyGroupPolicy::class
        );

        Gate::policy(
            JoinRequest::class,
            JoinRequestPolicy::class
        );

        Gate::policy(
            Notification::class,
            NotificationPolicy::class
        );
    }
}
