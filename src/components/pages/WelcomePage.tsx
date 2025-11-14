'use client';

import { Card } from '@/components/ui/card';
import { getAllTools, getCategoryById, toolIcons } from '@/libs/tools-data';

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
  const IconComponent = toolIcons[tool.id];

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
      onClick={() => onSelect(tool.id)}
    >
      <div className="flex flex-col gap-2 items-start justify-end pb-4 pt-8 px-4">
        <div className="bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center rounded-full shrink-0 w-10 h-10">
          {IconComponent && <IconComponent className="w-[18px] h-[18px] text-foreground" />}
        </div>
        <div className="flex flex-col items-start w-full">
          <h3 className="font-medium text-base text-primary leading-6">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-5">
            {category?.name}
          </p>
        </div>
      </div>
    </Card>
  );
};

export function WelcomePage({ onToolSelect }: WelcomePageProps) {
  const allTools = getAllTools();

  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-6 items-start justify-center pb-12 pt-14 px-12 w-full">
        {/* Hero Section */}
        <div className="flex flex-col gap-3 items-start justify-center w-full">
          <h1 className="font-extrabold text-[48px] leading-[48px] tracking-tight overflow-hidden text-ellipsis">
            DevPockit
          </h1>
          <p className="font-normal text-lg leading-7 text-pretty">
            A comprehensive collection of developer tools organized by categories. All tools run entirely in your browser for optimal performance and privacy.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex flex-wrap gap-6 items-center px-12 py-6 w-full">
        {allTools.map((tool) => (
          <div key={tool.id} className="w-[242px]">
            <ToolCard
              tool={tool}
              onSelect={onToolSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
