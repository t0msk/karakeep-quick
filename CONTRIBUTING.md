# Contributing to Karakeep Quick

First off — thank you for taking the time to contribute! Whether it's a bug fix, a new feature, or just fixing a typo, every contribution makes this extension better for everyone.

This document explains how to get set up, what standards we follow, and how the PR review process works.

---

## 📦 Project Setup

If this is your first time contributing:

1. **Fork** the repository to your own GitHub account:
   `https://github.com/t0msk/karakeep-quick/fork`

2. **Clone** your fork locally:

    ```bash
    git clone https://github.com/YOUR_FORK/karakeep-quick.git
    cd karakeep-quick
    ```

3. Set the **original repository** as an upstream remote so you can stay up to date:

    ```bash
    git remote add upstream https://github.com/t0msk/karakeep-quick.git
    ```

4. **Install dependencies** and generate the extension icons:

    ```bash
    npm install
    python3 generate_icons.py
    ```

5. **Start the development build watcher:**

    ```bash
    npm run dev
    ```

    Then open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and point it at the `dist/` folder. Refresh the extension card after each rebuild.

---

## 🌿 Branching & Workflow

1. Always create a **new branch** for your work — never commit directly to `main`:

    ```bash
    git checkout -b your-branch-name
    ```

2. Use a clear, descriptive branch name. For larger changes, prefix it:
    - `feature/add-keyboard-navigation`
    - `fix/search-debounce-memory-leak`
    - For small tweaks (typos, minor style fixes) a plain descriptive name is fine

3. Keep your fork up to date with upstream before opening a PR:

    ```bash
    git fetch upstream
    git rebase upstream/main
    ```

4. Push your branch to your fork:

    ```bash
    git push origin your-branch-name
    ```

---

## 🧹 Code Style & Formatting

We use **Prettier** with the following settings (see `.prettierrc` in the repo root):

```json
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "all",
    "printWidth": 100
}
```

**You must format your code before submitting a PR.** Run:

```bash
npx prettier --write .
```

If you use VS Code or a compatible editor, add this to your `settings.json` to auto-format on save:

```json
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnSave": true
```

### TypeScript

- All new code must be TypeScript — no plain `.js` files in `src/`
- Avoid `any` — use proper types or generics
- Add types to `src/types/index.ts` if they describe Karakeep API shapes

### Tailwind CSS

- We use **Tailwind CSS v4** — utility classes directly in JSX
- Use CSS custom property arbitrary values (`bg-[var(--bg-elevated)]`) for design tokens that need to respond to the light/dark theme
- Do not add new hardcoded hex colors directly in components — extend the theme variables in `src/styles/globals.css` instead

---

## 🧠 Code Quality Guidelines

1. ✅ Write clean, modular, composable components — one responsibility per file
2. 🧼 Avoid hardcoding values that belong in the design system or types
3. 💬 Add comments for non-obvious logic — especially around Chrome Extension APIs and async edge cases
4. 🚫 Keep PRs focused — one feature or fix per PR makes review much faster
5. 🌓 Any new UI must respect both light and dark themes — test both before submitting

---

## ✅ Pull Request Process

1. Push your branch to your fork
2. Open a Pull Request targeting the `main` branch of this repository
3. Fill in the PR template with:
    - A clear title summarising the change
    - A description of what was changed and why
    - Screenshots or a short screen recording for any UI changes
4. **PR Review Requirements:**
    - Your PR must be approved by a maintainer before it can be merged
    - Address all review comments before requesting a re-review
    - Squash trivial fixup commits before final merge

### What makes a great PR

- Small, focused diff — easier to review and less likely to conflict
- Meaningful commit messages (`feat: add keyboard navigation to search results`)
- No unrelated changes (reformatting unrelated files, etc.)
- Updated README or inline docs if the change affects usage

---

## 🐛 Reporting Bugs

Open an issue using the **Bug Report** template. Please include:

- Steps to reproduce
- Expected vs. actual behaviour
- Chrome version and OS
- Your Karakeep version/instance type (cloud / self-hosted)
- Any relevant console errors from `chrome://extensions → Karakeep Quick → background page`

---

## 💡 Suggesting Features

Open an issue using the **Feature Request** template, or start a [Discussion](https://github.com/t0msk/karakeep-quick/discussions) if you want to talk through an idea before committing to code.

Check the [Roadmap](README.md#️-roadmap) first — your idea might already be planned!

---

## 💬 Questions or Help?

If you're unsure about something or want feedback before writing code:

- Start a [Discussion](https://github.com/t0msk/karakeep-quick/discussions)
- Open a draft PR early and label it `help wanted`

---

We're glad to have you here — happy coding! 💻
