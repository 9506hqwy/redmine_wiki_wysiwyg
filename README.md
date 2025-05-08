# Redmine Wiki Wysiwyg

This plugin provides a WYSIWYG-style editor for wiki pages.

**Now this plugins is in development phase yet.**

## Features

- Edit wiki using rich text editor.

## Key Bindings

- `CTRL+b`: Bold.
- `CTRL+i`: Italic.
- `CTRL+e`: Inline code.
- `CTRL+ALT+0`: Text.
- `CTRL+ALT+1`: Heading level 1.
- `CTRL+ALT+2`: Heading level 2.
- `CTRL+ALT+3`: Heading level 3.
- `CTRL+ALT+8`: Bulk list.
- `CTRL+ALT+c`: Code block.
- `CTRL+ALT+x`: Strike through.
- `CTRL+Shiftb`: Backquote.
- `Shift+Enter`: Hard break.
- In code block
  - `TAB`: Indent level +1.
  - `Shift+TAB`: Indent level -1.
  - `CTRL+Enter`: Exit code block.
- In table block
  - `TAB`: Next cell.
  - `Shift+TAB`: Previous cell.
  - `CTRL+Enter`: Exit table block.

## Installation

1. Download plugin in Redmine plugin directory.
   ```sh
   git clone https://github.com/9506hqwy/redmine_wiki_wysiwyg.git
   ```
2. (Optional) Install dependency libraries in this plugin directory.
   This plugin uses many javascript modules from CDN in default.
   So, client can not access internet or low performance, then do this step.
   ```sh
   npm install
   npm run build
   ```
3. Start Redmine

## Configuration

1. Enable plugin module.

   Check [Wiki WYSIWYG] in project setting.

## Note

* Delete all columns to delete table.
* Not support Textile format.
* Not support outline (toc).
* Display as is raw HTML for HTML syntax.
  * Not support menu button that toggles underline text decoration.
* In inner wiki link.
  * Not support text decoration at title part.
* In list.
  + Not support empty list item.

## TODO

* Inner link.
  * other than wiki, e.g. document, news
* Auto-complete.
  * issues
  * mentions

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
