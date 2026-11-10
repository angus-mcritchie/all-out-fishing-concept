# All Out Fishing: reskin brief for the developer

Prepared by Hobbies Direct for All Out Fishing, 10 November 2026.

**What this is.** All Out Fishing are happy with how the current site works. They want it to look and feel like the concept mock-up, plus the short list of changes below. **This is a reskin of the site you've built, not a rebuild.** Keep the platform, data, checkout and integrations as they are. Each requirement below states only what differs from your site as it stood on 10 November.

**What's in the pack**

- `README.md`: this brief. Every change, with checks you can run.
- `mockup/`: the clickable mock-up as plain HTML, CSS and JavaScript (no framework, no build step). Open `mockup/index.html` in a browser. Treat it as a visual and behaviour reference to copy from. It isn't production code.
- `mockup/css/site.css`: every colour, font size, radius and breakpoint. Section 2 lists the tokens.
- `mockup/js/site.js`: the behaviour, written in small readable pieces: filters, search highlighting and menus.
- The roughly 3,500 product and colour photos aren't in this zip, to keep it small, so product cards in `mockup/` show empty photo boxes when opened locally. The public mock-up link has them all.

Live copy: https://angus-mcritchie.github.io/all-out-fishing-concept/

If you work with an AI coding assistant, give it this README and the `mockup/` folder. The requirements are written so it can work through them one at a time.

---

## 1. Priorities

| Order | Change | Why |
|---|---|---|
| 1 | Product data and images correct (already under way) | Everything else shows this data |
| 2 | R1 and R2: the look, filters and top menu | The core of the reskin |
| 3 | R3 to R10: copy, search, homepage sections, pricing | Smaller, mostly front-end |
| 4 | R12 and R13: polish rules and restyling your other pages | Finish |
| Later | R11: "Where are you fishing?" finder | Not for this launch |

**Keep these, even where the mock-up doesn't show them:** wishlist, account, Become a Member, Setup Builder, Species pages, New Arrivals, Privacy and Terms, paged listings with Show 50/100/150, the Sale only filter, the Lure Browser's Length filter, colour swatches and species tags on lure cards, the cart's promo code box and GST line, your product page tabs (Overview, Specifications), your photo zoom and your custom not-found page.

## 2. Look and feel

Fonts: **Barlow Condensed** (600, 700, 800; headings, buttons, navigation; always uppercase) and **Inter** (body). Both are in `mockup/assets/fonts/`.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#14181c` | Header, footer, dark sections, main text |
| `--mint` | `#14f3b9` | Brand accent. Only as a fill behind ink text, or as text on ink. Never mint text on white (fails contrast) |
| `--teal` | `#067a5e` | Links and accent text on white |
| `--tray` | `#eceff3` | Light panels, chips, cards |
| `--line` | `#d9dfe6` | Borders and dividers |
| `--body` | `#3f4954` | Secondary text |
| `--navy` | `#1b2b4b` | Setup Builder panel |
| Radius | 6px buttons and inputs, 10 to 14px cards and panels | Rounded, not oval |
| Page width | 1360px max, 40px gutters (16px on phones) | |

Breakpoints: phones up to 820px, tablets and small laptops 821 to 1024px, desktop above 1024px.

## 3. Requirements

Each one has **what to change** and, where useful, **how to check it**.

### R1. Filters down the side

**Today**: desktop filters are dropdowns in a row above the products. The Style list has no counts. Terminal Tackle and Line have no size filter.

**Build**

- On desktop, move the filters into a sidebar: **Brand** (checkboxes with counts), **Size** (chips) and **Price** brackets (Under $10, $10 to $25, $25 to $50, $50 to $100, $100 and over). Keep your phone filter sheet and restyle it to match.
- Every option shows the number of results it would give. Options that would give zero are greyed out.
- Add a **Size** filter to Terminal Tackle and Line: hook size for hooks (8/0 to 10), sinker size, breaking strain for line (6 lb, 10 lb, 20 lb). Hide it where it doesn't apply (storage).
- Product types sit as chips across the top of the category, as in the mock-up.

**Check**: on a phone, open Filters on Bait Hooks and tick 1/0. The count on the button updates, and closing returns focus to the Filters button.

Reference: `shop.html`, and the browser block in `js/site.js`.

### R2. Top menu

**Today**: Shop is one dropdown holding every category, so categories are one click deeper.

**Build**

