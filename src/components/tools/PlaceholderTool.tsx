import { Code } from 'lucide-react';
import { ComponentType } from 'react';

const PlaceholderTool: ComponentType<any> = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
            <Code className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tool Coming Soon!</h1>
            <p className="text-muted-foreground text-lg">
              This tool is currently under development and will be available soon.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          <p>
            This tool is part of the DevPockit suite.
            <span className="font-medium text-foreground"> Check back soon!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderTool;
