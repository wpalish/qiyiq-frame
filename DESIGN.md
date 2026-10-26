---
name: "QiyiqFrame"
description: "One image, explicit geometry, a measured source/result comparison."
colors:
  blue: "#225e80"
  hover: "#174a66"
  selection: "#c5e3f1"
  ink: "#17252d"
  muted: "#415b68"
  ground: "#f8fafb"
  panel: "#e3edf1"
  line: "#9bafb9"
  paper: "#fff"
  image-ground: "#e8edef"
  error: "#84251e"
  focus: "#a04513"
  warning: "#6b431b"
  warning-ground: "#fff4df"
typography:
  display:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "23px"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.4
  body:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 550
    lineHeight: 1.55
  caption:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.55
  caption-title:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "17px"
    lineHeight: 1.55
  small:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "13px"
    lineHeight: 1.55
  fingerprint:
    fontFamily: "Noto, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.55
rounded:
  field: "4px"
  button: "6px"
spacing:
  "5": "5px"
  "8": "8px"
  "9": "9px"
  "10": "10px"
  "12": "12px"
  "14": "14px"
  "16": "16px"
  "18": "18px"
  "20": "20px"
  "22": "22px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
components:
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.blue}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.panel}"
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.hover}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px"
  parameter-panel:
    backgroundColor: "{colors.panel}"
    padding: "22px"
  notice:
    backgroundColor: "{colors.warning-ground}"
    textColor: "{colors.warning}"
    padding: "12px"
  image-work-area:
    backgroundColor: "{colors.image-ground}"
    padding: "12px"
    height: "330px"
---

# Design System: QiyiqFrame

## Overview

**Creative North Star: "Gallery-label discipline"**

Gallery-label discipline gives the editor a precise, quiet working surface: graphite text, mineral-blue actions, cold near-white ground and a pale-blue parameter area. Noto supplies one consistent voice for headings, native form controls, captions and RU/KK task copy. The imagery is the user-selected or labeled synthetic source; the interface adds no imitation material or approval stamp.

The defining pattern is the measured source/result rail: equal image work areas, a fine rule above each caption, and explicit dimensions, geometry and source identity beside the visible image. Ordinary controls remain familiar. The narrow layout trades simultaneous comparison for a vertical source, result and parameter sequence.

The north-star wording comes from the code-led editor brief and describes the built source. The optional direction choice was unanswered and the recorded direction was inferred; this document asserts no human visual approval or standing preference. It is a source-derived record, not a new browser or accessibility audit.

**Key Characteristics:**

- One Noto family, with modest heading steps and compact measurement captions.
- Flat tonal work areas and one-pixel rules, with blue actions and explicit semantic states.
- Native labeled controls and visible measured image captions.
- A responsive comparison rail that stacks at narrow widths.

## Colors

The palette is a cool neutral working field with mineral-blue actions; warm colors identify focus, warnings and errors. The frontmatter preserves the source CSS color format and is normative.

### Primary

- **Mineral Blue** (`blue`): links, secondary-button text and borders, primary-button fill, body accent/caret and normal global status.
- **Deep Mineral Blue** (`hover`): link hover and primary-button hover.
- **Pale Selection Blue** (`selection`): text selection and the shared enabled-button active background.

### Neutral

- **Graphite Ink** (`ink`): body, field and selected-text foreground.
- **Slate Caption** (`muted`): help, caption measurements, revision and footer text.
- **Cold Near White** (`ground`): page ground.
- **Pale Blue Parameter Ground** (`panel`): geometry panel and secondary-button hover.
- **Measured Rule** (`line`): input strokes, caption rules, section and row dividers.
- **White Control Ground** (`paper`): header, inputs, secondary buttons and primary-button foreground.
- **Image Work Ground** (`image-ground`): both image work areas. This value is a literal in the stylesheet, not an existing custom property.

### Semantic states

- **Brick Error** (`error`): global error text, invalid text and the invalid input border/inset.
- **Burnt Orange Focus** (`focus`): the shared visible keyboard focus outline.
- **Umber Notice** and **Warm Notice Ground** (`warning`, `warning-ground`): warnings and pending-recipe notices.

