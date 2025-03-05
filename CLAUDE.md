# PlebFM Development Guide

## Commands

- `pnpm dev` - Start dev server with HTTPS on port 3000
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format all files with Prettier
- `pnpm storybook` - Run Storybook for component development

## Code Style

- **Package Manager**: PNPM required (enforced by preinstall hook)
- **TypeScript**: Strict mode enabled, explicit return types preferred
- **Formatting**:
  - 80 char line limit, 2 space indent, single quotes, trailing commas
  - Semicolons required, no JSX single quotes
  - Auto-formatted on commit via Husky + pretty-quick
- **Components**: React functional components with TypeScript interfaces
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Imports**: Group by: 1) React/Next, 2) External libs, 3) Internal modules
- **Error Handling**: Use try/catch blocks with appropriate user feedback
- **Project Structure**: App Router pattern with (private) folders for auth routes
