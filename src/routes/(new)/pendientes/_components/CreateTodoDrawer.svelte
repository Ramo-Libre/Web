<script lang="ts">
	import { X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { semestre } from '$lib/infra/semestres.svelte';

	interface Props {
		show: boolean;
		editId?: string;
		onClose: () => void;
	}

	let { show, editId = undefined, onClose }: Props = $props();

	let text = $state('');
	let body = $state('');
	let selectedRamoId = $state<string | undefined>(undefined);

	function resize(el: HTMLTextAreaElement) {
		el.style.height = '0';
		el.style.height = `${el.scrollHeight}px`;
	}

	function handleInput(e: Event) {
		resize(e.currentTarget as HTMLTextAreaElement);
	}

	function resizeVisible() {
		requestAnimationFrame(() => {
			const els = document.querySelectorAll<HTMLTextAreaElement>('.todo-textarea-input');
			for (const el of els) {
				if (el.offsetParent !== null) {
					resize(el);
					break;
				}
			}
		});
	}

	$effect(() => {
		if (!show) return;
		if (editId) {
			const todo = semestre.todos.get(editId);
			if (todo) {
				text = todo.text;
				body = todo.body ?? '';
				selectedRamoId = todo.ramoId;
				resizeVisible();
				return;
			}
		}
		text = '';
		body = '';
		selectedRamoId = undefined;
	});

	function confirm() {
		const todoText = text.trim();
		if (!todoText) return;
		const todoBody = body.trim() || undefined;
		if (editId) {
			const current = semestre.todos.get(editId);
			if (current) {
				semestre.todos.update(editId, {
					...current,
					text: todoText,
					body: todoBody,
					ramoId: selectedRamoId
				});
			}
		} else {
			semestre.todos.add({
				text: todoText,
				body: todoBody,
				completed: false,
				ramoId: selectedRamoId
			});
		}
		onClose();
	}

	function handleDelete() {
		if (!editId) return;
		semestre.todos.remove(editId);
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	const isEditing = $derived(!!editId);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<div class="fixed inset-0 z-50" role="dialog" aria-modal="true" in:fly={{ duration: 200 }}>
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={onClose}
			aria-label="Cerrar"
		></button>

		<div
			class="max-sm:hidden absolute top-0 right-0 bottom-0 w-[400px] bg-base-100 border-l border-base-400 shadow-2xl overflow-y-auto"
			in:fly={{ x: 380, duration: 250 }}
			out:fly={{ x: 380, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-3 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">
					{isEditing ? 'Editar pendiente' : 'Nuevo pendiente'}
				</h3>
				<button
					onclick={onClose}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<div>
					<textarea
						bind:value={text}
						oninput={handleInput}
						placeholder="¿Qué tienes que hacer?"
						class="todo-textarea-input w-full bg-transparent border-none outline-none text-2xl font-bold text-content placeholder-content/20 p-0 resize-none overflow-hidden"
						rows="1"
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								confirm();
							}
						}}></textarea>
				</div>

				<div class="border-t border-base-300 pt-4">
					<textarea
						bind:value={body}
						oninput={handleInput}
						placeholder="Detalles (opcional)"
						class="todo-textarea-input w-full bg-transparent border-none outline-none text-sm text-content/70 placeholder-content/20 p-0 resize-none overflow-hidden"
						rows="2"
						style="white-space: pre-wrap"></textarea>
				</div>

				<div class="border-t border-base-300 pt-4">
					<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
						Ramo
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => (selectedRamoId = undefined)}
							class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {!selectedRamoId
								? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
								: 'text-content/40 border-transparent hover:text-content/70'}"
						>
							<div class="w-2.5 h-2.5 rounded-full bg-base-300 shrink-0"></div>
							Ninguno
						</button>
						{#each semestre.ramos.list as [id, ramo] (id)}
							<button
								onclick={() => (selectedRamoId = id)}
								class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {selectedRamoId ===
								id
									? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
									: 'text-content/40 border-transparent hover:text-content/70'}"
							>
								<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
								></span>
								{ramo.name}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div
				class="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-base-300 bg-base-100"
			>
				{#if isEditing}
					<button
						onclick={handleDelete}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error-100 hover:bg-error-100/10 text-sm font-semibold transition-colors cursor-pointer mr-auto"
					>
						Eliminar
					</button>
				{/if}
				<button
					onclick={onClose}
					class="px-4 py-1.5 rounded-lg border border-base-400 text-sm font-medium text-content/60 hover:text-content transition-colors cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={confirm}
					disabled={!text.trim()}
					class="px-4 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed"
				>
					{isEditing ? 'Guardar' : 'Crear'}
				</button>
			</div>
		</div>

		<div
			class="sm:hidden absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]"
			in:fly={{ y: 100, duration: 250 }}
			out:fly={{ y: 100, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">
					{isEditing ? 'Editar pendiente' : 'Nuevo pendiente'}
				</h3>
				<button
					onclick={onClose}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<div>
					<textarea
						bind:value={text}
						oninput={handleInput}
						placeholder="¿Qué tienes que hacer?"
						class="todo-textarea-input w-full bg-transparent border-none outline-none text-xl font-bold text-content placeholder-content/20 p-0 resize-none overflow-hidden"
						rows="1"
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								confirm();
							}
						}}></textarea>
				</div>

				<div class="border-t border-base-300 pt-4">
					<textarea
						bind:value={body}
						oninput={handleInput}
						placeholder="Detalles (opcional)"
						class="todo-textarea-input w-full bg-transparent border-none outline-none text-sm text-content/70 placeholder-content/20 p-0 resize-none overflow-hidden"
						rows="2"
						style="white-space: pre-wrap"></textarea>
				</div>

				<div class="border-t border-base-300 pt-4">
					<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
						Ramo
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => (selectedRamoId = undefined)}
							class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {!selectedRamoId
								? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
								: 'text-content/40 border-transparent hover:text-content/70'}"
						>
							<div class="w-2.5 h-2.5 rounded-full bg-base-300 shrink-0"></div>
							Ninguno
						</button>
						{#each semestre.ramos.list as [id, ramo] (id)}
							<button
								onclick={() => (selectedRamoId = id)}
								class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {selectedRamoId ===
								id
									? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
									: 'text-content/40 border-transparent hover:text-content/70'}"
							>
								<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
								></span>
								{ramo.name}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div
				class="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border border-base-400 bg-base-100"
			>
				{#if isEditing}
					<button
						onclick={handleDelete}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error-100 hover:bg-error-100/10 text-sm font-semibold transition-colors cursor-pointer mr-auto"
					>
						Eliminar
					</button>
				{/if}
				<button
					onclick={onClose}
					class="px-4 py-1.5 rounded-lg border border-base-400 text-sm font-medium text-content/60 hover:text-content transition-colors cursor-pointer"
				>
					Cancelar
				</button>
				<button
					onclick={confirm}
					disabled={!text.trim()}
					class="px-4 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed"
				>
					{isEditing ? 'Guardar' : 'Crear'}
				</button>
			</div>
		</div>
	</div>
{/if}
