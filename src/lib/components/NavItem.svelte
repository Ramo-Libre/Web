<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ColorUtils } from '$lib/utils/colors';
	import type { Snippet } from 'svelte';
	import type { ColorName } from '$lib/types/colors';

	interface Props {
		href: string;
		color: ColorName;
		text: string;
		icon?: Snippet<[{ class?: string }]>;
		disabled?: boolean;
		className?: string;
	}

	const { href, color, text, icon, disabled = false, className = '' }: Props = $props();
	const active = $derived(page.url.pathname === href);

	const cu = $derived(ColorUtils.nameToTailwindClasses(color));
</script>

<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
	<a
		href={resolve(href as '/')}
		data-sveltekit-preload-data="hover"
		class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 shadow-sm border border-base-400 transition-all duration-200 hover:shadow-md hover:border-base-300 block {className}
		{active ? `ring-2 ${cu.ring} ${cu.bg} ${cu.border}` : cu.hover}
		{disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}"
		aria-current={active ? 'page' : undefined}
		tabindex={disabled ? -1 : 0}
	>
		<div class="flex items-center justify-between">
			<div
				class="flex items-center gap-3 flex-1 {active
					? cu.text
					: 'text-content group-hover:text-content/70'}"
			>
				<div class="flex items-center gap-3 max-sm:justify-center w-full">
					{#if icon}
						{@render icon({ class: 'w-8 h-8 rounded-md sm:p-1' })}
					{/if}
					<span class="text-lg font-semibold max-sm:hidden">{text}</span>
				</div>
			</div>
		</div>

		<!-- Active indicator -->
		{#if active}
			<div
				class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 {cu.indicator} rounded-full"
			></div>
		{/if}
	</a>
</div>
