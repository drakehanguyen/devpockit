# DevPockit Frontend

Next.js 15 frontend for DevPockit - A modern web application providing essential developer tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- pnpm (package manager)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Set up environment variables (optional)
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development Server

```bash
# Start the development server
pnpm dev

# Frontend will be available at:
# - Application: http://localhost:3000 (or 3001 if 3000 is busy)
# - Hot reload enabled for development
```

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Preview the production build locally
pnpm preview
```

## 🏗️ Architecture

### Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── globals.css       # Global styles with Tailwind
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Home page component
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Shadcn/ui components
│   │   └── tools/            # Tool-specific components (Phase 6+)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configurations
│   │   └── utils.ts          # Common utility functions
│   ├── services/             # API service layer
│   ├── stores/               # State management (Context API)
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── components.json           # Shadcn/ui configuration
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
└── README.md                # This file
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier
- **State Management**: React Context API + hooks
- **Form Handling**: React Hook Form + Zod validation (Phase 6+)
- **HTTP Client**: Fetch API / Axios (Phase 6+)

## 🎨 Design System

### Theme Configuration

- **Default Theme**: Dark mode
- **Theme Toggle**: Light/Dark mode switcher (Phase 6)
- **Colors**: Custom color palette with CSS variables
- **Typography**: System font stack with Tailwind typography
- **Responsive**: Mobile-first responsive design

### UI Components (Shadcn/ui)

The project uses Shadcn/ui for consistent, accessible components:

```bash
# Add new Shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
# Components will be added to src/components/ui/
```

### Styling Guidelines

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: For theme customization
- **Component Styling**: Tailwind classes with CSS modules fallback
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Default with toggle support

## 🔧 Configuration

### Environment Variables

```bash
# .env.local (for local development)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development

# Production environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_ENV=production
```

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Strict TypeScript checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Strict ESLint checking
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### TypeScript Configuration

- **Strict Mode**: Enabled for type safety
- **Path Mapping**: Configured for clean imports
- **Next.js Types**: Included for framework support

## 📱 Features (Current & Planned)

### ✅ Completed Features (Phase 1-5)

- **✅ Next.js 15 Setup**: App Router with TypeScript
- **✅ Tailwind CSS**: Styling framework configured
- **✅ Shadcn/ui**: UI component library setup
- **✅ Development Environment**: Hot reload and dev tools
- **✅ Code Quality**: ESLint and Prettier configured
- **✅ Build System**: Production build pipeline

### 🔄 Phase 6: Basic UI Layout (Next)

- **🔄 Sidebar Navigation**: Mobile-friendly sidebar
- **🔄 Header Component**: App header with branding
- **🔄 Theme Toggle**: Dark/Light mode switcher
- **🔄 Responsive Design**: Mobile-first layout
- **🔄 Layout Components**: Reusable layout primitives

### 📋 Upcoming Features (Phase 7+)

- **📋 Developer Tools UI**: 8 essential developer tools
- **📋 Authentication UI**: Login/Register forms
- **📋 User Dashboard**: Personal workspace
- **📋 History Tracking**: Save and revisit work
- **📋 Favorites System**: Bookmark preferred tools
- **📋 Copy-to-Clipboard**: One-click result copying
- **📋 Error Handling**: Graceful error boundaries
- **📋 Loading States**: Smooth user experience

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm dev:turbo        # Start with Turbopack (faster)

# Building
pnpm build            # Build for production
pnpm start            # Start production server
pnpm export           # Export static site

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # Run TypeScript compiler

# Testing (Phase 6+)
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Dependencies
pnpm add <package>    # Add production dependency
pnpm add -D <package> # Add development dependency
pnpm update           # Update dependencies
```

### Code Quality Standards

#### ESLint Configuration

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### File Organization

#### Component Structure

```typescript
// components/tools/JsonFormatter.tsx
interface JsonFormatterProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export function JsonFormatter({ onResult, onError }: JsonFormatterProps) {
  // Component implementation
}
```

#### Custom Hooks

```typescript
// hooks/useApi.ts
export function useApi<T>(endpoint: string) {
  // API hook implementation
}
```

#### Type Definitions

```typescript
// types/tools.ts
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

## 🌐 API Integration

### Service Layer Pattern

```typescript
// services/apiService.ts
class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  async formatJson(data: string, minify: boolean) {
    // API call implementation
  }
}

