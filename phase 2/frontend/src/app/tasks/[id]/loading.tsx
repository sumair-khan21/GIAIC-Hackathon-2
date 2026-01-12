export default function TaskDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-6 w-24 bg-muted/30 rounded animate-pulse" />
            <div className="flex items-center space-x-4">
              <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 h-5 w-5 bg-muted/30 rounded" />
              <div className="flex-1">
                <div className="h-8 w-3/4 bg-muted/30 rounded mb-2" />
                <div className="h-6 w-20 bg-muted/30 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted/30 rounded" />
              <div className="h-4 w-full bg-muted/30 rounded" />
              <div className="h-4 w-5/6 bg-muted/30 rounded" />
              <div className="h-4 w-4/6 bg-muted/30 rounded" />
            </div>

            <div className="space-y-1">
              <div className="h-4 w-48 bg-muted/30 rounded" />
              <div className="h-4 w-48 bg-muted/30 rounded" />
            </div>

            <div className="flex space-x-3">
              <div className="h-10 w-16 bg-muted/30 rounded" />
              <div className="h-10 w-16 bg-muted/30 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
