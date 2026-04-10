<script lang="ts">
	import { browser } from '$app/environment';
	import { HardDrive, Trash2, RefreshCw, Copy, Check } from '@lucide/svelte';

	let storageInfo = $state<{ key: string; size: number }[]>([]);
	let totalSize = $state(0);
	let copiedKey = $state<string | null>(null);

	function calculateStorage() {
		if (!browser) return;

		const info: { key: string; size: number }[] = [];
		let total = 0;

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key) continue;

			const value = localStorage.getItem(key) || '';
			const size = (key.length + value.length) * 2;
			info.push({ key, size });
			total += size;
		}

		storageInfo = info.sort((a, b) => b.size - a.size);
		totalSize = total;
	}

	function formatBytes(bytes: number) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function clearKey(key: string) {
		if (!confirm(`¿Borrar la key "${key}"?`)) return;
		localStorage.removeItem(key);
		calculateStorage();
	}

	function copyKey(key: string) {
		navigator.clipboard.writeText(key);
		copiedKey = key;
		setTimeout(() => {
			if (copiedKey === key) copiedKey = null;
		}, 2000);
	}

	$effect(() => {
		calculateStorage();
	});
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 text-config-100">
			<HardDrive size={20} />
			<h2 class="font-bold text-content">LocalStorage Status</h2>
		</div>
		<button
			onclick={calculateStorage}
			class="p-1.5 hover:bg-base-200 rounded-lg text-content/40 transition-colors cursor-pointer"
		>
			<RefreshCw size={14} />
		</button>
	</div>

	<div class="bg-base-200 border border-base-300 rounded-xl p-4 flex flex-col items-center justify-center">
		<span class="text-xs font-bold text-content/40 uppercase tracking-wider">Peso Total</span>
		<span class="text-3xl font-black text-content">{formatBytes(totalSize)}</span>
		<p class="text-[10px] text-content/30 mt-1 italic text-center">
			Límite estimado: ~5MB por dominio
		</p>
	</div>

	<div class="space-y-4">
		{#each storageInfo as item (item.key)}
			<div class="group flex flex-col gap-1.5">
				<div class="flex justify-between items-center text-xs">
					<div class="flex items-center gap-2 min-w-0">
						<span class="font-mono font-bold text-content/70 truncate max-w-[150px]" title={item.key}>
							{item.key}
						</span>
						<button
							onclick={() => copyKey(item.key)}
							class="p-1 hover:bg-base-300 rounded text-content/30 hover:text-config-100 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
							title="Copiar key"
						>
							{#if copiedKey === item.key}
								<Check size={12} class="text-success-100" />
							{:else}
								<Copy size={12} />
							{/if}
						</button>
					</div>

					<div class="flex items-center gap-3">
						<span class="text-content/50 font-mono">{formatBytes(item.size)}</span>
						<button
							onclick={() => clearKey(item.key)}
							class="text-error-100 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
							title="Eliminar"
						>
							<Trash2 size={12} />
						</button>
					</div>
				</div>

				<div class="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
					<div
						class="h-full bg-config-100 transition-all duration-500"
						style="width: {(item.size / totalSize) * 100}%"
					></div>
				</div>
			</div>
		{:else}
			<p class="text-center text-xs text-content/40 py-4 italic">Storage vacío</p>
		{/each}
	</div>
</div>