**The Assigned Color Rule.** Keep action, focus, warning and error colors attached to their existing meanings. The pale parameter ground groups controls; it is not a success or approval signal.

The declared `--error-ground` and `--success` colors have no assignments in the inspected source; they are excluded from normative tokens. The sidecar's eight-step tonal strips are generated panel metadata, not extracted UI states or an expanded product palette.

## Typography

**Display Font:** Noto, with Arial and sans-serif fallbacks.
**Body Font:** Noto, with the same fallbacks.
**Label/Mono Font:** Noto; measurements use tabular numerals where declared. There is no authored mono family.

**Character:** A single variable Noto face carries the operational hierarchy. The local font file is declared with weight range 100–900 and `font-display: swap`; it is self-hosted under the accompanying OFL file.

### Hierarchy

- **Display:** the product heading; default values are in `typography.display`. At the narrow breakpoint its size becomes (26px).
- **Headline:** section headings; default values are in `typography.headline`. At the narrow breakpoint their size becomes (22px).
- **Title:** panel and recipe headings; `typography.title`.
- **Body:** base copy and inherited control size/leading; `typography.body`. Paragraphs are bounded at (72ch), with section help bounded at (55ch).
- **Label:** form labels use `typography.label`; account labels use the small role and become inline-flex on narrow screens.
- **Caption:** help and image measurements use the caption role. Caption names use the caption-title role and semantic `strong` weight; no custom numeric weight is assigned to that role.
- **Small / fingerprint:** revision, account and footer text use the small role; source caption identity uses fingerprint. Recipe fingerprints remain caption-sized because the recipe paragraph selector wins. Fingerprints and revisions request `tabular-nums`.

**The Measured Caption Rule.** Preserve dimensions, geometry and source identity as text alongside the image. Long hashes and state messages must wrap rather than widen the working surface.

## Layout

The main container is centered with a maximum outer width of (1448px) and default horizontal padding of (24px), leaving a (1400px) inner measure at maximum width. The header aligns to that inner measure with a calculated side inset. The editor grid uses a flexible comparison region and a fixed (300px) parameter column, separated by (28px). The comparison region has two equal `minmax(0, 1fr)` columns and a (20px) gap. Default image work areas are (330px) high. The save row uses a flexible explanation beside a (280–460px) form column.

At `max-width: 1000px`, the parameter column moves below the comparison, image work areas become (320px) high, the parameter area is bounded at (650px), and its form becomes two columns. At `max-width: 600px`, the header becomes vertical; main side padding becomes (20px); source, result and parameters form one vertical sequence; image work areas become (280px) high; parameter padding becomes (18px); forms, save rows and recipe rows become single-column. The field-pair groups remain two columns inside the parameter form. The narrow navigation wraps and gives its button a full row.

The reusable spacing steps are recorded in frontmatter. The system uses a practical, varied rhythm rather than a claimed mathematical scale: compact label gaps, mid-sized form gaps, wider comparison/section separations. Captions, recipe text, raw text blocks, export-state messages and pending-recipe notices explicitly wrap unbroken content.

The supplied current review describes actual ordinary viewport sections at (1126×1087) and (400×700). At the wider size the pair and numeric column appear together; at the narrow size comparison requires scrolling after the header/navigation/picker. These are supplied review observations, not new captures or a full-page/mobile-touch verification by this documentation pass.

## Elevation & Depth

Resting surfaces are flat: page, image ground and parameter ground separate by tone; one-pixel strokes separate captions, sections and rows. There are no drop shadows or authored image-state animations. The only `box-shadow` is the error input's one-pixel inset reinforcement. It is a validation treatment rather than elevation. The skip link alone declares a raised stacking level when focused.

**The Flat Work Area Rule.** Use tonal separation and fine rules for resting work areas. The invalid-field inset is a state boundary, not decorative elevation.

Buttons transition only background and text color over (.18s) with `ease-out`. Reduced-motion preference removes transitions and forces automatic scroll behavior. This records CSS intent; motion was not observed in this source-only pass.

