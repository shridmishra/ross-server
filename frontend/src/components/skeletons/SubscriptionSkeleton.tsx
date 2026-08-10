"use client";

import { Skeleton } from "./ui";

export function ManageSubscriptionSkeleton() {
    return (
        <div className="min-h-full flex flex-col bg-background">
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton variant="rounded" width="4rem" height="4rem" className="shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton height="2.5rem" width="400px" className="max-w-full" />
                        <Skeleton height="1.25rem" width="500px" className="max-w-full" />
                    </div>
                </div>

                {/* Current Plan Section */}
                <div className="bg-muted/50 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Skeleton height="1rem" width="120px" className="max-w-full" />
                                <Skeleton height="1.5rem" width="80px" variant="rounded" className="shrink-0" />
                            </div>
                            <Skeleton height="2rem" width="200px" className="max-w-full" />
                            <Skeleton height="1.25rem" width="300px" className="max-w-full" />
                        </div>
                        <Skeleton height="3rem" width="140px" variant="rounded" className="shrink-0" />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* Four Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-card rounded-xl p-4 sm:p-5 border border-border space-y-3 overflow-hidden min-w-0">
                                    <Skeleton variant="rounded" width="1.5rem" height="1.5rem" className="shrink-0" />
                                    <Skeleton height="0.75rem" width="70%" />
                                    <Skeleton height="1.5rem" width="85%" />
                                    <Skeleton height="1rem" width="50%" />
                                </div>
                            ))}
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-card rounded-xl p-6 border border-border min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton variant="rounded" width="1.5rem" height="1.5rem" className="shrink-0" />
                                <Skeleton height="1.5rem" width="250px" className="max-w-full" />
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="border border-border rounded-lg p-4 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <Skeleton height="1.25rem" width="80%" className="max-w-full" />
                                            <Skeleton variant="rounded" width="1.25rem" height="1.25rem" className="shrink-0" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Billing History Skeleton */}
                    <div className="bg-card rounded-xl px-6 py-3.5 border border-border min-w-0">
                        <Skeleton height="1.5rem" width="150px" className="mb-4 max-w-full" />
                        <BillingHistorySkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BillingHistorySkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg gap-2 overflow-hidden"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Skeleton variant="circular" width="1.25rem" height="1.25rem" className="shrink-0" />
                        <div className="space-y-2 min-w-0 flex-1">
                            <Skeleton height="1rem" width="100px" className="max-w-full" />
                            <Skeleton height="0.75rem" width="80px" className="max-w-full" />
                        </div>
                    </div>
                    <Skeleton variant="rounded" width="1.25rem" height="1.25rem" className="shrink-0" />
                </div>
            ))}
            <div className="pt-2">
                <Skeleton height="0.75rem" width="180px" className="ml-auto max-w-full" />
            </div>
        </div>
    );
}
