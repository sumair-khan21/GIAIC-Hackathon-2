export default function DashboardLoading() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Form skeleton */}
          <section>
            <div className="h-6 w-32 bg-muted/30 rounded animate-pulse mb-4" />
            <div className="bg-background border border-border rounded-lg p-4 space-y-4">
              <div className="h-10 bg-muted/30 rounded animate-pulse" />
              <div className="h-24 bg-muted/30 rounded animate-pulse" />
              <div className="h-10 w-24 bg-muted/30 rounded animate-pulse" />
            </div>
          </section>

          {/* Task list skeleton */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 bg-muted/30 rounded animate-pulse" />
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-muted/30 rounded animate-pulse" />
                <div className="h-8 w-20 bg-muted/30 rounded animate-pulse" />
                <div className="h-8 w-24 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-lg p-4 animate-pulse"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 h-4 w-4 bg-muted/30 rounded" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted/30 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted/30 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
