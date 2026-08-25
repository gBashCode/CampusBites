---
description: Redesign Campus Bites UI to match a futuristic 2026 Zomato-inspired aesthetic.
---

# Campus Bites Redesign Plan - "2026 Zomato Vibe"

The goal is to transform the existing functionally-focused UI into a high-fidelity, immersive, and premium mobile-first web experience. We will adopt a "Dark Mode First" approach with vibrant accents, glassmorphism, and AI-driven UX patterns.

## 1. Design System & Theming (Global)
-   **Color Palette**:
    -   Background: `#121212` (Deep Charcoal) to `#0D0D0D` (Near Black).
    -   Primary: `#E23744` (Zomato Red) or a slightly more neon variant `#FF4B4B`.
    -   Surface: Glassmorphism (White/Black with low opacity + blur).
    -   Text: `#FFFFFF` (Primary), `#B0B0B0` (Secondary).
-   **Typography**: Use a modern sans-serif font (e.g., 'Inter', 'Outfit', or 'Plus Jakarta Sans').
-   **Iconography**: Rounded, 3D-style, or outline icons with neon glows (Lucide-react with custom styling).

## 2. Component Overhaul

### A. Navigation (Mobile Bottom Bar)
-   Replace the top tabs in Dashboard with a fixed **Bottom Floating Dock**.
-   Glassmorphism background (`backdrop-filter: blur(20px)`).
-   Active state: Icon glows + subtle scale animation.

### B. Header & Hero Section
-   **Immersive Hero**: Full-width image/video background at the top of the "Menu" page.
-   **Greeting**: "Good Evening, [Name]" with large, bold typography.
-   **Search**: A floating "Omnibar" with microphone icon (visual only) and "Ask AI" sparkles.

### C. Menu Grid (Cards)
-   **Card Style**: Dark cards with rounded corners (24px).
-   **Images**: Large, high-quality visuals.
-   **Interactions**: "Add" button with a complex animation (morphing or particle effect).
-   **Tags**: "Best Seller", "Spicy", "Vegetarian" using vibrant, pill-shaped badges.

### D. Cart Experience
-   **Mini-Cart**: A floating pill at the bottom (above nav) showing total items + price, encouraging quick checkout.
-   **Full Cart Page**: Slide-up drawer animation instead of a separate page route (if possible, or just a sleek page).
-   **Checkout**: Swipe-to-pay interaction.

### E. AI Features (Visual)
-   **"What are you craving?"**: A section with AI-suggested pills (e.g., "Late Night Snack", "Protein Packed").

## 3. Implementation Steps
1.  **Dependencies**: Install framer-motion for complex animations (if not already present, we'll try to stick to CSS/standard libs first, but Framer Motion is best for this feel).
    -   `npm install framer-motion clsx tailwind-merge` (We are using vanilla CSS, but these utilities help. Actually, stick to Vanilla CSS + Modules as per user instructions).
2.  **Global CSS**: Completely rewrite `index.css` to set the dark theme base.
3.  **Layout Update**: Modify `Dashboard.jsx` to move navigation to the bottom.
4.  **Menu Page**: Redesign `Menu.jsx` with the new card layout.
5.  **Cart**: Redesign `Cart.jsx`.

## 4. Execution Order
1.  **Step 1**: Update `index.css` with new variables and reset.
2.  **Step 2**: Rebuild `Dashboard.jsx` structure (Bottom Nav).
3.  **Step 3**: Designing the "Menu" view (Hero + Cards).
4.  **Step 4**: Polishing Animations.
