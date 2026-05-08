AXON
Brand Identity System
AI-Powered Task Automation
Version 1.0  ·  2025



01 — Brand Overview
Brand name
AXON

Brand personality
Intelligent

Tagline
Your work, wired for intelligence.

Brand description
AXON is a dark-first AI productivity platform that helps students, freelancers, and team leads manage tasks, automate workflows, and schedule intelligently through natural language. It is precise, minimal, and built for people who move fast and think clearly.

Target users
•	Student — Student / Learner
•	Freelancer — Professional / Freelancer
•	Team Lead — Team Lead / Manager

Brand voice
•	Sharp and direct — no filler words
•	Sentence case everywhere — never all caps in body
•	Confident, not arrogant
•	Intelligent, not jargon-heavy

02 — Color System
The AXON palette is built on five core colors. No purple, no indigo, no blue family. Every color has a single clear role in the interface.

PRIMARY PALETTE

Swatch	Name	Hex	Role
	Navy Blue	#0A2647	Navbar, sidebar, card surfaces, AI input background
	Mustard Gold	#D4AF37	Primary CTA, AI accent, brand mark, active states
	Pure White	#FFFFFF	Headlines, primary text on dark, ghost button text
	Rich Black	#1A1A1A	Page background, hero section, deep canvas layer
	Sky Blue	#87CEEB	Subheadlines, body copy on dark, tags, metadata text

SUPPORTING / BORDER COLOR
#1E3A5F  — Steel Rim  (card borders, dividers between navy surfaces)

SEMANTIC / STATUS COLORS

Swatch	Name	Hex	When to use
	Alert Red	#FF4D4D	Overdue tasks, errors, delete confirmations
	Caution Amber	#F5A623	Due today, warnings, calendar conflicts
	Task Green	#22C55E	Completed tasks, automation success, streaks
	Iron Gray	#5A6380	Disabled states, placeholder text, deferred tasks

COLOR ROLE IN THE UI

•	Mustard Gold is the AI color — every AI action, cursor blink, and active state uses gold
•	Navy Blue is the structure color — navbar, sidebar, cards, and input fields
•	Sky Blue is the information color — all readable body text and secondary labels on dark
•	Rich Black is the canvas — page background and deepest surface layer
•	Pure White is the signal — H1 headlines and high-contrast labels only

DARK MODE SURFACE STACK (TOP TO BOTTOM)

#1A1A1A  — Rich Black       Page background / hero section
#0A2647  — Navy Blue        Cards, navbar, sidebar, modals
#1E3A5F  — Steel Rim        Borders and dividers between navy
#D4AF37  — Mustard Gold     Active elements, AI cursor, CTA buttons

03 — Typography
Primary typeface
Inter — Geometric sans-serif
Clean, modern, and highly legible at all sizes. Used for all UI text, headings, body copy, and labels. Available free via Google Fonts.

Accent typeface
JetBrains Mono — Monospace
Used exclusively for code snippets, hex values, API references, and the AI input field placeholder text. Reinforces the intelligent, terminal feel.

TYPE SCALE

Role	Size	Weight	Usage
Display / H1	48–64px	500 Medium	Hero headline, page title
Heading / H2	32–40px	500 Medium	Section titles
Subheading / H3	24px	400 Regular	Card titles, feature names
Body	16px	400 Regular	Paragraphs, descriptions
Label / Caption	12–13px	500 Medium	Tags, badges, metadata
Mono / Code	14px	400 Regular	Input fields, hex values, code

Typography rules
•	Sentence case everywhere — never all caps in body text or headings
•	No bold in body paragraphs — weight contrast comes from size, not bold
•	Headline color on dark: Pure White #FFFFFF
•	Body text color on dark: Sky Blue #87CEEB
•	Mixed headline style allowed: one line in white, key word in gold
•	Line height: 1.5 for body, 1.2 for display headings
•	Letter spacing: -0.02em for display, 0 for body

04 — Logo & Mark
Logo construction
The AXON logo consists of two parts: an abstract mark and the wordmark set in Inter Medium.

Abstract mark concept
A minimal neural node symbol — a small circle with two short lines extending from it at angles, suggesting signal transmission and neural pathways. Simple enough to work at 16px favicon size. The mark sits to the left of the wordmark.

Wordmark
AXON — set in Inter Medium, tracked at +0.04em letter spacing, all caps. The wordmark always appears in Mustard Gold #D4AF37 on dark backgrounds.

