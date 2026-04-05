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

	let draft = $state<Contexto>(contexto);

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
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button
			class="absolute inset-0 bg-black/40 cursor-pointer"
			aria-label="Cerrar"
			onclick={onClose}
		></button>

		<div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
			<div class="px-6 py-4 border-b border-gray-100">
				<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
					Editar escala de notas
				</h3>
			</div>

			<div class="px-6 py-5 space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600">Nota mínima</span>
					<input
						type="number"
						value={draft.nota_minima}
						oninput={(e) =>
							update({ nota_minima: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600">Nota máxima</span>
					<input
						type="number"
						value={draft.nota_maxima}
						oninput={(e) =>
							update({ nota_maxima: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600">Nota de aprobación</span>
					<input
						type="number"
						value={draft.nota_aprobacion}
						oninput={(e) =>
							update({ nota_aprobacion: Number((e.target as HTMLInputElement).value || 0) })}
						class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>
			</div>

			<div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
				<button
					onclick={onClose}
					class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={handleApplyAll}
					class="px-3 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
				>
					Aplicar a Todos
				</button>
				<button
					onclick={handleApply}
					class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
				>
					Aplicar
				</button>
			</div>
		</div>
	</div>
{/if}