# Static bank demos

Independent, dependency-free static repository. The existing `index.html` bank form is preserved; the canonical WebMCP explorer is at `webmcp/index.html`.

## Run locally

From this repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/webmcp/>. No dependency installation or frontend build is needed. Use a modern browser and Node 20+ for tests.

```sh
node --test test/webmcp.test.js
node --check webmcp/consumer.js
node --check webmcp/demo.js
node --check test/webmcp.test.js
```

The tests exercise the actual consumer/site functions and browser entry scripts with narrow DOM boundary doubles. They do not simulate an LLM, validate browser layout, or prove live widget compatibility.

## Choose a consumer

- **Native only is the default.** Selection mirrors TalkyForm: `document.modelContext || navigator.modelContext`. The selected API must provide `registerTool`, `getTools`, and `executeTool`. A registration-only API is insufficient, even if a lower-priority API has consumer methods. Without these methods, **unavailable is expected**, not a reason to silently install anything.
- **DEMO SHIM requires explicit selection** (or `?mode=shim`). It is a demo-local simulated consumer, **not native WebMCP and not a model implementation**. It refuses to replace any preexisting modelContext API, including registration-only APIs. A browser with such an API may need a separate compatible profile or browser for the shim demo.
- The shim returns current RegisteredTool objects with exact window/origin provenance, checks object identity, rejects stale/aborted calls, emits `toolchange`, and supports unregister/AbortSignal cleanup. It is not a universal polyfill or a standalone security boundary. The actual widget owns the visitor's **Allow / Cancel** permission UI. The demo does not execute agent requests on its own.
- Base tools: `search_accounts`, `open_account`, `show_application`. Only a detail route (`#account/savings`, for example) registers `read_account_details`. Route-specific native registrations are replaced using AbortSignal. Manual buttons and tool callbacks use the same site actions.
- Registration supports synchronous shim returns and Promise-returning native APIs. Connect and launch stay disabled until all current registrations complete. `site.attach(api)` and `site.ready` resolve to a readiness boolean (false on failure or supersession); `site.registration` exposes pending/ready/failed/inactive status. Failures abort the current tools and show a generic diagnostic without breaking manual navigation. Mode/route changes abort superseded signals. Persisted `pageshow` restores tools after `pagehide` cleanup without reloading the widget or unlocking configuration. Native Promise behavior is covered by test doubles, not claimed as live-browser verification.

## Configure the widget

1. Start the **corrected Rails widget** on your local/preview endpoint. Use a version containing the companion runtime-instruction fix; changes to this static page alone cannot repair the Rails prompt.
2. In TalkyForm settings, allowlist the demo's host **including its port**, e.g. `127.0.0.1:4173`. If using `localhost:4173`, allowlist that exact host too.
3. Set **Widget script origin** to the corrected endpoint's origin, e.g. `http://127.0.0.1:3000` or an HTTPS preview origin. Set the public form ID to a form belonging to your test account. The page defaults to `https://www.talkyform.com` and public ID `g4UtyUR7fpzVFfxTQSNkqEie`; those defaults are not evidence that the deployment is ready.
4. Origins must be HTTPS, or HTTP loopback (`localhost`, `127.0.0.1`, `[::1]`) with optional port. Credentials, paths (including a trailing slash), queries and fragments are rejected. HTTPS GitHub Pages cannot load a plain HTTP backend for this demo: **serve the demo locally too**, or use an HTTPS preview backend.
5. Check the affirmative trust box. Loading that origin's script grants its code access to the page and page data. Then choose **Connect / load widget**. Tools are registered before the script is inserted. Connection settings lock once loading starts; use **Reload / reset configuration** to change them or retry a failure. Reset removes URL prefills but does not clear the widget's session token.
6. Click **Refresh diagnostics** if the avatar script has loaded but its asynchronously loaded adapter is not ready. No polling loop runs. Accepted tool names come from a real `TalkyFormWebMCP.connect(endpoint).snapshot()` followed by `dispose()`. Registration, script load, and accepted metadata do **not** establish that a model is connected.
7. Use the separate **Start Conversation** button. The demo never automatically launches a model. The widget itself may resume an existing session token after explicit Connect; use a fresh browser session when checking first-run behavior.

Optional local prefill example (still requires trust and Connect):

<http://127.0.0.1:4173/webmcp/?mode=shim&origin=http%3A%2F%2F127.0.0.1%3A3000&form=g4UtyUR7fpzVFfxTQSNkqEie>

**Never put provider keys in a URL, frontend code, public form ID, or browser storage.** Provider credentials belong on the Rails server. A real-model smoke test requires a configured server-side OpenRouter credential and available account quota.

## Privacy and billing

Use synthetic names and `example.test` email addresses only. All products and the bank are fictional. The site's own submit handler only displays a local confirmation and sends no request. **Conversation, discovered form context, and tool data can still go to TalkyForm and model providers.** Normal TalkyForm account quota is billed when launching. This page does not claim that nothing is transmitted. Diagnostic execution notices retain only the latest 20 public names/outcomes in memory, never tool arguments, user-entered fields or transcripts.

## Browser/model acceptance checklist

- Verify Native-only reports unavailable on a browser without the full consumer API. Explicitly select DEMO SHIM when appropriate; confirm its simulation label.
- Check configuration alone does not insert a widget script; Connect without affirmative trust fails visibly.
- Connect to the corrected endpoint and refresh diagnostics. Confirm the three base tool names appear under both registered and adapter-accepted lists. Launch separately.
- Ask to **search savings** → choose **Allow** → the visible result list changes. Compare against manual search.
- Request a different search → choose **Cancel** → results and route stay unchanged, with no site tool execution notice.
- Ask to open Private Savings → **Allow** → URL becomes `#account/savings`, account details appear, and `read_account_details` becomes available. Allow a read request.
- Ask to show its application → **Allow** → URL becomes `#apply/savings`, the real marked form appears, and the read tool disappears. Fill only synthetic first name/email (e.g. Alex / alex@example.test) through the widget's normal permission path or manually. Use the site's own **Confirm locally** submit and confirm the local notice.
- Use Back/Forward and manual controls; verify route tools refresh. Check script failure and adapter/permission errors remain visible; configuration stays locked until reset.
- Inspect at narrow width and keyboard-only. Record endpoint, consumer mode, browser version, accepted names, Allow/Cancel outcomes and screenshots without answer content.

Production smoke: after the Rails fix is deployed, serve this repo on GitHub Pages and open its `/webmcp/` route with the production widget origin <https://www.talkyform.com>. First allowlist that Pages host in TalkyForm. **Do not treat current production defaults as a verified smoke test.** The automated suite makes no model calls. The 21 Node tests pass. Local browser checks used the real widget and Rails endpoints with explicitly labelled provider fixtures, verifying confirmation/cancellation, search, SPA tool refresh, DOM filling and the site's own submit handler. A separate live-model API smoke test against the companion backend preview also passed: seven real model calls selected search, details navigation and application tools and handled results from these actual demo functions. That probe used a local shim harness, not the browser, and opened no voice/avatar sessions. A subsequent combined browser test also passed with the real preview model and no fixtures: search/Allow, Cancel/no effect, SPA details and newly available read tool, application fields, synthetic name/email fills, and the widget's Submit button reaching the site's local handler. It used 14 conversation turns via text resumption, cleared the resume credential and opened zero avatar sessions. Native browser interoperability and voice/avatar behavior remain separate acceptance checks; the consumer was the explicitly selected demo shim.

Scope: SPA hash navigation only. Full-reload conversation continuity is not implemented by this static demo; any session restoration belongs to the existing Rails widget.
