# Analytics Dashboard

## Overview

This is a full-stack analytics dashboard application built with React and Express. The application displays business metrics through interactive charts, data tables, and KPI cards. It features a modern UI with real-time data visualization for revenue tracking, user analytics, transaction monitoring, and product performance metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React with TypeScript**: The client-side is built using React 18 with TypeScript for type safety. The application uses a component-based architecture with a clear separation between UI components and business logic.

**UI Framework**: The application leverages shadcn/ui components built on top of Radix UI primitives and styled with Tailwind CSS. This provides a consistent, accessible design system with customizable theming through CSS variables.

**State Management**: Uses TanStack Query (React Query) for server state management, handling data fetching, caching, and synchronization. Local component state is managed with React's built-in useState and useContext hooks.

**Routing**: Implements client-side routing with Wouter, a lightweight routing library. The current setup includes basic route handling for the dashboard and 404 pages.

**Build System**: Vite is used as the build tool and development server, providing fast hot module replacement and optimized production builds.

### Backend Architecture

**Express.js Server**: RESTful API built with Express.js handling analytics data endpoints. The server includes middleware for JSON parsing, request logging, and error handling.

**Data Layer**: Currently uses an in-memory storage implementation (`MemStorage`) for development, but the architecture supports easy swapping to database-backed storage through the `IStorage` interface.

**API Design**: Clean REST endpoints for analytics (`/api/analytics`), transactions (`/api/transactions`), products (`/api/products`), and data export functionality (`/api/export/:type`).

### Data Storage Solutions

**Development Storage**: Uses in-memory storage with mock data for development and testing purposes. Data includes analytics metrics, transaction records, and product performance data.

**Database Schema**: Designed for PostgreSQL with Drizzle ORM. Schema includes tables for users, analytics, transactions, and products with proper type definitions and relationships.

**Data Export**: Built-in CSV export functionality for analytics, transactions, and products data.

### External Dependencies

**Database**: Configured for PostgreSQL via Neon Database with Drizzle ORM for type-safe database operations and migrations.

**UI Components**: Extensive use of Radix UI primitives for accessibility and shadcn/ui for styled components.

**Charts and Visualization**: Recharts library for rendering interactive charts including line charts, pie charts, and bar charts.

**Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming.

**Development Tools**: Vite for build tooling, TypeScript for type safety, and Replit-specific plugins for development environment integration.