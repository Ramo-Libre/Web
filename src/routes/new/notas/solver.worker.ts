import init, { solve } from '@ramo-libre/solver';

let ready = init();

self.onmessage = async (
	e: MessageEvent<{ fs: string; strategy: string; requestId: number; escenarioId?: string }>
) => {
	const { fs, strategy, requestId, escenarioId } = e.data;
	await ready;
	console.log(fs, strategy, requestId, escenarioId);
	try {
		const jsResult = solve(fs, {
			strategy,
			montecarlo_n: 2000,
			default_domain_lo: 0.0,
			default_domain_hi: 100.0
		});
		self.postMessage({
			requestId,
			result: {
				feasible: jsResult.feasible,
				plan: jsResult.plan,
				penalty: jsResult.penalty,
				strategy: jsResult.strategy,
				probability: jsResult.probability,
				effectiveness: jsResult.effectiveness,
				montecarlo_samples: jsResult.montecarlo_samples,
				constraint_violations: jsResult.constraint_violations,
				libertad: jsResult.libertad,
				elapsed_ms: jsResult.elapsed_ms
			},
			escenarioId
		});
	} catch (err) {
		console.log(err);
		self.postMessage({
			requestId,
			error: err instanceof Error ? err.message : 'Error al resolver',
			escenarioId
		});
	}
};
