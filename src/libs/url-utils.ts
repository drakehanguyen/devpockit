import { getCategoryById, getToolById } from './tools-data';

/**
 * Generate URL path for a tool based on its category and ID
 */
export function getToolUrl(toolId: string): string | null {
  const tool = getToolById(toolId);
  if (!tool) return null;

  return `/tools/${tool.category}/${toolId}`;
}

/**
 * Generate URL path for a category
 */
export function getCategoryUrl(categoryId: string): string | null {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  return `/tools/${categoryId}`;
}

/**
 * Parse URL path to extract tool information
 */
export function parseToolUrl(pathname: string): { category: string; toolId: string } | null {
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 3 && pathSegments[0] === 'tools') {
    const [, category, toolId] = pathSegments;
    return { category, toolId };
  }

  return null;
}

/**
 * Parse URL path to extract category information
 */
export function parseCategoryUrl(pathname: string): string | null {
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 2 && pathSegments[0] === 'tools') {
    return pathSegments[1];
  }

  return null;
}

/**
 * Validate if a tool URL is valid
 */
export function isValidToolUrl(pathname: string): boolean {
  const parsed = parseToolUrl(pathname);
  if (!parsed) return false;

  const tool = getToolById(parsed.toolId);
  return tool !== undefined && tool.category === parsed.category;
}

/**
 * Validate if a category URL is valid
 */
export function isValidCategoryUrl(pathname: string): boolean {
  const categoryId = parseCategoryUrl(pathname);
  if (!categoryId) return false;

  const category = getCategoryById(categoryId);
  return category !== null;
}
