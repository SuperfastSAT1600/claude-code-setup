# Prompt Engineering Patterns

Best practices for designing effective LLM prompts, managing context, and optimizing AI interactions.

---

## Prompt Structure

### Basic Template
```
[Role/Context]
You are a [role] that [capability].

[Task]
Your task is to [specific task].

[Input]
Here is the input:
<input>
{{INPUT}}
</input>

[Output Format]
Respond in the following format:
[specification]

[Constraints]
- Constraint 1
- Constraint 2
```

### Example: Code Review Prompt
```
You are a senior software engineer reviewing code for quality and security issues.

Your task is to review the following code and identify:
1. Potential bugs
2. Security vulnerabilities
3. Performance issues
4. Code style improvements

<code>
{{CODE}}
</code>

For each issue found, provide:
- Issue type (bug/security/performance/style)
- Severity (high/medium/low)
- Line number(s)
- Description
- Suggested fix

If no issues are found, respond with "No issues found."
```

---

## Prompt Techniques

### 1. Chain of Thought (CoT)
Guide the model to reason step-by-step.

```
Analyze this code for security vulnerabilities.

Think through this step by step:
1. First, identify all user inputs
2. Then, trace how each input flows through the code
3. Check if inputs are validated/sanitized
4. Identify any dangerous operations with user data
5. List potential vulnerabilities found

<code>
{{CODE}}
</code>
```

### 2. Few-Shot Learning
Provide examples to guide output format.

```
Convert natural language to SQL queries.

Examples:
User: "Show all users who signed up this month"
SQL: SELECT * FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

User: "Count orders by status"
SQL: SELECT status, COUNT(*) FROM orders GROUP BY status;

User: "Find the top 10 customers by total spend"
SQL: SELECT customer_id, SUM(total) as total_spend FROM orders GROUP BY customer_id ORDER BY total_spend DESC LIMIT 10;

Now convert:
User: "{{USER_QUERY}}"
SQL:
```

### 3. Role Assignment
Define expertise and perspective.

```
You are a database architect with 15 years of experience optimizing PostgreSQL databases for high-traffic applications.

Review this schema and query patterns, then recommend:
1. Index optimizations
2. Schema improvements
3. Query rewrites for better performance

<schema>
{{SCHEMA}}
</schema>

<queries>
{{QUERIES}}
</queries>
```

### 4. Output Constraints
Specify exact format requirements.

```
Generate a TypeScript interface for the following API response.

Requirements:
- Use strict typing (no 'any')
- Add JSDoc comments for each field
- Use optional (?) for nullable fields
- Export the interface

Response should be valid TypeScript code only, no explanations.

API Response:
{{JSON_RESPONSE}}
```

### 5. Decomposition
Break complex tasks into subtasks.

```
I need to implement user authentication. Let's break this down:

Step 1: First, analyze the current codebase structure
<codebase>
{{CODEBASE_INFO}}
</codebase>

What authentication patterns are already in use? What frameworks/libraries are available?

[Wait for response]

Step 2: Based on your analysis, design the authentication flow
- Registration
- Login
- Password reset
- Session management

[Continue step by step...]
```

---

## Context Management

### Token Optimization
```
# Summarize long documents before processing
Summarize the key points from this document in 3-5 bullet points,
focusing on information relevant to [specific topic]:

<document>
{{LONG_DOCUMENT}}
</document>
```

### Context Window Strategies
```
# For long codebases, provide relevant snippets only
Here are the relevant files for this task:

<file path="src/auth/login.ts">
{{LOGIN_FILE}}
</file>

<file path="src/auth/types.ts">
{{TYPES_FILE}}
</file>

Related files (not shown but exist):
- src/auth/register.ts
- src/auth/middleware.ts
- src/auth/utils.ts
```

### Conversation Management
```
# Previous context summary
Previous conversation summary:
- User wants to add OAuth2 support
- We discussed using passport.js
- User prefers Google and GitHub providers
- Decision: Use NextAuth.js for simplicity

Current request: Implement the OAuth providers we discussed.
```

---

## System Prompts

