<h1 align="center">
  <br>
  <a href="https://github.com/vstacked/commit_convention"><img src="./icon.png" alt="Markdownify" width="200"></a>
  <br>
  Commit Convention
  <br>
</h1>

<h4 align="center">A commit conventional tools desktop app built on top of <a href="http://electron.atom.io" target="_blank">Electron</a>.</h4>

<p align="center">
  <a href="https://www.electronjs.org/">
    <img src="https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white"
         alt="Electron">
  </a>
  <a href="https://jquery.com/">
    <img src="https://img.shields.io/badge/jquery-%230769AD.svg?logo=jquery&logoColor=white"
         alt="Electron">
  </a>
  <a href="https://code.visualstudio.com/"><img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?logo=visual-studio-code&logoColor=white"></a>
  <a href="https://github.com/vstacked/commit_convention">
      <img src="https://img.shields.io/github/last-commit/vstacked/commit_convention">
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#keyboard-shortcuts">Keyboard Shortcuts</a> •
  <a href="#license">License</a>
</p>

![demo](https://github.com/user-attachments/assets/e7d6d6e2-e368-4119-b529-b224be67501d)

### with Gemini 🎉

![demo-gemini](https://github.com/user-attachments/assets/e7bbba28-91a1-4a68-bed5-3c9a7ee2a466)

## Key Features

- Write commit messages quickly with a tap/click interface
- Autocomplete suggestions based on your commit history
- Flexible Copy Options
  - Copy commit messages as plain text
  - Copy as complete Git commit commands for easy pasting in terminal
- Project Profiles
  - Create and manage multiple profiles for different projects
  - Customize commit types and templates for each profile
- History Management
- Integrated with [Gemini AI](https://gemini.google.com/) to review and revised your commit message

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com), [yarn](https://yarnpkg.com/) and [Node.js](https://nodejs.org/en/download/) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/vstacked/commit_convention.git

# Go into the repository
$ cd commit_convention

# Install dependencies
$ yarn install

# Run the app
$ yarn run start
```

## Download

You can [download](https://github.com/vstacked/commit_convention/releases/tag/1.0.0) the latest installable version of Commit Convention for Windows.

## Keyboard Shortcuts

| Command                                | Key                                                            |
| -------------------------------------- | -------------------------------------------------------------- |
| Select / Unselect type `feat`          | <kbd>ctrl</kbd><kbd>1</kbd>                                    |
| Select / Unselect type `fix`           | <kbd>ctrl</kbd><kbd>2</kbd>                                    |
| Select / Unselect type `refactor`      | <kbd>ctrl</kbd><kbd>3</kbd>                                    |
| Select / Unselect type `perf`          | <kbd>ctrl</kbd><kbd>4</kbd>                                    |
| Select / Unselect type `style`         | <kbd>ctrl</kbd><kbd>5</kbd>                                    |
| Select / Unselect type `test`          | <kbd>ctrl</kbd><kbd>6</kbd>                                    |
| Select / Unselect type `docs`          | <kbd>ctrl</kbd><kbd>7</kbd>                                    |
| Select / Unselect type `build`         | <kbd>ctrl</kbd><kbd>8</kbd>                                    |
| Select / Unselect type `chore`         | <kbd>ctrl</kbd><kbd>9</kbd>                                    |
| Select / Unselect type `ops`           | <kbd>ctrl</kbd><kbd>0</kbd>                                    |
| Trigger autocomplete                   | <kbd>ctrl</kbd><kbd>space</kbd>                                |
| Close autocomplete & Profile(s) window | <kbd>Esc</kbd>                                                 |
| Autocomplete select move down          | <kbd>Arrow Down</kbd><br/>or <br/> <kbd>ctrl</kbd><kbd>j</kbd> |
| Autocomplete select move up            | <kbd>Arrow Up</kbd><br/>or <br/> <kbd>ctrl</kbd><kbd>k</kbd>   |
| Autocomplete apply selected            | <kbd>Enter</kbd>                                               |

## License

MIT
