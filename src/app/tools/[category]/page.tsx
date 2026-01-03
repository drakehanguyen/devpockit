import { getCategories, getCategoryById } from '@/libs/tools-data';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Disallow dynamic params that weren't generated at build time
export const dynamicParams = false;

// Force static generation (required for static export)
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category: category.id,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { category: categoryId } = await params;

    // Early validation
    if (!categoryId) {
      notFound();
    }

    const category = getCategoryById(categoryId);

    if (!category) {
      notFound();
    }

    // The AppLayout is now handled by the layout.tsx file
    return null;
  } catch (error) {
    // If anything goes wrong, show 404
    console.error('Category page error:', error);
    notFound();
  }
}
