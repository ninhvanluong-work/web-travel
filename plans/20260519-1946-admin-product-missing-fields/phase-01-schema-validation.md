# Phase 01 — Schema & Validation

**Date:** 2026-05-19  
**Priority:** High  
**Status:** Todo  
**Depends on:** Nothing (must complete first)

---

## Context Links

- Schema file: `src/lib/validations/product.ts`
- Form hook: `src/hooks/use-product-form.ts`
- API payload function: `src/api/product/requests.ts` (lines 63–81)
- API types: `src/api/product/types.ts`

---

## Overview

Extend `productSchema` with new fields, update `DEFAULT_VALUES`, update `form.reset()` in edit mode, and include Group 1 fields in `toApiPayload()`.

---

## Key Insights

### API type mapping

From `ApiProductDetail` in `src/api/product/types.ts`:

| API field          | API type                                                        | Notes                                                        |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------ |
| `tags`             | `ApiTagItem[]` — `{ id, name, ... }`                            | Send as `string[]` (tag names or IDs — TBD with backend)     |
| `elements`         | `ApiElementItem[]` — `{ id, key, name, description, isActive }` | Stored as key-value dict; form uses a flat object shape      |
| `experience`       | `ApiExperienceItem[]` — `{ imageUrl, title, content }`          | Note: API field is `experience` (singular) not `experiences` |
| `readBefore`       | `ApiReadBeforeItem[]` — `{ key, title, description }`           | API field is `readBefore`                                    |
| `shortDescription` | `string \| null`                                                | Already in `ApiProductDetail.shortDescription`               |

### Group 2 fields (no API type yet)

`isFreeCancellation` and `cancellationDeadlineHours` are not in `ApiProductDetail`. Add to schema for form state but **do not include in `toApiPayload()`** until backend confirms the field names.

`originalPrice` belongs on `optionSchema` (handled in Phase 6).

### Elements shape decision

`ApiElementItem` is a generic element with a `key` field. The form needs a structured object for the known keys. The cleanest approach: define an `elementsSchema` with explicit keys matching known product element keys (`departurePoint`, `pickup`, `dropOff`, `groupSize`, `language`, `difficulty`). Map from/to the `ApiElementItem[]` array format in the hook.

---

## Requirements

1. Add to `productSchema`:

   - `tags`: `z.array(z.string()).optional().default([])`
   - `elements`: structured object schema (see Architecture)
   - `experiences`: array schema `{ imageUrl, title, content }`
   - `readBefores`: array schema `{ key, title, description }`
   - `shortDescription`: `z.string().max(500).optional().nullable()`
   - `isFreeCancellation`: `z.boolean().default(false)`
   - `cancellationDeadlineHours`: `z.coerce.number().int().min(0).optional().nullable()`

2. Export new sub-schemas and types.

3. Update `DEFAULT_VALUES` in `src/hooks/use-product-form.ts`.

4. Update `form.reset(...)` block in `useProductForm` to map from `productData`.

5. Update `toApiPayload()` in `src/api/product/requests.ts` to include Group 1 fields: `tags`, `elements`, `experience`, `readBefore`.

---

## Architecture

### New Zod schemas (add to `src/lib/validations/product.ts`)

```ts
// Append after line 46 (after videoId field, before closing brace of productSchema)

// -- Inside productSchema additions --
shortDescription: z.string().max(500).optional().nullable(),
isFreeCancellation: z.boolean().default(false),
cancellationDeadlineHours: z.coerce.number().int().min(0).optional().nullable(),
tags: z.array(z.string()).optional().default([]),
elements: z
  .object({
    departurePoint: z.string().optional().nullable(),
    pickup: z.string().optional().nullable(),
    dropOff: z.string().optional().nullable(),
    groupSize: z.string().optional().nullable(),
    language: z.array(z.string()).optional().default([]),
    difficulty: z.string().optional().nullable(),
  })
  .optional()
  .default({}),
experiences: z
  .array(
    z.object({
      imageUrl: z.string().optional().nullable(),
      title: z.string().min(1, 'Title required'),
      content: z.string().optional().nullable(),
    })
  )
  .optional()
  .default([]),
readBefores: z
  .array(
    z.object({
      key: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional().nullable(),
    })
  )
  .optional()
  .default([]),
```

