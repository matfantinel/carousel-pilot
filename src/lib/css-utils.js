export const SCROLL_SHADOW_CSS = `
		/* From https://css-tricks.com/modern-scroll-shadows-using-scroll-driven-animations/ */
		@property --left-fade {
			syntax: '<length>';
			inherits: false;
			initial-value: 0;
		}
		@property --right-fade {
			syntax: '<length>';
			inherits: false;
			initial-value: 0;
		}
		@keyframes scrollfade {
			0%   { --left-fade: 0px;  --right-fade: var(--carousel-scroll-shadow-fade-length, 4rem); }
			10%  { --left-fade: var(--carousel-scroll-shadow-fade-length, 4rem); }
			90%  { --left-fade: var(--carousel-scroll-shadow-fade-length, 4rem); --right-fade: var(--carousel-scroll-shadow-fade-length, 4rem); }
			100% { --left-fade: var(--carousel-scroll-shadow-fade-length, 4rem); --right-fade: 0px; }
		}
		[data-carousel-track] {
			mask: linear-gradient(
				to right,
				transparent,
				#000 var(--left-fade) calc(100% - var(--right-fade)),
				transparent
			);
			animation: scrollfade;
			animation-timeline: --scrollfade;
			scroll-timeline: --scrollfade x;
		}
	`;

export const HIDE_SCROLLBAR_CSS = `
		[data-carousel-track] {
			scrollbar-width: none;
			&::-webkit-scrollbar {
				width: 0;
				height: 0;
				display: none;
			}
		}
	`;
