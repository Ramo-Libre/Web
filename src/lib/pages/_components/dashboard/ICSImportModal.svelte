<script lang="ts">
	import { Upload, Check, Calendar, MapPin, Clock, X, FileSpreadsheet } from '@lucide/svelte';
	import { parseICS, icsEventToScheduleEvent, type ParsedEvent, type DescriptionOptions } from '$lib/utils/ics';
	import { semestre } from '$lib/infra/semestres.svelte';

	let { onClose }: { onClose: () => void } = $props();

	const DAY_LABELS: Record<number, string> = {
		1: 'Lun',
		2: 'Mar',
		3: 'Mié',
		4: 'Jue',
		5: 'Vie',
		6: 'Sáb',
		7: 'Dom'
	};

	let events = $state<ParsedEvent[]>([]);
	let fileName = $state('');
	let error = $state('');
	let importing = $state(false);
	let includeLocation = $state(true);
	let includeDescription = $state(true);
	let isDragging = $state(false);

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) readFile(file);
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) readFile(file);
	}

	function readFile(file: File) {
		if (!file.name.endsWith('.ics')) {
			error = 'El archivo debe ser .ics';
			return;
		}
		fileName = file.name;
		error = '';
		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			try {
				events = parseICS(content);
				if (events.length === 0) {
					error = 'No se encontraron eventos en el archivo';
				}
			} catch {
				error = 'Error al parsear el archivo .ics';
			}
		};
		reader.readAsText(file);
	}

	function toggleEvent(index: number) {
		events[index].selected = !events[index].selected;
	}

	function toggleAll() {
		const allSelected = events.every((e) => e.selected);
		events = events.map((e) => ({ ...e, selected: !allSelected }));
	}

	function formatDays(days: number[]): string {
		return days.map((d) => DAY_LABELS[d]).join(', ');
	}

	function getPreviewDescription(event: ParsedEvent): string | undefined {
		const parts: string[] = [];
		if (includeLocation && event.location) parts.push(event.location);
		if (includeDescription && event.description) parts.push(event.description);
		return parts.length > 0 ? parts.join('\n') : undefined;
	}

	async function handleImport() {
		importing = true;
		const options: DescriptionOptions = { includeLocation, includeDescription };
		const selected = events.filter((e) => e.selected);
		for (const event of selected) {
			const scheduleEvent = icsEventToScheduleEvent(event, options);
			semestre.schedule.add(scheduleEvent);
		}
		importing = false;
		onClose();
	}
</script>

<div class="flex flex-col gap-5">
	{#if events.length === 0}
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<Calendar class="w-5 h-5 text-primary-100" />
				<h3 class="text-base font-bold text-content">Importar calendario</h3>
			</div>
			<p class="text-sm text-content/60">
				Selecciona un archivo .ics para importar tus horarios.
			</p>

			<label
				ondragenter={handleDragEnter}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				class="block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer {isDragging
					? 'border-primary-100 bg-primary-100/10'
					: 'border-base-400 hover:border-primary-100/50'}"
			>
				<Upload class="w-10 h-10 mx-auto text-content/30 mb-3 pointer-events-none" />
				<p class="text-sm text-content/60 mb-3 pointer-events-none">
					Arrastra un archivo .ics aquí o haz clic para seleccionar
				</p>
				<span class="inline-flex items-center gap-2 px-4 py-2 bg-base-200 hover:bg-base-300 rounded-lg text-sm font-medium text-content transition-colors pointer-events-none">
					<FileSpreadsheet class="w-4 h-4" />
					Seleccionar archivo
				</span>
				<input
					type="file"
					accept=".ics"
					class="hidden"
					onchange={handleFileInput}
				/>
			</label>

			{#if error}
				<p class="text-sm text-red-400">{error}</p>
			{/if}
		</div>
	{:else}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-bold text-content">
						{events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
					</h3>
					<p class="text-xs text-content/50 mt-0.5">{fileName}</p>
				</div>
				<button
					onclick={() => { events = []; fileName = ''; error = ''; }}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					title="Cambiar archivo"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<span class="text-xs font-semibold text-content/50 uppercase tracking-wider">Incluir</span>
				<button
					onclick={() => includeLocation = !includeLocation}
					class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer {includeLocation
						? 'bg-primary-100 text-base-100 border-primary-100'
						: 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
				>
					Ubicación
				</button>
				<button
					onclick={() => includeDescription = !includeDescription}
					class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer {includeDescription
						? 'bg-primary-100 text-base-100 border-primary-100'
						: 'bg-base-50 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
				>
					Descripción
				</button>
			</div>

			<label class="flex items-center gap-2 text-sm text-content/70 cursor-pointer">
				<input
					type="checkbox"
					checked={events.every((e) => e.selected)}
					indeterminate={events.some((e) => e.selected) && !events.every((e) => e.selected)}
					onchange={toggleAll}
					class="w-4 h-4 rounded border-base-400 text-primary-100 focus:ring-primary-100"
				/>
				Seleccionar todos
			</label>

			<div class="space-y-2 max-h-80 overflow-y-auto pr-1">
				{#each events as event, i (event.uid)}
					<button
						onclick={() => toggleEvent(i)}
						class="w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-left cursor-pointer {event.selected
							? 'bg-primary-100/10 border-primary-100/30'
							: 'bg-base-200/50 border-base-400 hover:border-base-300'}"
					>
						<input
							type="checkbox"
							checked={event.selected}
							class="w-4 h-4 mt-0.5 rounded border-base-400 text-primary-100 focus:ring-primary-100 shrink-0"
						/>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-content truncate">{event.title}</p>
							<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-content/50">
								{#if event.daysOfWeek}
									<span class="flex items-center gap-1">
										<Calendar class="w-3 h-3" />
										{formatDays(event.daysOfWeek)}
									</span>
								{:else if event.date}
									<span class="flex items-center gap-1">
										<Calendar class="w-3 h-3" />
										{event.date}
									</span>
								{/if}
								{#if event.startTime}
									<span class="flex items-center gap-1">
										<Clock class="w-3 h-3" />
										{event.startTime} - {event.endTime}
									</span>
								{/if}
							</div>
							{#if getPreviewDescription(event)}
								<div class="mt-1 text-xs text-content/40">
									{#each getPreviewDescription(event)!.split('\n') as line}
										{#if line === event.location}
											<span class="flex items-center gap-1">
												<MapPin class="w-3 h-3" />
												{line}
											</span>
										{:else}
											<p>{line}</p>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>

			{#if error}
				<p class="text-sm text-red-400">{error}</p>
			{/if}

			<button
				onclick={handleImport}
				disabled={events.filter((e) => e.selected).length === 0 || importing}
				class="w-full py-3 px-4 bg-primary-100 hover:bg-primary-100/80 disabled:bg-base-300 disabled:text-content/30 rounded-xl text-sm font-bold text-base-100 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				{#if importing}
					<span class="animate-spin">⏳</span>
					Importando...
				{:else}
					<Check class="w-4 h-4" />
					Importar {events.filter((e) => e.selected).length} evento{events.filter((e) => e.selected).length !== 1 ? 's' : ''}
				{/if}
			</button>
		</div>
	{/if}
</div>