- Put the categories straight on the top bar. Order: **Rods, Reels, Lures, Line, Terminal Tackle, Storage, Accessories, Apparel**. Then Lure Browser, Setup Builder and Shop by species buttons on the right where there's room.
- **Bait & Berley** sits inside Accessories under its own heading. **Hooks** sit inside Terminal Tackle under a "Hooks" heading, with sinkers, swivels and the rest under "Rigging".
- No "More" menu.
- **Don't shrink the menu text to make it fit.** The mock-up's steps:
    - Above 1360px: everything shows.
    - 1141 to 1360px: slightly tighter spacing, and only the Lure Browser button.
    - 1025 to 1140px: no shortcut buttons.
    - 1024px and below (tablets in both orientations): categories move into the menu button. In the menu, each category opens in place (accordion).
- Each mega menu has a "Shop all …" link next to its heading.

**Check**: at 1440, 1280, 1180, 1024, 820 and 390px wide, the categories never wrap onto two lines or overflow, and the text is never smaller than 18px.

This menu is our suggestion. All Out Fishing will confirm the final categories.

### R3. Dispatch wording

**Keep your countdown and its logic.** Only the wording and the phone layout change.

**Build**

- On a business day before the cut-off, the strip reads **"Order in 2h 14m 05s for dispatch today"**. Otherwise **"Next dispatch tomorrow at 12pm"** (or the weekday name).
- A small "?" explains: "Cut-off is 12pm Melbourne time on business days: Monday to Friday, except Victorian public holidays."
- On phones the line shortens to "Ships today: order in 2h 14m 05s" next to the phone number, on one line at 390px. It wraps to two today.

The mock-up doesn't work out public holidays. Yours should.

### R4. Reviews

**Build**: leave out the Reviews tab and the "No reviews yet / Write a review" block until products have reviews to show.

### R5. Search suggestions

**Today**: rows are products only, with no bold on what was typed.

**Build**

- Bold the part of each suggestion that matches what was typed ("**Tro**ut lures"). **Escape the text first, then wrap the match**, so product names can never inject HTML.
- Suggestions come in two groups, on phones too:
    - **Shop by**: species, which open the Lure Browser with that fish ticked, plus categories and types (for example "swiv" offers Swivels & Snaps).
    - **Products**: products whose name matches come before products that only match a tag.
- Down arrow moves into the suggestions, and Escape closes them.
- **Keep what was typed.** A category row reads "daiwa in Reels" and opens Reels with that brand ticked. A brand row reads "reels by Daiwa". Other words read "tide in Reels" and open Reels with the search kept, shown as a removable pill. The brand itself stays as a plain row. Group headings with no meaning alone never appear as suggestions.

**Check**: type "tro". Wherever "tro" appears in a suggestion's text it is bold, and "Trout lures" opens the Lure Browser with Trout ticked.

### R6. Homepage hero and tiles

**Today**: a full-screen video with the logo over it, so no products or categories on the first screen, then full-width photo banners.

**Build**

- Replace the first screen with a hero **inside** the page width, with rounded corners and a photo of a big catch. No video in the hero.
- On phones the hero is short (heading, one line, photo to the right), so all six category tiles are reachable without much scrolling.
- Below it, plain light category tiles: Rods, Reels, Lures, Line, Terminal Tackle, Storage.

**Check**: at 390px wide, the first screen shows the header, a short hero and the category tiles.

### R7. "Why shop with us"

**Build**: add a homepage section with three items: Same-day dispatch (order by 12pm on business days), Click & Collect (ready at our Geelong shop), Advice from anglers (we use this gear, plus the phone number).

### R8. Video lower on the page

**Build**: move the video to a "We're anglers first" section near the bottom, with a poster image and a play button. **Load it only when it's tapped** (no autoplay, no preload) so the page stays quick on phones.

**Needs**: a short highlight reel.

### R9. Guides and About Us

