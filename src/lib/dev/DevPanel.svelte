<script lang="ts">
	import { PUBLIC_TAURI_BUILD } from '$env/static/public';
	import { listAppDataDir, type DirEntryInfo } from './fs-inspector';
	import { HardDrive, RefreshCw, FileText, Folder, TriangleAlert } from '@lucide/svelte';

	let entries = $state<DirEntryInfo[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const isTauri =
		PUBLIC_TAURI_BUILD === 'true' || (typeof window !== 'undefined' && '__TAURI__' in window);

	async function refresh() {
		loading = true;
		error = null;
		try {
			entries = await listAppDataDir();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
			entries = [];
		} finally {
			loading = false;
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	$effect(() => {
		void refresh();
	});
</script>

{#if isTauri}
	<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 text-config-100">
				<HardDrive size={20} />
				<h2 class="font-bold text-content">Store Inspector</h2>
			</div>
			<button
				onclick={refresh}
				disabled={loading}
				class="p-1.5 hover:bg-base-200 rounded-lg text-content/40 transition-colors cursor-pointer disabled:opacity-30"
			>
				<RefreshCw size={14} />
			</button>
		</div>

		{#if error}
			<p class="text-xs text-error-100 flex items-center gap-1">
				<TriangleAlert size={12} />
				{error}
			</p>
		{/if}

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<div
					class="animate-spin h-5 w-5 border-2 border-config-100 border-t-transparent rounded-full"
				></div>
			</div>
		{:else if entries.length === 0}
			<p class="text-xs text-content/40 text-center py-4">Directorio vacío</p>
		{:else}
			<div class="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
				{#each entries as entry (entry.name)}
					<div class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-content/70">
						{#if entry.isDirectory}
							<Folder size={14} class="shrink-0 text-content/30" />
						{:else}
							<FileText size={14} class="shrink-0 text-content/40" />
						{/if}
						<span class="text-sm font-mono text-content truncate">{entry.name}</span>
						<span class="text-[10px] text-content/30 ml-auto shrink-0">
							{entry.isDirectory
								? 'dir'
								: entry.sizeBytes != null
									? formatBytes(entry.sizeBytes)
									: ''}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.custom-scroll::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: var(--color-base-400);
		border-radius: 4px;
	}
</style>
