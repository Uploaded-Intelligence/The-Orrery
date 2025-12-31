# AI Workflow Guide for Vibe Coders

> A strategic guide for non-developers using AI tools to build software.
> Last updated: December 2025

---

## Table of Contents

1. [Tool Categories Overview](#tool-categories-overview)
2. [Recommended Multi-Model Workflow](#recommended-multi-model-workflow)
3. [GPT Codex Code Review Setup](#gpt-codex-code-review-setup)
4. [Claude Code Multi-Instance Setup](#claude-code-multi-instance-setup)
5. [Cursor vs Windsurf Comparison](#cursor-vs-windsurf-comparison)
6. [Quick Reference](#quick-reference)

---

## Tool Categories Overview

Understanding what each tool does:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIBE CODER'S TOOLKIT                         │
├─────────────────────────────────────────────────────────────────┤
│  WHERE CODE GETS WRITTEN          WHERE YOU SEE RESULTS        │
│  ┌─────────────────────┐          ┌─────────────────────┐      │
│  │ • Claude Code (CLI) │          │ • Vercel            │      │
│  │ • Cursor            │    →     │ • Netlify           │      │
│  │ • Windsurf          │          │ • GitHub Pages      │      │
│  │ • Codespaces        │          │ • Codespaces (dev)  │      │
│  └─────────────────────┘          └─────────────────────┘      │
│                                                                 │
│  WHERE YOU GET OPINIONS           WHERE CODE LIVES             │
│  ┌─────────────────────┐          ┌─────────────────────┐      │
│  │ • GPT Codex(review) │          │ • GitHub            │      │
│  │ • Gemini (2nd look) │          │                     │      │
│  │ • Claude (explain)  │          │                     │      │
│  └─────────────────────┘          └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Purposes

| Tool | Category | Best For |
|------|----------|----------|
| **Claude Code** | Code Writer | Heavy lifting, complex multi-file changes, architecture |
| **GPT Codex** | Code Writer + Reviewer | Fast implementation, automated PR reviews |
| **Gemini** | Advisor | Visual/UI review, second opinions, multimodal tasks |
| **Cursor** | IDE | Power users who want to edit code themselves |
| **Windsurf** | IDE | Beginners who want simpler code editing |
| **Vercel** | Hosting | Automatic preview deployments |
| **GitHub Codespaces** | Cloud IDE | Browser-based development environment |

---

## Recommended Multi-Model Workflow

### The Strategic Approach

Use different AI models for their strengths:

```
PLANNING PHASE:        Claude Opus 4.5  →  "The Architect"
                       (structure, data flow, multi-file consistency)

IMPLEMENTATION:        Claude Code      →  Heavy lifting
                       (complex changes across many files)

FAST ITERATION:        GPT Codex        →  "The Sprinter"
                       (quick focused changes, clear scope)

VISUAL/UI REVIEW:      Gemini 3 Pro     →  "The Eyes"
                       (can see your screen, review UI)

CODE REVIEW:           GPT Codex        →  Automated PR reviews
                       (catches bugs, style issues, security)
```

### Workflow by Phase

#### Phase 1: Planning
1. Describe your feature/idea to Claude
2. Ask Claude to create an architecture plan
3. Get a second opinion from Gemini (paste the plan)
4. Finalize the approach

#### Phase 2: Implementation
1. Have Claude Code implement the changes
2. Push to a feature branch
3. Automatic preview via Vercel (see results immediately)

#### Phase 3: Review
1. GPT Codex automatically reviews the PR
2. Address any issues flagged
3. Get Gemini's opinion on UI/visuals if needed

#### Phase 4: Merge
1. Review looks good → Merge to main
2. Vercel auto-deploys to production

---

## GPT Codex Code Review Setup

### Option 1: GitHub Integration (Recommended)

This gives you automatic code reviews on every Pull Request.

#### Prerequisites
- ChatGPT Plus, Pro, Business, or Enterprise subscription
- GitHub account with repository access

#### Setup Steps

1. **Go to Codex Settings**
   - Visit [chatgpt.com/codex](https://chatgpt.com/codex)
   - Click on Settings/Integrations

2. **Connect GitHub**
   - Authorize Codex to access your GitHub repositories
   - Select the repositories you want to enable

3. **Enable Code Review**
   - In Codex settings, enable "Code review" for your repository
   - Choose automatic review or manual trigger

4. **Using Code Review**

   **Automatic:** Every PR gets reviewed automatically

   **Manual:** Comment on any PR with:
   ```
   @codex review
   ```

   **Focused Review:** Ask for specific checks:
   ```
   @codex review for security vulnerabilities
   @codex review for performance issues
   @codex review for accessibility
   ```

5. **Customize with AGENTS.md**

   Create an `AGENTS.md` file in your repository root:
   ```markdown
   # Review Guidelines

   ## Code Style
   - Use functional components in React
   - Prefer const over let
   - Always handle errors explicitly

   ## Security
   - Flag any hardcoded credentials
   - Check for SQL injection in queries
   - Validate all user inputs

   ## Performance
   - Flag unnecessary re-renders in React
   - Check for N+1 query patterns
   ```

   Codex will follow these guidelines when reviewing.

### Option 2: Manual Review via ChatGPT Web

1. Open your PR on GitHub
2. Copy the diff or changed files
3. Go to ChatGPT and paste with prompt:
   ```
   Review this code for bugs, security issues, and improvements:

   [paste code here]
   ```

### Option 3: Codex CLI

```bash
# Install Codex CLI
npm install -g @openai/codex

# Authenticate
codex auth

# Review a specific PR
codex review --pr 123 --repo username/repo-name

# Focus on security
codex review --pr 123 --repo username/repo-name --focus security
```

### Option 4: GitHub Action (CI/CD)

Add to `.github/workflows/codex-review.yml`:

```yaml
name: Codex Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Codex Review
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: review
```

---

## Claude Code Multi-Instance Setup

Running multiple Claude Code instances lets you work on different tasks/projects in parallel.

### Option 1: Multiple Terminal Windows (Simple)

The simplest approach - just open multiple terminals:

```bash
# Terminal 1 - Project A
cd ~/project-a
claude

# Terminal 2 - Project B
cd ~/project-b
claude

# Terminal 3 - Project C
cd ~/project-c
claude
```

Each instance has its own context and works independently.

### Option 2: Claude Squad (Recommended for Power Users)

[Claude Squad](https://github.com/smtg-ai/claude-squad) manages multiple AI agents with isolated workspaces.

#### Installation

```bash
# Install Claude Squad
go install github.com/smtg-ai/claude-squad@latest

# Or via Homebrew (macOS)
brew install claude-squad
```

#### Usage

```bash
# Start Claude Squad
claude-squad

# Create new agent sessions
# Each gets its own git worktree (isolated branch)
```

#### Features
- Manages multiple Claude Code, Codex, Gemini agents
- Each agent works on its own branch (git worktree)
- Visual dashboard to see all agents' progress
- Prevents conflicts between parallel work

### Option 3: Git Worktrees (Manual but Flexible)

Create isolated working directories for parallel work:

```bash
# In your main repo
cd ~/The-Orrery

# Create worktrees for different features
git worktree add ../orrery-feature-auth feature/auth
git worktree add ../orrery-feature-ui feature/ui
git worktree add ../orrery-bugfix bugfix/issue-42

# Now run Claude Code in each
# Terminal 1
cd ../orrery-feature-auth && claude

# Terminal 2
cd ../orrery-feature-ui && claude

# Terminal 3
cd ../orrery-bugfix && claude
```

Each worktree is an independent checkout - changes don't conflict.

### Option 4: Subagents (Within Single Claude Session)

Ask Claude Code to spawn parallel subagents:

```
"Explore the codebase using 4 tasks in parallel.
Each agent should explore different directories."

"Implement these 3 features in parallel:
1. Add dark mode toggle
2. Create export function
3. Fix the timer bug"
```

Claude will spawn subagents that work simultaneously.

### Best Practices for Multi-Instance

1. **Separate Concerns**: Each instance should work on different files/features
2. **Use Branches**: Create a branch for each parallel task
3. **Monitor Rate Limits**: Heavy parallel usage can hit API limits
4. **Merge Carefully**: Review changes before merging parallel work

### Maximizing Double Usage Limits

With 2x usage limits, you can:

1. **Run 2-3 instances comfortably** without hitting limits
2. **Use subagents liberally** for exploration and parallel tasks
3. **Tackle multiple projects** - switch between repos freely
4. **Don't hold back on complex requests** - let Claude think deeply

---

## Cursor vs Windsurf Comparison

### Quick Comparison

| Factor | Cursor | Windsurf | Winner for Non-Devs |
|--------|--------|----------|---------------------|
| **Learning curve** | Steeper, many features | Simpler, intuitive | **Windsurf** |
| **For beginners** | Overwhelming | Designed for ease | **Windsurf** |
| **Multi-file edits** | Powerful, manual | "Vibe and Replace" | **Windsurf** |
| **Speed** | Faster execution | Slightly slower | Cursor |
| **Community** | Larger, more resources | Growing | Cursor |
| **Price** | $20/month | $15/month | **Windsurf** |
| **AI model access** | Claude, GPT, etc. | Claude, GPT, etc. | Tie |

### When to Use Each

**Choose Windsurf if you:**
- Are new to coding/vibe coding
- Want things to "just work"
- Prefer delegating to AI
- Are building frontend-heavy projects
- Want simpler pricing

**Choose Cursor if you:**
- Have some coding experience
- Want maximum control
- Prefer directing the AI precisely
- Are working on complex backends
- Want access to power features

### Do You Even Need Them?

If Claude Code is doing all the heavy lifting, you may not need Cursor or Windsurf. They're most valuable when:

- You want to make small edits yourself
- You want to see code in a visual editor
- You want inline AI suggestions while typing

---

## Quick Reference

### Daily Workflow Cheatsheet

```
Morning: Plan with Claude what to work on today
   ↓
Work Session: Claude Code implements features
   ↓
Auto-Preview: Vercel shows live preview (no manual steps!)
   ↓
Review: GPT Codex reviews PRs automatically
   ↓
Polish: Use Gemini for UI/visual feedback
   ↓
Merge: Approve and merge when ready
```

### Command Quick Reference

```bash
# Start Claude Code
claude

# Run Claude Code in specific directory
cd ~/my-project && claude

# Start multiple instances
# Just open multiple terminals!

# Trigger GPT Codex review (in GitHub PR comment)
@codex review

# Focused Codex review
@codex review for security
```

### Useful Prompts

**For Claude Code:**
```
"Implement [feature] across all necessary files"
"Fix the bug where [description]"
"Refactor [component] to use [pattern]"
"Run 3 parallel tasks to [description]"
```

**For GPT Codex Review:**
```
@codex review
@codex review for security vulnerabilities
@codex review for performance issues
@codex review focusing on error handling
```

**For Gemini:**
```
"Look at this UI screenshot - what can be improved?"
"Review this architecture diagram"
"Is this the right approach for [problem]?"
```

---

## Resources

### Official Documentation
- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [OpenAI Codex](https://openai.com/codex)
- [Vercel Docs](https://vercel.com/docs)
- [Cursor](https://cursor.sh)
- [Windsurf](https://windsurf.ai)

### Tools Mentioned
- [Claude Squad](https://github.com/smtg-ai/claude-squad) - Multi-agent orchestration
- [Conductor](https://www.vibesparking.com) - Claude Code parallelization

### Community
- [Vibe Coding Guide](https://vibecoding.app)
- [AI Code Editor Comparisons](https://www.qodo.ai/blog/windsurf-vs-cursor/)

---

*This guide is maintained as part of The Orrery project. Last updated December 2025.*