### `optionSchema` addition (Phase 6 reference, add now for completeness)

```ts
// Inside optionSchema — add after line 57 (after order field)
originalPrice: z.coerce.number().min(0).optional().nullable(),
```

---

## Related Code Files

- `src/lib/validations/product.ts` — schema definitions (lines 27–70)
- `src/hooks/use-product-form.ts` — DEFAULT_VALUES (lines 18–35), form.reset (lines 55–72)
- `src/api/product/requests.ts` — `toApiPayload()` (lines 63–81)
- `src/api/product/types.ts` — `ApiProductDetail`, `ApiElementItem`, `ApiExperienceItem`, `ApiReadBeforeItem`, `ApiTagItem`

---

## Implementation Steps

### Step 1 — Extend `productSchema` in `src/lib/validations/product.ts`

Open `src/lib/validations/product.ts`. After line 46 (`videoId: z.string().optional().nullable(),`) and before the closing `});` on line 47, insert the 9 new fields:

```ts
  shortDescription: z.string().max(500).optional().nullable(),
  isFreeCancellation: z.boolean().default(false),
  cancellationDeadlineHours: z.coerce.number().int().min(0).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  elements: z
    .object({
      departurePoint: z.string().optional().nullable(),
      pickup: z.string().optional().nullable(),
      dropOff: z.string().optional().nullable(),
      groupSize: z.string().optional().nullable(),
      language: z.array(z.string()).optional().default([]),
      difficulty: z.string().optional().nullable(),
    })
    .optional()
    .default({}),
  experiences: z
    .array(
      z.object({
        imageUrl: z.string().optional().nullable(),
        title: z.string().min(1, 'Title required'),
        content: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
  readBefores: z
    .array(
      z.object({
        key: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
```

### Step 2 — Extend `optionSchema` in `src/lib/validations/product.ts`

After line 57 (`order: z.coerce.number().int().min(0).default(0),`) and before closing `});` of `optionSchema`, insert:

```ts
  originalPrice: z.coerce.number().min(0).optional().nullable(),
```

### Step 3 — Export new sub-types

After the existing type exports (line 70: `export type ItineraryFormValues = ...`), add:

```ts
export type ExperienceFormValues = {
  imageUrl?: string | null;
  title: string;
  content?: string | null;
};

export type ReadBeforeFormValues = {
  key: string;
  title: string;
  description?: string | null;
};

export type ElementsFormValues = {
  departurePoint?: string | null;
  pickup?: string | null;
  dropOff?: string | null;
  groupSize?: string | null;
  language?: string[];
  difficulty?: string | null;
};
```

### Step 4 — Update `DEFAULT_VALUES` in `src/hooks/use-product-form.ts`

In `src/hooks/use-product-form.ts`, extend the `DEFAULT_VALUES` object (currently lines 18–35) with:

```ts
  shortDescription: null,
  isFreeCancellation: false,
  cancellationDeadlineHours: null,
  tags: [],
  elements: {
    departurePoint: null,
    pickup: null,
    dropOff: null,
    groupSize: null,
    language: [],
    difficulty: null,
  },
  experiences: [],
  readBefores: [],
```

### Step 5 — Update `form.reset()` edit population in `src/hooks/use-product-form.ts`

In the `useEffect` block (lines 53–73), extend `form.reset({ ... })` with:

```ts
  shortDescription: productData.shortDescription ?? null,
  isFreeCancellation: false,           // not in API response yet; default false
  cancellationDeadlineHours: null,     // not in API response yet; default null
  tags: (productData.tags ?? []).map((t) => t.name),
  elements: mapElementsFromApi(productData.elements ?? []),
  experiences: (productData.experience ?? []).map((e) => ({
    imageUrl: e.imageUrl,
    title: e.title,
    content: e.content,
  })),
  readBefores: (productData.readBefore ?? []).map((r) => ({
    key: r.key,
    title: r.title,
    description: r.description,
  })),
```

Add helper function `mapElementsFromApi` just above `useProductForm` in the same file:

