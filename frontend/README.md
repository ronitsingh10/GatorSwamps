# GatorSwamp Frontend

A React-based frontend for the GatorSwamp housing management application.

## Tech Stack

- React 19
- Vite 6
- TailwindCSS 4
- MapLibre GL
- HeadlessUI
- React Router 7

## Project Structure

```
frontend/
├── src/          # Source code
├── public/       # Static assets
├── dist/         # Production build output
└── index.html    # Entry point
```

## Dependencies

### Production Dependencies
- `react` & `react-dom` - Core React library
- `@headlessui/react` - Accessible UI components
- `maplibre-gl` & `react-map-gl` - Map components
- `react-router-dom` - Routing
- `lucide-react` & `react-icons` - Icons
- `tailwindcss` - Styling

### Development Dependencies
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` and related plugins - Code quality
- `@types/react` & `@types/react-dom` - TypeScript definitions

## Setup

1. Install Node.js (Latest LTS version)
2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- **Development server**:
  ```bash
  npm run dev
  ```
  Starts the development server on port 5173

- **Production build**:
  ```bash
  npm run build
  ```
  Creates an optimized production build in `dist/`

- **Preview production build**:
  ```bash
  npm run preview
  ```
  Locally preview production build

- **Lint code**:
  ```bash
  npm run lint
  ```
  Run ESLint to check code quality

## Development

- Development server with hot reload
- ESLint for code quality
- API proxy configuration in vite.config.js
- TailwindCSS utility-first styling

## Building for Production

1. Create production build:
   ```bash
   npm run build
   ```

2. The `dist` directory will contain optimized files ready for deployment