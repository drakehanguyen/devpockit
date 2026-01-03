'use client';

import { ToolCard } from '@/components/ui/tool-card';
import { getAllTools, getCategoryById, toolIcons } from '@/libs/tools-data';

interface WelcomePageProps {
  onToolSelect: (toolId: string) => void;
  activeToolIds?: string[];
}

export function WelcomePage({ onToolSelect, activeToolIds = [] }: WelcomePageProps) {
  const allTools = getAllTools();

  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-6 items-start justify-center pb-8 pt-14 px-12 w-full">
        {/* Hero Section */}
        <div className="flex flex-col gap-3 items-start justify-center w-full">
          <h1 className="font-normal text-[48px] leading-[48px] tracking-normal overflow-hidden text-ellipsis">
            DevPockit
          </h1>
          <p className="font-normal text-lg leading-7 text-pretty">
            Essential dev tools at your fingertips. Work faster with tools that respect your privacy.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(242px,1fr))] gap-6 px-12 py-6 w-full">
        {allTools.map((tool) => {
          const category = getCategoryById(tool.category);
          const IconComponent = toolIcons[tool.id];
          const isActive = activeToolIds.includes(tool.id);

          return (
            <ToolCard
              key={tool.id}
              icon={IconComponent && <IconComponent className="w-10 h-10" />}
              name={tool.name}
              category={category?.name || tool.category}
              isActive={isActive}
              supportsDesktop={tool.supportsDesktop}
              supportsMobile={tool.supportsMobile}
              onClick={() => onToolSelect(tool.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
