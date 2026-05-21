# UI Components & API Layer Research

## UI Components Inventory

All components are Radix UI primitives wrapped with Tailwind styling. Located in `src/components/ui/`.

### Input Components

**Input** (`input.tsx`)

- Props: `InputProps` extends HTMLInputElement + variants (default/filled, sizes sm/default)
- RHF integration: Use with `register` or `Controller` + `FormField`
- Special: password toggle, prefix/suffix support, `fullWidth` prop
- Pattern: `.form { Input, TextArea } + FormField wrapper`

**TextArea** (`textarea.tsx`)

- Props: `TextAreaProps` extends HTMLTextAreaElement + variants
- RHF integration: Same as Input
- Config: `rows={5}` default, CVA variants (default/filled/floating)
- Usage: Large text fields, accepts `fullWidth` prop

**Select** (`select.tsx`)

- Root: `SelectPrimitive.Root` (Radix)
- Trigger: `SelectTrigger` CVA variants (variant, inputSize)
- Pattern: Wrap items in `SelectContent` → `SelectItem` children
- RHF: Use with `Controller` + `onValueChange` callback
- Example: OptionFormRow.tsx uses this for currency selection

### Boolean Components

**Switch** (`switch.tsx`)

- Radix primitive with Tailwind styling (h-5 w-9)
- State: `data-[state=checked/unchecked]` attributes
- RHF: Use with `Controller` + boolean state

**Checkbox** (`checkbox.tsx`)

- Radix with Check icon (lucide-react)
- CVA styled with focus ring, checked state
- RHF: Works with `register` directly

### Display Components

**Badge** (`badge.tsx`)

- CVA variants: default, secondary, destructive, outline, success/error/warning/info
- Props: `BadgeProps` extends HTMLDiv + variant prop
- Usage: Status indicators, tags
- No RHF integration needed (display-only)

## Shared Form Components

### ImageUploadCard (`image-upload-card.tsx`)

- Props: `{ label, fieldName: keyof ProductFormValues }`
- **RHF Pattern**: Uses `useFormContext<ProductFormValues>()` + `FormField` with `Controller`
- Flow: file input → preview + upload → URL to form state
- Features: CDN URL display, error banner (AlertBanner), loading spinner
- Integration: `field.onChange(url)` after upload succeeds

### OptionFormRow (`OptionFormRow.tsx`)

- Props: `{ value, index, onChange, onRemove }`
- **No direct RHF** — receives data as props, calls `onChange(index, patch)`
- Used by parent field array controller
- Contains: Input (title, order), Select (currency), Input (prices), TextArea (description)
- Pattern: Lift state to parent, pass callbacks

### ItineraryFormRow (`ItineraryFormRow.tsx`)

- Props: `{ value, index, isOpen, dragHandleProps, onChange, onRemove, onClone, onToggle }`
- **No direct RHF** — controlled component pattern
- Header: Drag handle, order badge, title, clone/delete buttons, expand toggle
- Body: Input (name), TinyMCE Editor (description)
- Pattern: Parent manages isOpen state + field array mutations

## Field Array Pattern

**DetailsSection** (`details-section.tsx`)

- Uses 3 fields: highlight, include, exclude
- Each is TinyMCE Editor wrapped in `FormField` → `FormControl`
- RHF: `field.value` → Editor, `field.onChange(content)` callback
- Editor config: 280px height, full toolbar, custom content_style

## API Layer Structure

### Tour Guides Type

From `api/product/types.ts`:

```typescript
export interface ApiTourGuide {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingStar: number;
}
```

Currently embedded in `ApiProductDetail.tourGuides[]`. No standalone guides API endpoints found.

### Product Requests

- `getProductById(id)` → `ApiProductDetail` (contains tourGuides array)
- `updateProduct(id, values)` → uses `toApiPayload()` mapper
- Mapper only includes: name, slug, description, images, duration, highlight, include, exclude, status, minPrice, destinationId, supplierId
- **Important**: tourGuides/tags/elements **NOT** in update payload — likely managed separately or as sub-resources

## RHF Integration Patterns Summary

| Component Type   | Pattern                         | Example                         |
| ---------------- | ------------------------------- | ------------------------------- |
| Text input       | `register()` or `Controller`    | Input, TextArea                 |
| Select/Dropdown  | `Controller` + `onValueChange`  | Select with Select component    |
| Image upload     | `Controller` + async upload     | ImageUploadCard                 |
| Rich editor      | `Controller` + `onEditorChange` | TinyMCE in DetailsSection       |
| Field array item | Controlled component callbacks  | OptionFormRow, ItineraryFormRow |

## Key Constraints

- No guides API endpoint found (only embedded in product detail)
- OptionFormRow/ItineraryFormRow: **not** RHF-integrated; parent controls state
- AlertBanner for all error/warning UX
- Editor config: TinyMCE GPL license, custom toolbar, no image upload to server (file_picker uses FileReader)
