# Development Workflows

Step-by-step workflows for common development tasks.

## Adding a New Domain Entity

1. **Create aggregate root** in `domain/model/{feature}/`

   - Add business logic methods
   - Implement validation
   - Add domain events if needed

2. **Create value objects** in same directory

   - Make immutable (use `@Value` or records)
   - Add self-validation in constructor

3. **Add repository interface** in `domain/repository/`

   - Define data access methods
   - Return domain objects, not DTOs

4. **Create MongoDB document** in `infrastructure/adapter/out/persistence/mongo/entity/{feature}/`

   - Add Spring Data annotations
   - Use `@Document` with collection name

5. **Implement repository adapter**

   - Create Spring Data repository interface
   - Implement domain repository interface
   - Inject Spring Data repository

6. **Create persistence mapper**
   - Use MapStruct for domain ↔ entity mapping
   - Add in `infrastructure/adapter/out/persistence/mongo/mapper/`

## Adding a New Use Case

1. **Define use case interface** in `application/usecase/command/` or `query/`

   - Single method: `execute(Command) → DTO`
   - Clear naming: `Create{Feature}UseCase`

2. **Create command/query DTO** in `application/dto/`

   - Use Java Record for immutability
   - Add validation if needed

3. **Create response DTO** in `application/dto/{feature}/`

   - Application-level DTO
   - Will be mapped from domain

4. **Implement use case** in `application/service/{feature}/`

   - Use Java Record or `@RequiredArgsConstructor`
   - Inject dependencies via constructor
   - Orchestrate domain logic
   - Return DTO, not domain object

5. **Create application mapper** in `application/mapper/`

   - MapStruct interface: domain ↔ application DTO

6. **Register bean** in configuration class
   - Create `@Bean` method if using records
   - Or use `@Service` annotation with Lombok

## Adding a New REST Endpoint

1. **Add method to controller** in `infrastructure/adapter/in/web/controller/`

   - Annotate with `@PostMapping`, `@GetMapping`, etc.
   - Extract authentication context
   - Build command/query

2. **Create request DTO** in `infrastructure/adapter/in/web/dto/request/`

   - Use Java Record
   - Separate from application DTO

3. **Create response DTO** in `infrastructure/adapter/in/web/dto/response/`

   - Use Java Record
   - Web-optimized representation

4. **Update response mapper** in `infrastructure/adapter/in/web/mapper/`

   - MapStruct: application DTO → web response

5. **Inject use case** via constructor
   - Add to controller dependencies

## Adding a New Event

1. **Create event class** in `domain/event/`

   - Immutable with `@Value` or record
   - Include timestamp

2. **Add publisher method** to output port interface

   - Define in `application/port/out/`
   - Example: `void publishOnboardingCompleted(OnboardingCompletedEvent event)`

3. **Implement Kafka adapter** in `infrastructure/adapter/out/messaging/kafka/`

   - Implement output port interface
   - Use `KafkaTemplate` to send

4. **Call publisher from use case**

   - Inject port interface
   - Call after domain operation

5. **Configure Kafka topic** in `application-kafka.yaml`
   - Add topic name
   - Set partition strategy

## Testing Strategy

**Unit Tests** (Domain Layer):

```java
@Test
void shouldMarkStepCompleted() {
    var states = States.initialize("user-123", OnboardingType.INDIVIDUAL);
    var stepData = new StepData("test data");

    states.markStepCompleted(OnboardingStep.PROFILE, stepData);

    assertTrue(states.getSteps().containsKey(OnboardingStep.PROFILE));
}
```

**Integration Tests** (Use Cases):

```java
@SpringBootTest
@Testcontainers
class CreateOnboardingUseCaseImplTest {
    @Container
    static MongoDBContainer mongodb = new MongoDBContainer("mongo:6");

    @Test
    void shouldCreateOnboarding() {
        // Test with real MongoDB via Testcontainers
    }
}
```

**API Tests** (Controllers):

```java
@WebMvcTest(OnboardingController.class)
class OnboardingControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateOnboarding() throws Exception {
        mockMvc.perform(post("/v1/onboarding")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"onboardingType\":\"INDIVIDUAL\"}"))
            .andExpect(status().isOk());
    }
}
```
