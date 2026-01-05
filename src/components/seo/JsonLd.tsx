'use client';

import { Tool } from '@/types/tools';

interface WebsiteJsonLdProps {
  type: 'website';
}

interface ToolJsonLdProps {
  type: 'tool';
  tool: Tool;
}

interface BreadcrumbJsonLdProps {
  type: 'breadcrumb';
  items: { name: string; url: string }[];
}

type JsonLdProps = WebsiteJsonLdProps | ToolJsonLdProps | BreadcrumbJsonLdProps;

export function JsonLd(props: JsonLdProps) {
  let structuredData: object;

  switch (props.type) {
    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'DevPockit',
        description:
          'Free online developer tools that run locally in your browser. JSON formatter, UUID generator, JWT decoder, and more.',
        url: 'https://devpockit.hypkey.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://devpockit.hypkey.com/tools?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'tool':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: props.tool.name,
        description: props.tool.description,
        url: `https://devpockit.hypkey.com${props.tool.path}`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '100',
        },
      };
      break;

    case 'breadcrumb':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

