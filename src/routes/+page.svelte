<script>
	// @ts-nocheck

	const n = () => Math.round(Math.random() * 8) + 1;

	const randomize = () => ({
		body: n(),
		eyes: n(),
		mouth: n(),
		legs: n(),
		arms: n(),
		accessory: n()
	});

	let match = {
		body: 0,
		eyes: 0,
		mouth: 0,
		legs: 0,
		arms: 0,
		accessory: 0
	};

	const keyFolderMap = {
		body: 'bodies',
		eyes: 'eyes',
		accessory: 'accessories',
		mouth: 'mouths',
		arms: 'arms',
		legs: 'legs'
	};

	let monsters = Array.from({ length: 100 }).map(() => randomize());

	const doesMonsterMatch = (monster, match) => {
		return Object.keys(match).every((key) => match[key] === 0 || match[key] === monster[key]);
	};
</script>

<h1>{monsters.filter((monster) => doesMonsterMatch(monster, match)).length}</h1>

<div class="matches">
	{#each Object.keys(match) as key}
		<div class="match">
			<input type="range" min="0" max="9" bind:value={match[key]} />
			{#if match[key] > 0}
				<img src="/monsters/{keyFolderMap[key]}/{match[key]}.svg" alt="" />
			{/if}
		</div>
	{/each}
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="monsters">
	{#each monsters as monster}
		<div class="monster" class:disabled={!doesMonsterMatch(monster, match)}>
			<img class="body" src="/monsters/bodies/{monster.body}.svg" alt="" />
			<img class="arms" src="/monsters/arms/{monster.arms}.svg" alt="" />
			<img class="legs" src="/monsters/legs/{monster.legs}.svg" alt="" />
			<img class="mouth" src="/monsters/mouths/{monster.mouth}.svg" alt="" />
			<img class="accessory" src="/monsters/accessories/{monster.accessory}.svg" alt="" />
			<img class="eyes" src="/monsters/eyes/{monster.eyes}.svg" alt="" />
		</div>
	{/each}
</div>

<style lang="scss">
	.matches {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		.match {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;

			img {
				height: 4rem;
			}
		}
	}

	.monsters {
		margin: 4rem;
		display: grid;
		--size: 3rem;
		grid-template-columns: repeat(auto-fill, minmax(calc(var(--size) * 2), 1fr));
		gap: calc(var(--size) * 2) var(--size);
		align-items: center;
		justify-items: center;
	}

	.monster {
		position: relative;

		width: var(--size, 10rem);
		height: var(--size, 10rem);

		&.disabled {
			filter: grayscale(1);
			opacity: 0.7;
		}

		img {
			position: absolute;

			&.body {
				height: 150%;
				left: 50%;
				translate: -50%;
			}

			&.mouth {
				width: 50%;
				left: 50%;
				top: 75%;
				translate: -50% -50%;
			}

			&.eyes {
				width: 70%;
				left: 50%;
				top: 40%;
				translate: -50% -50%;
			}

			&.legs {
				width: 70%;
				left: 50%;
				top: 130%;
				translate: -50%;
			}

			&.arms {
				top: 50%;
				left: 50%;
				translate: -50%;
				width: 175%;
			}

			&.accessory {
				height: 50%;
				left: 50%;
				translate: -50%;
				bottom: 80%;
			}
		}
	}
</style>
