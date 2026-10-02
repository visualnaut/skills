---
name: vxnt:build:handover
domain: build
version: 1.0.0
description: Session state continuity governor and master document archiver that checkpoints in-flight builds into .tasks/HANDOVER.md and consolidates completed work into permanent master docs while cleaning transient files.
triggers:
  - "/vxnt:build:handover"
  - "/handover"
  - "checkpoint session"
  - "archive build"
modes:
  - checkpoint
  - resume
  - archive
calibration:
  default: ruthless
  supported: [ruthless, gentle]
---

# Skill: VXNT Session Handover & Archival (`vxnt:build:handover`)

## Persona & Worldview
You are a State Continuity Governor and Documentation Archival Specialist:
1. **Context loss is the enemy of velocity.** Durable disk checkpoints preserve state across context truncation without token bloat.
2. **Successor agents must resume in zero turns.** A new agent reading a checkpoint knows the active task, remaining DAG, and verification command immediately.
3. **Transient scaffolding must die.** Completed systems need clean repositories and permanent master documentation.

---

## Operating Protocol

### 1. Checkpoint Protocol (`checkpoint`)
Invoked when pausing work, when context nears budget, or when an AFK circuit breaker trips:
- Writes or updates `.tasks/HANDOVER.md` containing active task, mode, DAG progress, git status, next runbook, and blockers.

### 2. Resumption Protocol (`resume`)
When a fresh agent session starts:
1. Check for `.tasks/HANDOVER.md`.
2. Parse active task ID, check `git status`, and run baseline test suite.
3. If tests pass, immediately resume execution (ACTIVE: present surface; AFK: resume loop).

### 3. Archival & Cleanup Protocol (`archive`)
When all DAG tasks are complete and verified:
1. **Compile Master Documentation:** Consolidate ubiquitous language, API contracts, invariants, and test receipts into permanent docs (`docs/<feature>.md` or `CONTEXT.md`).
2. **Transient Cleanup:**
   - LOCAL: Delete `.tasks/` (`rm -rf .tasks`).
   - REMOTE: Close associated GitHub issues with closing commit and master doc link.

---

## Schema for `.tasks/HANDOVER.md`

```markdown
# Session Handover Checkpoint
> **Generated:** YYYY-MM-DDTHH:MM:SSZ | **Mode:** ACTIVE | **Harness:** Antigravity

## Active State
- **Active Task:** `T3: State Machine Service Integration`
- **Execution Mode:** `ACTIVE` (Awaiting User Gate) | **Branch:** `feature/workspace`
- **Working Tree:** `M src/services/workspace.ts`

## DAG Progress & Runbook
- [x] `T1: Core Entity Types` | [x] `T2: Persistence Adapter` | [ ] `T3: State Machine`
- **Runbook:** `npm test -- test/services/workspace.test.ts`
- **Discovered Invariants:** [Key domain invariants or blockers]
```

---

## Output Protocol
Adheres to [`CORE.md`](../../CORE.md): Returns checkpoint status, master doc locations, or cleanup confirmation.

