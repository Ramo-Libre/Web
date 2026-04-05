<script lang="ts">
	import { TrendingUp, Activity } from '@lucide/svelte';
	import { db } from '$lib/state/index.svelte';

	const summaryStats = $derived.by(() => {
		let pendientes = 0;
		let buenas = 0;
		let malas = 0;
		let total = 0;

		for (const [ramoId] of db.ramos.list) {
			const { list } = db.notas.getEvaluacionesData(ramoId);
			const contextoRamo = db.notas.getContexto(ramoId);
			const notaAprobacion = contextoRamo?.nota_aprobacion ?? 0;

			for (const [, evaluacion] of list) {
				total += 1;
				const nota = evaluacion.valor_actual;
				if (nota === null || nota === undefined) {
					pendientes += 1;
				} else if (nota < notaAprobacion) {
					malas += 1;
				} else {
					buenas += 1;
				}
			}
		}

		return { pendientes, buenas, malas, total };
	});

	const globalStats = $derived.by(() => {
		const notas: number[] = [];

		for (const [ramoId] of db.ramos.list) {
			const { list } = db.notas.getEvaluacionesData(ramoId);
			for (const [, evaluacion] of list) {
				const nota = evaluacion.valor_actual;
				if (nota !== null && nota !== undefined) {
					notas.push(nota);
				}
			}
		}

		if (notas.length === 0) {
			return { media: 0, desviacion: 0, total: 0 };
		}

		const total = notas.length;
		const media = notas.reduce((acc, value) => acc + value, 0) / total;
		const desviacion = Math.sqrt(
			notas.reduce((acc, value) => acc + Math.pow(value - media, 2), 0) / total
		);

		return { media, desviacion, total };
	});
</script>

<div
	class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-64 relative overflow-hidden"
>
	<div class="flex items-center gap-2 mb-4">
		<TrendingUp class="w-5 h-5 text-green-500" />
		<h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Conteo evaluaciones</h3>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
			<div class="text-xs text-slate-500">Pendientes</div>
			<div class="text-xl font-semibold text-slate-800">{summaryStats.pendientes}</div>
		</div>
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
			<div class="text-xs text-slate-500">Buenas notas</div>
			<div class="text-xl font-semibold text-slate-800">{summaryStats.buenas}</div>
		</div>
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
			<div class="text-xs text-slate-500">Malas notas</div>
			<div class="text-xl font-semibold text-slate-800">{summaryStats.malas}</div>
		</div>
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
			<div class="text-xs text-slate-500">Total</div>
			<div class="text-xl font-semibold text-slate-800">{summaryStats.total}</div>
		</div>
	</div>

	<div class="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
		<div class="flex items-center gap-1">
			<Activity size={14} class="text-slate-400" />
			<span class="font-semibold text-slate-700">{globalStats.media.toFixed(1)}</span>
			<span class="text-[11px] text-slate-400">Media</span>
		</div>
		<div class="flex items-center gap-1">
			<Activity size={14} class="text-slate-400" />
			<span class="font-semibold text-slate-700">{globalStats.desviacion.toFixed(1)}</span>
			<span class="text-[11px] text-slate-400">Desviación</span>
		</div>
	</div>
</div>
