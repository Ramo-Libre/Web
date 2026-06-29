<script lang="ts">
	import { Trash2, Plus, Calendar, CircleCheck, History } from '@lucide/svelte';
	import { semestre } from '$lib/infra/semestres.svelte';

	let newSemesterName = $state('');
	let deleteConfirmData = $state<{ id: string; name: string } | null>(null);

	const semestreList = $derived(Array.from(semestre.semestres.entries()));
	const hasSemestres = $derived(semestreList.length > 0);
	const activeSemestre = $derived(semestre.active);
	const activeSemestreId = $derived(semestre.activeId);

	function handleAddKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (!newSemesterName.trim()) return;
			semestre.add(newSemesterName.trim());
			newSemesterName = '';
		}
	}

	function handleActiveRename(e: Event) {
		const newName = (e.currentTarget as HTMLInputElement).value.trim();
		if (newName && newName !== activeSemestre && activeSemestreId) {
			semestre.rename(activeSemestreId, newName);
		}
	}

	function handleActiveKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const input = e.currentTarget as HTMLInputElement;
			const newName = input.value.trim();
			if (newName && newName !== activeSemestre && activeSemestreId) {
				semestre.rename(activeSemestreId, newName);
			}
			input.blur();
		}
		if (e.key === 'Escape') {
			const input = e.currentTarget as HTMLInputElement;
			input.value = activeSemestre;
			input.blur();
		}
	}

	function handleInactiveRename(id: string, oldName: string, e: Event) {
		const newName = (e.currentTarget as HTMLInputElement).value.trim();
		if (newName && newName !== oldName) {
			semestre.rename(id, newName);
		}
	}

	function handleInactiveKey(id: string, oldName: string, e: KeyboardEvent) {
		if (e.key === 'Enter') {
			(e.currentTarget as HTMLInputElement).blur();
		}
		if (e.key === 'Escape') {
			const input = e.currentTarget as HTMLInputElement;
			input.value = oldName;
			input.blur();
		}
	}

	function openDeleteConfirm(id: string, name: string) {
		deleteConfirmData = { id, name };
	}

	function confirmDelete() {
		if (!deleteConfirmData) return;
		semestre.remove(deleteConfirmData.id);
		deleteConfirmData = null;
	}

	function cancelDelete() {
		deleteConfirmData = null;
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl overflow-hidden flex flex-col">
	<div
		class="relative bg-linear-to-r from-primary-100 to-primary-100/90 p-6 text-base-100 transition-colors"
	>
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2 opacity-80">
				<CircleCheck size={16} />
				<span class="text-xs font-bold uppercase tracking-widest">Periodo Actual</span>
			</div>

			{#if hasSemestres}
				<button
					onclick={() => openDeleteConfirm(activeSemestreId, activeSemestre)}
					class="p-2 rounded-lg bg-base-100/10 text-base-100/60 hover:bg-error-100 hover:text-base-100 transition-all backdrop-blur-sm z-20 cursor-pointer"
					title="Eliminar semestre actual"
				>
					<Trash2 size={18} />
				</button>
			{/if}
		</div>

		{#if activeSemestre}
			<input
				type="text"
				value={activeSemestre}
				onchange={handleActiveRename}
				onkeydown={handleActiveKey}
				class="block w-full bg-transparent border-none outline-none text-3xl sm:text-4xl font-bold text-base-100 placeholder-base-100/40 focus:ring-0 p-0 leading-tight relative z-10"
			/>
		{:else}
			<div class="text-base-100/50 text-3xl font-bold italic relative z-10">Sin selección</div>
			<p class="text-sm text-base-100/80 mt-2 relative z-10">
				Crea un semestre abajo para empezar.
			</p>
		{/if}

		<Calendar
			class="absolute -right-5 -bottom-5 text-base-100/10 rotate-12 pointer-events-none"
			size={160}
		/>
	</div>

	<div class="bg-base-200 flex flex-col divide-y divide-base-300">
		{#if hasSemestres}
			<div
				class="px-6 py-3 text-xs font-bold text-content/50 uppercase tracking-wider flex items-center gap-2"
			>
				<History size={12} />
				Biblioteca ({semestreList.length})
			</div>
		{/if}

		<div class="max-sm:max-h-56 overflow-y-auto">
			{#each semestreList as [id, data] (id)}
				{#if id !== activeSemestreId}
					<div
						class="group flex items-center justify-between px-6 py-3 hover:bg-base-100 transition-colors cursor-pointer"
						onclick={() => semestre.select(id)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') semestre.select(id);
						}}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center gap-4 flex-1">
							<div
								class="w-5 h-5 rounded-full border-2 border-base-400 group-hover:border-primary-100 group-hover:scale-110 transition-all shrink-0"
							></div>
							<input
								type="text"
								value={data.name}
								onclick={(e) => e.stopPropagation()}
								onchange={(e) => handleInactiveRename(id, data.name, e)}
								onkeydown={(e) => handleInactiveKey(id, data.name, e)}
								class="bg-transparent border-none outline-none text-content/80 font-medium group-hover:text-primary-100 focus:ring-0 p-0 flex-1 cursor-text"
							/>
						</div>

						<button
							onclick={(e) => {
								e.stopPropagation();
								openDeleteConfirm(id, data.name);
							}}
							class="group-hover:opacity-100 p-2 text-content/30 hover:text-error-100 transition-opacity cursor-pointer"
						>
							<Trash2 size={16} />
						</button>
					</div>
				{/if}
			{/each}
		</div>

		<div class="px-6 py-4 bg-base-100 border-t border-base-300">
			<div
				class="flex items-center gap-3 text-content/50 focus-within:text-primary-100 transition-colors"
			>
				<Plus size={20} />
				<input
					type="text"
					bind:value={newSemesterName}
					onkeydown={handleAddKey}
					placeholder="Crear nuevo semestre..."
					class="flex-1 bg-transparent border-none outline-none text-base text-content placeholder-content/40 focus:ring-0 p-0"
				/>
			</div>
		</div>
	</div>
</div>

{#if deleteConfirmData !== null}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={cancelDelete}
			aria-label="Cerrar modal"
		></button>

		<div
			class="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6"
		>
			<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
			<p class="text-sm text-content/70 mb-6">
				Esta acción eliminará permanentemente el semestre
				<strong class="text-content font-semibold">"{deleteConfirmData.name}"</strong>
				y todos los datos asociados a él. Esta acción no se puede deshacer.
			</p>

			<div class="flex justify-end gap-3">
				<button
					onclick={cancelDelete}
					class="px-4 py-2 rounded-lg border border-base-400 text-content/70 text-sm font-semibold hover:bg-base-200 hover:text-content transition-colors cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={confirmDelete}
					class="px-4 py-2 rounded-lg bg-error-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
				>
					Eliminar Semestre
				</button>
			</div>
		</div>
	</div>
{/if}
