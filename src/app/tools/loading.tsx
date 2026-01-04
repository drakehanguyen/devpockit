export default function ToolsLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium">Loading tools...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  );
}

