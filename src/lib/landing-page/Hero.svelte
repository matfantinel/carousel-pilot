<section class="hero full-width u-content-grid">
	<div class="content smol">
		<h1>🎠<br />Carousel Pilot</h1>
		<p class="subtitle u-h2">Your CSS carousel, enhanced.</p>
		<div class="buttons">
			<a
				href="https://github.com/matfantinel/carousel-pilot"
				class="button"
				style="background: #202328"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12.0001 16.5201V14.3676C12.0282 14.01 11.9799 13.6505 11.8583 13.313C11.7367 12.9755 11.5447 12.6677 11.2951 12.4101C13.6501 12.1476 16.1251 11.2551 16.1251 7.1601C16.1248 6.11297 15.7221 5.10599 15.0001 4.34759C15.3419 3.43148 15.3178 2.41886 14.9326 1.52009C14.9326 1.52009 14.0476 1.25759 12.0001 2.63009C10.2811 2.16421 8.46907 2.16421 6.75006 2.63009C4.70256 1.25759 3.81756 1.52009 3.81756 1.52009C3.43234 2.41886 3.40816 3.43148 3.75006 4.34759C3.02265 5.11162 2.61945 6.1277 2.62506 7.18259C2.62506 11.2476 5.10005 12.1401 7.45505 12.4326C7.2083 12.6876 7.018 12.9917 6.89653 13.325C6.77507 13.6584 6.72516 14.0137 6.75006 14.3676V16.5201"
						stroke="#EFF1F5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M6.75 15.02C4.5 15.7499 2.625 15.02 1.5 12.77"
						stroke="#EFF1F5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>

				Star on GitHub
			</a>
			<a
				href="https://www.npmjs.com/package/carousel-pilot"
				class="button"
				style="background: #CB3937"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M0.75 6H17.25V11.25H8.25V12.75H5.625V11.25H0.75V6Z"
						stroke="#EFF1F5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M5.625 6V11.25"
						stroke="#EFF1F5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M10.125 6V11.25"
						stroke="#EFF1F5"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path d="M13.5 8.25V11.25" stroke="#EFF1F5" stroke-width="1.5" stroke-linecap="round" />
					<path d="M3.75 8.25V11.25" stroke="#EFF1F5" stroke-width="1.5" stroke-linecap="round" />
					<path d="M8.25 8.25V9" stroke="#EFF1F5" stroke-width="1.5" stroke-linecap="round" />
					<path d="M15.375 8.25V11.25" stroke="#EFF1F5" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				View on npm</a
			>
		</div>
	</div>
</section>

<style>
	.hero {
		padding-top: 128px;
		padding-bottom: 64px;
		background-color: var(--bg-accent-color);
		background-image: url('/hero-bg.svg');
		background-position: center;
		background-repeat: repeat;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		align-items: center;
		justify-content: center;
	}

	h1 {
		color: var(--accent-color);
		text-align: center;

		animation: text-glow 3.5s cubic-bezier(0.66, 0, 0.34, 1) infinite alternate;
	}

	.subtitle {
		color: var(--text-medium-color);
		text-align: center;
	}

	.buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 16px;
	}

	@keyframes text-glow {
		0% {
			filter: drop-shadow(0 0 4px rgba(var(--accent-color-rgb), 0.4));
		}
		25% {
			filter: drop-shadow(0 0 5px rgba(var(--accent-color-rgb), 0.45));
		}
		50% {
			filter: drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.6));
		}
		75% {
			filter: drop-shadow(0 0 10px rgba(var(--accent-color-rgb), 0.7));
		}
		100% {
			filter: drop-shadow(0 0 6px rgba(var(--accent-color-rgb), 0.5));
		}
	}
</style>
