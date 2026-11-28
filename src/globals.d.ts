// The two scripts the page loads from its own origin: the Extensions API library and silverpoint's
// standalone file. Only the members the page uses are declared (TAB-DD-03 records where they come from).
import type { TableBinding, VisualSpecification, DataPage } from './bind';

interface DataTableReader { readonly pageCount: number; getPageAsync(index: number): Promise<DataPage>; releaseAsync(): Promise<void> }
interface Worksheet {
  getVisualSpecificationAsync(): Promise<VisualSpecification>;
  getSummaryDataReaderAsync(pageRowCount?: number, options?: { ignoreSelection?: boolean }): Promise<DataTableReader>;
  addEventListener(type: string, handler: () => void): () => boolean;
  selectMarksByValueAsync(selections: { fieldName: string; value: unknown[] }[], updateType: string): Promise<void>;
}
interface TableauGlobal {
  extensions: {
    initializeAsync(context?: { configure?: () => void }): Promise<unknown>;
    initializeDialogAsync(): Promise<string>;
    worksheetContent: { worksheet: Worksheet };
    settings: { get(key: string): string | undefined; set(key: string, value: string): void; saveAsync(): Promise<unknown> };
    ui: { displayDialogAsync(url: string, payload: string, options: { width: number; height: number }): Promise<string>; closeDialog(payload: string): void };
    environment?: { locale?: string };
  };
  TableauEventType: { SummaryDataChanged: string; SettingsChanged: string };
  SelectionUpdateType: { Replace: string };
}
interface ChartMount { update(spec: unknown): void; destroy(): void }
interface SilverpointGlobal {
  readonly version: string;
  specFromTable(binding: TableBinding): { ok: true; value: Record<string, unknown> } | { ok: false; error: { kind: string } };
  specErrorMessage(error: { kind: string }): string;
  mount(target: Element, spec: unknown, options?: { onSelect?: (item: { datum: Record<string, unknown> }) => void; locale?: string }): ChartMount;
}

declare global {
  const tableau: TableauGlobal;
  const Silverpoint: SilverpointGlobal;
}
export {};
