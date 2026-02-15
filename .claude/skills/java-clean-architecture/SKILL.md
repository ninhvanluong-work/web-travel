---
name: java-clean-architecture
description: Implement Clean Architecture, Hexagonal Architecture (Ports & Adapters), and Domain-Driven Design in Java/Spring Boot applications. Use when architecting microservices, refactoring monoliths, implementing CQRS patterns, creating domain models with aggregates/value objects, or building framework-independent business logic. Covers package structure, layered architecture, dependency injection, MapStruct mapping, event-driven integration, MongoDB persistence, and Spring Boot configuration for enterprise Java applications.
---

# Java Clean Architecture

Build maintainable, testable, and scalable Java/Spring Boot microservices using Clean Architecture, Hexagonal Architecture, and Domain-Driven Design principles.

## When to Use This Skill

- Architecting new Spring Boot microservices from scratch
- Refactoring monolithic Java applications for better maintainability
- Implementing CQRS (Command Query Responsibility Segregation) patterns
- Building framework-independent business logic
- Creating rich domain models with aggregates and value objects
- Establishing architecture standards for Java/Spring teams
- Planning microservices decomposition with clear boundaries

## Core Architecture Principles

**Dependency Rule**: Dependencies always point inward (Infrastructure → Application → Domain)

**Layer Responsibilities**:

- **Domain**: Pure Java business logic, entities, rules (no framework dependencies)
- **Application**: Use cases, orchestration, DTOs (depends on Domain only)
- **Infrastructure**: Spring Boot integration, I/O, adapters (depends on Application + Domain)

## Package Structure

See `references/package-structure.md` for complete directory organization following Hexagonal Architecture with Ports & Adapters pattern.

## Implementation Patterns

**Domain Layer**:

- Aggregate Roots with business logic (not anemic models)
- Value Objects (immutable, self-validating)
- Repository interfaces (ports) defining data access contracts
- Domain Services for stateless business logic
- Domain Events for business notifications

**Application Layer**:

- Use Case interfaces (input ports) and implementations
- Command/Query DTOs (CQRS pattern)
- MapStruct mappers for Domain ↔ Application conversion
- Output ports for external systems (event publishers, gateways)

**Infrastructure Layer**:

- REST Controllers (input adapters) handling HTTP concerns
- Repository implementations (output adapters) using Spring Data
- Kafka/messaging adapters for event publishing
- MongoDB/JPA persistence entities
- Spring configuration classes for dependency injection

## Key Design Patterns

See `references/design-patterns.md` for detailed implementations including:

- Repository pattern with interface abstractions
- Mapper pattern for layer-to-layer translation (3-layer mapping strategy)
- Command pattern for request encapsulation
- Strategy pattern for validation
- Event-Driven architecture with domain events

## Development Workflows

**Adding New Features**:

1. Create domain model in `domain/model/{feature}/`
2. Add repository interface in `domain/repository/`
3. Define use case interface in `application/usecase/command/` or `query/`
4. Implement use case in `application/service/{feature}/`
5. Create REST endpoint in `infrastructure/adapter/in/web/controller/`
6. Implement persistence adapter in `infrastructure/adapter/out/persistence/`
7. Wire beans in Spring configuration

See `references/workflows.md` for complete step-by-step workflows including adding entities, use cases, REST endpoints, and events.

## Code Examples

**Standard Use Case Structure**:
See `references/use-case-example.md` for complete use case implementation with dependency injection via Java records, domain orchestration, and DTO mapping.

**Standard Controller Structure**:
See `references/controller-example.md` for REST controller implementation with authentication context extraction, command building, and response mapping.

**Domain Model Example**:
See `references/domain-model-example.md` for aggregate root implementation with business rules, value objects, and domain events.

## Technology Stack

- **Java 17+** with Records for immutable DTOs
- **Spring Boot 3.x** for framework integration
- **MapStruct** for type-safe mapping
- **Lombok** for boilerplate reduction
- **MongoDB/PostgreSQL** for persistence
- **Apache Kafka** for event streaming
- **Eureka** for service discovery
- **OAuth2** for authentication

## Best Practices

1. Keep business logic in domain objects, not services
2. Use Java Records for immutable DTOs and stateless services
3. Implement 3-layer mapping (Web DTO → Application DTO → Domain Model → Database Entity)
4. Separate commands and queries (CQRS)
5. Test domain logic without frameworks (pure unit tests)
6. Publish domain events for cross-service communication
7. Use Spring configuration classes to wire dependencies
8. Implement rich domain models with behavior

## Common Pitfalls to Avoid

- **Anemic Domain Models**: Entities with only data, no behavior → Put business logic in domain objects
- **Framework Coupling**: Business logic depends on Spring → Keep domain framework-agnostic
- **Fat Controllers**: Business logic in controllers → Delegate to use cases
- **Repository Leakage**: Exposing database entities → Return domain models, use mappers
- **Missing Abstractions**: Concrete dependencies in domain → Define ports (interfaces)
- **Over-Engineering**: Clean Architecture for simple CRUD → Use pragmatically

## References

- `references/package-structure.md` - Complete package organization with examples
- `references/design-patterns.md` - Detailed pattern implementations
- `references/workflows.md` - Step-by-step development workflows
- `references/use-case-example.md` - Standard use case structure
- `references/controller-example.md` - Standard REST controller structure
- `references/domain-model-example.md` - Domain modeling with DDD
- `references/data-flow.md` - Request-response and event publishing flows
- `references/configuration.md` - Spring Boot configuration and dependency injection
