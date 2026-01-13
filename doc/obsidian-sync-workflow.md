# Obsidian ↔ Orrery Sync Workflow

## Direction 1: Obsidian → Orrery

1. Claude reads TaskNotes from vault
2. Claude generates `public/sync/obsidian-manifest.json`
3. User clicks "Sync from Obsidian" button
4. Tasks appear in Orrery with dependency edges

## Direction 2: Orrery → Obsidian

1. User clicks "To Obsidian" button
2. Downloads `orrery-to-obsidian-{timestamp}.json`
3. User shares JSON with Claude
4. Claude writes each task back to vault:

```javascript
// For each task in manifest.tasks:
await mcp__obsidian__write_note({
  path: task.path,
  content: task.content,
  mode: 'overwrite'
});
```

## What Syncs

| Field | Obsidian → Orrery | Orrery → Obsidian |
|-------|-------------------|-------------------|
| Title | filename → title | title → filename |
| Status | fm.status → status | computed status → fm.status |
| Priority | fm.priority → cognitiveLoad | cognitiveLoad → fm.priority |
| Time Est | fm.timeEstimate → estimatedMinutes | estimatedMinutes → fm.timeEstimate |
| Projects | fm.projects → questIds (via lookup) | questIds → fm.projects (via lookup) |
| Blocked By | fm.blockedBy → edges | edges → fm.blockedBy |
| Notes | content → notes | notes → content |

## What Doesn't Sync

- **Positions**: Orrery-only (visual layout)
- **Actual minutes**: Orrery-only (session tracking)
- **Scheduled date**: Obsidian-only (calendar feature)
- **Contexts**: Obsidian-only (GTD feature)
