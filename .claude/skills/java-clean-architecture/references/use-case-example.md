# Use Case Example

Standard structure for use case implementation in Java Clean Architecture.

## Use Case Interface

```java
package vn.company.service.application.usecase.command.onboarding;

public interface CreateOnboardingUseCase {
    OnboardingDTO execute(CreateOnboardingCommand command);
}
```

## Use Case Implementation

```java
package vn.company.service.application.service.onboarding;

import lombok.RequiredArgsConstructor;
import vn.company.service.domain.model.onboarding.States;
import vn.company.service.domain.repository.OnboardingStatesRepository;
import vn.company.service.application.dto.command.onboarding.CreateOnboardingCommand;
import vn.company.service.application.dto.onboarding.OnboardingDTO;
import vn.company.service.application.mapper.OnboardingModelMapper;

// Using Java Record for immutable service (Java 17+)
public record CreateOnboardingUseCaseImpl(
    OnboardingStatesRepository repository,
    OnboardingModelMapper mapper
) implements CreateOnboardingUseCase {

    @Override
    public OnboardingDTO execute(CreateOnboardingCommand command) {
        // 1. Create domain object with business logic
        var states = States.initialize(
            command.uuidAccount(),
            command.onboardingType()
        );

        // 2. Validate via domain object methods
        states.validate();

        // 3. Save using repository port
        var saved = repository.save(states);

        // 4. Return DTO (never return domain object)
        return mapper.toDTO(saved);
    }
}
```

## Alternative with Lombok

If not using Java Records:

```java
package vn.company.service.application.service.onboarding;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateOnboardingUseCaseImpl implements CreateOnboardingUseCase {

    private final OnboardingStatesRepository repository;
    private final OnboardingModelMapper mapper;

    @Override
    public OnboardingDTO execute(CreateOnboardingCommand command) {
        // Implementation same as above
    }
}
```

## Command DTO

```java
package vn.company.service.application.dto.command.onboarding;

// Immutable command with Java Record
public record CreateOnboardingCommand(
    String uuidAccount,
    OnboardingType onboardingType
) {
    // Validation can be added here
    public CreateOnboardingCommand {
        if (uuidAccount == null || uuidAccount.isBlank()) {
            throw new IllegalArgumentException("UUID account is required");
        }
    }
}
```

## Key Principles

1. **Dependency Injection via Constructor**: Use records or `@RequiredArgsConstructor`
2. **Orchestrate Domain Logic**: Don't implement business rules in use case
3. **Return DTOs**: Never expose domain objects to outer layers
4. **Keep Stateless**: Use cases should have no mutable state
5. **Single Responsibility**: One use case per operation
