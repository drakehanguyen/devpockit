import { getToolById, getTools } from '@/libs/tools-data';
import { notFound } from 'next/navigation';
import { use } from 'react';

interface ToolPageProps {
  params: Promise<{
    category: string;
    toolId: string;
  }>;
}

export async function generateStaticParams() {
  const tools = getTools();
  return tools.map((tool) => ({
    category: tool.category,
    toolId: tool.id,
  }));
}

export default function ToolPage({ params }: ToolPageProps) {
  const { category, toolId } = use(params);
  const tool = getToolById(toolId);

  if (!tool) {
    notFound();
  }

  // Verify the tool belongs to the specified category
  if (tool.category !== category) {
    notFound();
  }

  // The AppLayout is now handled by the layout.tsx file
  return null;
}
