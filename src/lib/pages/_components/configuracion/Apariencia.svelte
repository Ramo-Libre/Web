<script lang="ts">
	import { db } from '$lib';
	import { themes, type Theme } from '@ramo-libre/ui-themes';
	import { Check } from '@lucide/svelte';

	let currentTheme = $derived<Theme>(db.preferences.theme);

	function onSetTheme(theme: Theme) {
		db.preferences.setTheme(theme);
		db.preferences.applyTheme();
	}
</script>

<div
	class="w-full bg-base-100 border border-base-400 text-content rounded-2xl shadow-sm p-6 transition-colors duration-300"
>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold tracking-tight">Apariencia</h2>
			<p class="text-sm text-content/60">Elige el tema visual de la interfaz.</p>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
			{#each themes as theme (theme.id)}
				{@const isSelected = currentTheme === theme.id}
				<button
					onclick={() => onSetTheme(theme.id as Theme)}
					class="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer w-full
                    {isSelected
						? 'bg-primary-100/10 border-primary-100 text-primary-100 shadow-sm'
						: 'bg-base-200 border-base-300 hover:border-base-400 text-content/80'}"
				>
					<div class="flex items-center gap-3 min-w-0">
						<theme.icon size={18} class="shrink-0" strokeWidth={isSelected ? 2.5 : 2} />
						<span class="font-semibold text-sm truncate">{theme.label}</span>
					</div>

					{#if isSelected}
						<div class="bg-primary-100 text-base-100 rounded-full p-0.5 shrink-0">
							<Check size={12} strokeWidth={4} />
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(html) {
		transition:
			background-color 0.3s ease,
			color 0.3s ease,
			border-color 0.3s ease;
	}
</style>
