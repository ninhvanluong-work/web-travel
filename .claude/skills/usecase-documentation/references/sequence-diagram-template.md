# Sequence Diagram Template

## Main Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant API
    participant Validator
    participant Service
    participant DB
    participant Queue

    User->>Client: {User action description}
    Client->>API: {HTTP METHOD} {endpoint}

    API->>Validator: Validate request
    Validator-->>API: Valid ✓

    API->>Service: {Business operation}
    Service->>DB: {Database operation}
    DB-->>Service: {Result}
    Service-->>API: {Processed result}

    API->>Queue: Publish event

    API-->>Client: {HTTP Status} + {response data}
    Client-->>User: "{User message}"
```

## Alternative Flow: {Error Case Name}

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant API
    participant Validator

    User->>Client: {Action with invalid data}
    Client->>API: {HTTP METHOD} {endpoint}

    API->>Validator: Validate request
    Validator-->>API: Invalid ✗

    API-->>Client: 400 Bad Request
    Client-->>User: "Error: {message}"
```

## Component Interaction Diagram

```mermaid
graph LR
    Client[Client Application]
    API[API Gateway]
    Auth[Auth Service]
    Service[Business Service]
    DB[(Database)]
    Cache[(Cache)]
    Queue[Message Queue]

    Client -->|HTTP Request| API
    API -->|Verify Token| Auth
    API -->|Business Logic| Service
    Service -->|Read/Write| DB
    Service -->|Check| Cache
    Service -->|Publish Event| Queue
```

## Notes

- Use `actor` for human users
- Use `participant` for system components
- Use `-->>` for responses (dashed line)
- Use `->>` for requests (solid line)
- Include success and failure paths
- Add activation boxes for important operations: `activate {Participant}` / `deactivate {Participant}`
