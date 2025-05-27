# Redmine Wiki WYSIWYG

This plugin provides a WYSIWYG-style editor for wiki pages.

## Features

- Edit wiki using rich text editor.

## Installation

1. Download plugin in Redmine plugin directory.
   ```sh
   git clone https://github.com/9506hqwy/redmine_wiki_wysiwyg.git
   ```
2. Build dependency libraries in this plugin directory.
   e.g. use [npm](https://nodejs.org/en) to build. [bun](https://bun.sh/) or [deno](https://deno.com/) is available alternatively.
   ```sh
   npm install
   npm run build
   ```
3. Start Redmine

## Configuration

1. Enable plugin module.

   Check [Wiki WYSIWYG] in project setting.

## Usage

* Text decoration
  * Click menu button to start text decoration, or click menu after select text to toggle to text decoration.
* Table
  * Click header cell to change text align.
  * Click data cell to operate for columne or row.
* Inner wiki link
  * Click menu button to add new inner text, or click menu after select text to toggle to inner link.
  * Click text to update link destination.
  * Change text to update display text.
* External link
  * Click menu button to add new external text, or click menu after select text to toggle to external link.
  * Click text to update link destination.
  * Change text to update display text.
* Image
  * Click menu button to add image. Input attached file name or external URL.

## Key Bindings

- `CTRL+b`: Bold.
- `CTRL+i`: Italic.
- `CTRL+e`: Inline code.
- `CTRL+ALT+0`: Text.
- `CTRL+ALT+1`: Heading level 1.
- `CTRL+ALT+2`: Heading level 2.
- `CTRL+ALT+3`: Heading level 3.
- `CTRL+ALT+7`: Order list.
- `CTRL+ALT+8`: Bullet list.
- `CTRL+ALT+c`: Code block.
- `CTRL+ALT+x`: Strike through.
- `CTRL+Shift+b`: Backquote.
- `Shift+Enter`: Hard break.
- In list block
  - `TAB`: Indent level +1.
  - `Shift+TAB`: Indent level -1.
  - `CTRL+Enter`: Exit code block.
- In table block
  - `TAB`: Next cell.
  - `Shift+TAB`: Previous cell.
  - `CTRL+Enter`: Exit table block.

## Note

* Delete all columns to delete table.
* Not support Textile format.
* Not support outline (toc).
* Display as is raw HTML for HTML syntax.
  * Not support menu button that toggles underline text decoration.
* In inner wiki link.
  * Not support text decoration at title part.

## Tested Environment

* Redmine (Docker Image)
  * 4.0
  * 4.1
  * 4.2
  * 5.0
  * 5.1
  * 6.0
* Database
  * SQLite
  * MySQL 5.7 or 8.0
  * PostgreSQL 12

## References

* [milkdown](https://milkdown.dev/)
