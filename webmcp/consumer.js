(function (root) {
  'use strict';
  const owned = new WeakMap();
  const unavailable = message => ({ mode: 'unavailable', api: null, message });
  function select(win, mode = 'native') {
    const candidate = win.document.modelContext || win.navigator?.modelContext;
    const ours = owned.get(win);
    if (mode === 'shim') {
      if (candidate && candidate === ours) return { mode: 'DEMO SHIM', api: ours, message: 'Simulated consumer — not native WebMCP or a model implementation.' };
      if ('modelContext' in win.document || 'modelContext' in (win.navigator || {})) return unavailable('DEMO SHIM conflict: an existing modelContext API will not be replaced.');
      const api = createShim(win);
      try { Object.defineProperty(win.document, 'modelContext', { value: api, configurable: true }); }
      catch (_) { return unavailable('DEMO SHIM unavailable: browser denied installation.'); }
      owned.set(win, api);
      return select(win, mode);
    }
    if (candidate && candidate !== ours && ['registerTool', 'getTools', 'executeTool'].every(key => typeof candidate[key] === 'function')) {
      return { mode: 'Native', api: candidate, message: 'Native consumer API available; this does not establish a model connection.' };
    }
    return unavailable('Native-only unavailable: requires registerTool, getTools and executeTool on the selected API. No shim was loaded.');
  }
  function release(win) {
    if (owned.get(win) && win.document.modelContext === owned.get(win)) delete win.document.modelContext;
    owned.delete(win);
  }
  function createShim(win) {
    const events = new EventTarget(), entries = new Map();
    const changed = () => events.dispatchEvent(new Event('toolchange'));
    const aborted = () => new DOMException('Execution aborted', 'AbortError');
    function remove(name) {
      const entry = entries.get(name);
      if (!entry) return;
      entry.signal?.removeEventListener('abort', entry.remove);
      entries.delete(name); changed();
    }
    function current(registered) {
      const entry = entries.get(registered?.name);
      if (!entry || entry.registered !== registered) throw new Error('Stale tool or invalid identity');
      if (registered.window !== win || registered.origin !== win.location.origin) throw new Error('Invalid window/origin provenance');
      return entry;
    }
    return {
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      registerTool(tool, { signal } = {}) {
        if (signal?.aborted) return;
        if (!tool || typeof tool.name !== 'string' || typeof tool.execute !== 'function') throw new Error('Invalid tool');
        if (entries.has(tool.name)) throw new Error('Tool already registered');
        const registered = Object.freeze({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema, window: win, origin: win.location.origin });
        const entry = { registered, execute: tool.execute, signal, remove: () => remove(tool.name) };
        entries.set(tool.name, entry);
        signal?.addEventListener('abort', entry.remove, { once: true }); changed();
      },
      unregisterTool: remove,
      getTools: async () => Array.from(entries.values(), entry => entry.registered),
      async executeTool(registered, input, { signal } = {}) {
        const entry = current(registered);
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Input must be an object');
        if (signal?.aborted) throw aborted();
        let cancel;
        const cancellation = new Promise((_, reject) => { cancel = () => reject(aborted()); });
        signal?.addEventListener('abort', cancel, { once: true });
        try {
          const result = await Promise.race([entry.execute(input, { signal }), cancellation]);
          if (signal?.aborted) throw aborted();
          current(registered);
          return result;
        } finally { signal?.removeEventListener('abort', cancel); }
      }
    };
  }
  const api = { select, release };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DemoConsumer = api;
})(typeof window === 'object' ? window : globalThis);
