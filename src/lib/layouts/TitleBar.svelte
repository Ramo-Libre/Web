<script lang="ts">
	import { PUBLIC_TAURI_BUILD } from '$env/static/public';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import { VERSION } from '$lib/utils/version';
	import { Minus, Square, X } from '@lucide/svelte';

	const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in window;
	const isLinux = typeof navigator !== 'undefined' && navigator.platform.includes('Linux');
	const showControls = isTauri && !isLinux;

	let isMaximized = $state(false);

	async function getWindow() {
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		return getCurrentWindow();
	}

	async function minimize() {
		await (await getWindow()).minimize();
	}

	async function toggleMaximize() {
		const win = await getWindow();
		await win.toggleMaximize();
		isMaximized = await win.isMaximized();
	}

	async function close() {
		await (await getWindow()).close();
	}
</script>

{#if isTauri}
	<header
		data-tauri-drag-region
		class="select-none flex items-center h-9 px-3 bg-base-200 border-b border-base-400 text-content/60 shrink-0"
	>
		<div data-tauri-drag-region class="flex-1 flex items-center gap-2 text-xs font-medium tracking-wide">
			<img src={SuiteFavicons.web} alt="" class="w-4 h-4" />
			Ramo Libre
		</div>

		<span class="text-[10px] text-content/30 select-none">{VERSION}</span>

		{#if showControls}
			<div class="flex items-center -mr-1">
				<button
					data-tauri-drag-region="false"
					onclick={minimize}
					class="flex items-center justify-center w-7 h-7 rounded hover:bg-base-300 text-content/50 hover:text-content cursor-default transition-colors"
					aria-label="Minimizar"
				>
					<Minus size="14" />
				</button>
				<button
					data-tauri-drag-region="false"
					onclick={toggleMaximize}
					class="flex items-center justify-center w-7 h-7 rounded hover:bg-base-300 text-content/50 hover:text-content cursor-default transition-colors"
					aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
				>
					<Square size="12" />
				</button>
				<button
					data-tauri-drag-region="false"
					onclick={close}
					class="flex items-center justify-center w-7 h-7 rounded hover:bg-red-600/80 text-content/50 hover:text-white cursor-default transition-colors"
					aria-label="Cerrar"
				>
					<X size="14" />
				</button>
			</div>
		{/if}
	</header>
{/if}
