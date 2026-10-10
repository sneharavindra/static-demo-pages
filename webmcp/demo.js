(function (root) {
  'use strict';
  const products = Object.freeze([
    { id: 'savings', name: 'Private Savings', summary: 'Flexible savings for everyday reserves.', details: 'Fictional variable-rate savings account. Access funds at any time; no demo fees or real interest offers.' },
    { id: 'current', name: 'Premier Current', summary: 'A current account for everyday spending.', details: 'Fictional current account with everyday payments. No overdraft, payment service or real account is provided.' },
    { id: 'fixed-term', name: 'Fixed Term Deposit', summary: 'Set aside funds for a fixed term.', details: 'Fictional twelve-month deposit. Early access is restricted in this example; no real rate or deposit offer.' }
  ]);
  function validateOrigin(value) {
    try {
      if (typeof value !== 'string' || !/^https?:\/\/[^/?#\s\\]+$/.test(value)) throw 0;
      const url = new URL(value);
      if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) throw 0;
      return url.origin;
    } catch (_) { throw new Error('Enter an HTTPS origin or HTTP loopback origin only, without credentials, path, query or hash.'); }
  }
  function validate(input, key) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => k !== key)) throw new Error('Invalid input object');
    if (key === 'query' && (typeof input.query !== 'string' || input.query.length > 80)) throw new Error('query must be a string of at most 80 characters');
    if (key === 'id' && !products.some(p => p.id === input.id)) throw new Error('Unknown account id');
  }
  function createSite({ render, navigate, log = () => {}, changed = () => {} }) {
    let state = { route: '#accounts', results: products, product: null, application: false };
    let context, base, detail, generation = 0;
    let registration = 'inactive', ready = Promise.resolve(false), baseReady;
    const schema = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
    const idSchema = schema({ id: { type: 'string', enum: products.map(p => p.id) } });
    async function register(name, description, inputSchema, action, signal) {
      return context.registerTool({ name, description, inputSchema, async execute(input) {
        try {
          const result = action(input);
          // Actions are synchronous: capture this action's lifetime before yielding.
          const actionReady = ready, ticket = generation;
          const registered = await actionReady;
          if (!registered || ticket !== generation) throw new Error('Tool registration failed or was superseded. The action may already have applied; do not automatically retry.');
          log(name, 'completed'); return result;
        }
        catch (error) { log(name, 'not completed'); throw error; }
      } }, { signal });
    }
    function refreshRouteTool() {
      const ticket = ++generation;
      detail?.abort(); detail = null;
      if (!context) return ready;
      registration = 'pending';
      let routeReady;
      if (state.route.startsWith('#account/')) {
        detail = new AbortController();
        routeReady = register('read_account_details', 'Read the fictional account details currently displayed. Available only on an account detail route.', schema({}), input => {
          validate(input); return state.product;
        }, detail.signal);
      }
      // Both synchronous shim returns and native registration promises are supported.
      // Superseded completions must never change the current lifetime's status.
      ready = Promise.all([baseReady, routeReady]).then(() => {
        if (ticket !== generation) return false;
        registration = 'ready'; changed(); return true;
      }, () => {
        if (ticket !== generation) return false;
        site.dispose(); registration = 'failed'; changed(); return false;
      });
      changed();
      return ready;
    }
    function route(hash) {
      const match = /^#(account|apply)\/(savings|current|fixed-term)$/.exec(hash);
      state = { ...state, route: match ? hash : '#accounts', product: match ? products.find(p => p.id === match[2]) : null, application: match?.[1] === 'apply' };
      render(state); refreshRouteTool();
      return state.product || { count: state.results.length };
    }
    function go(kind, input) { validate(input, 'id'); const hash = '#' + kind + '/' + input.id; const result = route(hash); navigate(hash); return result; }
    const site = {
      search(input) {
        validate(input, 'query');
        const query = input.query.trim().toLowerCase();
        state = { ...state, results: products.filter(p => (p.name + ' ' + p.summary).toLowerCase().includes(query)) };
        route('#accounts'); navigate('#accounts');
        return state.results;
      },
      open: input => go('account', input),
      apply: input => go('apply', input),
      route,
      get registration() { return registration; },
      // Resolves true only for the current successful registration; never rejects.
      get ready() { return ready; },
      attach(api) {
        site.dispose(); context = api; base = new AbortController();
        baseReady = Promise.all([
          register('search_accounts', 'Search fictional bank accounts by keyword and show matching results on this page. Use an empty query to show all accounts.', schema({ query: { type: 'string', maxLength: 80 } }), site.search, base.signal),
          register('open_account', 'Open the selected fictional account detail page, changing the URL hash and making read_account_details available.', idSchema, site.open, base.signal),
          register('show_application', 'Show the selected account application form for synthetic first name and email. This does not submit an application.', idSchema, site.apply, base.signal)
        ]);
        return refreshRouteTool();
      },
      dispose() {
        ++generation;
        detail?.abort(); base?.abort(); detail = base = null; context = null;
        registration = 'inactive'; ready = Promise.resolve(false); changed();
      }
    };
    render(state);
    return site;
  }
  async function acceptedTools(adapter, endpoint) {
    if (!adapter?.connect) return { names: [], status: 'Adapter not ready — refresh diagnostics after loading.' };
    let connection;
    try {
      connection = adapter.connect(endpoint);
      const snapshot = await connection.snapshot();
      return { names: snapshot.tools.map(t => t.name), status: 'Adapter snapshot only; not evidence of a model connection.' };
    } catch (_) { return { names: [], status: 'Adapter unavailable or permission denied. No model connection verified.' }; }
    finally { connection?.dispose(); }
  }
  function boot(win) {
    const doc = win.document, $ = id => doc.getElementById(id);
    const params = new URLSearchParams(win.location.search);
    $('mode').value = params.get('mode') === 'shim' ? 'shim' : 'native';
    $('origin').value = params.get('origin') || 'https://www.talkyform.com';
    $('form-id').value = params.get('form') || 'g4UtyUR7fpzVFfxTQSNkqEie';
    let selection, endpoint, loaded = false, locked = false, revision = 0;
    const notices = [];
    const text = (id, value) => { $(id).textContent = value; };
    function log(name, outcome) {
      notices.unshift(name + ': ' + outcome); notices.length = Math.min(notices.length, 20);
      text('execution-log', notices.join('\n'));
    }
    function render(state) {
      text('route', state.route);
      $('results-panel').hidden = !!state.product;
      $('detail-panel').hidden = !state.product || state.application;
      $('application-panel').hidden = !state.application;
      $('results').replaceChildren();
      text('result-count', state.results.length + ' fictional accounts');
      for (const product of state.results) {
        const item = doc.createElement('li'), heading = doc.createElement('h3'), summary = doc.createElement('p'), button = doc.createElement('button');
        heading.textContent = product.name; summary.textContent = product.summary; button.textContent = 'View details';
        button.type = 'button'; button.addEventListener('click', () => site.open({ id: product.id }));
        item.append(heading, summary, button); $('results').append(item);
      }
      text('confirmation', '');
      if (state.product) {
        text('detail-title', state.product.name); text('detail-copy', state.product.details);
        $('apply').onclick = () => site.apply({ id: state.product.id });
        text('application-title', 'Apply for ' + state.product.name);
        $('account-name').value = state.product.name;
        // Replacing the visible form's values is site-owned; the widget discovers the real DOM.
        $('application').reset(); $('account-name').value = state.product.name;
      }
    }
    const site = createSite({ render, navigate: hash => { win.location.hash = hash; }, log, changed: () => { if (selection) void diagnostics(); } });
    async function diagnostics() {
      const ticket = ++revision;
      text('consumer-mode', selection?.mode || 'unavailable');
      const registrationStatus = {
        pending: 'Tool registration pending — connection disabled.',
        failed: 'Tool registration failed or permission denied. Choose a consumer again to retry.',
        inactive: 'Tool registration inactive.'
      }[site.registration];
      text('consumer-status', registrationStatus || selection?.message || 'Consumer unavailable.');
      if (!selection?.api) text('consumer-status', selection?.message || 'Consumer unavailable.');
      $('connect').disabled = locked || site.registration !== 'ready';
      $('launch').disabled = true;
      try {
        const tools = selection?.api ? await selection.api.getTools() : [];
        if (ticket !== revision) return;
        text('registered', tools.map(t => t.name).join(', ') || 'None');
      } catch (_) {
        if (ticket !== revision) return;
        text('registered', 'Unavailable — discovery or permission error.');
        text('consumer-mode', 'unavailable');
      }
      const accepted = endpoint ? await acceptedTools(win.TalkyFormWebMCP, endpoint) : { names: [], status: 'Widget not loaded.' };
      if (ticket !== revision) return;
      text('accepted', accepted.names.join(', ') || 'None'); text('adapter-status', accepted.status);
      // The avatar script loads its adapter asynchronously. Refresh is explicit, not a polling loop.
      $('launch').disabled = !(site.registration === 'ready' && loaded && win.TalkyFormAvatar && win.TalkyFormWebMCP);
    }
    function prepare() {
      site.dispose(); root.DemoConsumer.release(win);
      try {
        selection = root.DemoConsumer.select(win, $('mode').value);
        if (selection.api) site.attach(selection.api);
      } catch (_) { selection = { mode: 'unavailable', message: 'Tool registration unavailable or permission denied.', api: null }; }
      void diagnostics();
    }
    $('mode').addEventListener('change', prepare);
    $('search').addEventListener('submit', event => { event.preventDefault(); site.search({ query: $('query').value }); });
    $('browse').addEventListener('click', () => site.search({ query: '' }));
    win.addEventListener('hashchange', () => {
      if (win.location.hash !== $('route').textContent) site.route(win.location.hash);
    });
    win.addEventListener('pagehide', () => site.dispose());
    win.addEventListener('pageshow', event => {
      if (event.persisted && selection?.api) site.attach(selection.api);
    });
    $('application').addEventListener('submit', event => {
      event.preventDefault();
      if (!$('application').reportValidity()) return;
      text('confirmation', 'Demo application confirmed locally. No account was opened. The site submit handler sent no request.');
      log('site_submit', 'local confirmation');
    });
    $('connect').addEventListener('click', () => {
      if (locked) return;
      try {
        const origin = validateOrigin($('origin').value), id = $('form-id').value;
        if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw new Error('Enter a public form ID (1–100 letters, digits, underscores or hyphens).');
        if (!$('trust').checked) throw new Error('Confirm that you trust the script origin with this page’s data.');
        if (!selection?.api) throw new Error('Consumer unavailable. Choose a supported native consumer or explicitly select DEMO SHIM.');
        if (site.registration !== 'ready') throw new Error('Tool registration is not ready. Check consumer diagnostics before connecting.');
        if (win.location.protocol === 'https:' && origin.startsWith('http:')) throw new Error('Serve this demo locally too when using an HTTP widget origin.');
        endpoint = origin + '/f/' + encodeURIComponent(id);
        locked = true; $('connection-fields').disabled = true;
        const script = doc.createElement('script'); script.src = origin + '/talkyform-avatar.js'; script.dataset.talkyformId = id;
        script.onload = () => { loaded = true; text('connection-status', 'Widget script loaded; model connection unverified. Refresh diagnostics if the adapter is still loading.'); void diagnostics(); };
        script.onerror = () => { text('connection-status', 'Widget script failed to load. Reload/reset configuration to retry.'); log('widget_load', 'failed'); };
        text('connection-status', 'Loading trusted widget script… Existing widget sessions may resume after this explicit connection.');
        doc.head.append(script);
      } catch (error) { text('connection-status', error.message); }
    });
    $('refresh').addEventListener('click', () => { void diagnostics(); });
    $('reset').addEventListener('click', () => { win.location.href = win.location.pathname; });
    site.route(win.location.hash); prepare();
  }
  const api = { createSite, validateOrigin, acceptedTools, boot };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.BankDemo = api; boot(root); }
})(typeof window === 'object' ? window : globalThis);
