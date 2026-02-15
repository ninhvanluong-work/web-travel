# Design Patterns

Common design patterns used in Java Clean Architecture.

## Repository Pattern

**Purpose**: Abstract data access with interface in domain, implementation in infrastructure.

**Domain Layer (Port)**:

```java
package vn.company.service.domain.repository;

public interface OnboardingStatesRepository {
    Optional<States> findByUuidAccount(String uuidAccount);
    States save(States states);
}
```

**Infrastructure Layer (Adapter)**:

```java
package vn.company.service.infrastructure.adapter.out.persistence.mongo.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OnboardingStatesRepositoryImpl implements OnboardingStatesRepository {

    private final OnboardingStatesMongoRepository mongoRepository;
    private final StatesPersistenceMapper mapper;

    @Override
    public Optional<States> findByUuidAccount(String uuidAccount) {
        return mongoRepository.findByUuidAccount(uuidAccount)
            .map(mapper::toDomain);
    }

    @Override
    public States save(States states) {
        var document = mapper.toDocument(states);
        var saved = mongoRepository.save(document);
        return mapper.toDomain(saved);
    }
}
```

## Mapper Pattern (3-Layer Mapping)

**Purpose**: Prevent coupling between layers with separate DTOs.

**Layer 1 - Web to Application**:

```java
@Mapper(componentModel = "spring")
public interface OnboardingResponseMapper {
    OnboardingOut toResponse(StatesDTO dto);
}
```

**Layer 2 - Application to Domain**:

```java
@Mapper(componentModel = "spring")
public interface OnboardingModelMapper {
    StatesDTO toDTO(States domain);
    States toDomain(StatesDTO dto);
}
```

**Layer 3 - Domain to Persistence**:

```java
@Mapper(componentModel = "spring")
public interface StatesPersistenceMapper {
    StatesDocument toDocument(States domain);
    States toDomain(StatesDocument document);
}
```

## Command Pattern (CQRS)

**Purpose**: Encapsulate requests as immutable command objects.

**Command (Write)**:

```java
public record CreateOnboardingCommand(
    String uuidAccount,
    OnboardingType type
) {}

public interface CreateOnboardingUseCase {
    OnboardingDTO execute(CreateOnboardingCommand command);
}
```

**Query (Read)**:

```java
public record GetOnboardingQuery(
    String uuidAccount
) {}

public interface GetOnboardingUseCase {
    OnboardingDTO execute(GetOnboardingQuery query);
}
```

## Strategy Pattern

**Purpose**: Different validation strategies for different onboarding steps.

```java
@Service
public class OnboardingStepValidatorService {

    public void validate(OnboardingStep step, StepData data) {
        var strategy = getValidationStrategy(step);
        strategy.validate(data);
    }

    private ValidationStrategy getValidationStrategy(OnboardingStep step) {
        return switch (step) {
            case PROFILE -> new ProfileValidationStrategy();
            case ORGANIZATION -> new OrganizationValidationStrategy();
            case PREFERENCES -> new PreferencesValidationStrategy();
        };
    }
}

interface ValidationStrategy {
    void validate(StepData data);
}
```

## Event-Driven Pattern

**Purpose**: Decouple services via asynchronous events.

**Publishing Event**:

```java
@Service
public record CompleteOnboardingUseCaseImpl(
    OnboardingStatesRepository repository,
    OnboardingEventPublisherPort eventPublisher
) implements CompleteOnboardingUseCase {

    @Override
    public void execute(CompleteOnboardingCommand command) {
        var states = repository.findByUuidAccount(command.uuidAccount())
            .orElseThrow();

        states.complete();
        repository.save(states);

        // Publish domain event
        eventPublisher.publishCompleted(new OnboardingCompletedEvent(
            states.getUuidAccount(),
            states.getOnboardingType()
        ));
    }
}
```

**Consuming Event**:

```java
@Component
public class OnboardingCompletedListener {

    @KafkaListener(topics = "onboarding.completed")
    public void handleCompleted(OnboardingCompletedEvent event) {
        // Handle event in another service
    }
}
```

## Dependency Injection Pattern

**Using Java Records** (Java 17+):

```java
public record MyUseCaseImpl(
    MyRepository repository,
    MyMapper mapper
) implements MyUseCase {
    // Dependencies automatically injected via constructor
}

// Register as bean in configuration
@Configuration
public class UseCaseConfiguration {
    @Bean
    public MyUseCase myUseCase(MyRepository repo, MyMapper mapper) {
        return new MyUseCaseImpl(repo, mapper);
    }
}
```

**Using Lombok**:

```java
@Service
@RequiredArgsConstructor
public class MyUseCaseImpl implements MyUseCase {
    private final MyRepository repository;
    private final MyMapper mapper;
}
```
