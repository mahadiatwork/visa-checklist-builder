# Visa Checklist Builder

## Overview
A Next.js 14 web application designed for migration agents to manage and customize document checklists for different visa types. The app provides a clean, intuitive interface for building, editing, and saving visa checklists with localStorage persistence.

## Project Details
- **Created**: October 31, 2025
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (no TypeScript)
- **Styling**: Tailwind CSS
- **Data Persistence**: localStorage (client-side only)

## Tech Stack
- **Next.js 14** - React framework with App Router
- **React 18** - JavaScript UI library
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Drag-and-drop library for reordering checklist items
  - @dnd-kit/core
  - @dnd-kit/sortable
  - @dnd-kit/utilities

## Features
1. **Visa Type Selection**: Choose from 4 visa categories
   - Partner Visa
   - 482 Temporary Work Visa
   - Protection Visa
   - Permanent Employer Sponsored Visa

2. **Template Management**
   - Load default checklist templates for each visa type
   - Save customized versions as templates
   - Toggle between default and saved templates
   - Templates persist across browser sessions

3. **Category Management**
   - Collapsible category cards
   - Inline editable category titles (contentEditable)
   - Add new categories
   - Delete existing categories
   - Each category can have multiple checklist items

4. **Item Management**
   - Inline editable checklist items (contentEditable)
   - Add new items to any category
   - Delete individual items
   - Drag-and-drop reordering within categories
   - Visual drag handles for easy interaction

5. **Data Persistence**
   - Save entire checklist to localStorage
   - Save customized checklists as reusable templates
   - Automatic template detection and loading
   - Separate storage per visa type

## Project Structure
```
/
├── app/
│   ├── layout.js          # Root layout with metadata
│   ├── page.js            # Main application component
│   └── globals.css        # Tailwind CSS imports
├── data/
│   └── visaChecklists.js  # Default visa checklist templates
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Recent Changes
- **Oct 31, 2025**: Initial project setup with all core features implemented
  - Created Next.js 14 app with JavaScript configuration
  - Implemented visa checklist builder with full CRUD operations
  - Added drag-and-drop functionality for item reordering
  - Integrated localStorage for template persistence
  - Applied Tailwind CSS styling with custom visa-green color (#198754)

## Design Notes
- Clean, modern card-based layout
- Responsive design for desktop, tablet, and mobile
- Green accent color (#198754) for primary actions
- Blue accent for secondary actions
- Smooth transitions for collapsing/expanding categories
- Hover effects and visual feedback for interactive elements
- Drag handles visible on all checklist items
- Delete buttons appear on hover for cleaner interface

## User Preferences
- Client-side only application (no backend required)
- No TypeScript (JavaScript only)
- localStorage for data persistence
- Modern, professional design suitable for migration agents

## Development
```bash
# Install dependencies
npm install

# Run development server (port 5000)
npm run dev

# Build for production
npm build

# Start production server
npm start
```

## Environment
- Development server runs on port 5000
- Binds to 0.0.0.0 for Replit compatibility
- No environment variables required
- No backend or database needed

## Future Enhancements (Not Yet Implemented)
- Drag-and-drop reordering for entire categories (currently items only)
- Multiple named templates per visa type
- Export to PDF or CSV
- Checklist completion tracking with checkboxes
- Progress indicators
- Search/filter functionality across all items
- Print-friendly views
- Undo/redo functionality
- Template sharing capabilities
