# Ceramic Studio UI Refresh Design

## Overview

Full redesign of the personal portfolio from a dark ember/fire theme to a warm, organic "Ceramic Studio" aesthetic using the Claude Color Palette. Light mode default with dark mode toggle. Artisan, tactile feel with serif display typography, organic spore particles, and masonry layouts.

## Color System

### Light Mode (default)

| Role             | Color        | Hex       |
|------------------|-------------|-----------|
| Background       | White       | `#FFFFFF` |
| Surface          | Cream       | `#FDF9F3` |
| Surface elevated | Pale Taupe  | `#D2C3B7` |
| Border           | Muted Brown | `#7E6E5C` |
| Text primary     | Claude Brown| `#3F3227` |
| Text secondary   | Muted Brown | `#7E6E5C` |
| Text muted       | Pale Taupe  | `#D2C3B7` |
| Accent           | Rust        | `#D0643A` |
| Accent hover     | Claude Brown| `#3F3227` |

### Dark Mode

| Role             | Color        | Hex       |
|------------------|-------------|-----------|
| Background       | Deep Noir   | `#0E0A08` |
| Surface          | Dark Claude | `#211A15` |
| Surface elevated | Claude Brown| `#3F3227` |
| Border           | Muted Brown | `#7E6E5C` |
| Text primary     | Cream       | `#FDF9F3` |
| Text secondary   | Pale Taupe  | `#D2C3B7` |
| Text muted       | Muted Brown | `#7E6E5C` |
| Accent           | Rust        | `#D0643A` |
| Accent hover     | Cream       | `#FDF9F3` |

## Typography

- **Display**: Fraunces (Google Fonts, variable) - organic serif with optical sizing
- **Body**: Plus Jakarta Sans (Google Fonts, variable) - warm geometric sans
- **Mono**: JetBrains Mono (keep existing)

### Hierarchy

- Hero name: Fraunces, 80-96px, weight 900
- Section titles: Fraunces, 40-48px, weight 700
- Card titles: Plus Jakarta Sans, 20px, weight 600
- Body: Plus Jakarta Sans, 16px, weight 400
- Meta/small: Plus Jakarta Sans, 14px, text-secondary

## Layout Changes

### From
- Full-screen sections with DotNav
- Bento grid articles
- Horizontal scroll projects

### To
- Single flowing page with sticky top nav
- Asymmetric masonry article grid
- Responsive card grid for projects with inline expansion

### Header/Nav
- Slim fixed top bar: name (left), section links (center), theme toggle (right)
- Hamburger menu on mobile
- Transparent on hero, solid on scroll

### Hero
- Full viewport height
- Large Fraunces serif name
- One-liner subtitle
- Social icons row
- Subtle paper grain texture background

### Articles Section
- Asymmetric masonry layout (3 col desktop, 1 col mobile)
- Tag filtering as pill toggle buttons
- Cards with subtle lift shadow on hover (no 3D tilt)
- Rust "Read more" links

### Projects Section
- Responsive card grid (3 col desktop, 2 tablet, 1 mobile)
- Selected project expands inline via collapsible
- Rust left-border accent for selected state

### Footer
- Minimal: name, year, social links
- Separator line above

### Removed
- DotNav (replaced by sticky header)
- SceneContainer full-height constraint

## Component Design

### Article Cards (shadcn card)
- Cream/white bg, thin Muted Brown border
- Rounded image (8px), subtle shadow
- Tags: Cream bg with colored left border
- Hover: subtle lift shadow
- Rust "Read more" link

### Project Cards (shadcn card)
- White/cream card, thin border
- Language dot indicator
- Star count
- Selected: Rust left border
- Expands inline with collapsible

### Article Modal (shadcn dialog)
- Full-width dialog with scroll-area
- Hero image at top
- Fraunces title, clean markdown rendering
- Rust-colored links
- Tag badges

### Theme Toggle (shadcn dropdown-menu + button)
- Sun/Moon icon toggle
- Light / Dark / System options

### Loading Screen
- Replace "DSB" particle formation
- Simple warm spinner or pulse animation
- Claude Brown / Rust themed

## Canvas & Companion

### Background Particles (Organic Spores)
- Gentle floating seed/spore shapes
- Light mode: Pale Taupe/Muted Brown, opacity 0.15-0.3
- Dark mode: Cream/Pale Taupe, opacity 0.2-0.4
- Movement: Gentle upward drift with lateral sway
- Cursor: Soft dispersion on proximity
- Count: 30-50 particles, larger, softer shapes

### Penguin Companion
- Restyle with Claude palette (Claude Brown body, Cream belly, Rust beak/feet)
- Keep behavior system (walk, sit, jump)
- Warmer, softer pixel art

## New shadcn Components

Install: card, dialog, separator, tabs, scroll-area, dropdown-menu, navigation-menu, toggle, skeleton

## Technical Notes

- next-themes for light/dark mode
- CSS variables for all colors (mapped to shadcn convention)
- Fraunces + Plus Jakarta Sans via next/font/google
- Keep Framer Motion for animations
- Keep existing data flow (server components, getConfig, etc.)
