---
name: usecase-documentation
description: Create comprehensive, implementation-ready use case documentation following structured template with actors, flows, business rules, API specifications, sequence diagrams, test scenarios, and implementation guides. Use when documenting API endpoints, features, or complex workflows that need detailed specification for development teams.
version: 1.0.0
---

# Use Case Documentation Skill

Create structured, comprehensive use case documentation for API endpoints and features.

## When to Use

- Documenting new API endpoints or features
- Creating implementation specifications for development teams
- Standardizing use case documentation across projects
- Need detailed business rules and validation requirements
- Require comprehensive test scenarios and API contracts

## Documentation Structure

Each use case directory contains:

```
usecases/
└── uc_{usecase_name}/
    ├── README.md                 # Main use case documentation
    ├── api-spec.yaml            # OpenAPI specification
    ├── sequence-diagram.md       # Mermaid sequence diagrams
    ├── test-cases.md            # Detailed test scenarios
    └── postman-tests.json       # Postman collection (optional)
```

> **Note**: For implementation guidelines, use the **java-clean-architecture** skill which provides comprehensive Clean Architecture patterns, project structure, and code examples.

## Creating a New Use Case

### 1. Initial Setup

Create use case directory with naming convention `uc_{feature_name}`:

```bash
mkdir -p .specs/usecases/uc_{name}
```

### 2. README.md Template

See `references/readme-template.md` for complete structure including:

- **Overview**: Purpose and context
- **Actors**: Primary and supporting actors
- **Preconditions/Postconditions**: Success and failure states
- **Main Flow**: Step-by-step happy path
- **Alternative Flows**: Error and edge cases
- **Business Rules**: Validation and constraints
- **Data Requirements**: Input/output formats
- **Non-Functional Requirements**: Performance, security, scalability
- **Error Handling**: Error codes and messages
- **Test Scenarios**: Comprehensive test cases
- **Dependencies**: Internal and external services

### 3. API Specification (api-spec.yaml)

Create OpenAPI 3.0 specification with:

- Complete request/response schemas
- Validation rules
- Security requirements
- Error response formats

See `references/api-spec-template.yaml` for template.

### 4. Sequence Diagram (sequence-diagram.md)

Create Mermaid diagrams showing:

- Main flow interaction
- Alternative flows
- System component interactions

See `references/sequence-diagram-template.md` for examples.

### 5. Test Cases (test-cases.md)

Document test scenarios:

- Functional tests (happy path, validations, business rules)
- Security tests (authentication, authorization, injection)
- Performance tests (load, stress, latency)
- Integration tests (dependent services)

See `references/test-cases-template.md` for structure.

> **For Implementation Guidelines**: Use the **java-clean-architecture** skill for comprehensive implementation patterns, Clean Architecture structure, and code examples.

## Quick Start Example

```bash
# Create new use case
mkdir -p .specs/usecases/uc_create_user

# Generate documentation from template
# (Reference templates in references/ directory)
```

## Best Practices

1. **Be Specific**: Use concrete examples, not abstract descriptions
2. **Complete Error Coverage**: Document all error scenarios with codes
3. **Security First**: Include authentication, authorization, encryption
4. **Testable**: Every requirement should have corresponding test case
5. **Developer-Friendly**: Include code examples, diagrams, and API specs
6. **Version Control**: Track changes in Change History section

## Quality Checklist

Before finalizing use case documentation:

- [ ] All sections completed (no TODOs remaining)
- [ ] Business rules clearly defined with identifiers (BR-001, BR-002, etc.)
- [ ] Error codes catalogued with HTTP status, condition, and message
- [ ] Sequence diagrams visualize main and alternative flows
- [ ] API spec validates successfully (use OpenAPI validator)
- [ ] Test scenarios cover functional, security, and performance requirements
- [ ] Dependencies documented (internal services, external APIs)
- [ ] Non-functional requirements quantified (p95 < Xs, uptime %, etc.)

## References

- `references/readme-template.md` - Full README structure
- `references/api-spec-template.yaml` - OpenAPI template
- `references/sequence-diagram-template.md` - Mermaid diagram examples
- `references/test-cases-template.md` - Test scenario structure

## Related Skills

- **java-clean-architecture** - Use for implementation guidelines, Clean Architecture patterns, and code structure
