import { getToolById, getTools } from '@/libs/tools-data';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: Promise<{
    category: string;
    toolId: string;
    instanceId: string;
  }>;
}

// Disallow dynamic params that weren't generated at build time
// This ensures invalid routes show 404 instead of causing errors
export const dynamicParams = false;

// Force static generation (required for static export)
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tools = getTools();
  // Generate instances 1-5 for each tool (max instances per tool)
  const params: Array<{ category: string; toolId: string; instanceId: string }> = [];

  for (const tool of tools) {
    for (let i = 1; i <= 5; i++) {
      params.push({
        category: tool.category,
        toolId: tool.id,
        instanceId: i.toString(),
      });
    }
  }

  return params;
}

export default async function ToolPage({ params }: ToolPageProps) {
  try {
    const { category, toolId, instanceId } = await params;

    // Early validation - if params are missing or invalid, show 404
    if (!category || !toolId || !instanceId) {
      notFound();
    }

    const tool = getToolById(toolId);

    // Validate tool exists
    if (!tool) {
      notFound();
    }

    // Verify the tool belongs to the specified category
    if (tool.category !== category) {
      notFound();
    }

    // Validate instanceId is a non-empty string
    if (instanceId.trim() === '') {
      notFound();
    }

    // The AppLayout is now handled by the layout.tsx file
    return null;
  } catch (error) {
    // If anything goes wrong (including route validation errors), show 404
    console.error('Tool page error:', error);
    notFound();
  }
}