### Code Assistant
```
You are an expert software engineer assistant. You help with:
- Writing clean, efficient code
- Debugging issues
- Code reviews
- Architecture decisions

Guidelines:
- Always explain your reasoning
- Provide working code examples
- Consider edge cases
- Follow best practices for the language/framework
- Ask clarifying questions when requirements are unclear

When writing code:
- Include error handling
- Add helpful comments for complex logic
- Follow the existing code style
- Consider security implications
```

### API Designer
```
You are an API design expert specializing in RESTful and GraphQL APIs.

When designing APIs:
- Follow REST conventions (resources, HTTP methods, status codes)
- Design for consistency and predictability
- Consider versioning strategy
- Plan for pagination, filtering, and sorting
- Document with OpenAPI/Swagger format

Output specifications in the requested format (OpenAPI, GraphQL SDL, etc.)
```

---

## Error Handling Prompts

### Graceful Degradation
```
Attempt to [task]. If you cannot complete it fully:
1. Complete as much as possible
2. Clearly indicate what was completed
3. Explain what couldn't be done and why
4. Suggest alternative approaches

Do not make up information. If uncertain, say so.
```

### Validation Prompt
```
Before providing your answer, verify:
1. Does the code compile/run without errors?
2. Does it handle the edge cases mentioned?
3. Are there any security concerns?
4. Is the solution complete?

If any verification fails, revise your answer.
```

---

## Domain-Specific Prompts

### Code Generation
```
Generate [language] code for [functionality].

Requirements:
- TypeScript with strict mode
- Include type definitions
- Add error handling
- Include unit tests
- Follow [pattern] pattern

Use these existing utilities:
<utilities>
{{AVAILABLE_UTILITIES}}
</utilities>

Match the existing code style:
<example>
{{CODE_STYLE_EXAMPLE}}
</example>
```

### Documentation
```
Generate documentation for this code.

Include:
- Brief description (1-2 sentences)
- Parameters with types and descriptions
- Return value description
- Usage examples
- Edge cases and error conditions

Format: JSDoc for JavaScript/TypeScript

<code>
{{CODE}}
</code>
```

### Debugging
```
Help debug this issue:

Error message:
{{ERROR}}

Code that produces the error:
<code>
{{CODE}}
</code>

What I've tried:
{{ATTEMPTED_FIXES}}

Relevant context:
- Node.js version: {{VERSION}}
- Framework: {{FRAMEWORK}}
- Environment: {{ENV}}
```

---

## Anti-Patterns to Avoid

### Vague Instructions
```
# Bad
"Make this code better"

# Good
"Refactor this function to:
1. Reduce cyclomatic complexity below 10
2. Extract magic numbers to constants
3. Add input validation"
```

### Missing Context
```
# Bad
"Fix the bug"

# Good
"Fix the null pointer exception that occurs when
users.find() returns undefined on line 45.
The expected behavior is to return an empty array."
```

### Ambiguous Output Format
```
# Bad
"Write some tests"

# Good
"Write Jest unit tests with:
- describe/it structure
- AAA pattern (Arrange, Act, Assert)
- Coverage for happy path and error cases
- Mock external dependencies"
```

---

## Prompt Testing

### Evaluation Criteria
1. **Consistency**: Same prompt produces similar quality outputs
2. **Accuracy**: Output matches expected result
3. **Completeness**: All requirements addressed
4. **Format**: Output follows specified structure
5. **Edge Cases**: Handles unusual inputs gracefully

### A/B Testing Template
```
Test prompt variations:

Version A: [Original prompt]
Version B: [Modified prompt]

Test cases:
1. [Simple case]
2. [Complex case]
3. [Edge case]

Metrics:
- Correctness rate
- Response time
- Token usage
- User satisfaction
```

---

## Resources

- Anthropic Prompt Engineering Guide: https://docs.anthropic.com/claude/docs/prompt-engineering
- OpenAI Best Practices: https://platform.openai.com/docs/guides/prompt-engineering
- LangChain Prompts: https://python.langchain.com/docs/modules/model_io/prompts/
