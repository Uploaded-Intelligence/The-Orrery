# Superpowers setup notes

These notes capture the completed bootstrap of the Superpowers system and how to re-run it in any future session.

## What was installed
- `~/.codex/superpowers`: cloned from https://github.com/obra/superpowers.
- `~/.codex/skills`: personal skills directory (created if missing).
- `~/.codex/AGENTS.md`: records the instructions to run the bootstrap tool.

## Re-running the bootstrap
Use the Superpowers bootstrap tool to display the available skills and follow any prompts to load them:

```bash
~/.codex/superpowers/.codex/superpowers-codex bootstrap
```

The bootstrap tool is model-agnostic, so any agent (including Claude) can run the same command against this installation to review or load skills.
