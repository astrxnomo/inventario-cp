# Skills Migration Plan

This file documents the plan and precise manual confirmation process for permanently deleting legacy skills under `.agents/skills/` after migration to curated skills.

## Steps

1. **Replace AGENTS.md:**
   - Insert/replace root AGENTS.md with curated skills and conventions, referencing `.agents/skills/registry.json`.
2. **Create curated skill folders:**
   - Add new SKILL.md for each curated skill.
3. **Update registry.json:**
   - Ensure all curated skills are listed; validate against schema if available.
4. **Complete migration PR (or review as branch):**
   - Verify new documentation and registry are in place.
5. **Generate `delete-list.txt`:**
   - List all legacy skill folders as candidates for deletion. **Do _not_ delete at this stage.**
6. **[REQUIRED] Backup:**
   - Before any deletion, backup `.agents/skills/*` not present in registry.json to `.agents/skills/legacy-backup/<timestamp>/`.
7. **Request manual confirmation:**
   - Maintainers must explicitly comment or issue with:

     `CONFIRM DELETE SKILLS <branch-or-commit-sha> <user>`

   This token must be recorded in PR comment/issue, and referenced before deletion proceeds.

8. **CI Deletion Block:**
   - CI must block actual deletion until token and backup are validated.
9. **Delete legacy folders:**
   - After confirmation, delete all listed in `delete-list.txt`, commit, and push.

## Safety Notes

- NO destructive operation on `.agents/skills/*` until _after_ explicit confirmation is recorded.
- All changes are staged and committed for traceability.
- Backups must be verified, and backup path/policy documented in branch/PR.

## Confirmation Token Format

To authorize deletion, submit exactly:

```
CONFIRM DELETE SKILLS <branch-or-commit-sha> <user>
```

- Replace `<branch-or-commit-sha>` with active branch or commit SHA.
- Replace `<user>` with your GitHub username.

## For maintainers

For full context, see implementation commit log and apply-report.json.
