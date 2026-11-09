# All Out Fishing: reskin brief for the developer

Prepared by Hobbies Direct for Peri and Michael at All Out Fishing, 10 November 2026.

**What this is.** All Out Fishing are happy with how the current site works. They want it to look and feel like the concept mock-up, plus a short list of changes from our 9 November catch-up. **This is a reskin of the site you've built, not a rebuild.** Keep the platform, data, checkout and integrations as they are.

**What's in the pack**

- `README.md`: this brief. Every change, with checks you can run.
- `mockup/`: the clickable mock-up as plain HTML, CSS and JavaScript (no framework, no build step). Open `mockup/index.html` in a browser. Treat it as a visual and behaviour reference to copy from. It isn't production code.
- `mockup/css/site.css`: every colour, font size, radius and breakpoint. Section 2 lists the tokens.
- `mockup/js/site.js`: the behaviour, written in small readable pieces: the multi-select browser, dispatch countdown, search highlighting and menus.

Live copy: https://angus-mcritchie.github.io/all-out-fishing-concept/

If you work with an AI coding assistant, give it this README and the `mockup/` folder. The requirements are written so it can work through them one at a time.

---

## 1. Priorities

| Order | Change | Why |
|---|---|---|
| 1 | Product data and images correct (already under way) | Peri: "Let's get all that stuff sorted first." |
| 2 | R1 to R4: the look, the multi-select browsing, filters, header and menu | The core of the reskin |
| 3 | R5 to R12: copy, search, homepage sections, pricing | Smaller, mostly front-end |
| Later | R13: "Where are you fishing?" finder | Peri: not for this launch |

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
| Radius | 6px buttons and inputs, 10 to 14px cards and panels | "Rounded, not oval" (Peri) |
| Page width | 1360px max, 40px gutters (16px on phones) | |

Breakpoints: phones up to 820px, tablets and small laptops 821 to 1024px, desktop above 1024px.

## 3. Requirements

Each one has **what to build** and **how to check it**.

### R1. Tick more than one, on every category

All Out Fishing's favourite feature on the current site is ticking several product types at once (for example swivels and snaps, floats, and beads and tubing together). The Lure Browser already does this for lure styles. Do the same for every category.

**Build**
- Each category page shows its product types as tick-chips across the top ("Tick more than one to compare").
- **Inside one filter, ticks add together (OR).** Ticking Swivels & Snaps and Floats shows both. **Across filters, ticks narrow (AND).** Floats plus Jarvis Walker shows Jarvis Walker floats only.
- Coming in from a menu link or a tile pre-ticks that type and leaves the others available. For example, Line > Braid opens Line with Braid ticked, and the shopper can add Leader.
- Every option shows the number of results it would give. Options that would give zero are greyed out.
- Ticked options also appear as removable pills above the results, with **Clear all**.
- The ticks are kept in the URL (for example `?cat=line&type=Braid|Leader&brand=Rovex`), so reloading, Back and sharing a link keep the selection. The mock-up uses `history.replaceState`.
- Species stays a Lure Browser filter. **Don't** make species a site-wide setting (Peri: "It's not a species thing").

**Check**
1. Terminal Tackle: tick Swivels & Snaps, then Floats. Both kinds show, and the heading reads "13 swivels & snaps and floats".
2. Add a brand. Only that brand's swivels and floats remain.
3. Reload the page. The same ticks are still on.
4. Line > Braid from the menu opens with Braid ticked. Tick Leader, and braid is still shown.

Reference: `shop.html`, and the `shared multi-select browser` block in `js/site.js`.

### R2. Brand, size and price down the side

**Build**
- A sidebar with **Brand** (checkboxes with counts), **Size** (chips) and **Price** brackets (Under $10, $10 to $25, $25 to $50, $50 to $100, $100 and over).
- Size depends on the category: hook size for hooks (8/0 to 10), sinker size, breaking strain for line (6lb, 10lb, 20lb…). Hide it where it doesn't apply (storage).
- On phones the sidebar becomes one **Filters** sheet that slides up from the bottom. It has a close button and a sticky "Show N products" button, and Escape closes it.
- The Lure Browser gets Brand and Price too, and Size (length or weight) once lures have a size field. The mock-up's lure data has no size yet.

**Check**: on a phone, open Filters on Bait Hooks, tick 1/0. The count on the button updates, closing returns focus to the Filters button.

### R3. Phone header

**Build**: remove the row of Lure Browser / Setup Builder / Shop by species buttons from under the search on phones. Put them at the bottom of the menu. The phone header is: menu button, logo, account, cart, then search.

**Check**: at 390px wide, the first screen shows the header, a short hero and the category tiles.

### R4. Top menu

**Build**
- Order: **Rods, Reels, Lures, Line, Terminal Tackle, Storage, Accessories, Apparel**. Then Lure Browser, Setup Builder and Shop by species buttons on the right where there's room.
- **Storage** is new at the top level (tackle boxes, trays, bags, backpacks, lure rolls, rod tubes, buckets). **Bait & Berley** moves inside Accessories under its own heading. **Hooks** stay inside Terminal Tackle under a "Hooks" heading, with sinkers, swivels and the rest under "Rigging".
- No "More" menu.
- **Don't shrink the menu text to make it fit.** The mock-up's steps:
  - Above 1360px: everything shows.
  - 1141 to 1360px: slightly tighter spacing, and only the Lure Browser button.
  - 1025 to 1140px: no shortcut buttons.
  - 1024px and below (tablets in both orientations): categories move into the menu button. In the menu, each category opens in place (accordion).
- Each mega menu has a "Shop all …" link next to its heading. Terminal Tackle and Line have a "Tick more than one" shortcut panel (for example "Swivels, floats and beads").

