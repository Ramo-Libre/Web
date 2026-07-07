import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { changeBus } from '$lib/infra/sync.svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

interface Todo {
	text: string;
	completed: boolean;
	ramoId?: string;
	createdAt: string;
}
type Key = string;
type Todos = SvelteMap<Key, Todo>;

export type TodosSerial = [Key, Todo][];
export const DEFAULT_TODOS = [];

export class TodosManager implements Serializable<TodosSerial> {
	private _todos = $state<Todos>(new SvelteMap<Key, Todo>(DEFAULT_TODOS));

	fromSerial(serial: TodosSerial) {
		this._todos = new SvelteMap<Key, Todo>(serial);
	}

	toSerial(): TodosSerial {
		return Array.from(this._todos.entries());
	}

	clear(): void {
		this._todos.clear();
	}

	empty(): boolean {
		return this._todos.size === 0;
	}

	toOne(id: string): Todo | null {
		const todo = this._todos.get(id);
		return todo ? { ...todo } : null;
	}

	fromOne(id: string, data: Todo) {
		this._todos.set(id, data);
	}

	removeSilent(id: string) {
		this._todos.delete(id);
	}

	add(todo: Omit<Todo, 'createdAt'> & { createdAt?: string }) {
		const id = generateUUID();
		this._todos.set(id, { ...todo, createdAt: todo.createdAt ?? new SvelteDate().toISOString() });
		changeBus.emit('todos', 'created', id);
		return id;
	}

	remove(id: string) {
		this._todos.delete(id);
		changeBus.emit('todos', 'deleted', id);
	}

	get(id: string): Todo | undefined {
		return this._todos.get(id);
	}

	has(id: string): boolean {
		return this._todos.has(id);
	}

	update(id: string, todo: Todo) {
		this._todos.set(id, todo);
		changeBus.emit('todos', 'updated', id);
	}

	removeByRamo(ramoId: string) {
		const toDelete: string[] = [];
		for (const [id, todo] of this._todos) {
			if (todo.ramoId === ramoId) toDelete.push(id);
		}
		for (const id of toDelete) {
			this._todos.delete(id);
			changeBus.emit('todos', 'deleted', id);
		}
	}

	getByRamo(ramoId: string): Todo[] {
		const result: Todo[] = [];
		for (const [, todo] of this._todos) {
			if (todo.ramoId === ramoId) result.push(todo);
		}
		return result;
	}

	getByCompleted(completed: boolean): Todo[] {
		const result: Todo[] = [];
		for (const [, todo] of this._todos) {
			if (todo.completed === completed) result.push(todo);
		}
		return result;
	}

	get list() {
		return Array.from(this._todos.entries());
	}

	get map() {
		return this._todos;
	}
}
