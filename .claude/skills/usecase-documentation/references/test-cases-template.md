# Test Cases Template

## Test Coverage Matrix

| Category    | Test ID              | Priority | Status  |
| ----------- | -------------------- | -------- | ------- |
| Functional  | TC-F-001 to TC-F-{N} | P0-P2    | Not Run |
| Security    | TC-S-001 to TC-S-{N} | P0-P1    | Not Run |
| Performance | TC-P-001 to TC-P-{N} | P1-P2    | Not Run |
| Integration | TC-I-001 to TC-I-{N} | P1       | Not Run |

---

## Functional Tests

### TC-F-001: {Test Name - Happy Path}

**Priority**: P0  
**Type**: Positive Test

**Preconditions**:

- {Setup requirement 1}
- {Setup requirement 2}

**Test Data**:

```json
{
  "field1": "valid-value-1",
  "field2": "valid-value-2"
}
```

**Steps**:

1. {Action step 1}
2. {Action step 2}
3. {Action step 3}

**Expected Results**:

- HTTP Status: `{status-code}`
- Response body contains: `{field}`
- Database record created with: `{conditions}`
- Audit log entry: `{action-type}`

**Actual Results**: {To be filled during test execution}

**Status**: Not Run | Pass | Fail

---

### TC-F-002: {Validation Test Name}

**Priority**: P0  
**Type**: Negative Test

**Preconditions**:

- {Requirements}

**Test Data**:

```json
{
  "field1": "{invalid-value}",
  "field2": null
}
```

**Steps**:

1. Submit request with invalid data
2. Observe validation response

**Expected Results**:

- HTTP Status: `400 Bad Request`
- Error code: `ERR_{CATEGORY}_{NUM}`
- Error message: "{Expected message}"
- Validation details array contains field errors

**Actual Results**:

**Status**: Not Run

---

## Security Tests

### TC-S-001: Unauthorized Access

**Priority**: P0  
**Type**: Security - Authentication

**Test Data**:

- No JWT token in Authorization header

**Steps**:

1. Send request without auth token
2. Observe response

**Expected Results**:

- HTTP Status: `401 Unauthorized`
- Error code: `ERR_AUTH_001`
- No sensitive data in response

**Status**: Not Run

---

### TC-S-002: Insufficient Permissions

**Priority**: P0  
**Type**: Security - Authorization

**Preconditions**:

- User authenticated but lacks required permission

**Test Data**:

- Valid JWT but role = `VIEWER` (not `ADMIN`)

**Steps**:

1. Authenticate as low-privilege user
2. Attempt restricted operation
3. Observe rejection

**Expected Results**:

- HTTP Status: `403 Forbidden`
- Error code: `ERR_AUTH_005`
- No audit log created

**Status**: Not Run

---

### TC-S-003: SQL Injection Attempt

**Priority**: P0  
**Type**: Security - Input Validation

**Test Data**:

```json
{
  "name": "test'; DROP TABLE users; --"
}
```

**Expected Results**:

- Input properly sanitized
- No SQL execution
- Either: validation error OR safe storage with escaped characters

**Status**: Not Run

---

## Performance Tests

### TC-P-001: Response Time Under Load

**Priority**: P1  
**Type**: Performance - Latency

**Test Configuration**:

- Concurrent users: {50}
- Test duration: {5 minutes}
- Requests per second: {100}

**Expected Results**:

- P95 response time: < {1 second}
- P99 response time: < {2 seconds}
- Error rate: < {1%}
- No memory leaks or resource exhaustion

**Metrics to Collect**:

- Response time distribution
- Throughput (requests/second)
- Error rate
- CPU/Memory usage

**Status**: Not Run

---

### TC-P-002: Database Performance

**Priority**: P1  
**Type**: Performance - Database

**Test Scenario**:

- Database contains {10,000} existing records
- Execute {query-type} operations

**Expected Results**:

- Query execution: < {100ms}
- Transaction commit: < {50ms}
- No table locks exceeding {1 second}

**Status**: Not Run

---

## Integration Tests

### TC-I-001: End-to-End Flow

**Priority**: P0  
**Type**: Integration - Full System

**Test Scenario**:
Complete user journey from {start} to {end}

**Steps**:

1. {Integration step 1}
2. {Integration step 2}
3. {Verify dependent system interaction}

**Expected Results**:

- All systems integrated correctly
- Event published to message queue
- External service called with correct payload
- Data consistency across all systems

**Status**: Not Run

---

## Edge Cases & Boundary Tests

### TC-E-001: {Boundary Condition}

**Test Data**:

- Field with minimum allowed value: `{min-value}`
- Field with maximum allowed value: `{max-value}`
- Field with value just below minimum
- Field with value just above maximum

**Expected Results**:

- Min/max values accepted
- Out-of-range values rejected with validation error

**Status**: Not Run

---

## Regression Tests

### TC-R-001: {Previously Fixed Bug}

**Bug Reference**: {BUG-XXX}

**Test Scenario**:
Reproduce conditions that caused previous bug

**Expected Results**:

- Bug does not reoccur
- Fix remains effective

**Status**: Not Run

---

## Test Execution Summary

**Total Tests**: {N}  
**Executed**: {N}  
**Passed**: {N}  
**Failed**: {N}  
**Blocked**: {N}  
**Not Run**: {N}

**Pass Rate**: {X}%  
**Test Coverage**: {Y}%

**Critical Issues Found**: {List}  
**Recommendations**: {Improvements or findings}
