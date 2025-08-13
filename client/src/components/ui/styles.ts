// Centralized UI class tokens to keep look-and-feel consistent

// Design (form) vs Style (color)
// Form tokens (shape/spacing/typography) should not include color
export const INPUT_FORM = 'mt-1 w-full rounded-lg p-2 focus:outline-none';
export const SELECT_FORM = INPUT_FORM;
export const CHECKBOX_WRAPPER = 'inline-grid place-items-center h-[var(--checkbox-hit)] w-[var(--checkbox-hit)] rounded-xl border border-[var(--control-outline-soft)] bg-[var(--control-bg-soft)] shadow-sm align-middle transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--focus-ring)] focus-within:ring-offset-2 focus-within:ring-offset-transparent';
export const CHECKBOX_FORM = 'h-[var(--checkbox-size)] w-[var(--checkbox-size)]';
export const CARD_FORM = 'rounded-2xl p-6';
export const CARD_BODY = 'p-3 flex flex-col';

// Style tokens reference CSS variables (themeable)
export const INPUT_STYLE = 'bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--control-text)] focus:ring-2 focus:ring-[var(--accent)]';
export const SELECT_STYLE = INPUT_STYLE;
export const CHECKBOX_STYLE = 'accent-[var(--accent)]';
export const CARD_STYLE_NEUTRAL = 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-color)]';
export const FIELD_CONTAINER_BASE = 'w-full rounded-lg border p-3';
export const FIELD_CONTAINER_BG_NORMAL = 'bg-[var(--control-bg)] border-[var(--control-border)]';
export const FIELD_CONTAINER_BG_LIMIT = 'bg-[var(--control-bg)] border-[var(--border-default)]';
export const FIELD_CONTAINER_BG_BLOCKING = 'bg-[var(--error-bg)] border-[var(--error-border)]';
export const FIELD_CONTAINER_BG_WARNING = 'bg-[var(--notice-warning-bg)] border-[var(--notice-warning-border)]';

// Slider
export const SLIDER_ROOT_BASE = 'group relative flex w-full items-center select-none touch-none';
export const SLIDER_FIELD_STACK = 'space-y-2';
export const SLIDER_TRACK_BASE = 'relative w-full grow rounded-full bg-[var(--slider-track)] h-[var(--slider-track-h)]';
export const SLIDER_RANGE_BASE = 'absolute rounded-full bg-[var(--slider-range)] h-[var(--slider-track-h)] transition-colors';
export const SLIDER_THUMB_BASE = 'block rounded-full bg-[var(--slider-thumb-bg)] shadow-md ring-1 ring-[var(--slider-thumb-ring)] h-[var(--slider-thumb)] w-[var(--slider-thumb)] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--slider-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-105 active:scale-95';
// Tick marks
export const SLIDER_TICK_BASE = 'absolute top-1/2 -translate-y-1/2 w-px h-2 bg-[var(--slider-tick)]';

// Slider density presets (set CSS variables)
export const SLIDER_DENSITY_SM = '[--slider-thumb:0.75rem] [--slider-track-h:0.25rem]';
export const SLIDER_DENSITY_MD = '[--slider-thumb:1rem] [--slider-track-h:0.375rem]';
export const SLIDER_DENSITY_LG = '[--slider-thumb:1.25rem] [--slider-track-h:0.5rem]';

// Radio / Segmented controls
export const RADIO_LABEL_BASE = 'inline-flex items-center gap-2 cursor-pointer select-none';
export const RADIO_DOT_BASE = 'h-4 w-4 rounded-full border border-[var(--control-border)] grid place-items-center';
export const RADIO_DOT_INNER = 'h-2.5 w-2.5 rounded-full bg-[var(--accent)]';
export const SEGMENT_GROUP_BASE = 'inline-flex rounded-md overflow-hidden border border-[var(--control-border)] bg-[var(--control-bg)]';
export const SEGMENT_BASE = 'px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';
export const SEGMENT_ACTIVE = 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]';

