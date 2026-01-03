export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load the page</p>
        </div>
      </div>
    </div>
  );
}

