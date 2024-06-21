# Contributing to Gravatar Hovercards

🤗 Welcome, and thank you for your interest in Gravatar Hovercards! Whether you're here to report an issue, suggest a new feature, or submit code changes, we greatly appreciate your help.

## Questions, Issue Reporting, and Feature Suggestions

Please [submit an issue](https://github.com/Automattic/gravatar/issues/new/choose) with all pertinent details and context to help us fully understand your report or suggestion. To avoid duplication, kindly check for existing issues or feature requests similar to yours before filing a new one.

## Code Contributions

We welcome Pull Requests, particularly for bug fixes related to any open issues you wish to address! If you're new to creating Pull Requests, we suggest you check out [this free video series](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

Gravatar Hovercards is developed using [TypeScript](https://www.typescriptlang.org/), [Sass](https://sass-lang.com/) (following [BEM naming conventions](https://getbem.com/)), and is bundled using [Webpack](https://webpack.js.org/). For package management and script running, we use [npm](https://www.npmjs.com/).

### Development Workflow

The general development workflow is as follows:

1. Fork and clone the repository.
2. Install the dependencies by running `npm install`. Make sure your Node version matches the minimum requirement specified in the `package.json` file.
3. Create a new branch, using [the branch naming scheme](https://github.com/Automattic/wp-calypso/blob/trunk/docs/git-workflow.md#branch-naming-scheme), e.g. `add/a-cool-feature` or `fix/100-a-bug`.
4. Navigate to the project directory by running `cd web/packages/hovercards`.
5. Build the library in development mode using `npm run build:watch`. This command compiles the code and watches for changes.
6. **In a new terminal**, start a local server with `npm run start`. Now you can modify the code in the `src` folder and test it (or the output formats) in the `playground` directory.
7. Update or add the related types if necessary.
8. If needed, update the relevant documentation such as [README.md](README.md) or [CONTRIBUTING.md](CONTRIBUTING.md).
9. Commit your changes and check if all the automated tests pass. (You can fix linting errors by running `npm run lint:<TYPE> --fix`)
10. Create a Pull Request with your changes.

### Scripts

Below is a list of available scripts. You can run them using `npm run <script>`:

- `start`: Starts a local server to test the library in development mode.
- `build`: Builds the library in production mode, creating the `dist` folder with bundled files.
- `build:dev`: Builds the library in development mode, creating the `dist` folder with bundled files.
- `build:watch`: Builds the library in development mode and watches for changes.
- `build:types`: Builds the library types.
- `build:core`: Builds the library in production mode for Vanilla JavaScript.
- `build:react`: Builds the library in production mode for React.
- `format`: Formats the code using the [`format`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#format) script of `@wordpress/scripts`.
- `type-check`: Checks the types using [TypeScript](https://www.typescriptlang.org/).
- `lint:js`: Lints the JavaScript / TypeScript code using the [`lint:js`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#lint-js) script of `@wordpress/scripts`.
- `lint:style`: Lints the Sass / CSS code using the [`lint:style`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#lint-style) script of `@wordpress/scripts`.
- `lint:md:docs`: Lints the Markdown files using the [`lint:md:docs`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#lint-md-docs) script of `@wordpress/scripts`.
- `lint`: Runs all the linters.
- `clean:dist`: Removes the `dist` folder.
- `clean:release`: Removes the `release` folder.
- `clean`: Removes all the generated folders (e.g. `dist`, `release`).

### PR Merge Policy

- Pull Requests (PRs) must pass all automated tests and receive approval from at least one reviewer before they can be merged into the `trunk` branch.
- Who is responsible for merging the approved PRs?
    - For PRs authored by external individuals who do not have push permissions, the reviewer who approved the PR will handle the merging process.
    - For PRs authored by contributors who have push permissions, the author of the PR will merge their own PR.

## Release Process

This project utilizes [release-it](https://github.com/release-it/release-it) for automating releases across both [NPM](https://npm.im/@gravatar-com/hovercards) and [GitHub](https://github.com/Automattic/gravatar/releases). There're two ways to create a new release:

- GitHub Action:
    - Go to [the release action page](https://github.com/Automattic/gravatar/actions/workflows/hovercards-release.yml)
    - Click on the `Run workflow` button
    - Choose the appropriate `Version type` (we use [Semantic Versioning](https://semver.org/))
    - Confirm by clicking on `Run workflow` again
- Local Release (with the push permission): In the root directory, run `npm run release` and follow the instructions.
