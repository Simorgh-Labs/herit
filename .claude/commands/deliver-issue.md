Deliver a GitHub issue end-to-end: read it, implement it, open a PR, wait for CI, merge, and clean up.

## Usage

```
/deliver-issue <issue-number>
```

## Steps

### 1. Read the issue

```bash
gh issue view $ISSUE_NUMBER
```

Take note of:
- The issue title — use it to derive the branch name
- The full description and acceptance criteria
- Any labels (bug, feature, docs, chore) — these determine the branch prefix

### 2. Create a feature branch

Determine the correct prefix from the issue type:

| Label / type | Prefix     |
|---|---|
| Bug fix      | `fix/`     |
| New feature  | `feature/` |
| Documentation| `docs/`    |
| Maintenance  | `chore/`   |

Create the branch from an up-to-date `main`:

```bash
git checkout main
git pull
git checkout -b <prefix>/<short-description>
```

Use kebab-case for the description (e.g. `feature/add-language-filter`, `fix/pagination-recruiter-dashboard`).

### 3. Implement the changes

- Read the relevant existing files before making any edits — understand the current patterns first.
- Keep changes focused to the scope of the issue.
- Write or update tests to cover the changes.
- Follow existing code style; run `dotnet format` if you touch C# files.

### 4. Build and test

```bash
dotnet build --configuration Release
dotnet test --configuration Release --no-build
```

All tests must pass before continuing. Fix any failures before moving on.

### 5. Commit

Write a concise commit message in the imperative mood that references the issue:

```bash
git add <specific files>
git commit -m "$(cat <<'EOF'
<Short description of change>

Closes #$ISSUE_NUMBER

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Do not use `git add -A` — stage only the files that belong to this change.

### 6. Push and open a PR

```bash
git push -u origin HEAD
```

Then open a PR against `main`, filling in the project's PR template:

```bash
gh pr create \
  --base main \
  --title "<Issue title or short summary>" \
  --body "$(cat <<'EOF'
## Description

<Brief description of what this PR does and why.>

## Linked Issue

Closes #$ISSUE_NUMBER

## Type of Change

- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Chore / refactor

## Testing Notes

<Describe how this was tested.>

## Checklist

- [x] Code builds cleanly (`dotnet build`)
- [x] Tests pass (`dotnet test`)
- [ ] Relevant documentation updated
- [x] Branch follows naming convention (`feature/`, `fix/`, `docs/`, `chore/`)
EOF
)"
```

### 7. Wait for CI to pass

Poll until all checks are green:

```bash
gh pr checks --watch
```

If any check fails, investigate the logs, fix the issue, commit the fix, and push again before continuing.

### 8. Merge the PR

Once CI passes, merge using squash to keep `main` history clean:

```bash
gh pr merge --squash --auto
```

### 9. Sync local main and clean up

```bash
git checkout main
git pull
git branch -d <branch-name>
```

### 10. Close the issue

The `Closes #N` in the PR body automatically closes the issue on merge. If for any reason it is still open, close it explicitly:

```bash
gh issue close $ISSUE_NUMBER --comment "Delivered in PR merged to main."
```
