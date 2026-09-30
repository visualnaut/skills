# The Code Gauntlet Recipe

> **Composite Multi-Agent Workflow:** `vxnt:code-review` ➔ `vxnt:adversarial` ➔ `vxnt:simplifier`  
> **Target:** Code Diffs, Pull Requests, Architecture RFCs, or Critical Modules.

---

## Workflow Objective
The Code Gauntlet subjects any codebase change to a three-tier gauntlet:
1. **Tier 1 (`vxnt:code-review`):** Audits architecture, seams, cognitive readability, and error paths.
2. **Tier 2 (`vxnt:adversarial`):** Attacks the reviewed code to expose race conditions, resource exhaustion, and security/input breaking points.
3. **Tier 3 (`vxnt:simplifier`):** Strips away any defensive over-engineering or premature abstractions introduced during steps 1 & 2, delivering the leanest possible production code.

```mermaid
flowchart LR
    A[Input Code / Diff] --> B[1. Code Reviewer (vxnt:code-review)]
    B -->|Seams & Architecture| C[2. Adversarial Red Team (vxnt:adversarial)]
    C -->|Failure Modes & Hardening| D[3. The Simplifier (vxnt:simplifier)]
    D -->|YAGNI & Bloat Cut| E[Hardened & Minimal Code]
```

---

## Token Efficiency Directive (`vxnt:token-economist`)
> **Context Control:** Between passes, pass ONLY the diff and bulleted blocker fixes—never repeat raw tool outputs, package files, or full unchanged files.

---

## Step-by-Step Invocation Protocol

### Step 1: Run Architectural Review
Run the `vxnt:code-review` skill on the target file or diff:
```
/vxnt:code-review
<paste code diff or file path>
```
*Goal:* Identify interface leaks, error handling gaps, and cognitive complexity. Note the `[BLOCKER]` and `[WARNING]` items.

### Step 2: Red Team the Proposed Patch
Feed the code (including any fixes from Step 1) to `vxnt:adversarial`:
```
/vxnt:adversarial
<paste code with applied Step 1 fixes>
```
*Goal:* Probe concurrency, edge-case inputs, failure cascades, and state corruption. Apply necessary guards.

### Step 3: Strip Defensive Bloat
Feed the hardened code to `vxnt:simplifier`:
```
/vxnt:simplifier
<paste hardened code>
```
*Goal:* Ensure the hardening didn't invent 3 new layers of abstraction or introduce unnecessary third-party packages. Replace complex custom logic with native standard library methods.

---

## Automated Gauntlet Prompt (For Single-Prompt LLM Execution)

If running in a single web prompt or non-agentic LLM, paste this prompt:

```markdown
Run the **Code Gauntlet** on the following code. Execute three passes in order:

PASS 1 - ARCHITECTURE & STANDARDS (code-review):
- Evaluate interface depth, cognitive load, error handling completeness, and maintainability.
- List all BLOCKER and WARNING issues with exact diffs.

PASS 2 - ADVERSARIAL STRESS-TEST (adversarial):
- Attack the code for race conditions, toxic inputs, cascading resource exhaustion, and unhandled failure states.
- Provide exploit/failure scenarios and hardening diffs.

PASS 3 - SIMPLIFICATION & YAGNI (simplifier):
- Review the combined result. Cut any premature abstractions, replace complex code with standard library primitives, and minimize net lines of code.

FINAL DELIVERABLE:
1. Combined Scorecard Matrix across all three domains.
2. The final, consolidated, hardened, and simplified code block ready for production.

---
CODE TO REVIEW:
<paste your code here>
```
