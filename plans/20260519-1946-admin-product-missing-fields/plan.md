# Plan: Admin Product Form — Missing Fields

**Date:** 2026-05-19  
**Status:** Todo  
**Scope:** Add all fields missing from Admin Product Form that either exist in the API or are needed for product creation.

---

## Overview

Six phases covering schema, UI, and payload changes. Phases 1–5 are Group 1 (API types already exist). Phase 6 is low-priority Group 2.

No existing logic is modified without permission. Only additive changes.

---

## Phases

| #   | File                                                                       | Priority | Status | Description                                                                                              |
| --- | -------------------------------------------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------------------------------- |
| 1   | [phase-01-schema-validation.md](./phase-01-schema-validation.md)           | High     | Todo   | Add new fields to Zod schema, defaults, and `toApiPayload()`                                             |
| 2   | [phase-02-basic-info-additions.md](./phase-02-basic-info-additions.md)     | High     | Todo   | Add `shortDescription`, `tags`, `isFreeCancellation`, `cancellationDeadlineHours` to BasicInfoSection    |
| 3   | [phase-03-quick-facts-section.md](./phase-03-quick-facts-section.md)       | High     | Todo   | New section: `elements` object fields (departurePoint, pickup, dropOff, groupSize, language, difficulty) |
| 4   | [phase-04-experiences-section.md](./phase-04-experiences-section.md)       | Medium   | Todo   | New section: `experiences` array (imageUrl, title, content)                                              |
| 5   | [phase-05-read-before-section.md](./phase-05-read-before-section.md)       | Medium   | Todo   | New section: `readBefores` array (key, title, description)                                               |
| 6   | [phase-06-options-original-price.md](./phase-06-options-original-price.md) | Low      | Todo   | Add `originalPrice` to `optionSchema` + `OptionFormRow` (OptionsSection currently hidden)                |

---

## Dependency Order

Phase 1 must complete before Phases 2–6. Phases 2–5 can be worked in parallel after Phase 1.

---

## Key Constraints

- `elements`, `experiences`, `readBefores` in API response are named differently than on `ApiProductDetail` (`elements` is `ApiElementItem[]` with `key/name/description`, `experience` is `ApiExperienceItem[]`, `readBefore` is `ApiReadBeforeItem[]`)
- Group 2 fields (`shortDescription`, `isFreeCancellation`, `cancellationDeadlineHours`, `originalPrice`) require backend confirmation before sending in payload — add to schema/form now, omit from payload until confirmed
- Never modify scroll, IntersectionObserver, Zustand, or video behavior
- No Vietnamese comments in source files
