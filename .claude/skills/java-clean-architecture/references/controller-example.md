# Controller Example

Standard REST controller structure for Java Clean Architecture.

## REST Controller

```java
package vn.company.service.infrastructure.adapter.in.web.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.company.auth.helper.DataContextHelper;
import vn.company.service.application.usecase.command.onboarding.CreateOnboardingUseCase;
import vn.company.service.application.dto.command.onboarding.CreateOnboardingCommand;
import vn.company.service.infrastructure.adapter.in.web.dto.request.onboarding.CreateOnboardingRequest;
import vn.company.service.infrastructure.adapter.in.web.dto.response.onboarding.OnboardingOut;
import vn.company.service.infrastructure.adapter.in.web.mapper.OnboardingResponseMapper;

@RestController
@RequestMapping("/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final CreateOnboardingUseCase createUseCase;
    private final OnboardingResponseMapper responseMapper;

    @PostMapping
    public ResponseEntity<OnboardingOut> create(@RequestBody CreateOnboardingRequest request) {
        // 1. Extract authentication context
        var uuidAccount = DataContextHelper.getUuidAccount();

        // 2. Build command from request and context
        var command = new CreateOnboardingCommand(
            uuidAccount,
            request.onboardingType()
        );

        // 3. Execute use case
        var result = createUseCase.execute(command);

        // 4. Map to response DTO
        var response = responseMapper.toResponse(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<OnboardingOut> get() {
        var uuidAccount = DataContextHelper.getUuidAccount();
        // Implementation similar to above
        return ResponseEntity.ok(null);
    }
}
```

## Request DTO

```java
package vn.company.service.infrastructure.adapter.in.web.dto.request.onboarding;

import vn.company.service.domain.enums.OnboardingType;

public record CreateOnboardingRequest(
    OnboardingType onboardingType
) {}
```

## Response DTO

```java
package vn.company.service.infrastructure.adapter.in.web.dto.response.onboarding;

import vn.company.service.domain.enums.OnboardingType;

public record OnboardingOut(
    String id,
    String uuidAccount,
    OnboardingType type,
    boolean completed
) {}
```

## Response Mapper

```java
package vn.company.service.infrastructure.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import vn.company.service.application.dto.onboarding.OnboardingDTO;
import vn.company.service.infrastructure.adapter.in.web.dto.response.onboarding.OnboardingOut;

@Mapper(componentModel = "spring")
public interface OnboardingResponseMapper {
    OnboardingOut toResponse(OnboardingDTO dto);
}
```

## Key Principles

1. **Handle HTTP Concerns Only**: Status codes, headers, request/response mapping
2. **Extract Authentication**: Use shared utilities like `DataContextHelper`
3. **Delegate to Use Cases**: Controllers should be thin
4. **Use Versioned Paths**: `/v1/`, `/v2/` for API versioning
5. **Map to Web DTOs**: Don't expose application DTOs directly
