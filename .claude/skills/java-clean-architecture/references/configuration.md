# Spring Boot Configuration

Dependency injection and configuration for Java Clean Architecture.

## Use Case Configuration

Register use cases as Spring beans:

```java
package vn.company.service.infrastructure.config.usecase;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.company.service.domain.repository.OnboardingStatesRepository;
import vn.company.service.application.mapper.OnboardingModelMapper;
import vn.company.service.application.service.onboarding.*;
import vn.company.service.application.usecase.command.onboarding.*;

@Configuration
public class OnboardingUseCaseConfiguration {

    // Register use case implemented with Java Record
    @Bean
    public CreateOnboardingUseCase createOnboardingUseCase(
        OnboardingStatesRepository repository,
        OnboardingModelMapper mapper
    ) {
        return new CreateOnboardingUseCaseImpl(repository, mapper);
    }

    // Alternative: use cases with @Service annotation don't need manual registration
    // @Service classes are auto-detected by component scan
}
```

## MapStruct Configuration

Enable MapStruct with Spring integration:

**build.gradle**:

```gradle
dependencies {
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
}
```

**Mapper Example**:

```java
@Mapper(componentModel = "spring")
public interface OnboardingModelMapper {
    StatesDTO toDTO(States domain);
    States toDomain(StatesDTO dto);

    // Custom mapping
    @Mapping(source = "uuidAccount", target = "userId")
    StatesDTO toDTOWithCustomMapping(States domain);
}
```

## MongoDB Configuration

**application-mongo.yaml**:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/personalize
      database: personalize
      auto-index-creation: true
```

**Entity Example**:

```java
@Document(collection = "onboarding_states")
@Data
public class StatesDocument {
    @Id
    private String id;

    @Indexed(unique = true)
    private String uuidAccount;

    private OnboardingType onboardingType;
    private Map<OnboardingStep, StepData> steps;
    private boolean completed;
}
```

## Kafka Configuration

**application-kafka.yaml**:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

**Event Publisher Adapter**:

```java
@Component
@RequiredArgsConstructor
public class KafkaOnboardingEventPublisherAdapter implements OnboardingEventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "onboarding.completed";

    @Override
    public void publishCompleted(OnboardingCompletedEvent event) {
        kafkaTemplate.send(TOPIC, event.getUuidAccount(), event);
    }
}
```

## Redis Configuration

**application-redis.yaml**:

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2000
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
```

**Redis Template Configuration**:

```java
@Configuration
public class RedisConfiguration {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
        RedisConnectionFactory connectionFactory
    ) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

## Security Configuration

**application-oauth2.yaml**:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com
```

**Security Configuration**:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        return http.build();
    }
}
```

## Application Entry Point

```java
@SpringBootApplication
@EnableRetry
@EnableKafka
@EnableScheduling
@EnableDiscoveryClient
@EnableConfigurationProperties
public class PersonalizeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersonalizeServiceApplication.class, args);
    }
}
```

## Multi-Config Import Pattern

**application.yaml**:

```yaml
spring:
  application:
    name: personalize-service
  config:
    import:
      - application-endpoint.yaml
      - application-database.yaml
      - application-kafka.yaml
      - application-eureka.yaml
      - application-oauth2.yaml
      - application-redis.yaml
      - application-mongo.yaml
      - application-i18n.yaml
```

Benefits:

- Centralized configuration management
- Consistent settings across services
- Easy to update shared configurations
- Modular organization
