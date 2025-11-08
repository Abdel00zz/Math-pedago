
// Lightweight helper to synchronize progress across tabs/clients.
// Minimal, low-risk implementation that will be used by the app where available.
// Exports a function `setupGlobalProgressSync` that callers can use to register
// a simple handler and receive a stop() cleanup function.

export type ProgressSyncHandler = (payload: any) => void;

export function setupGlobalProgressSync(handler?: ProgressSyncHandler) {
	// Use BroadcastChannel when available for cross-tab messaging; otherwise noop.
	let channel: BroadcastChannel | null = null;
	const listener = (ev: MessageEvent) => {
		try {
			handler?.(ev.data);
		} catch (err) {
			// swallow handler errors to avoid breaking callers
			// eslint-disable-next-line no-console
			console.error('progress sync handler error', err);
		}
	};

	if (typeof BroadcastChannel !== 'undefined') {
		try {
			channel = new BroadcastChannel('math-pedago-progress-sync');
			channel.addEventListener('message', listener as EventListener);
		} catch (err) {
			// ignore platform errors (some browsers/restrictions)
			// eslint-disable-next-line no-console
			console.warn('BroadcastChannel not available for progress sync', err);
			channel = null;
		}
	}

	// Return a callable cleanup function so callers that expect a function can call it.
	const cleanup = () => {
		if (channel) {
			try {
				channel.removeEventListener('message', listener as EventListener);
				channel.close();
			} catch (err) {
				// ignore
			}
			channel = null;
		}
	};

	// Attach a `post` helper to the function so callers can send messages if needed.
	(cleanup as any).post = (payload: any) => {
		try {
			if (channel) channel.postMessage(payload);
		} catch (err) {
			// ignore
		}
	};

	return cleanup as unknown as ((() => void) & { post?: (payload: any) => void });
}

export default setupGlobalProgressSync;