LOGO COLOR VARIANTS

•	On dark (primary) — Gold mark + Gold wordmark on Navy or Black
•	On light — Navy mark + Navy wordmark on White
•	Monochrome — White mark + White wordmark for dark overlays
•	Icon only — Abstract mark alone, used for favicons and app icons

Clear space
Maintain a minimum clear space equal to the height of the letter X in AXON on all four sides of the logo. Never place other elements inside this zone.

Logo don'ts
•	Never rotate the logo
•	Never use any color outside the defined logo variants
•	Never stretch or distort the mark
•	Never use the wordmark without the abstract mark in primary contexts
•	Never place the gold logo on a light background

05 — UI Components
Buttons
All buttons use fully rounded edges (border-radius: 9999px). No sharp corners anywhere in the interface.

Variant	Background	Text	Border
Primary	#D4AF37 Gold	#0A2647 Navy	None
Ghost / Secondary	Transparent	#FFFFFF White	#FFFFFF 1px
Danger	#FF4D4D Red	#FFFFFF White	None
Disabled	#5A6380 Gray	#1A1A1A Black	None

Input fields
All input fields are fully pill-shaped (border-radius: 9999px). Navy fill, gold border, sky blue placeholder text.

•	Background: #0A2647 Navy
•	Border: 1px solid #D4AF37 Gold
•	Placeholder text: #87CEEB Sky Blue, JetBrains Mono
•	Live AI indicator: small pulsing green dot (#22C55E) on the left inside the field
•	Submit icon: gold arrow on the right
•	Focus state: gold border increases to 2px

Cards
All cards use rounded corners (border-radius: 16px). Never sharp edges on any card surface.

•	Background: #0A2647 Navy
•	Border: 0.5px solid #1E3A5F Steel Rim
•	Title text: #FFFFFF White, Inter Medium
•	Body text: #87CEEB Sky Blue, Inter Regular
•	Active / hover border: #D4AF37 Gold

Navbar
Transparent on hero section, switches to #0A2647 Navy on scroll. AXON wordmark + mark left. Nav links center. Rounded gold CTA right.

Social proof strip
Full-width navy strip with a 1px gold top border. User segment labels in Sky Blue. Dot separators in Gold.

AI input bar (hero)
Full pill shape. Sits centered below the headline. Typewriter animation cycles through sample commands. The blinking gold cursor is the primary brand moment on the landing page.

06 — Spacing & Layout
Spacing scale

Token	Value	Usage
xs	4px	Icon gaps, tight internal padding
sm	8px	Inline element gaps
md	16px	Component internal padding
lg	24px	Card padding, section gaps
xl	48px	Between page sections
2xl	96px	Hero vertical breathing room

Border radius
•	Buttons — fully rounded, 9999px
•	Input fields — fully rounded, 9999px
•	Cards — 16px
•	Badges / tags — 8px
•	Feature icons — 10px
•	Never use 0px (sharp) corners on interactive elements

07 — Landing Page Structure
Seven sections, top to bottom. Every section is dark. No white or light backgrounds anywhere.

#	Section	Key elements
01	Navbar	AXON mark + wordmark, 4 nav links, gold rounded CTA button
02	Hero	Mixed-color headline, sky blue subline, pill AI input with live dot, two rounded buttons, navy-to-black radial gradient bg
03	Social proof strip	Navy strip, gold top border, user segments in sky blue
04	Product in action	3 full-width overlapping app screens, bold white text overlaid on low-opacity images
05	Feature cards	3 navy rounded cards, gold icon, white title, sky blue description
06	User quotes	3 dark cards, white quote, sky blue name and role
07	Closing CTA	White headline, pill email input, gold rounded button, AXON wordmark

08 — Design Principles
1. Intelligent first
Every design decision should reinforce that AXON thinks. Gold appears wherever the AI is present. The interface never feels passive.

2. No decoration
No gradients used as decoration. No glow effects. No illustrations. If an element does not serve a function, it does not exist.

3. Soft edges, sharp thinking
All buttons, inputs, and interactive elements are fully rounded. The sharpness comes from the thinking, not the corners.

4. Dark by default
The dark mode is the product. Light mode is a secondary consideration. Every component is designed to live on a dark surface first.

5. Generous whitespace
Never crowd elements. Whitespace is not emptiness — it is clarity. A screen with breathing room feels more intelligent than a dense one.


AXON Brand Identity System  ·  Version 1.0  ·  Confidential