// A mock of the Extensions API members the page calls (TAB-T-07), served in place of the vendored
// library. A test sets window.__tableau = { fields, columns, rows, settings, dialogAnswer } first.
(() => {
  const state = window.__tableau;
  const listeners = {};
  const calls = (window.__tableauCalls = []);
  const settings = { ...(state.settings ?? {}) };
  const worksheet = {
    async getVisualSpecificationAsync() {
      return { activeMarksSpecificationIndex: 0, marksSpecifications: [{ encodings: Object.entries(state.fields).flatMap(([id, names]) => names.map((name) => ({ id, field: { name } }))) }] };
    },
    async getSummaryDataReaderAsync() {
      const columns = state.columns.map((fieldName, index) => ({ fieldName, index }));
      return { pageCount: 1, async getPageAsync() { return { columns, data: state.rows.map((r) => r.map((v) => ({ value: v, nativeValue: v }))) }; }, async releaseAsync() {} };
    },
    addEventListener(type, handler) { (listeners[type] ??= []).push(handler); return () => true; },
    async selectMarksByValueAsync(selections, type) { calls.push({ select: selections, type }); },
  };
  window.__fire = (type) => (listeners[type] ?? []).forEach((h) => h());
  window.tableau = {
    TableauEventType: { SummaryDataChanged: 'summary-data-changed', SettingsChanged: 'settings-changed' },
    SelectionUpdateType: { Replace: 'select-replace' },
    extensions: {
      async initializeAsync(context) { window.__configure = context?.configure; },
      async initializeDialogAsync() { return state.dialogPayload ?? '{}'; },
      worksheetContent: { worksheet },
      environment: { locale: 'en-US' },
      settings: { get: (k) => settings[k], set: (k, v) => { settings[k] = v; }, async saveAsync() { calls.push({ saved: { ...settings } }); } },
      ui: {
        async displayDialogAsync(url, payload) { calls.push({ dialog: url, payload }); return state.dialogAnswer ?? payload; },
        closeDialog(payload) { calls.push({ closed: payload }); },
      },
    },
  };
})();
