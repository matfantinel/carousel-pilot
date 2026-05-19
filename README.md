# Carousel Pilot

A zero-dependency, framework-agnostic carousel/slider web component. You bring the CSS layout — Carousel Pilot handles navigation, active state, autoplay, infinite loop, and scroll tracking on top of your existing scroll container.

## How it works

Carousel Pilot is a [custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) (`<carousel-pilot>`) that wraps your existing scrollable track. It doesn't impose any layout or styles — you style the track and slides however you want (flexbox, CSS scroll snap, etc.) and Carousel Pilot wires up the behaviour.

## Installation

```bash
npm install carousel-pilot
```

## Usage

### With a bundler (Vite, Webpack, Rollup, etc.)

Import once anywhere in your app — this registers the custom element globally:

```js
import 'carousel-pilot';
```

### In a Svelte project

```js
import 'carousel-pilot';
// or, to use the Svelte component directly:
import { CarouselPilot } from 'carousel-pilot';
```

### Via CDN / plain HTML

```html
<script type="module" src="https://unpkg.com/carousel-pilot/dist/carousel-pilot.js"></script>
```

## Basic example

The only required piece is a scrollable track element marked with `data-carousel-track`. Everything else is optional.

```html
<carousel-pilot>
  <ul data-carousel-track>
    <li>Slide 1</li>
    <li>Slide 2</li>
    <li>Slide 3</li>
  </ul>

  <!-- Optional navigation -->
  <button data-carousel-prev>Prev</button>
  <span>Slide <span data-carousel-currentIndex>1</span> of 3</span>
  <button data-carousel-next>Next</button>
</carousel-pilot>
```

You are responsible for the track's CSS layout. A typical setup with CSS scroll snap:

```css
[data-carousel-track] {
  display: flex;
  gap: 1rem;
  overflow: auto;
  scroll-snap-type: x mandatory;
}

[data-carousel-track] > li {
  flex: 0 0 300px;
  scroll-snap-align: start;
}
```

## Slot conventions

Mark elements inside `<carousel-pilot>` with these data attributes to connect them:

| Attribute | Role |
|---|---|
| `data-carousel-track` | The scrollable slide container (required) |
| `data-carousel-prev` | Button to scroll to the previous slide |
| `data-carousel-next` | Button to scroll to the next slide |
| `data-carousel-indicator` | Repeated indicator elements (e.g. dots); the active one gets an `active` class |
| `data-carousel-currentIndex` | Element whose text content is updated with the current slide number (1-based) |

## Props

### Selectors

These props accept a CSS selector string. Each one falls back to its corresponding `data-*` attribute if left empty.

| Prop | Default fallback | Description |
|---|---|---|
| `track` | `[data-carousel-track]` | The scrollable slide container. Required. |
| `prev` | `[data-carousel-prev]` | Button to scroll to the previous slide. |
| `next` | `[data-carousel-next]` | Button to scroll to the next slide. |
| `indicators` | `[data-carousel-indicator]` | Repeated indicator elements (e.g. dots). The active one receives an `active` class. |
| `current` | `[data-carousel-currentIndex]` | Element whose text content is set to the current slide number (1-based). |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `centered` | `boolean` | `false` | Centers the active slide in the track. Use `scroll-snap-align: center` on slides when enabled. |
| `scrollAmount` | `'slide' \| 'page'` | `'slide'` | How far prev/next scroll. `'slide'` uses the active slide's width; `'page'` uses the track's full width. |

### CSS injection

| Prop | Type | Default | Description |
|---|---|---|---|
| `addSpacers` | `boolean` | `true` | Injects invisible spacer elements so the first and last slides can be scrolled flush to the edge (or center when `centered` is on). |
| `showScrollShadow` | `boolean` | `false` | Injects a CSS scroll shadow on the track to hint that more content is scrollable. |
| `hideScrollbar` | `boolean` | `false` | Hides the track's scrollbar via injected CSS. |

### Autoplay

| Prop | Type | Default | Description |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Automatically advances slides on an interval. Pauses on hover, stops permanently on manual scroll or prev/next interaction. |
| `autoplayDelay` | `number` | `5000` | Interval in milliseconds between autoplay advances. |

### Loop

| Prop | Type | Default | Description |
|---|---|---|---|
| `loop` | `boolean` | `false` | Enables infinite looping by cloning slides on each side of the track. |
| `dedupeHeadings` | `boolean` | `true` | Replaces heading elements inside cloned slides with `<div>`s to prevent duplicate headings in the document outline. |
| `headingClasses` | `string` | `'h1, h2, h3, h4, h5, h6'` | Comma-separated class names applied to heading replacements in clones (index 0 → h1 class, 1 → h2, etc.). |

## JavaScript API

```js
const carousel = document.querySelector('carousel-pilot');

carousel.scrollToIndex(2);       // scroll to a specific slide (0-based)
carousel.scrollNext();           // scroll forward one slide
carousel.scrollPrev();           // scroll backward one slide
```

## Events

```js
carousel.addEventListener('slide-change', (e) => {
  console.log(e.detail.index); // 0-based index of the new active slide
  console.log(e.detail.total); // total number of slides
});

carousel.addEventListener('autoplay-started', () => { /* ... */ });
carousel.addEventListener('autoplay-stopped', (e) => {
  console.log(e.detail.paused); // true = paused (hovering), false = stopped permanently
});
```

## Development

The project uses [Storybook](https://storybook.js.org/) for local development. Example components live in `src/lib/examples/`.

```bash
npm install
npm run storybook
```

Storybook will start at **http://localhost:6006**.

## Building & publishing

Build both the Svelte library distribution and the standalone bundle:

```bash
npm run prepack
```

This runs `svelte-package` (for Svelte users) and a Vite library build (for everyone else), then validates the output with `publint`. Both outputs land in `dist/`.

Publish to npm:

```bash
npm publish
```

Make sure you've updated the `version` field in `package.json` before publishing.