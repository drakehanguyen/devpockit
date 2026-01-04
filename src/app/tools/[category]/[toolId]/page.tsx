import { getToolById, getTools } from '@/libs/tools-data';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: Promise<{
    category: string;
    toolId: string;
  }>;
}

// Disallow dynamic params that weren't generated at build time
// This ensures invalid routes show 404 instead of causing errors
export const dynamicParams = false;

// Force static generation (required for static export)
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tools = getTools();
  return tools.map((tool) => ({
    category: tool.category,
    toolId: tool.id,
  }));
}

export default async function ToolPage({ params }: ToolPageProps) {
  try {
    const { category, toolId } = await params;

    // Early validation - if params are missing or invalid, show 404
    if (!category || !toolId) {
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

    // The AppLayout is now handled by the layout.tsx file
    return null;
  } catch (error) {
    // If anything goes wrong (including route validation errors), show 404
    console.error('Tool page error:', error);
    notFound();
  }
}
