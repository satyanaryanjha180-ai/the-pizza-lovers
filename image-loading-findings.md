# Image Loading Findings

- The homepage references four local assets under `/assets/`: `pizza-cutting-hero.webp`, `pizza-detail.webp`, `snacks-spread.webp`, and `pizza-mark.webp`.
- All four files exist under `client/public/assets/`.
- Browser inspection found 12 rendered `<img>` elements, and every one reported `complete: true` with a non-zero natural width/height.
- The full-page preview shows the hero image, menu thumbnails, combo image, and footer/logo imagery rendering.
- The perceived missing images are caused by menu items that omit the optional `image` property in `Home.tsx`; those cards intentionally render no `<img>` at all. This affects Tomato & Cheese Pizza, Onion & Cheese Pizza, Pizza Indiana, Masala Paneer, Dark Spicy, Paneer Tikka, Cheese Garlic Bread, Veg. Maggi, Cold Coffee, Cheese Burger, White Pasta, and Veg Combo Double.
- No broken image request was observed in the current preview.

## Planned fix

Make the menu data provide a valid image for every menu item, while keeping the existing local asset paths and adding accessible alt text/fallback behavior in the card renderer so each menu card has a visible food visual and image failures do not leave an unexplained blank area.

## Verification after fix

- The refreshed preview now renders 24 image elements, including all 20 menu items plus hero, logo, and feature imagery.
- Browser validation reported `failed: []`; every image was complete and had a non-zero natural width.
- All image sources resolve to the four uploaded `/manus-storage/` paths rather than the old `/assets/` paths.
- `pnpm check` and `pnpm build` both completed successfully. The build emitted only the existing large-chunk warning.
