<script lang="ts">
	import { X, Copy } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';
	import { semestre } from '$lib/infra/semestres.svelte';
	import type { RenderType } from '$lib/features/notas.svelte';
	import { buildAIContextPrompt } from '@ramo-libre/dsl-parser';

	interface Props {
		escenarioId: string | null;
		show: boolean;
		onClose: () => void;
	}

	let { escenarioId, show, onClose }: Props = $props();

	let inputScript = $state('');
	let renderTypes = $state<RenderType[]>(['constraint']);

	$effect(() => {
		if (!show || !escenarioId) return;
		const data = semestre.escenarios.get(escenarioId);
		if (data) {
			inputScript = data.scriptRaw;
			renderTypes = data.renderTypes ?? ['constraint'];
		}
	});

	function save() {
		if (!escenarioId) return;
		semestre.escenarios.setScript(escenarioId, inputScript);
		semestre.escenarios.setRenderTypes(escenarioId, renderTypes);
		onClose();
	}

	function toggleRenderType(t: RenderType) {
		if (renderTypes.includes(t)) {
			if (renderTypes.length > 1) {
				renderTypes = renderTypes.filter((r) => r !== t);
			}
		} else {
			renderTypes = [...renderTypes, t];
		}
	}

	const labels: Record<RenderType, string> = {
		assignment: 'Asignaciones',
		constraint: 'Restricciones',
		domain: 'Dominios'
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	let copied = $state(false);

	async function copyContext() {
		const prompt = buildAIContextPrompt();
		try {
			await navigator.clipboard.writeText(prompt);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// fallback
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		in:fly={{ duration: 200 }}
	>
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={onClose}
			aria-label="Cerrar"
		></button>

		<!-- Desktop: right panel -->
		<div
			class="max-sm:hidden absolute top-0 right-0 bottom-0 w-[500px] bg-base-100 border-l border-base-400 shadow-2xl overflow-y-auto"
			in:fly={{ x: 380, duration: 250 }}
			out:fly={{ x: 380, duration: 200 }}
		>
			<div class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-3 border-b border-base-300">
				<h3 class="text-lg font-bold text-content">Editar reglas</h3>
				<button
					onclick={onClose}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-content/50">¿Necesitas Ayuda?</span>
					<button
						onclick={copyContext}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer {copied ? 'bg-success-100 text-base-100 border-success-100' : 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					>
						<Copy size={14} />
						{copied ? 'Copiado' : 'Copiar Contexto IA'}
					</button>
				</div>
				<textarea
					bind:value={inputScript}
					placeholder="PC = prom(C1, C2)
NF = PC * 0.6 + Cert * 0.4

NF >= 55
cada(C1, C2) >= 30

dominio C1, C2 [0, 100]
dominio Cert [0, 100]"
					class="w-full h-[400px] px-4 py-3 rounded-lg border border-base-400 bg-base-100 text-sm font-mono text-content focus:outline-none focus:border-primary-100 resize-none"
					spellcheck="false"
				></textarea>

				<div class="flex items-center gap-3">
					<span class="text-xs font-semibold text-content/50 uppercase tracking-wider">Mostrar</span>
					{#each ['assignment', 'constraint', 'domain'] as t}
						{@const type = t as RenderType}
						<button
							onclick={() => toggleRenderType(type)}
							class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer {renderTypes.includes(type)
								? 'bg-primary-100 text-base-100 border-primary-100'
								: 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
						>
							{labels[type]}
						</button>
					{/each}
				</div>
			</div>

			<div class="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-base-300 bg-base-100">
				<button
					onclick={onClose}
					class="px-4 py-1.5 rounded-lg border border-base-400 text-sm font-medium text-content/60 hover:text-content transition-colors cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={save}
					class="px-4 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
				>
					Guardar
				</button>
			</div>
		</div>

		<!-- Mobile: bottom sheet -->
		<div
			class="sm:hidden absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] overflow-y-auto"
			in:fly={{ y: 100, duration: 250 }}
			out:fly={{ y: 100, duration: 200 }}
		>
			<div class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300">
				<h3 class="text-lg font-bold text-content">Editar reglas</h3>
				<button
					onclick={onClose}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-content/50">¿Necesitas Ayuda?</span>
					<button
						onclick={copyContext}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer {copied ? 'bg-success-100 text-base-100 border-success-100' : 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					>
						<Copy size={14} />
						{copied ? 'Copiado' : 'Copiar Contexto IA'}
					</button>
				</div>
				<textarea
					bind:value={inputScript}
					placeholder="PC = prom(C1, C2)
NF = PC * 0.6 + Cert * 0.4

NF >= 55
cada(C1, C2) >= 30

dominio C1, C2 [0, 100]
dominio Cert [0, 100]"
					class="w-full h-[300px] px-4 py-3 rounded-lg border border-base-400 bg-base-50 text-sm font-mono text-content focus:outline-none focus:border-primary-100 resize-none"
					spellcheck="false"
				></textarea>

				<div class="flex items-center gap-3">
					<span class="text-xs font-semibold text-content/50 uppercase tracking-wider">Mostrar</span>
					{#each ['assignment', 'constraint', 'domain'] as t}
						{@const type = t as RenderType}
						<button
							onclick={() => toggleRenderType(type)}
							class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer {renderTypes.includes(type)
								? 'bg-primary-100 text-base-100 border-primary-100'
								: 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
						>
							{labels[type]}
						</button>
					{/each}
				</div>
			</div>

			<div class="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border border-base-400 bg-base-100">
				<button
					onclick={onClose}
					class="px-4 py-1.5 rounded-lg border border-base-400 text-sm font-medium text-content/60 hover:text-content transition-colors cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={save}
					class="px-4 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
				>
					Guardar
				</button>
			</div>
		</div>
	</div>
{/if}
