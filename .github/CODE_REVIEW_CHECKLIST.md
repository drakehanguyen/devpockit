# Code Review Checklist

Use this checklist when reviewing pull requests to ensure code quality and consistency.

## Code Quality

### TypeScript
- [ ] No `any` types (unless truly necessary)
- [ ] Proper type definitions for all functions and components
- [ ] Interfaces used for object shapes
- [ ] Type checking passes (`pnpm type-check`)

### Code Style
- [ ] Follows project naming conventions
- [ ] Consistent formatting (Prettier)
- [ ] No console.log statements left in code
- [ ] No commented-out code
- [ ] No TODO comments without context

### React Components
- [ ] Functional components with hooks
- [ ] Proper prop types/interfaces
- [ ] No unnecessary re-renders
- [ ] Proper use of React hooks (no violations)
- [ ] Accessibility considerations (if applicable)

### File Organization
- [ ] Files in correct directories
- [ ] Proper file naming conventions
- [ ] No circular dependencies
- [ ] Imports are organized correctly

## Functionality

### Logic
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors

### Performance
- [ ] No performance regressions
- [ ] Efficient algorithms/data structures
- [ ] Proper memoization (if needed)
- [ ] No unnecessary computations

### Testing
- [ ] Tests added for new functionality
- [ ] Existing tests still pass
- [ ] Test coverage maintained or improved
- [ ] Tests are meaningful and not just for coverage

## Security

### Input Validation
- [ ] User inputs are validated
- [ ] No XSS vulnerabilities
- [ ] No injection vulnerabilities
- [ ] Proper sanitization (if needed)

### Data Handling
- [ ] No sensitive data exposed
- [ ] No secrets in code
- [ ] Proper error messages (no info leakage)

## Documentation

### Code Comments
- [ ] Complex logic is commented
- [ ] JSDoc comments for public APIs
- [ ] Comments explain "why", not "what"

### Documentation Updates
- [ ] README updated (if needed)
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Architecture docs updated (if needed)
- [ ] Development docs updated (if needed)

## Build & Deployment

### Build Process
- [ ] Build succeeds (`pnpm build`)
- [ ] No build warnings
- [ ] Type checking passes
- [ ] Linting passes

### Compatibility
- [ ] Works in target browsers
- [ ] Mobile responsive (if applicable)
- [ ] No breaking changes (or properly documented)

## Git & PR

### Commit Quality
- [ ] Commit messages follow conventional commits
- [ ] Commits are logical and atomic
- [ ] No merge commits (use rebase)

### PR Quality
- [ ] PR description is clear
- [ ] Related issues are linked
- [ ] Screenshots provided (for UI changes)
- [ ] Breaking changes documented

## Tool-Specific (if adding/modifying tools)

### Tool Implementation
- [ ] Follows tool implementation pattern
- [ ] Logic in `src/libs/` (pure functions)
- [ ] Configuration in `src/config/`
- [ ] Component in `src/components/tools/`
- [ ] Registered in `src/libs/tools-data.ts`
- [ ] Added to component loader

### Tool Testing
- [ ] Unit tests for tool logic
- [ ] Component tests for tool UI
- [ ] Edge cases tested
- [ ] Error cases handled

## Accessibility

### WCAG Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (if applicable)
- [ ] Proper ARIA labels (if needed)
- [ ] Color contrast meets standards

## Performance

### Bundle Size
- [ ] No unnecessary dependencies added
- [ ] Code splitting used appropriately
- [ ] Lazy loading used where appropriate

### Runtime Performance
- [ ] No memory leaks
- [ ] Efficient rendering
- [ ] Proper cleanup (useEffect cleanup functions)

## Review Process

### Before Approving
1. Review all checklist items
2. Test the changes locally (if possible)
3. Verify CI checks pass
4. Check for any security concerns
5. Ensure documentation is updated

### Approval Criteria
- ✅ All critical items checked
- ✅ Code follows project standards
- ✅ Tests pass and coverage maintained
- ✅ No security issues
- ✅ Documentation updated

### Request Changes
If changes are needed:
- Be specific about what needs to change
- Provide examples or suggestions
- Explain why the change is needed
- Be respectful and constructive

## Common Issues to Watch For

### Anti-patterns
- ❌ Using `any` type unnecessarily
- ❌ Missing error handling
- ❌ Hardcoded values that should be configurable
- ❌ Duplicate code that should be extracted
- ❌ Missing tests for critical functionality

### Best Practices
- ✅ Proper TypeScript typing
- ✅ Error boundaries for React components
- ✅ Input validation
- ✅ Meaningful variable/function names
- ✅ DRY (Don't Repeat Yourself) principle

---

**Remember**: Code reviews are about improving code quality and learning. Be constructive, respectful, and helpful.

