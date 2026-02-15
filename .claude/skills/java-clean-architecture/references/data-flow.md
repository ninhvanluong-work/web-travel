# Data Flow Patterns

Request-response and event publishing flows in Java Clean Architecture.

## Synchronous Request-Response Flow

```
HTTP Client
    │
    ▼
┌────────────────────────────────────────────┐
│ Controller (Input Adapter)                 │
│ - Extract auth context                     │
│ - Build command from request               │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│ Use Case (Application)                     │
│ - Orchestrate domain logic                 │
│ - Load/save via repository                 │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│ Domain Model                               │
│ - Apply business rules                     │
│ - Validate invariants                      │
│ - Generate domain events                   │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│ Repository (Output Adapter)                │
│ - Map domain → persistence                 │
│ - Execute database operations              │
└────────────────────────────────────────────┘
    │
    ▼
MongoDB / PostgreSQL
```

## Asynchronous Event Publishing Flow

```
Use Case
    │
    │ 1. Domain operation complete
    ▼
┌────────────────────────────────────────────┐
│ Domain Event Created                       │
│ - OnboardingCompletedEvent                 │
└────────────────────────────────────────────┘
    │
    │ 2. Publish via port
    ▼
┌────────────────────────────────────────────┐
│ Event Publisher Port (Interface)           │
│ - publishCompleted(event)                  │
└────────────────────────────────────────────┘
    │
    │ 3. Adapter implementation
    ▼
┌────────────────────────────────────────────┐
│ Kafka Adapter (Output Adapter)             │
│ - Serialize event to JSON                  │
│ - Send to Kafka topic                      │
│ - Partition by uuidAccount                 │
└────────────────────────────────────────────┘
    │
    ▼
Kafka Topic: onboarding.completed
    │
    │ 4. Asynchronous consumption
    ▼
Other Services (Consumers)
```

## 3-Layer Mapping Flow

Prevents coupling by using separate DTOs for each layer:

```
Web Layer: StatesOut (Response DTO)
         │
         ▼ OnboardingResponseMapper
Application Layer: StatesDTO (Application DTO)
         │
         ▼ OnboardingModelMapper
Domain Layer: States (Domain Model)
         │
         ▼ StatesPersistenceMapper
Persistence Layer: StatesDocument (Database Entity)
```

**Why 3 layers?**

1. Web changes (JSON structure) don't affect domain
2. Database changes (schema) don't affect application
3. Domain changes don't leak to external APIs
4. Each layer optimized for its purpose

## Caching Pattern

```
Controller
    │
    ▼
Use Case
    │
    ▼
Repository (with caching)
    │
    ├─── Cache Hit? ──── Redis ────┐
    │                               │
    └─── Cache Miss ──┐             │
                      ▼             │
                   MongoDB          │
                      │             │
                      └─── Update Cache
                                    │
                                    ▼
                             Return Domain Model
```

**Implementation**:

```java
@Component
@RequiredArgsConstructor
public class CachedOnboardingRepository implements OnboardingStatesRepository {

    private final OnboardingStatesMongoRepository mongoRepository;
    private final RedisTemplate<String, States> redisTemplate;
    private static final String CACHE_KEY_PREFIX = "onboarding:states:";

    @Override
    public Optional<States> findByUuidAccount(String uuidAccount) {
        // Try cache first
        var cached = redisTemplate.opsForValue()
            .get(CACHE_KEY_PREFIX + uuidAccount);

        if (cached != null) {
            return Optional.of(cached);
        }

        // Cache miss - load from database
        var states = mongoRepository.findByUuidAccount(uuidAccount);

        // Update cache
        states.ifPresent(s ->
            redisTemplate.opsForValue()
                .set(CACHE_KEY_PREFIX + uuidAccount, s, Duration.ofMinutes(20))
        );

        return states;
    }
}
```

## CQRS Flow Separation

**Command (Write) Flow**:

```
POST /v1/onboarding
    │
    ▼
CreateOnboardingCommand
    │
    ▼
CreateOnboardingUseCase
    │
    ▼
Domain Model (mutate)
    │
    ▼
Repository.save()
    │
    ▼
Event Publisher
```

**Query (Read) Flow**:

```
GET /v1/onboarding
    │
    ▼
GetOnboardingQuery
    │
    ▼
GetOnboardingUseCase
    │
    ▼
Repository.find()
    │
    ▼
Return DTO (no mutation)
```