```ts
// Maps ApiElementItem[] to the flat ElementsFormValues object
function mapElementsFromApi(
  items: import('@/api/product/types').ApiElementItem[]
): import('@/lib/validations/product').ElementsFormValues {
  const result: import('@/lib/validations/product').ElementsFormValues = {
    departurePoint: null,
    pickup: null,
    dropOff: null,
    groupSize: null,
    language: [],
    difficulty: null,
  };
  for (const item of items) {
    if (item.key === 'departurePoint') result.departurePoint = item.name;
    else if (item.key === 'pickup') result.pickup = item.name;
    else if (item.key === 'dropOff') result.dropOff = item.name;
    else if (item.key === 'groupSize') result.groupSize = item.name;
    else if (item.key === 'difficulty') result.difficulty = item.name;
    else if (item.key === 'language') result.language = item.name ? item.name.split(',').map((s) => s.trim()) : [];
  }
  return result;
}
```

**Note on `language` mapping:** The API `ApiElementItem` has a single `name` string. If the backend stores multiple languages as a comma-separated string in one element, use the split approach above. If each language is a separate element, adjust the accumulation logic. Verify with backend before release.

### Step 6 — Update `toApiPayload()` in `src/api/product/requests.ts`

In `src/api/product/requests.ts`, extend `toApiPayload()` (currently lines 63–81) to include Group 1 fields. Add after line 80 (`supplierId: values.supplierId || undefined,`):

```ts
    tags: values.tags?.length ? values.tags : undefined,
    experience: values.experiences?.length
      ? values.experiences.map((e) => ({ imageUrl: e.imageUrl ?? '', title: e.title, content: e.content ?? '' }))
      : undefined,
    readBefore: values.readBefores?.length
      ? values.readBefores.map((r) => ({ key: r.key, title: r.title, description: r.description ?? '' }))
      : undefined,
    elements: mapElementsToApi(values.elements),
```

Add helper function `mapElementsToApi` just above `toApiPayload` in the same file:

```ts
function mapElementsToApi(elements?: import('@/lib/validations/product').ElementsFormValues | null) {
  if (!elements) return undefined;
  const result: Record<string, string>[] = [];
  const keys = ['departurePoint', 'pickup', 'dropOff', 'groupSize', 'difficulty'] as const;
  for (const key of keys) {
    const val = elements[key];
    if (val) result.push({ key, name: val });
  }
  if (elements.language?.length) {
    result.push({ key: 'language', name: elements.language.join(',') });
  }
  return result.length ? result : undefined;
}
```

**Note:** Group 2 fields (`shortDescription`, `isFreeCancellation`, `cancellationDeadlineHours`) are intentionally omitted from `toApiPayload()` until backend confirms support.

---

## Todo Checklist

- [ ] Insert 9 fields into `productSchema` after `videoId` line
- [ ] Insert `originalPrice` into `optionSchema`
- [ ] Export `ExperienceFormValues`, `ReadBeforeFormValues`, `ElementsFormValues` types
- [ ] Extend `DEFAULT_VALUES` in `use-product-form.ts`
- [ ] Add `mapElementsFromApi` helper above `useProductForm`
- [ ] Extend `form.reset()` with all new fields
- [ ] Add `mapElementsToApi` helper above `toApiPayload` in `requests.ts`
- [ ] Extend `toApiPayload()` with Group 1 fields
- [ ] Run `pnpm check-types` — fix any TypeScript errors
- [ ] Run `pnpm lint` — fix any lint errors

---

## Success Criteria

- `pnpm check-types` passes with zero errors
- `ProductFormValues` TypeScript type includes all new fields
- Creating/updating a product sends `tags`, `experience`, `readBefore`, `elements` in payload
- Edit mode correctly populates all new fields from API response

---

## Risk Assessment

| Risk                                                              | Impact | Mitigation                                                                  |
| ----------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `language` stored differently in API                              | Medium | Confirm with backend; adjust mapping function                               |
| Backend rejects unknown payload fields                            | Low    | API likely ignores unknown fields; but test in staging                      |
| Group 2 fields (`isFreeCancellation`) causing type errors         | Low    | Keep them in schema, exclude from payload; cast not needed                  |
| `elements` key values differ from assumed (`departurePoint` etc.) | High   | Confirm exact `key` strings used in API `ApiElementItem.key` before Phase 3 |
