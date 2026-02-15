# Usecase Documentation Skill

A comprehensive skill for creating structured, implementation-ready use case documentation for API endpoints and features.

## Purpose

This skill standardizes use case documentation across projects by providing templates and guidelines for creating complete specifications that development teams can implement without ambiguity.

## What's Included

### Main Components

1. **SKILL.md** - Quick reference guide
2. **Reference Templates** (in `references/`):
   - `readme-template.md` - Complete use case structure
   - `api-spec-template.yaml` - OpenAPI 3.0 specification
   - `sequence-diagram-template.md` - Mermaid diagrams
   - `test-cases-template.md` - Test scenarios

> **For Implementation**: Use the **java-clean-architecture** skill which provides comprehensive Clean Architecture patterns, project structure, and code examples.

### Documentation Structure

Each use case follows this pattern:

```
.specs/usecases/
└── uc_{feature_name}/
    ├── README.md                 # Main documentation
    ├── api-spec.yaml            # OpenAPI spec
    ├── sequence-diagram.md       # Mermaid diagrams
    ├── test-cases.md            # Test scenarios
    └── postman-tests.json       # Optional: Postman collection
```

## When to Use

- Documenting new API endpoints
- Creating feature specifications
- Standardizing documentation across team
- Need comprehensive test coverage planning
- Require detailed implementation guidelines

## Quick Start

### 1. Create Use Case Directory

```bash
mkdir -p .specs/usecases/uc_{feature_name}
```

### 2. Copy Templates

Reference templates from `.agent/skills/usecase-documentation/references/`:

- `readme-template.md` → `README.md`
- `api-spec-template.yaml` → `api-spec.yaml`
- Other templates as needed

### 3. Fill in Details

Follow template placeholders (marked with `{placeholder}`) and customize for your use case.

## Template Overview

### README Template Sections

1. **Use Case Header**: ID, name, overview
2. **Actors**: Primary and supporting
3. **Preconditions/Postconditions**: Success and failure states
4. **Main Flow**: Happy path with sequence diagram
5. **Alternative Flows**: Error scenarios
6. **Business Rules**: Validation and constraints (BR-XXX)
7. **Data Requirements**: Input/output schemas
8. **Non-Functional Requirements**: Performance, security, availability
9. **Error Handling**: Error code catalog
10. **Test Scenarios**: Comprehensive test cases
11. **Dependencies**: Internal and external services
12. **Related Use Cases**: Links to other UCs
13. **Change History**: Version tracking
14. **Notes**: Important considerations

### API Spec Template

OpenAPI 3.0 specification with:

- Request/response schemas
- Validation rules
- Security requirements
- Error responses
- Multiple examples

### Test Cases Template

Covers:

- Functional tests (positive/negative)
- Security tests (auth, injection, etc.)
- Performance tests (load, latency)
- Integration tests
- Edge cases and boundaries

## Example Use Case

See `.specs/usecases/uc_create_schema/` for a complete example following this pattern.

## Best Practices

1. **Be Specific**: Use concrete examples, not abstractions
2. **Complete Error Coverage**: Document all error scenarios
3. **Security First**: Include auth, authorization, encryption
4. **Testable**: Every requirement → test case
5. **Developer-Friendly**: Code examples, diagrams, API specs
6. **Version Control**: Track changes in Change History

## Quality Checklist

Before finalizing documentation:

- [ ] All template sections completed
- [ ] Business rules have BR-XXX identifiers
- [ ] Error codes cataloged with HTTP status
- [ ] Sequence diagrams for main and alt flows
- [ ] API spec validates (OpenAPI validator)
- [ ] Test scenarios comprehensive
- [ ] Dependencies documented
- [ ] NFRs quantified (SLAs, latency targets)
- [ ] No TODO placeholders remaining

## Contributing

When creating new usecases:

1. Follow naming convention: `uc_{feature_name}`
2. Use all templates for consistency
3. Fill in placeholders thoroughly
4. Review against quality checklist
5. Update related use cases section

## Support

For questions or improvements to this skill, contact the backend team or submit a pull request.