## Shapes

Controls have gently curved corners: fields use `rounded.field`, buttons use `rounded.button`. Parameter containers, image surfaces, notices, fieldsets and recipe rows keep their square default silhouette. Inputs, fieldsets and dividers use a single-pixel stroke. No chip/pill component or decorative card surface exists in the inspected artifact.

The shared focus treatment is a solid (3px) outline offset by (3px). Invalid geometry inputs receive an error border plus (1px) inset; the source also changes outline offset to (1px) for native invalid inputs that are not placeholder-shown. Preserve that distinction when reading the CSS rather than generalizing the invalid inset into all fields.

## Components

### Buttons

Familiar, compact controls with a clear filled preparation action. Secondary and primary tokens are in frontmatter; both share a (44px) minimum height, a one-pixel action-color border and weight (600). Secondary hover uses the pale panel ground. Primary hover uses the deep action color. The primary is full width. Disabled buttons use opacity (.6) and the default cursor; enabled controls use the shared visible focus outline.

The shared active selector assigns the selection ground. In source it can interact with the primary's white foreground when its more-specific hover selector is not active. That is an unverified state interaction, retained in the source-faithful specimen; it is not a confirmed product defect, a tested touch result or an endorsed new color pairing.

### Inputs / Fields

White fields use the ink foreground and measured-rule stroke. Numeric, text and select controls share the native family, full available width, (44px) minimum height and the field radius. The file input has its own (7px) padding; the checkbox uses a (20px) box. Labels form a grid with a (5px) gap. Fields inherit the label weight; buttons set their own weight.

The current geometry presentation sets `aria-invalid="true"` on the failing field and points `aria-describedby` to the polite live export-state message. Invalid fields receive the visible error border and inset. RU/KK task messages name the affected dimension or coordinate and its allowed integer range. This is a source association and scoped-review result, not a screen-reader-use claim.

### Navigation

Text links and a native metadata-refresh button form a wrapping, ruled row. Links use weight (600), the action color, an underlined baseline offset and the deep hover color. Revision text is small, muted and tabular. The narrow button occupies the row; there is no invented tab/chip selection state. The skip link appears at the top when focused.

### Image comparison rail

Equal, square-cornered image grounds hold real canvas content with `object-fit: contain`. Empty work areas show centered muted task text rather than a decorative asset. Each caption has a fine top rule, (16px) separation, measured text, a strong image name and a wrapping source fingerprint where relevant. Source and result geometry stay textual alongside the image.

### Parameter panel and notices

The flat pale-blue parameter panel groups labeled controls. Its default padding is recorded in frontmatter; narrow padding is described in Layout. Warm notices use their semantic foreground/ground and stay text-led. Pending-source and export-state text wrap long SHA256 values. No status is presented as quality certification or approval.

### Recipe rows

Saved geometry is presented as ruled rows, not cards: a flexible text block beside wrapping native actions. Titles and metadata wrap; a fingerprint remains available in text. At the narrow breakpoint the actions move below the information. The source shows explicit open/archive actions and a visibly disabled archive action when unavailable.

These component snippets are static documentation specimens derived from the source. They demonstrate authored CSS and markup states; they do not run file decoding, geometry, save, export, refresh, authentication or archive behavior.

## Do's and Don'ts

### Do:

- **Do** keep source/result measurements and the source SHA256 in wrapping text captions.
- **Do** retain native labels, the visible focus outline and the field-specific error association when extending controls.
- **Do** use the current two layout breakpoints and the stacked source/result/parameter order at narrow widths.
- **Do** keep preparation, each download and recipe save as visibly distinct actions.

### Don't:

- **Don't** add stamps or approval cues to the image work areas.
- **Don't** substitute a decorative card or chip vocabulary for the current flat panels and ruled rows.
- **Don't** treat generated tonal ramps in the sidecar as shipped palette tokens.
- **Don't** treat this documentation or static examples as proof of touch, assistive-technology, security, performance or publication readiness.
