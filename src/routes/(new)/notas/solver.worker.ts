import init, { solve } from '@ramo-libre/solver';

export interface SolverWorkerResult {
	feasible: boolean;
	plan: Map<string, number>;
	penalty: number;
	strategy: string;
	probability: number;
	effectiveness: number;
	montecarlo_samples: number;
	constraint_violations: string[];
	libertad: { label?: string; raw: string; slack: number; penalty: number }[];
	elapsed_ms: number;
}

export interface SolverWorkerRequest {
	fs: string;
	strategy: string;
	requestId: number;
	escenarioId?: string;
}

export type SolverWorkerMessage =
	| { hasError: false; requestId: number; escenarioId?: string; result: SolverWorkerResult }
	| { hasError: true; requestId: number; escenarioId?: string; error: string };

const ready = init();

self.onmessage = async (e: MessageEvent<SolverWorkerRequest>) => {
	const { fs, strategy, requestId, escenarioId } = e.data;

	try {
	    await ready;
		const jsResult = solve(fs, {
			strategy,
			montecarlo_n: 2000,
			default_domain_lo: 0.0,
			default_domain_hi: 100.0
		});

		// jsResult.plan y jsResult.libertad vienen tipados como `any` desde el
		// binding wasm-bindgen (ver JsSolverResult), así que los casteamos una
		// sola vez aquí a la forma real que produce serde-wasm-bindgen.
		const result: SolverWorkerResult = {
			feasible: jsResult.feasible,
			plan: jsResult.plan as Map<string, number>,
			penalty: jsResult.penalty,
			strategy: jsResult.strategy,
			probability: jsResult.probability,
			effectiveness: jsResult.effectiveness,
			montecarlo_samples: jsResult.montecarlo_samples,
			constraint_violations: jsResult.constraint_violations,
			libertad: jsResult.libertad as SolverWorkerResult['libertad'],
			elapsed_ms: jsResult.elapsed_ms
		};

		const message: SolverWorkerMessage = { hasError: false, requestId, escenarioId, result };
		self.postMessage(message);
	} catch (err) {
		const message: SolverWorkerMessage = {
			hasError: true,
			requestId,
			escenarioId,
			error: err instanceof Error ? err.message : 'Error al resolver'
		};
		self.postMessage(message);
	}
};
