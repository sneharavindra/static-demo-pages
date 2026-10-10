'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const load = path => fs.existsSync(require('node:path').join(__dirname, path)) ? require(path) : {};
const C = load('../webmcp/consumer.js');
const D = load('../webmcp/demo.js');
const host = () => ({ document: {}, navigator: {}, location: { origin: 'http://localhost:4173' } });
const tool = (execute = () => 'done') => ({ name: 'probe', description: 'Run probe', inputSchema: { type: 'object', properties: {} }, execute });

test('native-only is default; shim requires explicit selection and never replaces APIs', () => {
  assert.equal(typeof C.select, 'function');
  const w = host();
  assert.equal(C.select(w).mode, 'unavailable');
  assert.equal(w.document.modelContext, undefined);
  const partial = { registerTool() {} };
  w.document.modelContext = partial;
  w.navigator.modelContext = { registerTool() {}, getTools() {}, executeTool() {} };
  assert.equal(C.select(w).mode, 'unavailable');
  assert.match(C.select(w, 'shim').message, /conflict/i);
  assert.equal(w.document.modelContext, partial);
  delete w.document.modelContext;
  assert.equal(C.select(w).api, w.navigator.modelContext);
  assert.equal(C.select(w, 'shim').mode, 'unavailable');
  const empty = host();
  const selected = C.select(empty, 'shim');
  assert.equal(selected.mode, 'DEMO SHIM');
  assert.equal(empty.document.modelContext, selected.api);
  assert.equal(C.select(empty).mode, 'unavailable');
});

test('shim executes only exact current RegisteredTool with matching provenance and object input', async () => {
  assert.equal(typeof C.select, 'function');
  const w = host(), api = C.select(w, 'shim').api;
  api.registerTool(tool());
  const [registered] = await api.getTools();
  assert.equal(registered.window, w);
  assert.equal(registered.origin, w.location.origin);
  assert.equal(await api.executeTool(registered, {}, {}), 'done');
  await assert.rejects(api.executeTool({ ...registered }, {}, {}), /identity|stale/i);
  await assert.rejects(api.executeTool(registered, 'bad', {}), /object/i);
  w.location.origin = 'https://elsewhere.example';
  await assert.rejects(api.executeTool(registered, {}, {}), /origin|provenance/i);
});

test('shim emits changes, unregisters via signal, rejects stale and aborted execution', async () => {
  assert.equal(typeof C.select, 'function');
  const api = C.select(host(), 'shim').api;
  let changes = 0, calls = 0;
  api.addEventListener('toolchange', () => changes++);
  const lifetime = new AbortController();
  api.registerTool(tool(() => { calls++; }), { signal: lifetime.signal });
  const [old] = await api.getTools();
  const cancelled = new AbortController(); cancelled.abort();
  await assert.rejects(api.executeTool(old, {}, { signal: cancelled.signal }), /abort/i);
  assert.equal(calls, 0);
  lifetime.abort();
  api.registerTool(tool());
  await assert.rejects(api.executeTool(old, {}, {}), /stale|identity/i);
  api.unregisterTool('probe');
  assert.deepEqual(await api.getTools(), []);
  assert.equal(changes, 4);
  api.registerTool(tool(), { signal: cancelled.signal });
  assert.deepEqual(await api.getTools(), []);
});

test('shim rejects an execution aborted while awaiting a callback', async () => {
  assert.equal(typeof C.select, 'function');
  const api = C.select(host(), 'shim').api;
  let finish;
  api.registerTool(tool(() => new Promise(resolve => { finish = resolve; })));
  const [registered] = await api.getTools();
  const controller = new AbortController();
  const pending = api.executeTool(registered, {}, { signal: controller.signal });
  controller.abort(); finish('late');
  await assert.rejects(pending, /abort/i);
});

