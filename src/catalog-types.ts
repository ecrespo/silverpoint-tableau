// The slim host catalog the page and the dialog read (silverpoint Data Model §2.39, the parts used).
export interface CatalogRole {
  readonly id: string;
  readonly prop: string | null;
  readonly label: string;
  readonly kind: string;
  readonly dataType: string;
  readonly required: boolean;
  readonly multiple: boolean;
}
export interface CatalogOption {
  readonly name: string;
  readonly label: string;
  readonly doc: string;
  readonly kind: string;
  readonly values?: readonly string[];
  readonly default?: boolean | number | string;
}
export interface CatalogChart {
  readonly slug: string;
  readonly title: string;
  readonly roles: readonly CatalogRole[];
  readonly options: readonly CatalogOption[];
}
export interface CatalogAppearance {
  readonly grounds: readonly { readonly name: string; readonly label: string; readonly substrates: readonly { readonly name: string; readonly label: string }[] }[];
  readonly modes: readonly { readonly name: string; readonly label: string }[];
  readonly palettes: readonly { readonly name: string; readonly label: string }[];
}
