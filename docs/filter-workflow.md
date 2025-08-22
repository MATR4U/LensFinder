# Filter Workflow and Feature Reference

This document explains the LensFinder filtering experience and lists all available filter features. The user journey contains five stages, while the filtering itself happens in two steps: brand/capabilities selection first, followed by fine-tuning with sliders and advanced controls.

## Journey overview

1) Mode
2) Build and capabilities (Stage 1 of filter: brand/caps)
3) Requirements (Stage 2 of filter: sliders/advanced)
4) Compare
5) Report

See the stage configuration in client/src/lib/flowConfig.ts.

## Stage 1: Brand and capabilities

Purpose
- Select camera body and brand context.
- Establish initial capabilities that scope what is available in the next step.

Primary UI
- Camera body selection
- Brand selection (and other basic capability grouping)

Related store fields
- cameraName
- isPro
- brand
- lensType
- sealed
- isMacro
- priceRange
- weightRange

## Stage 2: Fine selection with sliders and advanced controls

Purpose
- Precisely tune requirements that directly impact the resulting lens set.
- Choose hard vs soft constraints for price, weight, and video-oriented attributes.

Primary UI groups
- Coverage / Focal range / Max aperture
- Price and Weight with Soft/Required modes
- Video constraints: Distortion and Focus Breathing scores
- Feature toggles: OIS, Weather sealed, Macro

Transitions
- Continue from Requirements to Compare; Compare → Report is gated by having at least two selected lenses.

## Complete filter feature list

Simple filters (client/src/stores/filterStore/slices/simpleFiltersSlice.ts)
- cameraName: string
- isPro: boolean
- brand: string
- lensType: string
- sealed: boolean
- isMacro: boolean
- priceRange: { min: number; max: number }
- weightRange: { min: number; max: number }

Pro filters (client/src/stores/filterStore/slices/proFiltersSlice.ts)
- proCoverage: string
- proFocalMin: number
- proFocalMax: number
- proMaxApertureF: number
- proRequireOIS: boolean
- proRequireSealed: boolean
- proRequireMacro: boolean
- proPriceMax: number
- proWeightMax: number
- proDistortionMaxPct: number
- proBreathingMinScore: number

Soft vs hard preferences
- softPrice: boolean
- softWeight: boolean
- softDistortion: boolean
- softBreathing: boolean

Enable flags (turn a specific filter off)
- enablePrice: boolean
- enableWeight: boolean
- enableDistortion: boolean
- enableBreathing: boolean

Goals and scoring inputs
- goalPreset: string
- goalWeights: Record&lt;string, number&gt;
- focalChoice: number
- subjectDistanceM: number

Compare and report (for later stages)
- selected: Result | null
- compareList: string[] and helpers
- report: ReportResponse | null

## Behavior and constraints

Availability caps
- availabilityCaps provides dataset-driven bounds and options. Relevant keys: brands, lensTypes, coverage, priceBounds/priceTicks, weightBounds/weightTicks, focalBounds/focalTicks, apertureMaxMax, distortionMaxMax, breathingMinMin.
- Brand/lensType/coverage setters normalize selections to "Any" if the chosen value is outside available caps.

Clamping and debounced updates
- Price/weight use debounced range updates to keep the UI responsive while typing or sliding long ranges.
- Many numeric setters clamp against availabilityCaps-derived bounds when present.

Preset hysteresis on slider changes
- Pro numeric changes nudge goalWeights and may infer a new goalPreset using a small hysteresis window to avoid thrashing.

Soft vs required semantics
- enableX=false turns the specific filter off.
- softX=true interprets the filter as a preference in ranking.
- Required path applies the filter as a hard constraint.

History and resets
- Changes push into a coalesced history; undo/redo is supported.
- Stage baselines can be captured and reset, and Requirements provides a reset action.

URL and persistence
- Key parts of state are persisted via zustand persist. Stage index, compare selections, and certain transient bits are intentionally not persisted. See partialize and migrate in client/src/stores/filterStore.ts.
- URL synchronization is handled in a UI hook (useUrlFiltersSync).

## Accessibility and UI bindings

- Use the schema-based binding hook useFilterBindings(schema) to connect UI controls to store values and setters without ad-hoc selectors. See docs/ui-bindings.md.
- Grouped controls should use proper labels and aria-labelledby relationships.

## Notes for contributors

- Preserve test-visible labels and structure (see TESTING.md). Examples: the Requirements heading, “Weather sealed” and “Macro” labels, lens card test ids and “Select”/“Remove” states.
- Keep components small and focused (target under 250 lines) and prefer splitting grouped requirement sections (coverage/focal/aperture, price/weight, video constraints, feature toggles) into separate files under components/requirements.
