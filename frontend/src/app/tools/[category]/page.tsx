'use client';

import { getCategoryById } from '@/libs/tools-data';
import { notFound } from 'next/navigation';
import { use } from 'react';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = use(params);
  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  // The AppLayout is now handled by the layout.tsx file
  return null;
}
