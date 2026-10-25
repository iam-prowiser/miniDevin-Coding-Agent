# minidevin

### Libraries / Tools

- **Pi** / coding-agent framework
- **Claude Agent SDK** or equivalent agent SDK
- Sandboxed execution environment
- Node.js / TypeScript
- Shell / terminal execution

### Your Agent Should Be Able To

- Read and search files
- Understand an existing codebase
- Modify/create files
- Execute shell commands
- Run tests
- Inspect errors
- Iterate on its solution

### Example

Give the agent:

> “This repository has 3 bugs. Find and fix them.”
> 

The agent should independently inspect the repository, make changes, run tests, and attempt to solve the task.

### Focus

**Autonomy + tool use + iterative reasoning**

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To type check:

```bash
bun check
```

Run `bun fmt` to format the code.

This project was created using `bun init` in bun v1.4.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
