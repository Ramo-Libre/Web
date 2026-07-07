<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { semestre } from '$lib/infra/semestres.svelte';
	import CreateTodoDrawer from './CreateTodoDrawer.svelte';

	let showCreateDrawer = $state(false);
	let editId = $state<string | undefined>(undefined);

	let showPending = $state(true);
	let showCompleted = $state(false);
	let selectedRamos = $state(new SvelteSet<string>());

	const todos = $derived(semestre.todos.list);
	const ramos = $derived(semestre.ramos.list);

	const filtered = $derived(
		todos.filter(([, t]) => {
			const matchesStatus = (showPending && !t.completed) || (showCompleted && t.completed);
			const matchesRamo = selectedRamos.size === 0 || (t.ramoId && selectedRamos.has(t.ramoId));
			return matchesStatus && matchesRamo;
		})
	);

	function toggleRamo(id: string) {
		const next = new SvelteSet(selectedRamos);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedRamos = next;
	}

	function toggleTodo(
		id: string,
		todo: { text: string; completed: boolean; ramoId?: string; createdAt: string }
	) {
		semestre.todos.update(id, { ...todo, completed: !todo.completed });
	}

	function openEditor(id: string) {
		editId = id;
		showCreateDrawer = true;
	}

	function openCreator() {
		editId = undefined;
		showCreateDrawer = true;
	}

	function ramoFor(ramoId: string | undefined): { name: string; color: string } | null {
		if (!ramoId) return null;
		const ramo = semestre.ramos.get(ramoId);
		return ramo ?? null;
	}
</script>

<div class="flex flex-col gap-3">
	<div class="bg-base-100 border border-base-400 rounded-xl p-3">
		<div class="flex items-center gap-2 max-sm:mb-2">
			<button
				onclick={() => (showPending = !showPending)}
				class="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {showPending
					? 'bg-todos-100 text-base-100 border-todos-100'
					: 'bg-base-100 text-content/40 border-base-400 hover:border-todos-100 hover:text-content'}"
			>
				Pendiente
			</button>
			<button
				onclick={() => (showCompleted = !showCompleted)}
				class="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {showCompleted
					? 'bg-todos-100 text-base-100 border-todos-100'
					: 'bg-base-100 text-content/40 border-base-400 hover:border-todos-100 hover:text-content'}"
			>
				Completado
			</button>

			<span class="w-px h-5 bg-base-300 max-sm:hidden"></span>

			{#each ramos as [id, ramo] (id)}
				<button
					onclick={() => toggleRamo(id)}
					class="max-sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {selectedRamos.has(
						id
					)
						? 'text-base-100 border-transparent'
						: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					style={selectedRamos.has(id) ? `background:${ramo.color};` : ''}
				>
					<span
						class="w-2 h-2 rounded-full shrink-0"
						style="background:{selectedRamos.has(id) ? 'currentColor' : ramo.color}"
					></span>
					{ramo.name}
				</button>
			{/each}

			<button
				onclick={openCreator}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-todos-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer ml-auto shrink-0"
			>
				<Plus class="w-4 h-4" />
				Nuevo
			</button>
		</div>

		<div class="sm:hidden flex items-center gap-2 flex-wrap">
			{#each ramos as [id, ramo] (id)}
				<button
					onclick={() => toggleRamo(id)}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {selectedRamos.has(
						id
					)
						? 'text-base-100 border-transparent'
						: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					style={selectedRamos.has(id) ? `background:${ramo.color};` : ''}
				>
					<span
						class="w-2 h-2 rounded-full shrink-0"
						style="background:{selectedRamos.has(id) ? 'currentColor' : ramo.color}"
					></span>
					{ramo.name}
				</button>
			{/each}
		</div>
	</div>

	{#each filtered as [id, todo] (id)}
		{@const ramoColor = todo.ramoId ? (ramoFor(todo.ramoId)?.color ?? '') : ''}
		<div
			class="group bg-base-100 border border-base-400 rounded-xl p-4 flex items-center gap-3 hover:border-base-300 transition-all duration-200 cursor-pointer"
			class:border-l-[3px]={!!ramoColor}
			style={ramoColor ? `border-left-color:${ramoColor};` : ''}
			onclick={() => openEditor(id)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && openEditor(id)}
		>
			<button
				onclick={(e) => {
					e.stopPropagation();
					toggleTodo(id, todo);
				}}
				class="shrink-0 w-5 h-5 rounded-full border-2 transition-all cursor-pointer {todo.completed
					? 'bg-base-300/60 border-base-300'
					: 'border-base-400 hover:border-base-300'}"
				style={ramoColor
					? `border-color:${ramoColor};${todo.completed ? `background:${ramoColor};` : ''}`
					: ''}
				aria-label={todo.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
			></button>

			<span
				class="flex-1 text-sm min-w-0 break-words {todo.completed
					? 'text-content/40 line-through'
					: 'font-medium text-content'}"
			>
				{todo.text}
			</span>
		</div>
	{/each}
</div>

<CreateTodoDrawer show={showCreateDrawer} {editId} onClose={() => (showCreateDrawer = false)} />
