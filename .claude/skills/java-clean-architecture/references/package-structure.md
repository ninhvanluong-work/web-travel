# Package Structure

Complete package organization for Java Clean Architecture with Hexagonal Architecture (Ports & Adapters).

## Directory Organization

```
vn.{company}.{service}/
│
├── {Service}Application.java           # Entry point
│
├── domain/                             # DOMAIN LAYER (Core Business)
│   ├── enums/                          # Business enumerations
│   ├── event/                          # Domain events
│   ├── model/                          # Domain models
│   │   └── {feature}/
│   │       ├── {Aggregate}.java        # Aggregate Root (rich domain model)
│   │       └── {ValueObject}.java      # Value Object (immutable, self-validating)
│   ├── repository/                     # Repository Ports (Interfaces)
│   │   └── {Feature}Repository.java
│   └── service/                        # Domain Services
│       └── {Feature}Service.java
│
├── application/                        # APPLICATION LAYER (Use Cases)
│   ├── dto/                            # Application Data Transfer Objects
│   │   ├── command/                    # Command DTOs (CQRS Write)
│   │   │   └── {feature}/
│   │   │       ├── Create{Feature}Command.java
│   │   │       └── Update{Feature}Command.java
│   │   ├── query/                      # Query DTOs (CQRS Read)
│   │   │   └── {feature}/
│   │   └── {feature}/
│   │       └── {Feature}DTO.java       # Application-level DTO
│   ├── mapper/                         # Domain ↔ Application mapping
│   │   └── {Feature}ModelMapper.java   # MapStruct mapper
│   ├── port/                           # Application Ports
│   │   └── out/
│   │       └── {Feature}EventPublisherPort.java
│   ├── service/                        # Use Case Implementations
│   │   └── {feature}/
│   │       ├── Create{Feature}UseCaseImpl.java
│   │       └── Get{Feature}UseCaseImpl.java
│   └── usecase/                        # Use Case Interfaces (Input Ports)
│       ├── command/                    # Command Use Cases
│       │   └── {feature}/
│       └── query/                      # Query Use Cases
│           └── {feature}/
│
└── infrastructure/                     # INFRASTRUCTURE LAYER (Framework Integration)
    ├── adapter/
    │   ├── in/                         # Input Adapters (Driving)
    │   │   └── web/
    │   │       ├── controller/
    │   │       │   └── {Feature}Controller.java
    │   │       ├── dto/                # Web DTOs (Request/Response)
    │   │       │   ├── request/{feature}/
    │   │       │   └── response/{feature}/
    │   │       │       └── {Feature}Out.java
    │   │       └── mapper/             # Application ↔ Web mapping
    │   │           └── {Feature}ResponseMapper.java
    │   └── out/                        # Output Adapters (Driven)
    │       ├── messaging/              # Messaging Adapters
    │       │   └── kafka/
    │       │       └── Kafka{Feature}EventPublisherAdapter.java
    │       └── persistence/            # Persistence Adapters
    │           └── mongo/
    │               ├── entity/         # Database Entities
    │               │   └── {feature}/
    │               │       └── {Feature}Document.java
    │               ├── mapper/         # Domain ↔ Persistence mapping
    │               │   └── {Feature}PersistenceMapper.java
    │               └── repository/     # Repository Implementations
    │                   └── {feature}/
    │                       ├── {Feature}MongoRepository.java (Spring Data)
    │                       └── {Feature}RepositoryImpl.java (Adapter)
    └── config/                         # Spring Configuration
        └── usecase/
            └── {Feature}UseCaseConfiguration.java
```

## Package Naming Conventions

- Group by feature first, then by type
- Example: `application/service/onboarding/` (not `application/onboarding/service/`)
- Use plural for collections: `enums/`, `events/`, `mappers/`
- Use singular for single items: `repository/`, `service/`