test('site manual and tool actions share search, navigation, application, and route tool refresh', async () => {
  assert.equal(typeof D.createSite, 'function');
  const api = C.select(host(), 'shim').api;
  let rendered, hash;
  const site = D.createSite({ render: value => { rendered = value; }, navigate: value => { hash = value; } });
  await site.attach(api);
  site.search({ query: 'savings' });
  assert.deepEqual(rendered.results.map(p => p.id), ['savings']);
  let tools = await api.getTools();
  await api.executeTool(tools.find(t => t.name === 'search_accounts'), { query: 'current' });
  assert.deepEqual(rendered.results.map(p => p.id), ['current']);
  await api.executeTool(tools.find(t => t.name === 'open_account'), { id: 'fixed-term' });
  assert.equal(hash, '#account/fixed-term');
  assert.equal(rendered.product.id, 'fixed-term');
  tools = await api.getTools();
  const read = tools.find(t => t.name === 'read_account_details');
  assert.equal((await api.executeTool(read, {})).id, 'fixed-term');
  await api.executeTool(tools.find(t => t.name === 'show_application'), { id: 'savings' });
  assert.equal(hash, '#apply/savings');
  assert.equal(rendered.application, true);
  assert.equal(rendered.product.id, 'savings');
  assert.ok(!(await api.getTools()).some(t => t.name === 'read_account_details'));
  await assert.rejects(api.executeTool(read, {}), /stale|identity/i);
  site.route('#account/current');
  assert.equal(rendered.product.id, 'current');
  site.route('#bad');
  assert.equal(rendered.route, '#accounts');
  site.dispose();
  assert.deepEqual(await api.getTools(), []);
});

test('inline bounded schemas and actual action validation reject malformed input', async () => {
  assert.equal(typeof D.createSite, 'function');
  const api = C.select(host(), 'shim').api;
  const site = D.createSite({ render() {}, navigate() {} }); await site.attach(api);
  for (const entry of await api.getTools()) {
    assert.equal(entry.inputSchema.type, 'object');
    assert.equal(entry.inputSchema.additionalProperties, false);
    assert.doesNotMatch(JSON.stringify(entry.inputSchema), /\$schema|\$ref/);
    assert.ok(entry.description.length > 20);
  }
  const entries = await api.getTools();
  assert.deepEqual(entries.find(t => t.name === 'open_account').inputSchema.properties.id.enum, ['savings', 'current', 'fixed-term']);
  assert.equal(entries[0].inputSchema.properties.query.maxLength, 80);
  assert.throws(() => site.search({ query: 'x'.repeat(81) }), /query/i);
  assert.throws(() => site.search({ query: 3 }), /query/i);
  assert.throws(() => site.open({ id: 'unknown' }), /id/i);
  assert.throws(() => site.apply({ id: 'savings', extra: true }), /input/i);
});

