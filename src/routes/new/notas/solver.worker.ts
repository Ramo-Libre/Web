import init, { solve } from '@ramo-libre/solver';

let ready = init();

self.onmessage = async (e: MessageEvent<{ fs: string; strategy: string; requestId: number; ramoId?: string }>) => {
	const { fs, strategy, requestId, ramoId } = e.data;
	await ready;
	try {
		const result = solve(fs, {
			strategy,
			montecarlo_n: 2000,
			default_domain_lo: 0.0,
			default_domain_hi: 100.0
		});
		self.postMessage({ requestId, result, ramoId });
	} catch (err) {
		self.postMessage({ requestId, error: err instanceof Error ? err.message : 'Error al resolver', ramoId });
	}
};
