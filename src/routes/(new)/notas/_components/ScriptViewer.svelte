<script lang="ts">
	import { parseScript, toLatex } from '@ramo-libre/dsl-parser';
	import type { RenderType } from '$lib/features/notas.svelte';
	import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';

	interface Props {
		scriptRaw: string;
		renderTypes: RenderType[];
		onEdit?: () => void;
	}

	let { scriptRaw, renderTypes, onEdit }: Props = $props();

	let katexInstance: { renderToString: (tex: string, options?: object) => string } | null =
		$state(null);

	onMount(async () => {
		const mod = await import('katex');
		katexInstance = mod.default;
	});

	const statements = $derived(parseScript(scriptRaw));

	const visibleStatements = $derived(
		statements.filter((s) => renderTypes.includes(s.type as RenderType))
	);

	function renderStmtHtml(stmt: (typeof statements)[number]): string | null {
		try {
			if (!katexInstance) return null;
			return katexInstance.renderToString(toLatex(stmt), {
				displayMode: true,
				throwOnError: false
			});
		} catch {
			return null;
		}
	}
</script>

<div
	class="rounded-xl border border-base-400 bg-base-100 shadow-inner w-full relative cursor-pointer overflow-hidden group"
	onclick={onEdit}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter') onEdit?.();
	}}
>
	<div class="absolute top-4 left-4 flex items-center gap-2 text-content/50 pointer-events-none">
		<span class="font-medium text-xs uppercase tracking-widest">Ecuación de Nota</span>
	</div>

	{#if visibleStatements.length === 0}
		<div class="h-40 flex items-center justify-center">
			<div
				class="flex flex-col items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-dashed border-primary-100/30 bg-primary-100/5 group-hover:bg-primary-100/10 group-hover:border-primary-100/50 transition-all cursor-pointer"
			>
				<span class="text-sm font-bold text-primary-100/70"
					>Presiona para configurar las reglas</span
				>
			</div>
		</div>
	{:else}
		<div class="text-center py-12 px-8 mt-6">
			{#if visibleStatements.length > 0}
				<div class="space-y-4">
					{#each visibleStatements as stmt (stmt.raw)}
						{@const html = renderStmtHtml(stmt)}
						<div class="flex items-center justify-center gap-3">
							{#if html}
								<div class="katex-block">{@html html}</div>
							{:else}
								<span class="text-xs text-error-100 font-mono">{stmt.raw}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(.katex-block .katex-display) {
		margin: 0.15em 0;
		text-align: center;
	}
	:global(.katex-block .katex) {
		font-size: 1em;
	}
</style>
