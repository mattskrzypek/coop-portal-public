# FatPigeon Coop, illustration brief

Paste this into the order. Reference files are the current PNGs in this repo, plus `nest-layout-20261020/perch-branch.svg` and `perch-trunk.svg`.

## The site

Private portal for one family and their friends. It links to movies, photos, audiobooks, and a few other apps on a home server. Dark theme. The mascot is a fat pigeon (FatPigeon). The humour is 8-bit: small, dry, a bit dorky. The drawings should carry that joke. They should not be tiny pixel sprites, and they should not look generated.

Ten pictures. Seven of them are stored twice (same bytes in two folders). Draw each scene once.

## Style

Hand-drawn illustration. Consistent line weight. A little intentional wobble in the line, the way the wooden branches already look. Limited palette. One pigeon design used across the set: grey body, lighter chest, orange beak and feet, a small dark eye. When a picture needs a cap or a scarf, use the same cap and the same scarf every time.

Match the existing branch drawings (`perch-branch.svg`, `perch-trunk.svg`). Uneven ink, visible stroke, a few leaves that are not identical. Do not redraw the branches. They stay as they are. New wood (the nest, the stump, the signpost, the toolbox) should use the same browns.

Colours from `coop.css`:

| Role | Hex | Name in the CSS |
| --- | --- | --- |
| Charcoal background | `#111511` | `background` |
| Cream | `#e1e7df` | text `color` |
| Accent | `#b3ef69` | `--green` |
| Amber | `#ffd878` | `--amber` |
| Muted cream | `#b3bfb0` | `--muted` |
| Line | `#35432e` | `--line` |
| Panel | `#191f18` | `--panel` |

The pages people actually open use the same cream, green, and amber, on a charcoal of `#0d150e` (panel `#182218`). There is no teal in the stylesheet. The accent is that yellow-green. Use it for the scarf, headphones, and small motion marks.

Branch browns, from `perch-branch.svg`, so new wood matches: `#68452d`, `#a4784b`, `#493222`, `#765035`, `#956b43`, `#c39760`, `#35271c`, `#b18653`. Leaves `#5d7c3b`.

Orange for beak and feet can sit outside that list. Keep it to one orange, used everywhere.

## Pictures

Every file is 3:2. Deliver a transparent PNG unless the notes say the current file is opaque. Card art sits on the right half of a dark card, so keep the subject readable at roughly 400px wide and leave the left side of the canvas quiet.

