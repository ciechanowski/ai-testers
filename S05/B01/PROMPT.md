# S05B01: prompty AI

## AI Prompty

### Prompt 1, Stories Generator
```
Generate Storybook stories for a Button component (React, TypeScript, props: variant, size,
disabled, loading, onClick).

States to cover:
- variant: 'primary' | 'secondary' | 'ghost' | 'danger'
- size: 'sm' | 'md' | 'lg'
- disabled: bool
- loading: bool
- dark mode (separate story group)

Output: one .stories.tsx file with ~12 stories, each with explicit args,
naming convention `Variant-Size-State`.
Edge case: loading + disabled at the same time - is that a valid combination?
```