test('widget origins permit HTTPS or HTTP loopback only, without URL extras', () => {
  assert.equal(typeof D.validateOrigin, 'function');
  for (const value of ['https://www.talkyform.com', 'https://preview.example:444', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000']) assert.equal(D.validateOrigin(value), value);
  for (const value of ['http://example.com', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?x', 'https://example.com#x', '//example.com', 'javascript:alert(1)', 'https://example.com/', 'https://example.com?', 'https://example.com#']) assert.throws(() => D.validateOrigin(value), /origin/i, value);
});

test('diagnostics uses adapter snapshot and always disposes, including late permission errors', async () => {
  assert.equal(typeof D.acceptedTools, 'function');
  assert.match((await D.acceptedTools(null, '/f/demo')).status, /not ready/i);
  let disposed = 0, endpoint;
  const adapter = { connect(value) { endpoint = value; return { async snapshot() { return { tools: [{ name: 'search_accounts' }] }; }, dispose() { disposed++; } }; } };
  assert.deepEqual((await D.acceptedTools(adapter, '/f/demo')).names, ['search_accounts']);
  assert.equal(endpoint, '/f/demo'); assert.equal(disposed, 1);
  adapter.connect = () => ({ async snapshot() { throw new Error('private permission details'); }, dispose() { disposed++; } });
  const failed = await D.acceptedTools(adapter, '/f/demo');
  assert.deepEqual(failed.names, []); assert.match(failed.status, /unavailable/i);
  assert.doesNotMatch(failed.status, /private/); assert.equal(disposed, 2);
});

// Narrow DOM boundary for the actual browser scripts; no network, layout or widget simulation.
function page(search = '?mode=shim', native) {
  const vm = require('node:vm');
  const nodes = new Map();
  function element() {
    return Object.assign(new EventTarget(), { value: '', textContent: '', dataset: {}, children: [], disabled: false,
      append(...items) { this.children.push(...items); }, replaceChildren() { this.children = []; }, reportValidity() { return true; }
    });
  }
  const html = fs.readFileSync(require('node:path').join(__dirname, '../webmcp/index.html'), 'utf8');
  for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) nodes.set(id, element());
  const win = Object.assign(new EventTarget(), { navigator: {}, location: { search, hash: '', pathname: '/webmcp/', origin: 'http://localhost:4173', protocol: 'http:' }, document: { head: element(), getElementById: id => nodes.get(id), createElement: element } });
  if (native) win.document.modelContext = native;
  nodes.get('application').reset = () => { nodes.get('first-name').value = ''; nodes.get('email').value = ''; };
  const context = vm.createContext({ window: win, EventTarget, Event, AbortController, DOMException, URL, URLSearchParams });
  for (const file of ['consumer.js', 'demo.js']) vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../webmcp', file), 'utf8'), context);
  return { win, get: id => nodes.get(id), click: id => nodes.get(id).dispatchEvent(new Event('click')) };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

// Native-shaped API: registration completes later and honors its lifetime signal.
function nativeDouble() {
  const api = C.select(host(), 'shim').api, register = api.registerTool;
  const pending = [];
  api.registerTool = (tool, options) => new Promise((resolve, reject) => {
    pending.push({ name: tool.name, signal: options.signal, reject,
      finish() { register(tool, options); resolve(); } });
  });
  return { api, pending, finish() { pending.splice(0).forEach(p => p.finish()); } };
}

test('open_account waits for native route registration before the execution snapshot', async () => {
  const n = nativeDouble(), notices = [], navigations = [];
  let rendered;
  const site = D.createSite({ render(value) { rendered = value; }, navigate(hash) { navigations.push(hash); }, log(...notice) { notices.push(notice); } });
  const attached = site.attach(n.api); n.finish(); await attached;
  const open = (await n.api.getTools()).find(t => t.name === 'open_account');
  let settled = false;
  const execution = n.api.executeTool(open, { id: 'savings' });
  execution.then(() => { settled = true; }, () => { settled = true; });
  await flush();
  assert.equal(rendered.route, '#account/savings');
  assert.deepEqual(navigations, ['#account/savings']);
  assert.equal(settled, false);
  assert.deepEqual(notices, []);
  assert.ok(!(await n.api.getTools()).some(t => t.name === 'read_account_details'));
  n.finish();
  assert.equal((await execution).id, 'savings');
  const snapshot = await n.api.getTools();
  assert.equal(snapshot.length, 4);
  assert.equal((await n.api.executeTool(snapshot.find(t => t.name === 'read_account_details'), {})).id, 'savings');
  assert.deepEqual(notices[0], ['open_account', 'completed']);
  assert.equal(navigations.length, 1);
});

test('open_account rejects failed native registration without completion or replay', async () => {
  const n = nativeDouble(), notices = [], navigations = [];
  let rendered;
  const site = D.createSite({ render(value) { rendered = value; }, navigate(hash) { navigations.push(hash); }, log(...notice) { notices.push(notice); } });
  const attached = site.attach(n.api); n.finish(); await attached;
  const open = (await n.api.getTools()).find(t => t.name === 'open_account');
  const execution = n.api.executeTool(open, { id: 'savings' });
  const rejected = assert.rejects(execution, /registration.*(failed|superseded)/i);
  n.pending.shift().reject(new Error('native denial'));
  await rejected;
  assert.deepEqual(notices, [['open_account', 'not completed']]);
  assert.equal(rendered.route, '#account/savings');
  assert.deepEqual(navigations, ['#account/savings']);
  assert.equal(site.registration, 'failed');
  n.finish();
  assert.deepEqual(await n.api.getTools(), []);
});

test('open_account rejects a fast superseding route rather than adopting its readiness', async () => {
  const n = nativeDouble(), notices = [], navigations = [];
  let rendered;
  const site = D.createSite({ render(value) { rendered = value; }, navigate(hash) { navigations.push(hash); }, log(...notice) { notices.push(notice); } });
  const attached = site.attach(n.api); n.finish(); await attached;
  const open = (await n.api.getTools()).find(t => t.name === 'open_account');
  const execution = n.api.executeTool(open, { id: 'savings' });
  const rejected = assert.rejects(execution, /registration.*superseded/i);
  const stale = n.pending.shift();
  // Supersede in the same turn, before the execution callback can resume.
  site.apply({ id: 'current' });
  assert.equal(rendered.route, '#apply/current');
  assert.equal(stale.signal.aborted, true);
  assert.equal(await site.ready, true);
  stale.finish();
  await rejected;
  assert.deepEqual(notices, [['open_account', 'not completed']]);
  assert.deepEqual(navigations, ['#account/savings', '#apply/current']);
  assert.equal(site.registration, 'ready');
  assert.deepEqual((await n.api.getTools()).map(t => t.name).sort(), ['open_account', 'search_accounts', 'show_application']);
});

test('native attach is awaitable and Connect waits for every registration', async () => {
  const n = nativeDouble();
  const site = D.createSite({ render() {}, navigate() {} });
  const attached = site.attach(n.api);
  assert.equal(typeof attached?.then, 'function');
  assert.equal(site.registration, 'pending');
  n.pending.shift().finish(); await flush();
  assert.equal(site.registration, 'pending');
  n.finish(); assert.equal(await attached, true);
  assert.equal(site.registration, 'ready');
  const browser = nativeDouble(), p = page('', browser.api);
  p.get('trust').checked = true; p.click('connect');
  assert.equal(p.win.document.head.children.length, 0);
  assert.match(p.get('connection-status').textContent, /registration|ready/i);
  browser.pending.shift().finish(); await flush();
  assert.equal(p.get('connect').disabled, true);
  browser.finish(); await flush();
  assert.equal(p.get('connect').disabled, false);
  p.click('connect'); assert.equal(p.win.document.head.children.length, 1);
});

test('rejected native registration cleans up siblings and reports failure without unhandled rejection', async () => {
  const n = nativeDouble(), p = page('', n.api);
  n.pending.shift().finish();
  n.pending.shift().reject(new Error('private denial'));
  await flush();
  assert.equal((await n.api.getTools()).length, 0);
  assert.ok(n.pending.every(p => p.signal.aborted));
  n.finish(); await flush();
  assert.equal((await n.api.getTools()).length, 0);
  assert.match(p.get('consumer-status').textContent, /registration.*(failed|unavailable)/i);
  assert.doesNotMatch(p.get('consumer-status').textContent, /private denial/);
  assert.equal(p.get('connect').disabled, true);
  p.get('trust').checked = true; p.click('connect');
  assert.equal(p.win.document.head.children.length, 0);
});

for (const asynchronous of [false, true]) test(`route registration failure keeps manual state/render/hash coherent (${asynchronous ? 'async' : 'sync'})`, async () => {
  const api = C.select(host(), 'shim').api, register = api.registerTool;
  const p = page('', api); await flush();
  api.registerTool = (tool, options) => {
    if (tool.name !== 'read_account_details') return register(tool, options);
    if (asynchronous) return Promise.reject(new Error('denied'));
    throw new Error('denied');
  };
  p.get('results').children[0].children[2].dispatchEvent(new Event('click'));
  await flush();
  assert.equal(p.win.location.hash, '#account/savings');
  assert.equal(p.get('route').textContent, '#account/savings');
  assert.equal(p.get('detail-title').textContent, 'Private Savings');
  assert.equal(p.get('detail-panel').hidden, false);
  assert.match(p.get('consumer-status').textContent, /registration.*(failed|unavailable)/i);
  assert.equal(p.get('connect').disabled, true);
  assert.equal((await api.getTools()).length, 0);
  p.click('browse'); await flush();
  assert.equal(p.win.location.hash, '#accounts');
  assert.equal(p.get('results-panel').hidden, false);
});

test('persisted pageshow restores locked page tools and diagnostics without duplicates', async () => {
  const n = nativeDouble(), p = page('', n.api); n.finish(); await flush();
  p.get('results').children[0].children[2].dispatchEvent(new Event('click'));
  n.finish(); await flush();
  p.get('trust').checked = true; p.click('connect');
  assert.equal(p.win.document.head.children.length, 1);
  p.win.dispatchEvent(new Event('pagehide')); await flush();
  assert.equal((await n.api.getTools()).length, 0);
  const restore = () => p.win.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  restore(); restore(); n.finish(); await flush();
  const names = (await n.api.getTools()).map(t => t.name);
  assert.equal(names.length, 4); assert.equal(new Set(names).size, 4);
  assert.match(p.get('registered').textContent, /read_account_details/);
  assert.equal(p.get('connection-fields').disabled, true);
  assert.equal(p.win.document.head.children.length, 1);
});

test('superseded attach and route registrations abort pending signals and cannot leak tools', async () => {
  const old = nativeDouble(), current = nativeDouble();
  const site = D.createSite({ render() {}, navigate() {} });
  const first = site.attach(old.api);
  const second = site.attach(current.api);
  assert.ok(old.pending.every(p => p.signal.aborted));
  old.pending.shift().reject(new Error('late rejection')); old.finish();
  current.finish(); await second; await first;
  assert.equal(site.registration, 'ready');
  site.open({ id: 'savings' }); const stale = current.pending.shift();
  site.open({ id: 'current' });
  assert.equal(stale.signal.aborted, true);
  stale.reject(new Error('late detail rejection')); current.finish(); await site.ready;
  assert.equal(site.registration, 'ready');
  assert.equal((await old.api.getTools()).length, 0);
  const tools = await current.api.getTools();
  assert.equal(tools.length, 4);
  assert.equal((await current.api.executeTool(tools.find(t => t.name === 'read_account_details'), {})).id, 'current');
  site.open({ id: 'savings' }); const abandoned = current.pending.shift();
  site.apply({ id: 'current' }); abandoned.finish(); await site.ready;
  assert.equal((await current.api.getTools()).length, 3);
});

test('rapid browser mode changes abort old native registrations and preserve current status', async () => {
  const n = nativeDouble(), p = page('', n.api);
  p.get('mode').value = 'shim'; p.get('mode').dispatchEvent(new Event('change'));
  assert.ok(n.pending.every(p => p.signal.aborted));
  p.get('mode').value = 'native'; p.get('mode').dispatchEvent(new Event('change'));
  const stale = n.pending.splice(0, 3); stale[0].reject(new Error('old mode')); stale.slice(1).forEach(p => p.finish());
  n.finish(); await flush();
  assert.equal((await n.api.getTools()).length, 3);
  assert.equal(p.get('consumer-mode').textContent, 'Native');
  assert.equal(p.get('connect').disabled, false);
});

test('own hashchange preserves synthetic form entries; real route changes reset them', async () => {
  const p = page(); await flush();
  const tools = await p.win.document.modelContext.getTools();
  await p.win.document.modelContext.executeTool(tools.find(t => t.name === 'show_application'), { id: 'savings' });
  p.get('first-name').value = 'Synthetic';
  p.win.dispatchEvent(new Event('hashchange'));
  assert.equal(p.get('first-name').value, 'Synthetic');
  p.win.location.hash = '#apply/current'; p.win.dispatchEvent(new Event('hashchange'));
  assert.equal(p.get('first-name').value, '');
  assert.equal(p.get('account-name').value, 'Premier Current');
});

test('URL prefills never connect; trust gates loading; script errors stay visible and config locks', async () => {
  const p = page('?mode=shim&origin=http%3A%2F%2Flocalhost%3A3000&form=public_demo'); await flush();
  assert.equal(p.win.document.head.children.length, 0);
  assert.equal(p.get('launch').disabled, true);
  p.click('connect'); assert.match(p.get('connection-status').textContent, /trust/i);
  assert.equal(p.win.document.head.children.length, 0);
  p.get('trust').checked = true; p.click('connect');
  const [script] = p.win.document.head.children;
  assert.equal(script.src, 'http://localhost:3000/talkyform-avatar.js');
  assert.equal(script.dataset.talkyformId, 'public_demo');
  assert.equal(p.get('connection-fields').disabled, true);
  assert.equal((await p.win.document.modelContext.getTools()).length, 3);
  script.onerror(); assert.match(p.get('connection-status').textContent, /failed/i);
  p.click('connect'); assert.equal(p.win.document.head.children.length, 1);
});

test('late native discovery errors display unavailable; delayed adapter needs explicit refresh', async () => {
  const denied = page('', { registerTool() {}, getTools: async () => { throw new Error('denied'); }, executeTool() {} });
  await flush(); assert.equal(denied.get('consumer-mode').textContent, 'unavailable');
  assert.match(denied.get('registered').textContent, /permission/i);
  const p = page(); await flush(); p.get('trust').checked = true; p.click('connect');
  p.win.document.head.children[0].onload(); await flush();
  assert.equal(p.get('launch').disabled, true);
  assert.match(p.get('adapter-status').textContent, /not ready/i);
  p.win.TalkyFormAvatar = {};
  p.win.TalkyFormWebMCP = { connect: () => ({ snapshot: async () => ({ tools: [{ name: 'search_accounts' }] }), dispose() {} }) };
  p.click('refresh'); await flush();
  assert.equal(p.get('launch').disabled, false);
  assert.equal(p.get('accepted').textContent, 'search_accounts');
  assert.match(p.get('connection-status').textContent, /unverified/i);
});