**Check**: at 1440, 1280, 1180, 1024, 820 and 390px wide, the categories never wrap onto two lines or overflow, and the text is never smaller than 18px.

This menu is our suggestion. All Out Fishing will confirm the final categories.

### R5. Dispatch line

**Build**: the green strip at the top reads:
- On a weekday before the cut-off: **"Order in 2h 14m 05s for dispatch today"**, counting down every second.
- Otherwise: **"Next dispatch tomorrow at 12pm"** (or the weekday name, for example "Monday", over a weekend).
- A small "?" explains: "Cut-off is 12pm Melbourne time, Monday to Friday."
- Next to it: "Click & Collect in Geelong". On phones the line shortens to "Ships today: order in 2h 14m 05s" next to the phone number.

The time must be worked out in **Australia/Melbourne** time, whatever the shopper's device is set to. The mock-up uses `Intl.DateTimeFormat` with `timeZone:'Australia/Melbourne'`. Ideally the server supplies the cut-off and the business calendar.

**Needs from All Out Fishing**: the real cut-off, dispatch days and public holidays. The mock-up doesn't handle public holidays.

**Check**: set the device to Perth time. The countdown still ends at 12pm Melbourne time.

### R6. Take out price match and reviews

**Build**: remove "We price match" everywhere (strip, trust section, product page). Remove the reviews score and review cards from the homepage until there are enough reviews. Peri: "leave it blank, keep it cleaner."

### R7. Search

**Build**
- Bold the part of each suggestion that matches what was typed ("**Tro**ut lures"). **Escape the text first, then wrap the match**, so product names can never inject HTML.
- Suggestions come in two groups:
  - **Shop by**: species, which open the Lure Browser with that fish ticked (keep this, Peri likes it), plus categories and types (for example "swiv" offers Swivels & Snaps).
  - **Products**: products whose name matches come before products that only match a tag.
- Show both groups on phones too.
- Down arrow moves into the suggestions, and Escape closes them.

**Check**: type "tro". Wherever "tro" appears in a suggestion's text it is bold, and "Trout lures" opens the Lure Browser with Trout ticked.

### R8. Homepage hero and tiles

**Build**
- The hero sits **inside** the page width (it no longer runs off the right edge) with rounded corners. The photo shows a big catch (aspirational, "holding up big fish"). The team photo moves to About Us.
- On phones the hero is short (heading, one line, photo to the right), so all six category tiles are reachable without much scrolling.
- Category tiles are plain light cards, with no dark box around the group. The six tiles are Rods, Reels, Lures, Line, Terminal Tackle, Storage.

### R9. "Why shop with us"

Rename "Why people buy from us" to **"Why shop with us"**. It has three items: Same-day dispatch (order by 12pm on weekdays), Click & Collect (ready at our Geelong shop), Advice from anglers (we use this gear, plus the phone number).

### R10. Video lower on the page

**Build**: a "We're anglers first" section near the bottom with a poster image and a play button. **Load the video only when it's tapped** (no autoplay, no preload) so the page stays quick on phones. No video in the hero.

**Needs**: the 30-second highlight reel, still to be filmed.

### R11. Guides and About Us

**Build**: take **Fishing Reports** out of the homepage and footer. The bottom of the homepage has two large links: **Guides** (How to Catch, Buyer's Guides, Tackle Tips, Cookbook) and **About Us** (Meet the Team, Visit the Shop, socials). Group the footer the same way. Keep the legal and help links (Shipping & Returns, Privacy, Terms).

### R12. Cheapest price first

**Build**
- Product cards for items with more than one size show **"From $X"** using the lowest variant price.
- Product pages open on the cheapest variant, and the price updates when another size is picked.

**Decide with All Out Fishing**: does "cheapest" mean the cheapest variant **in stock**? We'd suggest yes.

### R13. Later: "Where are you fishing?"

A separate concept page (`finder.html`) for after launch. A shopper picks a water from a map or a list and sees its main species, ramps and land-based spots. One tap opens the Lure Browser with that species ticked, or there's a short "just give me the essentials" kit. It's only linked from the phone menu for now. **Don't build it for launch.** Notes for later: it needs a maintained list of waters and their species, with sources, and it should link to the Victorian Fisheries Authority for rules rather than restating them.

## 4. Data the reskin relies on

| Field | Used for | Notes |
|---|---|---|
| Product type within its category (for example Swivels & Snaps) | R1 tick-chips | Probably your existing subcategories |
| Brand | R2 | |
| Size, hook size or breaking strain | R2 | Often in the variant names, for example "Sz4/0" or "300m 15lb". Worth storing as a proper attribute |
| Variant prices and stock | R12 | |
| Species, water type, lure style | Lure Browser (as now) | Mostly tagged on lures only |

## 5. Quality checks

- **Speed**: hero image under about 60 KB with `fetchpriority="high"`, everything below the fold `loading="lazy"`, video loaded on tap only.
- **Keyboard**: every menu, filter sheet and suggestion list works with Tab, arrows and Escape. Escape returns focus to the button that opened it. Focus outlines are visible (3px teal, or mint on dark).
- **Contrast**: never mint text on white. Use teal for links on white.
- **Touch targets** are 44px or more on phones.
- **No horizontal scrolling** at 320, 390, 768, 1024 or 1440px.

## 6. What not to copy from the mock-up

- The white "Concept mock-up" bar at the top.
- The sample products. Terminal Tackle, Line and Storage use some All Out Fishing listings from 2 November, plus Jarvis Walker and Rovex items at the maker's RRP. The reel's size prices are examples.
- The cart, which only counts clicks in the browser. Keep your real cart and checkout.
- "Crew note goes here" and "Your highlight reel goes here" are placeholders for All Out Fishing's own content.
