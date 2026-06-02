# API Product Payload Analysis

## Current API Payload (toApiPayload fn)

Location: `src/api/product/requests.ts:63-81`

Fields SENT to API:

- name, slug
- description, highlight, include, exclude (optional)
- thumbnail, itineraryImage, images (optional array of URLs)
- duration, durationType
- status (draft|published|hidden)
- minPrice (numeric)
- destinationId, supplierId (optional UUID)

## Form Values (ProductFormValues)

Location: `src/lib/validations/product.ts:27-47`

Form supports: name, slug, description, destinationId, supplierId, duration, durationType, highlight, include, exclude, minPrice, status, thumbnail, itineraryImage, images, videoId.

## Missing Fields NOT in API Payload

The following fields from ApiProductDetail do NOT exist in current form/payload:

- **tags** (ApiTagItem[])
- **elements** (ApiElementItem[])
- **experiences** (ApiExperienceItem[])
- **readBefore** (ApiReadBeforeItem[])
- **tourGuides** (ApiTourGuide[])
- **shortDescription** (string | null)
- **isFreeCancellation** (not in types)
- **cancellationDeadlineHours** (not in types)
- **originalPrice** (not in types)
- **banner** (ApiBannerItem[])

## Options & Itineraries

Form has state for `options` and `itineraries` (use-product-form.ts:41-42), but:

- NOT sent in main product create/update
- NO separate API endpoints called in form hook
- Stored in local state only; unclear if submitted elsewhere

## Form-to-API Conversion

Direct mapping via `toApiPayload()` with minimal transformation:

- Image URLs extracted from `{ url }` objects
- No nested data serialization
- Undefined fields omitted from payload

## Questions Remaining

1. Are options/itineraries submitted via separate POST endpoints after product creation?
2. Are tags/elements/readBefore/experiences set via separate PATCH endpoints?
3. Does backend auto-create readBefore items or are they user-defined?
