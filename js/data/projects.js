export const PROJECTS = [
  {
    id:       'testgenie',
    name:     'TESTGENIE',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Full-stack AI test management SaaS',
    stack:    ['Java 21', 'Quarkus', 'AWS Lambda', 'DynamoDB', 'React 18', 'AWS Bedrock', 'TypeScript'],
    metrics: [
      { value: '70%',  label: 'DOC EFFORT ↓' },
      { value: '3×',   label: 'TEST SPEED ↑' },
      { value: '5+',   label: 'TEAMS USING' },
    ],
    problem:
      'Test documentation was entirely manual — engineers spent 70% of cycle time writing test cases ' +
      'instead of executing them. No traceability from Jira requirements to test coverage.',
    approach:
      'Serverless backend (Java 21 + Quarkus on AWS Lambda) with single-table DynamoDB design for ' +
      'low-latency access patterns. AWS Bedrock drives AI test case generation from Jira requirement ' +
      'context. React 18 + Material UI frontend with custom productivity dashboards.',
    challenges: [
      'Single-table DynamoDB design required upfront access-pattern modelling — GSI patterns needed 3 iterations',
      'AWS Bedrock prompt engineering for deterministic test case structure (not free-form prose)',
      'Cold-start latency on Lambda required SnapStart + provisioned concurrency tuning',
    ],
    links: [],
  },
  {
    id:       'bulldozer',
    name:     'BULLDOZER',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'LangChain AI documentation pipeline',
    stack:    ['Python', 'LangChain', 'Claude', 'Pydantic', 'Jira API', 'Confluence API'],
    metrics: [
      { value: '73+',   label: 'MICROSERVICES' },
      { value: '69%',   label: 'KNOWLEDGE COV.' },
      { value: 'mins',  label: 'VS DAYS BEFORE' },
    ],
    problem:
      'No one had documented 73+ microservices across 3 teams. New engineers had zero onboarding ' +
      'material. PRDs, API specs, and test plans had to be reverse-engineered from source code manually.',
    approach:
      'LCEL pipeline: ingest service code → Claude synthesises PRD → generate OpenAPI spec → ' +
      'produce test plan → push to Confluence. Pydantic models enforce structured output at each stage. ' +
      'Deterministic, not agentic — each step is a typed transformation.',
    challenges: [
      'Keeping Pydantic output schemas stable across different Claude response styles',
      'Jira/Confluence API rate limiting required backoff + resumable batch processing',
      'Prompt chaining: later stages depend on earlier outputs — error propagation required careful handling',
    ],
    links: [],
  },
  {
    id:       'evtframework',
    name:     'EVENT-DRIVEN TEST FRAMEWORK',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Java framework for AWS SNS/SQS microservice testing',
    stack:    ['Java', 'TestNG', 'AWS SNS', 'AWS SQS', 'AWS Bedrock', 'Jenkins'],
    metrics: [
      { value: '15+',  label: 'MICROSERVICES' },
      { value: '0',    label: 'PROD ESCAPES' },
      { value: '100%', label: 'FILTER COVERAGE' },
    ],
    problem:
      'Testing 15+ event-driven microservices required publishing SNS events, waiting for SQS ' +
      'processing, and asserting downstream state — all done manually per test cycle.',
    approach:
      'Reusable Java test library: SNS publisher + SQS async poller with configurable timeouts, ' +
      'SNS filter policy validator, mock service harness, and AWS Bedrock for parsing ' +
      'unstructured event payloads. Jenkins pipeline for full regression on every PR.',
    challenges: [
      'SQS eventual consistency: async polling with configurable backoff to avoid flaky timeouts',
      'SNS filter policy validation required simulating filter evaluation locally (no AWS API for this)',
      'Bedrock integration for event parsing needed prompt templating to handle schema variations',
    ],
    links: [],
  },
  {
    id:       'cctoolkit',
    name:     'CLAUDE CODE TOOLKIT',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Team-wide AI tooling standardisation via Claude Code',
    stack:    ['Bash', 'Claude Code', 'MCP Servers', 'Anthropic API', 'YAML'],
    metrics: [
      { value: '5+',    label: 'CUSTOM SKILLS' },
      { value: '3',     label: 'TEAMS ONBOARDED' },
      { value: '1-cmd', label: 'INSTALL' },
    ],
    problem:
      'Each engineer was using Claude ad-hoc with inconsistent prompts and no shared context. ' +
      'QA, Dev, and PM teams had no common AI workflow — value was siloed per individual.',
    approach:
      'Version-controlled toolkit: custom Claude Code skills (/generate-test-cases, /test-plan, ' +
      '/product-manager, /update-automation-status, /flowable-dev), MCP server configs ' +
      '(mcp-atlassian, playwright, context7), and a one-command idempotent Bash installer.',
    challenges: [
      'Making skills portable across machines with different project structures required relative-path conventions',
      'Multi-agent patterns (Opus for synthesis, Sonnet for scanning) needed careful permission modelling',
      'Onboarding PM team required skill UX simplification — no terminal familiarity assumed',
    ],
    links: [],
  },
];