export const apiService = new ApiService();
```

### Authentication Integration

```typescript
// hooks/useAuth.ts
export function useAuth() {
  // JWT token management
  // User state management
  // Login/logout functionality
}
```

### Error Handling

```typescript
// components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary implementation
}
```

## 📊 Current Phase Status

### ✅ Completed Phases

- **Phase 1**: Project Setup ✅
- **Phase 2**: Backend Foundation ✅
- **Phase 3**: API Structure ✅
- **Phase 4**: Database Setup ✅
- **Phase 5**: Authentication System ✅

### 🔄 Current Phase

- **Phase 6**: Basic UI Layout (In Progress)
  - Sidebar navigation component
  - Header with theme toggle
  - Responsive layout system
  - Dark/Light mode implementation

### 📋 Next Phases

- **Phase 7**: JSON ↔ YAML Converter UI
- **Phase 8**: JSON Formatter UI
- **Phase 9**: XML Formatter UI
- **Phase 10**: UUID Generator UI

## 🎯 Developer Tools (Phase 7-14)

### Tool Categories

#### **Data Conversion Tools**
1. **JSON ↔ YAML Converter**: Bidirectional conversion with validation
2. **JSON Formatter**: Minify/beautify with syntax highlighting
3. **XML Formatter**: Format XML with error handling

#### **Generator Tools**
4. **UUID Generator**: v1, v4, v5 with bulk generation
5. **Lorem Ipsum Generator**: Customizable text generation

#### **Development Tools**
6. **JWT Encoder/Decoder**: HS256 algorithm, header/payload editing
7. **Cron Parser**: Human-readable descriptions, next execution times
8. **Regex Tester**: JavaScript/Python flavors, match highlighting

### UI/UX Features

- **📋 Copy-to-Clipboard**: One-click result copying
- **💾 Auto-Save**: Preserve work in progress
- **📱 Mobile-Friendly**: Responsive tool interfaces
- **🎨 Syntax Highlighting**: Code formatting and colors
- **⚡ Real-time Processing**: Instant results as you type
- **🔄 History**: Save and revisit previous work
- **⭐ Favorites**: Bookmark frequently used tools

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

### Environment Variables for Production

```bash
# Vercel environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_ENV=production
```

### Build Optimization

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Automatic font optimization
- **Bundle Analysis**: Built-in bundle analyzer

## 🧪 Testing Strategy

### Testing Framework (Phase 6+)

```bash
# Install testing dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event jest-environment-jsdom
```

### Test Types

1. **Unit Tests**: Component and utility testing
2. **Integration Tests**: API integration testing
3. **E2E Tests**: Full user workflow testing
4. **Accessibility Tests**: WCAG compliance testing

### Example Test

```typescript
// __tests__/components/JsonFormatter.test.tsx
import { render, screen } from '@testing-library/react';
import { JsonFormatter } from '@/components/tools/JsonFormatter';

describe('JsonFormatter', () => {
  it('formats JSON correctly', () => {
    // Test implementation
  });
});
```

## 🔍 Performance Optimization

### Next.js 15 Features

- **App Router**: Improved routing and layouts
- **Server Components**: Reduced client-side JavaScript
- **Streaming**: Progressive page loading
- **Turbopack**: Faster development builds

### Optimization Techniques

- **Code Splitting**: Route and component level
- **Lazy Loading**: Dynamic imports for tools
- **Memoization**: React.memo and useMemo
- **Bundle Size**: Regular bundle analysis
- **Core Web Vitals**: Performance monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9

   # Or use different port
   pnpm dev -p 3001
   ```

2. **TypeScript Errors**:
   ```bash
   # Check TypeScript configuration
   pnpm type-check

   # Clear Next.js cache
   rm -rf .next
   pnpm dev
   ```

3. **Styling Issues**:
   ```bash
   # Rebuild Tailwind
   pnpm build

   # Check Tailwind configuration
   npx tailwindcss --help
   ```

4. **Package Issues**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   pnpm install
   ```

### Development Tips

- **Hot Reload**: Automatic on file changes
- **Error Overlay**: Development error display
- **React DevTools**: Browser extension for debugging
- **Next.js DevTools**: Built-in development tools

## 📚 Learning Resources

### Next.js 15
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)

### Shadcn/ui
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Component Examples](https://ui.shadcn.com/examples)
- [Customization Guide](https://ui.shadcn.com/docs/theming)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 📝 Contributing

### Development Workflow

1. **Setup**: Follow installation instructions
2. **Branch**: Create feature branch from main
3. **Develop**: Follow coding standards and conventions
4. **Test**: Write and run tests for new features
5. **Lint**: Ensure code passes ESLint and Prettier
6. **Commit**: Use conventional commit messages
7. **PR**: Create pull request with description

### Coding Standards

- **TypeScript**: Strict mode, proper typing
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: kebab-case for file names
- **Imports**: Absolute imports with path mapping
- **Comments**: JSDoc for public APIs

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/phase-6-sidebar

# Commit with conventional commits
git commit -m "feat: add sidebar navigation component"

# Push and create PR
git push origin feature/phase-6-sidebar
```

## 🎯 Roadmap

### Short Term (Phase 6-10)
- ✅ Basic UI layout and navigation
- ✅ Core developer tools implementation
- ✅ Authentication UI integration
- ✅ Responsive design system

### Medium Term (Phase 11-15)
- ✅ Advanced tools (JWT, Regex, Cron)
- ✅ User dashboard and history
- ✅ Favorites and preferences
- ✅ Performance optimization

### Long Term (Phase 16-18)
- ✅ Testing and quality assurance
- ✅ Production deployment
- ✅ Documentation and maintenance
- ✅ Future enhancements

The frontend is ready for **Phase 6: Basic UI Layout** where we'll implement the core navigation, theming, and responsive layout system that will serve as the foundation for all developer tools.
