# Gridia - Copilot Instructions

## Project Overview
Gridia is a modern bookmark management application built with SolidJS and IndexedDB. It's a Progressive Web App (PWA) that allows users to organize, search, and manage bookmarks offline.

## Tech Stack
- **Framework**: SolidJS 1.9.9
- **Language**: TypeScript
- **Build Tool**: Vite 7.1.7
- **Database**: IndexedDB (client-side)
- **PWA Features**: Service Worker, Web App Manifest

## Project Structure
```
src/
├── types/          # Type definitions
├── services/       # IndexedDB and business logic
├── components/     # UI components
├── data/          # Static data
├── App.tsx        # Main application
└── index.tsx      # Entry point with Service Worker registration
```

## Coding Standards

### TypeScript
- Always use explicit types; avoid `any`
- Define interfaces in `src/types/`
- Use type imports: `import { type Component } from 'solid-js'`
- Enable strict mode (already configured)

### Components
- Use functional components with SolidJS patterns
- Component files: PascalCase (e.g., `BookmarkCard.tsx`)
- Companion CSS files: Same name (e.g., `BookmarkCard.css`)
- Props: Define using interfaces
- Example structure:
```typescript
import { type Component } from 'solid-js';
import './ComponentName.css';

interface ComponentNameProps {
  // props definition
}

const ComponentName: Component<ComponentNameProps> = (props) => {
  return (
    <div class="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Services
- Service files: camelCase (e.g., `bookmarkDB.ts`)
- Export class and instance: `export class ServiceName {}` and `export const serviceName = new ServiceName()`
- Place in `src/services/`

### Styling
- Use CSS files (not CSS-in-JS)
- Class names: kebab-case (e.g., `bookmark-card`)
- Responsive design: Mobile-first approach
- Breakpoints: Mobile (≤480px), Tablet (481px-768px), Desktop (>768px)

### File Naming
- Components: PascalCase
- Services: camelCase
- Types: camelCase
- CSS: Match component name

## Architecture Patterns

### State Management
- Use SolidJS's `createSignal` for reactive state
- Keep state close to where it's used
- Use `createEffect` for side effects

### Data Layer
- IndexedDB is the single source of truth
- Use `bookmarkDB` service for all database operations
- Database name: `GridiaDB`
- Object store: `bookmarks`

### PWA Implementation
- Service Worker: Network-first, cache fallback strategy
- Register Service Worker in `index.tsx`
- Icons: Multiple sizes (72x72 to 512x512)
- Manifest: Located in `public/manifest.json`

## Development Workflow

### Available Commands
- `npm run dev` - Start development server (port 5173)
- `npm run build` - TypeScript compile + production build
- `npm run preview` - Preview production build locally

### Building
- Always run `tsc -b` for type checking
- Vite bundles for production
- Output: `dist/` directory

### Commit Messages
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Code formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Build/config changes

## Component Guidelines

### Adding New Components
1. Create in `src/components/`
2. Include TypeScript interface for props
3. Create companion CSS file
4. Import CSS in component
5. Export as default

### Component Props
- Always define props interface
- Use TypeScript for type safety
- Document complex props with comments

## Best Practices

### SolidJS Specific
- Use `For` component for lists, not `.map()`
- Use `Show` for conditional rendering
- Leverage fine-grained reactivity
- Avoid unnecessary wrappers

### IndexedDB
- Always handle async operations
- Use try/catch for error handling
- Close database connections when appropriate
- IndexedDB limitations in private browsing mode

### Performance
- Keep components small and focused
- Use CSS transitions for animations
- Lazy load when beneficial
- Leverage Vite's code splitting

### Accessibility
- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers

## Security
- Client-side only (no server)
- SolidJS auto-escapes to prevent XSS
- Local storage (IndexedDB) only
- No external API calls

## Testing
Currently no test framework is configured. If adding tests:
- Preferred: Vitest (Vite integration)
- Component testing: @solidjs/testing-library
- E2E: Playwright or Cypress

## Deployment
- GitHub Pages (automated via `.github/workflows/deploy.yml`)
- Builds on push to `main` branch
- Deploy URL: https://mtsgi.github.io/gridia-copilot/

## Common Tasks

### Adding a New Bookmark Field
1. Update `Bookmark` interface in `src/types/bookmark.ts`
2. Update database schema version in `bookmarkDB.ts`
3. Add migration logic if needed
4. Update `BookmarkForm.tsx` for input
5. Update `BookmarkCard.tsx` for display

### Adding a New Filter
1. Add state in `App.tsx`
2. Update filtering logic in `filteredBookmarks` memo
3. Add UI controls for the filter
4. Persist filter state if needed

### Styling Changes
1. Modify relevant CSS file
2. Follow existing naming conventions
3. Ensure responsive behavior
4. Test on multiple screen sizes

## Japanese Language
This project uses Japanese for:
- UI labels and text
- Comments in code
- Documentation (README, ARCHITECTURE, DEVELOPMENT)

When working with Japanese text:
- Ensure UTF-8 encoding
- Use appropriate Japanese typography
- Follow Japanese UI conventions

## Resources
- [SolidJS Documentation](https://www.solidjs.com)
- [Vite Documentation](https://vitejs.dev)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