| # | Filename | Where it appears | What it depicts now | Size and format | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `pigeon-family-six-v2.png` | Home, top of the page (`index.html`). Also two unused preview pages. | Six pigeons on a woven nest. Left to right: Matt's wife in a dark sweater, reading; Matt in FPV goggles with a controller, tiny quad on the nest; Mom in a long green scarf; Dad in a flat cap and round glasses; Matt's brother with an upright double bass; his wife with a mic and a pearl necklace. | 1536×1024 PNG, transparency. On screen up to about 430px wide. | Keep these six and these props. This is the cast. |
| 2 | `command-coop-duel.png` | Apps page, the Command Coop card. | Four pigeons from that cast around a stump table in a dark forest, playing cards. Glowing creatures over the table (blue bird, green deer, orange dragon, purple bird), a crystal and a dark flower on the table, a lantern and mushrooms at the base. | 1536×1024 PNG. Current file is opaque RGB. Deliver with transparency. | Shown on the right of the card, about half the card width. |
| 3 | `watch.png` | Home and Apps, the Watch card. Watch page heading, and the library card on that page. | Pigeon in a cap and green scarf on a green couch, bowl of popcorn, floor lamp, houseplant, a plaid cushion and a throw. | 1536×1024 PNG, transparency. | Same file in both `art/` folders. Draw it once. |
| 4 | `request.png` | Home and Apps, the Requests card. Second card on the Watch page. Also the heading rule for a Requests page that is not in the nav. | Pigeon in flight, cap and green scarf, carrying a sealed envelope, green motion dashes behind. | 1536×1024 PNG, transparency. | Same file in both `art/` folders. |
| 5 | `listen.png` | Home and Apps, the Audiobooks card. | Pigeon with headphones and a cap, eyes shut, standing on two books in the grass, a few music notes. | 1536×1024 PNG, transparency. | Same file in both `art/` folders. |
| 6 | `photos.png` | Home and Apps, the Photos card. Flock page heading. | Pigeon with a camera, cap and scarf, on a rock, four polaroids of mountain landscapes fanned behind. | 1536×1024 PNG, transparency. | Same file in both `art/` folders. |
| 7 | `tools.png` | Home, the Smaller tools card. Page heading on Apps, Admin, and Stats. | Pigeon in a green cap and scarf, holding a wrench, next to a blank wooden signpost and a toolbox. | 1536×1024 PNG, transparency. | The sign has no words. Leave it blank. Same file in both `art/` folders. |
| 8 | `hero.png` | Not on the six current pages. CSS still loads it for an old hero, and three preview pages show it. | Night lake. Pigeon with cap and scarf on a rock beside a lit lantern. Pines, water, mountains, a moon, two cabins with lit windows. | 1536×1024 PNG. Current file is opaque RGB. | Keep the left side dark or transparent so it can fade into `#0d150e`. Same file in both `art/` folders. |
| 9 | `art/crumbs.png` | Not on the six current pages. CSS loads it beside an old "ask" box. | Pigeon in a cap and green scarf eating from a red-and-white popcorn bucket, a couple of green crumbs in the air. | 1536×1024 PNG, transparency. | Different picture from row 10. Paths: `redesign-chat-media-20261020/art/crumbs.png` and `redesign-reference-20261020/art/crumbs.png`. |
| 10 | `crumbs-butler.png` | Home, beside the chat welcome ("What do you need?"). The page asks for `/crumbs/crumbs.png`. That file is not in this repo. | A butler pigeon in a lime bow tie, carrying a tray of crumbs. That sentence is the alt text. There is no copy of the current drawing here to trace. | 1536×1024 PNG, transparency. Shown in a box about 240×210px. | Name the delivery `crumbs-butler.png` so it does not collide with row 9. We will put it on the server as `/crumbs/crumbs.png`. |

The two `art/` folders are `redesign-chat-media-20261020/art/` and `redesign-reference-20261020/art/`. Rows 3 to 9 are byte-for-byte the same in both. One drawing covers both paths.

## Deliverables

For each of the 10 images:

- A layered source file (PSD, Procreate, Affinity, or an SVG made of real strokes). Name it to match the row.
- A PNG master, sRGB, 1536×1024, 3:2, with the transparency noted above. No embedded text, no colour profile tricks. This is the file the site will use. It is already above @2x for every slot except the old hero (largest on-screen widths are about 430px for the family portrait and about 420px for a card).
- A second PNG at @2x of that on-screen size, same framing: 860×573 for the family portrait (row 1), 480×320 for the butler (row 10), 840×560 for the card scenes (rows 2 to 7 and row 9). For the hero (row 8), the @2x file is 1920×1280, since that scene can be shown larger.

Filenames exactly as in the table. PNG for the web files. Do not send only a JPEG.

## Leave these alone

`perch-branch.svg` and `perch-trunk.svg` stay. `pigeon-family-six-v1.png` is an unused earlier portrait. `pigeon-surfer.png` and `command-coop-icon.png` are unused. `placeholder-art/` is a rejected pixel pass. Do not use it as a style reference.

## Avoid

- A look that reads as generated: airbrushed lighting, identical glassy eyes, perfect symmetry, bloom, sparkles, extra detail in every leaf.
- Tiny pixel sprites. A plainer pixel pass was already rejected.
- Words, letters, logos, watermarks, or a signature inside the picture.
- Extra pigeons, extra props, or a different outfit for the same bird.
- A solid black, white, or coloured rectangle behind a character. Empty space is real transparency.
- A different aspect ratio, a different crop, or a busy background that fills the left half of a card.
- Photoreal feathers, 3D render, or a neon cyber palette.
