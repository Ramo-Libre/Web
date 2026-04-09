<script lang="ts">
	import type { Contexto } from '@madmti/gradesolver';

	interface Props {
		open: boolean;
		contexto: Contexto;
		onApply: (contexto: Contexto) => void;
		onApplyAll: (contexto: Contexto) => void;
		onClose: () => void;
	}

	let { open = false, contexto, onApply, onApplyAll, onClose }: Props = $props();

	let draft = $state<Contexto>({ nota_minima: 0, nota_maxima: 0, nota_aprobacion: 0 });

	$effect(() => {
		if (open) {
			draft = { ...contexto };
		}
	});

	function update(partial: Partial<Contexto>) {
		draft = { ...draft, ...partial };
	}

	function handleApply() {
		onApply({ ...draft });
	}

	function handleApplyAll() {
		onApplyAll({ ...draft });
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer transition-all"
			aria-label="Cerrar"
			onclick={onClose}
		></button>

		<div
			class="relative w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 overflow-hidden transition-colors"
		>
			<div class="px-6 py-4 border-b border-base-300">
				<h3 class="text-sm font-semibold text-content uppercase tracking-wide">
					Editar escala de notas
				</h3>
			</div>

			<div class="px-6 py-5 space-y-4 bg-base-100">
				<div class="flex items-center justify-between">
					<span class="text-sm text-content/80">Nota mínima</span>
					<input
						type="number"
						value={draft.nota_minima}
						oninput={(e) =>
							update({ nota_minima: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm text-content/80">Nota máxima</span>
					<input
						type="number"
						value={draft.nota_maxima}
						oninput={(e) =>
							update({ nota_maxima: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm text-content/80">Nota de aprobación</span>
					<input
						type="number"
						value={draft.nota_aprobacion}
						oninput={(e) =>
							update({ nota_aprobacion: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>
			</div>

			<div
				class="px-6 py-4 border-t border-base-300 flex items-center justify-end gap-2 bg-base-100"
			>
				<button
					onclick={onClose}
					class="px-3 py-2 text-sm font-medium text-content/60 hover:text-content cursor-pointer transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={handleApplyAll}
					class="px-3 py-2 text-sm font-semibold text-primary-100 hover:opacity-80 cursor-pointer transition-opacity"
				>
					Aplicar a Todos
				</button>
				<button
					onclick={handleApply}
					class="px-4 py-2 text-sm font-semibold bg-primary-100 text-base-100 rounded-lg hover:opacity-90 cursor-pointer transition-all active:scale-95 shadow-sm"
				>
					Aplicar
				</button>
			</div>
		</div>
	</div>
{/if}
