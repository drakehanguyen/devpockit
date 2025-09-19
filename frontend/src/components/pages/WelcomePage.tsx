'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTools, getCategoryById, getPopularTools } from '@/lib/tools-data';
import { cn } from '@/lib/utils';

interface WelcomePageProps {
  onToolSelect: (toolId: string) => void;
}

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon?: string;
    isPopular?: boolean;
  };
  onSelect: (toolId: string) => void;
}

const ToolCard = ({ tool, onSelect }: ToolCardProps) => {
  const category = getCategoryById(tool.category);

  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-category-blue-200 hover:border-category-blue-300 hover:bg-category-blue-50 dark:border-category-blue-800 dark:hover:border-category-blue-700 dark:hover:bg-category-blue-950/50',
      green: 'border-category-green-200 hover:border-category-green-300 hover:bg-category-green-50 dark:border-category-green-800 dark:hover:border-category-green-700 dark:hover:bg-category-green-950/50',
      purple: 'border-category-purple-200 hover:border-category-purple-300 hover:bg-category-purple-50 dark:border-category-purple-800 dark:hover:border-category-purple-700 dark:hover:bg-category-purple-950/50',
      red: 'border-category-red-200 hover:border-category-red-300 hover:bg-category-red-50 dark:border-category-red-800 dark:hover:border-category-red-700 dark:hover:bg-category-red-950/50',
      orange: 'border-category-orange-200 hover:border-category-orange-300 hover:bg-category-orange-50 dark:border-category-orange-800 dark:hover:border-category-orange-700 dark:hover:bg-category-orange-950/50',
      teal: 'border-category-teal-200 hover:border-category-teal-300 hover:bg-category-teal-50 dark:border-category-teal-800 dark:hover:border-category-teal-700 dark:hover:bg-category-teal-950/50',
      indigo: 'border-category-indigo-200 hover:border-category-indigo-300 hover:bg-category-indigo-50 dark:border-category-indigo-800 dark:hover:border-category-indigo-700 dark:hover:bg-category-indigo-950/50',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getCategoryHoverTextClasses = (color: string) => {
    const colorMap = {
      blue: 'group-hover:text-category-blue-900 dark:group-hover:text-category-blue-300',
      green: 'group-hover:text-category-green-900 dark:group-hover:text-category-green-300',
      purple: 'group-hover:text-category-purple-900 dark:group-hover:text-category-purple-300',
      red: 'group-hover:text-category-red-900 dark:group-hover:text-category-red-300',
      orange: 'group-hover:text-category-orange-900 dark:group-hover:text-category-orange-300',
      teal: 'group-hover:text-category-teal-900 dark:group-hover:text-category-teal-300',
      indigo: 'group-hover:text-category-indigo-900 dark:group-hover:text-category-indigo-300',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md',
        category && getCategoryColorClasses(category.color)
      )}
      onClick={() => onSelect(tool.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <CardTitle className={cn(
                "text-lg transition-colors",
                category && getCategoryHoverTextClasses(category.color)
              )}>{tool.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  "text-xs text-muted-foreground transition-colors",
                  category && getCategoryHoverTextClasses(category.color)
                )}>{category?.name}</span>
                {tool.isPopular && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                    Popular
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className={cn(
          "text-sm leading-relaxed transition-colors",
          category && getCategoryHoverTextClasses(category.color)
        )}>
          {tool.description}
        </CardDescription>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-3 p-0 h-auto font-medium text-primary hover:text-primary/80 transition-colors",
            category && getCategoryHoverTextClasses(category.color)
          )}
        >
          Open Tool →
        </Button>
      </CardContent>
    </Card>
  );
};

export function WelcomePage({ onToolSelect }: WelcomePageProps) {
  const popularTools = getPopularTools();
  const allTools = getAllTools();
  const totalCategories = new Set(allTools.map(tool => tool.category)).size;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">DP</span>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold">DevPockit</h1>
            <p className="text-lg text-muted-foreground">Essential Developer Tools</p>
          </div>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A comprehensive collection of developer tools organized by categories.
          All tools run entirely in your browser for optimal performance and privacy.
        </p>

        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{allTools.length} Tools Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>{totalCategories} Categories</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Frontend Only</span>
          </div>
        </div>
      </div>

      {/* Popular Tools Section */}
      {popularTools.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Popular Tools</h2>
            <p className="text-muted-foreground">
              Most frequently used tools by developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={onToolSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Tools Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">All Tools</h2>
          <p className="text-muted-foreground">
            Browse all available developer tools by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={onToolSelect}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Why DevPockit?</h2>
          <p className="text-muted-foreground">
            Built for developers, by developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              All tools run entirely in your browser for instant results
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              No data leaves your device. Complete privacy and security
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold">Mobile Friendly</h3>
            <p className="text-sm text-muted-foreground">
              Responsive design that works perfectly on all devices
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Ready to get started?</h2>
        <p className="text-muted-foreground">
          Select a tool from the sidebar or use the search function to find what you need
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => onToolSelect('lorem-ipsum')}
            className="px-6"
          >
            Try Lorem Ipsum Generator
          </Button>
          <Button
            variant="outline"
            onClick={() => onToolSelect('json-formatter')}
            className="px-6"
          >
            Explore All Tools
          </Button>
        </div>
      </div>
    </div>
  );
}
