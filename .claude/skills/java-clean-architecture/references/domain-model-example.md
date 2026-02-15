# Domain Model Example

Domain-Driven Design patterns for Java Clean Architecture.

## Aggregate Root

```java
package vn.company.service.domain.model.onboarding;

import lombok.Getter;
import vn.company.service.domain.enums.OnboardingStep;
import vn.company.service.domain.enums.OnboardingType;
import vn.company.service.domain.event.OnboardingCompletedEvent;

import java.util.*;

@Getter
public class States {
    private String id;
    private String uuidAccount;
    private OnboardingType onboardingType;
    private Map<OnboardingStep, StepData> steps;
    private boolean completed;
    private List<Object> domainEvents;

    // Factory method for creation
    public static States initialize(String uuidAccount, OnboardingType type) {
        var states = new States();
        states.id = UUID.randomUUID().toString();
        states.uuidAccount = uuidAccount;
        states.onboardingType = type;
        states.steps = new HashMap<>();
        states.completed = false;
        states.domainEvents = new ArrayList<>();
        return states;
    }

    // Business logic: Mark step as completed
    public void markStepCompleted(OnboardingStep step, StepData data) {
        if (this.completed) {
            throw new IllegalStateException("Cannot modify completed onboarding");
        }

        this.steps.put(step, data);

        // Check if all required steps are completed
        if (isAllStepsCompleted()) {
            this.complete();
        }
    }

    // Business logic: Complete onboarding
    private void complete() {
        this.completed = true;
        this.domainEvents.add(new OnboardingCompletedEvent(
            this.uuidAccount,
            this.onboardingType
        ));
    }

    // Business rule validation
    public void validate() {
        if (uuidAccount == null || uuidAccount.isBlank()) {
            throw new IllegalArgumentException("UUID account is required");
        }
        if (onboardingType == null) {
            throw new IllegalArgumentException("Onboarding type is required");
        }
    }

    private boolean isAllStepsCompleted() {
        // Business logic to check completion
        return steps.size() >= getRequiredStepsCount();
    }

    private int getRequiredStepsCount() {
        return switch (onboardingType) {
            case INDIVIDUAL -> 3;
            case ORGANIZATION -> 5;
        };
    }
}
```

## Value Object

```java
package vn.company.service.domain.model.onboarding;

import lombok.Value;

import java.time.Instant;

// Immutable value object with Lombok @Value
@Value
public class StepData {
    String data;
    Instant completedAt;
    boolean valid;

    // Self-validating constructor
    public StepData(String data) {
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Step data cannot be empty");
        }
        this.data = data;
        this.completedAt = Instant.now();
        this.valid = true;
    }
}
```

## Domain Event

```java
package vn.company.service.domain.event;

import lombok.Value;
import vn.company.service.domain.enums.OnboardingType;

import java.time.Instant;

@Value
public class OnboardingCompletedEvent {
    String uuidAccount;
    OnboardingType onboardingType;
    Instant occurredAt;

    public OnboardingCompletedEvent(String uuidAccount, OnboardingType type) {
        this.uuidAccount = uuidAccount;
        this.onboardingType = type;
        this.occurredAt = Instant.now();
    }
}
```

## Repository Interface (Port)

```java
package vn.company.service.domain.repository;

import vn.company.service.domain.model.onboarding.States;

import java.util.Optional;

public interface OnboardingStatesRepository {
    Optional<States> findByUuidAccount(String uuidAccount);
    States save(States states);
    void delete(String uuidAccount);
}
```

## Key Principles

1. **Rich Domain Models**: Business logic in entities, not services
2. **Immutable Value Objects**: Use `@Value` or records
3. **Self-Validation**: Throw exceptions for invalid states
4. **Domain Events**: Track what happened in the domain
5. **Factory Methods**: Use static methods for creation
6. **No Framework Dependencies**: Pure Java only
