<header class="header">
	<nav>
		<a href="#demo">Demo</a>
		<a href="#why">Why</a>
		<a href="#how-it-works">How it works</a>
		<a href="#installation">Installation</a>
		<a href="#usage-docs">Docs</a>
	</nav>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: center;

		z-index: 9;
		position: fixed;
		top: 8px;
		width: 100%;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 8px 24px;

		padding: 16px;
		border-radius: 9999px;
		background-color: transparent;

		animation: nav-shadow linear both;
		animation-timeline: scroll();
		animation-range: 0px 100px;
	}

	@keyframes nav-shadow {
		from {
			box-shadow: none;
      background-color: transparent;
		}
		to {
			box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
      background-color: var(--bg-accent-color);
		}
	}

	@media (max-width: 768px) {
		.header {
			top: 0;
		}
		nav {
			border-radius: 0;
		}
	}
</style>