// App/page scaffolding tokens
export const APP_BACKGROUND = 'min-h-screen bg-gradient-to-b from-[var(--bg-from)] to-[var(--bg-to)] text-[var(--text-color)]';
export const PAGE_CONTAINER = 'max-w-7xl mx-auto p-6';
export const SECTION_STACK = 'space-y-6';
export const CARD_BASE = `${CARD_FORM} border`;
export const CARD_NEUTRAL = CARD_STYLE_NEUTRAL;
export const CARD_ERROR = 'bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]';
export const CARD_WARNING = 'bg-[var(--notice-warning-bg)] border-[var(--notice-warning-border)] text-[var(--notice-warning-text)]';
export const CARD_SUCCESS = 'bg-[var(--notice-success-bg)] border-[var(--notice-success-border)] text-[var(--notice-success-text)]';
export const CARD_INFO = 'bg-[var(--notice-info-bg)] border-[var(--notice-info-border)] text-[var(--notice-info-text)]';
export const TITLE_H1 = 'text-2xl font-semibold tracking-tight';
export const TITLE_H2 = 'text-xl font-semibold';
export const TEXT_SM = 'text-sm';
export const TEXT_XS_MUTED = 'text-xs text-[var(--text-muted)]';
export const TEXT_XS = 'text-xs';
export const TEXT_MUTED = 'text-[var(--text-muted)]';
export const FORM_LABEL = 'block text-sm font-medium text-[var(--text-muted)]';
export const FORM_HELP = 'text-xs text-[var(--text-muted)]';

// Links/badges
export const LINK_HOVER_ACCENT = 'hover:text-[var(--accent)]';
export const BADGE_ACCENT = 'px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30';
export const BADGE_NEUTRAL = 'px-2 py-0.5 rounded bg-[var(--control-bg)] text-[var(--text-color)] border border-[var(--control-border)]';
export const BADGE_SELECTED = 'text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)]';
export const BADGE_SHAPE_XS = 'text-xs px-2 py-0.5 rounded';
export const BADGE_COUNT = 'text-xs px-2 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--control-text)]';

// Panel (alias to card for now)
export const PANEL_BASE = CARD_BASE;
export const PANEL_NEUTRAL = CARD_NEUTRAL;

// Layout tokens
export const GRID_AUTOFILL = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';
export const GRID_AUTOFILL_4 = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';
export const GRID_TWO_GAP3 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
export const GRID_TWO_GAP4 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
export const GRID_THREE_GAP4 = 'grid grid-cols-1 sm:grid-cols-3 gap-4';
export const GRID_LG_TWO_GAP6 = 'grid grid-cols-1 lg:grid-cols-2 gap-6';

// Common rows and dividers
export const ROW_BETWEEN = 'flex items-center justify-between';
export const ROW_END = 'flex justify-end';
export const ACTION_ROW = 'flex gap-2';
export const DIVIDER_T = 'pt-3 border-t border-[var(--border-default)]';

// Loading states
export const LOADING_TEXT_SM = 'text-sm text-[var(--text-muted)]';
export const TEXT_2XS_MUTED = 'text-[10px] text-[var(--text-muted)]';
export const INLINE_LABEL_MUTED_XS = 'inline-flex items-center gap-2 text-xs text-[var(--text-muted)]';

// Inline chips rows
export const INLINE_CHIPS_ROW = 'flex flex-wrap gap-2 text-xs';

// Section titles
export const SECTION_TITLE = 'mb-2 text-lg font-semibold text-[var(--text-color)]';

// Page stack (legacy alias; prefer PAGE_CONTAINER + SECTION_STACK)
export const PAGE_STACK = 'max-w-6xl mx-auto px-3 md:px-4 py-4 space-y-4';

// Prebuilt card wrapper with padding + spacing
export const CARD_PADDED = `${CARD_BASE} ${CARD_NEUTRAL} p-4 space-y-4`;
export const CARD_PADDED_SM = `${CARD_BASE} ${CARD_NEUTRAL} p-3`;

// Common vertical rhythm stack
export const STACK_Y = 'space-y-4';

// Glassmorphism tokens
export const GLASS_PANEL = 'rounded-3xl border border-[var(--control-border)] bg-[color-mix(in_oklab,var(--card-bg),white_6%)]/80 backdrop-blur-md shadow-xl';
export const GLASS_CARD_SM = 'rounded-xl border border-[var(--control-border)] bg-[color-mix(in_oklab,var(--card-bg),white_6%)]/70 backdrop-blur';
export const AURA_ACCENT = 'absolute inset-0 -z-10 rounded-3xl bg-[var(--accent)]/10 blur-2xl';
export const STICKY_TOP = 'sticky top-2 z-40';
export const BADGE_ICON = 'h-6 w-6 rounded-md grid place-items-center bg-[var(--control-bg)]/40 border border-[var(--border-default)]';
export const SPINNER_SM = 'h-6 w-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin';

// Collapsible (standardized)
export const COLLAPSE_TOGGLE = 'inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded px-1 py-0.5';
export const ICON_CHEVRON_SM = 'h-3 w-3 transition-transform';