**Build**: the bottom of the homepage has two large links: **Guides** (How to Catch, Buyer's Guides, Tackle Tips, Cookbook) and **About Us** (Meet the Team, Visit the Shop, socials). Group the footer the same way. Keep the legal and help links.

### R10. Cheapest price first

**Today**: cards show one plain price and the product page opens on a middle size.

**Build**

- Product cards show **"From $X"** only when the listing's price is the cheapest variant's price and sizes differ in price. Otherwise show the plain listing price.
- Under that same condition, product pages open on the cheapest variant and the price updates when another size is picked. If the listing's price isn't the cheapest size, the page keeps the listing price and sizes don't change it, until variant prices are confirmed.

**Decide with All Out Fishing**: does "cheapest" mean the cheapest variant **in stock**? We'd suggest yes.

### R11. Later: "Where are you fishing?"

A separate concept page (`finder.html`) for after launch. A shopper picks a water from a map or a list and sees its main species, ramps and land-based spots. One tap opens the Lure Browser with that species ticked, or there's a short "just give me the essentials" kit. It's only linked from the phone menu for now. **Don't build it for launch.** The mock-up runs on real data: 266 waters from the Victorian Fisheries Authority's stocking database, plus OpenStreetMap ramps and jetties, a Leaflet map and Wikimedia Commons photos. `finder-sources.md`, next to this README, lists every dataset and its licence. **The VFA data is licensed for non-commercial use only**, so a live version needs the VFA's written permission, or the data under CC BY. Link to the VFA for rules rather than restating them.

### R12. Polish rules (from the shop rules Hobbies Direct uses on its own site)

Items marked *Mock-up* can be copied from the mock-up. Items marked *Real checkout* can only be finished on your site.

**Build: look and feel**

- **Cards:** the category label and heart come off the photo, where they collide with packets. Cards stay even. Titles stop at 2 lines, with the full name on hover. The photo's `alt` is blank when the product name sits right beside it.
- **Chips and pills:** small 6px corners, not pill shapes. Active-filter pills read as one phrase.
- **Links:** text links are dark and underlined. Mint is for links on dark backgrounds.
- **Press feedback:** a button press shows at once, with a darker fill and a 0.97 shrink (none with reduced motion). Hover changes colour only, with no lift or shadow.
- **Long filter lists:** show the 8 values with the most products, then "Show all N", which opens the full list A to Z. Never cut a list to hide just one value. Shorter lists are ranked by count too. Lists over 15 values get a "Find a …" box.
- **Sort labels:** keep your options, including Newest. Only the wording changes: Most popular (Relevance on search), Newest, Lowest price, Highest price, Name A to Z, in sentence case.
- **Breadcrumbs:** stop at the parent section, because the page's own name is the heading. Phones drop "Home".
- **Product page on a phone:**
    - The order is name, photo, then options, price and Add to Cart close together. Delivery and Click & Collect lines come after the button.
    - A bar with the price and Add to Cart shows from arrival, and hides while the real button is on screen.
- **Phone filters:** the Filters button stays on screen as you scroll.
- **No results:** open text, not a box, with every way out: untick a filter, clear all, or call the shop.
- **Spacing:** shop sections sit 48px apart on phones and 64px on desktop. Picture grids keep at least 12px between tiles.
- **Phone numbers:** written without brackets, as "03 5222 3257".
- **Delivery strip:** sits in a labelled area (`<aside aria-label="Delivery and contact">`).
- **Page language:** `lang="en-AU"`.

**Build: prices and product page**

- **Sale price (Mock-up):** one signal only. Black price, the saving in red beside it ("Save $30"), regular price struck through in grey where there's room. On phone cards, the buy bar and search rows, show the price and "Save $30" only, never a struck price on its own. No red badges, no red price, no "-20%" tags. Drive it from an optional regular-price field and carry it to the cart line. Reference: `priceHTML` in `js/site.js`, `.save` and `.was` in `css/site.css`.
- **Tabular figures (Mock-up):** every price in a list or card uses `font-variant-numeric: tabular-nums`.
- **Spec units (Mock-up):** a non-breaking space between number and unit in facet labels, size chips, variants and specs ("300 m", "15 lb", "2.4 kg"). One helper, display only, so filter values and URLs keep the raw text. Model numbers and product names ("2500", "BG MQ", "SW5000-H") are left alone. Reference: `unit` in `js/site.js`.
- **Returns line (Mock-up):** "30 day change of mind returns" is said once on the product page, with the delivery lines.
- **Pay later:** you don't offer it today, so add nothing. If that changes, say it once, on the line under the price.
- **Photo boxes (Mock-up):** a loading or missing photo shows a quiet grey box in the same slot, in cards, cart rows, search rows and the gallery. No shimmer and no "coming soon" art.
- **Add to cart (Mock-up shows the states; Real checkout wires them to the request):** the button goes busy (spinner over the label, width and name kept, `aria-busy`, can't fire twice), then a short note with the product's photo, and the cart badge pops (200ms, 1.15x at most). No fly-to-cart.

**Build: navigation**

- **Back to the list (Mock-up):** Back from a product returns to the same scroll position, restored after the list has drawn. A sort change adds a history step. Filter ticks and find boxes replace the current entry, so one Back leaves the list. Reference: `listKey` in `js/site.js`.
- **Skip to content (Mock-up):** the first Tab stop on every page, hidden until focused, moves focus to the page's `<main>`.

**Build: cart, errors and forms**

- **Express wallets (Mock-up placeholder; Real checkout):** one row of Apple Pay, Google Pay and PayPal under Checkout in the cart, and nowhere else in the cart. The mock-up has labelled demo buttons. Use Stripe's own wallet buttons and show only the wallets the device supports. All Out Fishing to confirm they want this.
- **Delivery options (Mock-up; Real checkout):** at most one label each, in priority order Free, then Fastest, then Cheapest. Show the arrival estimate and never say "guaranteed". Standard and Express read "Priced at checkout".
- **Form fields (Mock-up for cart and contact; Real checkout for the rest):** every field sets the correct `type`, `inputmode` and `autocomplete`. Empty-field errors say what to do ("Enter your postcode"), never "is required" or "Please".
- **Shop failure (Mock-up page; Real checkout):** `error.html`. Says what happened and that the cart is saved, then Try again and the phone number. No status names, no "Please", no blame, no promises. Show it when the shop fails on your side, and make Try again repeat the failed request.

**Check**: at every width from 320 to 1920px, nothing scrolls sideways, no text is cut off, and every tap target on a phone is at least 44px or has that much clear space around it.

### R13. Restyle your other pages

These pages already exist on your site. Keep them and their content, and restyle them to match the mock-up:

- **Shopping:** Cart (`cart.html`) and Shop by Brand (`brands.html`, an A to Z with a find box).
- **About and help:** About Us and The Team, Contact, Shipping & Returns, Click & Collect, FAQ.
- **Guides** (`guides.html`).

Keep your real cart and checkout. Copy the layout, not the demo cart. The mock-up's not-found page (`404.html`) and photo viewer are there so the mock-up works; keep yours.

The dashed boxes mark content All Out Fishing still needs to supply: crew photos and a crew note for each product.

## 4. Data the reskin relies on

| Field | Used for | Notes |
|---|---|---|
| Product type within its category (for example Swivels & Snaps) | R1 chips | Probably your existing subcategories |
| Brand | R1 | |
| Size, hook size or breaking strain | R1 | Often in the variant names, for example "Sz4/0" or "300m 15lb". Worth storing as a proper attribute |
| Variant prices and stock | R10 | |
| Species, water type, lure style | Lure Browser (as now) | Mostly tagged on lures only |

## 5. Quality checks

- **Speed**: hero image under about 60 KB with `fetchpriority="high"`, everything below the fold `loading="lazy"`, video loaded on tap only.
- **Keyboard**: every menu, filter sheet and suggestion list works with Tab, arrows and Escape. Escape returns focus to the button that opened it. Focus outlines are visible (3px teal, or mint on dark).
- **Contrast**: never mint text on white. Use teal for links on white.
- **Touch targets** are 44px or more on phones.
- **No horizontal scrolling** at 320, 390, 768, 1024 or 1440px.

## 6. What not to copy from the mock-up

- The white "Concept mock-up" bar at the top.
- The product data in `js/catalogue.js` and `js/details.js`. It's All Out Fishing's real range and prices from the live site on 10 November 2026 (1,602 products with a photo), squeezed down for a static mock-up. Use your live data and real product pages instead.
- The demo cart, which lives in the browser tab (sessionStorage). Keep your real cart and checkout.
- The Apple Pay, Google Pay and PayPal buttons in the cart, which are labelled demos.
- The guide links on `guides.html`, which are inactive in the mock-up.
- The contact form, which checks the fields but never sends a message.
- The homepage "Join now" form, which checks the email and says nothing was sent. Keep your real Become a Member sign-up.
- The "Start the Setup Builder" button, which shows a note because the builder isn't in the mock-up. Link it to your Setup Builder.
- The mock-up's `404.html` and photo viewer. Keep yours.
- "Crew note goes here" and "Your highlight reel goes here" are placeholders for All Out Fishing's own content.
