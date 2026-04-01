# Scout Report: Admin Module Codebase Search

Date: 2026-03-30
Status: COMPLETE

## Search Results Summary

All requested items found and catalogued.

### Coverage

- Admin-related docs: 4 files
- Layout system (\_app.tsx): Found
- UI components: 32 total components available
- Module examples: 4 feature modules with structure patterns
- Type system: barrel index found
- Utilities: utils.ts with 7 helper functions
- Design config: tailwind.config.ts with extensive customization
- Design guidelines: NOT FOUND

## Key Files Located

### Layout & Navigation

- /src/pages/\_app.tsx (NextPageWithLayout pattern)
- /src/components/layouts/MainLayout/MainLayout.tsx (phone-frame 430px x 932px)
- /src/components/layouts/MainLayout/ (Header, Navbar, Sidebar, Footer, index)
- /src/components/layouts/ModuleLayout.tsx

### Critical UI Components

- Tabs: /src/components/ui/tabs.tsx
- Table: /src/components/ui/table.tsx
- Button: /src/components/ui/button.tsx (8 variants)
- Input: /src/components/ui/input.tsx
- Form: /src/components/ui/form.tsx (react-hook-form)
- Dialog: /src/components/ui/dialog.tsx
- Select: /src/components/ui/select.tsx
- Card: /src/components/ui/card.tsx
- Tooltip: /src/components/ui/tooltip.tsx

### Other Components (32 total)

- Forms: label, textarea, checkbox, radio-group, switch
- Dropdowns: dropdown-menu, select-with-search, autocomplete, multiple-autocomplete
- Overlays: alert-dialog, popover, sheet, alert
- Data: badge, avatar, chip, skeleton, spinner
- Layout: separator, scrollArea, navigation-menu, calendar

### Module Patterns

- /src/modules/DetailSearchPage/index.tsx (search results example)
- /src/modules/HomePage/index.tsx (main landing example)
- /src/modules/VideoDetailPage/index.tsx (video detail example)
- /src/modules/button-page/index.tsx (ui demo example)

### Utilities & Config

- /src/lib/utils.ts (cn, slugify, unslugify, truncate, isArrayOfFile, removeItem, closestItem)
- /src/types/index.ts (FCC, NextPageWithLayout, ErrorMutate, ROUTE, ElementProps)
- /tailwind.config.ts (screens, fonts, spacing, colors, gradients, border-radius)

### Admin Specs

- /docs/specs/admin-product-management.md (REQUIRED READING - v1.1 with ERD)
- /docs/specs/product_form_spec.md
- /docs/video-admin-guide.md (video upload guidelines)

## File Paths (Absolute)

/d/Remote/web-travel/src/pages/\_app.tsx
/d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx
/d/Remote/web-travel/src/components/ui/tabs.tsx
/d/Remote/web-travel/src/components/ui/table.tsx
/d/Remote/web-travel/src/components/ui/button.tsx
/d/Remote/web-travel/src/components/ui/input.tsx
/d/Remote/web-travel/src/components/ui/form.tsx
/d/Remote/web-travel/src/components/ui/dialog.tsx
/d/Remote/web-travel/src/components/ui/select.tsx
/d/Remote/web-travel/src/components/ui/card.tsx
/d/Remote/web-travel/src/components/ui/badge.tsx
/d/Remote/web-travel/src/components/ui/tooltip.tsx
/d/Remote/web-travel/src/lib/utils.ts
/d/Remote/web-travel/src/types/index.ts
/d/Remote/web-travel/tailwind.config.ts
/d/Remote/web-travel/docs/specs/admin-product-management.md

## Design Constraints

Mobile-first, max-width 430px, max-height 932px phone-frame
Custom fonts: DINPro, DIN Pro Cond
Color system: Neon, Pink, Neutral, Blue, Green, Yellow, Red palettes
Typography: 18 custom font sizes (d1-d3, h1-h6, body1-body4, caption1-2, overline1-3, button1-3)

## Code Snippets - Key Patterns

### \_app.tsx Layout System (line 26)

```typescript
const getLayout = Component.getLayout ?? ((page: ReactNode) => <MainLayout>{page}</MainLayout>);
```

Pages can opt out:

```typescript
MyPage.getLayout = (page) => <CustomLayout>{page}</CustomLayout>;
export default MyPage;
```

### MainLayout.tsx - Phone Frame Container

```typescript
const MainLayout: FCC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] 
                      h-[100dvh] max-h-[932px] overflow-hidden bg-white shadow-2xl"
      >
        <main className="h-full overflow-hidden scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};
```

### Tabs Component (tabs.tsx)

```typescript
export { Tabs, TabsContent, TabsList, TabsTrigger };

// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>;
```

### Button Variants (button.tsx)

Available: primary, secondary, ghost, icon, glass, glassLight, overlay, transparent

```typescript
<Button variant="primary">Create</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="icon" size="icon"><Icon /></Button>
```

### Utility Functions (lib/utils.ts)

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}
```

### Module Pattern (DetailSearchPage Example)

```typescript
// /src/modules/DetailSearchPage/index.tsx
const DetailSearchPage: NextPageWithLayout = () => {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState<string | undefined>();

  const { data, isLoading } = useInfiniteListVideo({
    variables: { query: query || undefined },
    enabled: query !== undefined,
  });

  const handleSubmit = (value?: string) => {
    setQuery((value ?? inputValue).trim());
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <SearchInput value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
      <VideoGrid videos={data?.pages.flatMap((p) => p.items) ?? []} isLoading={isLoading} />
    </div>
  );
};

export default DetailSearchPage;
```

## Implementation Checklist

Next steps to build admin module:

1. Read /d/Remote/web-travel/docs/specs/admin-product-management.md completely
2. Create admin pages:
   - /src/pages/admin/products.tsx (list page)
   - /src/pages/admin/products/create.tsx (create form)
   - /src/pages/admin/products/[id]/edit.tsx (edit form)
3. Create admin modules:
   - /src/modules/AdminProductsPage/index.tsx
   - /src/modules/AdminProductFormPage/index.tsx (shared for create + edit)
4. Use available components: Table, Form, Input, Button, Select, Card, Dialog
5. Reference DetailSearchPage module structure
6. Implement with NextPageWithLayout pattern for consistent layout

## Summary

Search completed successfully. All files needed for admin module implementation have been located and documented. UI component library is comprehensive with 32+ components ready to use. Module structure pattern is clear from existing implementations (DetailSearchPage, HomePage, VideoDetailPage).

No design guidelines document exists, so use Tailwind config and existing modules as reference.
