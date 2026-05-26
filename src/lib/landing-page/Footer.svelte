<script>
	const currentYear = new Date().getFullYear();
</script>

<section class="footer full-width u-content-grid">
	<div class="content smol">
		<p>
			This project is open source. You can always check out the <a
				href="https://github.com/matfantinel/carousel-pilot"
				target="_blank">source code</a
			> to see its inner workings and contribute.
		</p>
		<div class="credits">			
			<p>
				Made by <a href="https://fantinel.dev/?utm_source=carousel-pilot" target="_blank"
					>Matt Fantinel</a
				>
			</p>
			<p>
				Made possible by <a
					href="https://usefulgroup.com/?utm_source=carousel-pilot"
					target="_blank">Useful Group</a
				>
			</p>
			<p>{currentYear}</p>
		</div>
	</div>
</section>

<style>
	.footer {
		padding-top: 64px;
		padding-bottom: 64px;
		background-color: var(--bg-accent-color);
		background-image: url('/hero-bg.svg');
		background-position: center;
		background-repeat: repeat;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		justify-content: center;
		text-align: center;
		text-wrap: balance;
	}

	.credits {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-weight: 800;
		text-wrap: balance;
	}
</style>
