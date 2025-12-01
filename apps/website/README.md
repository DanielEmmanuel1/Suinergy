# Marketing Website - Suinergy

Public-facing marketing website for Suinergy yield aggregator.

## Purpose

This is the **marketing website** (`suinergy.com`) that introduces visitors to the platform. It does NOT contain wallet integration or dApp functionality.

**For the actual dApp application, see:** `apps/dapp`

## Features

- 🎨 Polished UI with TailwindCSS and custom design system
- ✨ Rich animations with GSAP, Framer Motion, and Lenis
- 📱 Responsive design optimized for all devices
- 🎭 shadcn/ui component library

## Content Sections (To Be Implemented)

- Hero section with value proposition
- Features overview
- How it works / Strategy explanation
- Team / About section
- Call-to-action to launch dApp
- Footer with links

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animation**: GSAP, Framer Motion, Lenis
- **UI Components**: shadcn/ui

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development server (port 3000)
pnpm dev
```

Visit `http://localhost:3000`

## Build

```bash
pnpm build
pnpm start
```
