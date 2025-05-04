# Redmine Wiki Wysiwyg

This plugin provides a WYSIWYG-style editor for wiki pages.

**Now this plugins is in development phase yet.**

## Features

- Edit wiki using rich text editor powered by [milkdown](https://milkdown.dev/).

## Key Bindings

- `CTRL+b`: Bold.
- `CTRL+i`: Italic.
- `CTRL+e`: Inline code.
- `CTRL+ALT+0`: Text.
- `CTRL+ALT+1`: Heading level 1.
- `CTRL+ALT+2`: Heading level 2.
- `CTRL+ALT+3`: Heading level 3.
- `CTRL+ALT+c`: Code block.
- `CTRL+ALT+x`: Strike through.
- In code block
  - `CTRL+Enter`: Exit code block.
- In table block
  - `CTRL+Enter`: Exit table block.

## Installatin

1. Download plugin in Redmine plugin directory.
   ```sh
   git clone https://github.com/9506hqwy/redmine_wiki_wysiwyg.git
   ```
2. Install dependency libraries in this plugin directory.
   ```sh
   npm install
   npm run build
   ```
3. Start Redmine

## Configuration

1. Enable plugin module.

   Check [Wiki WYSIWYG] in project setting.

## Note

* Not support Textile format.
* Not support outline (toc).
* Display as is raw HTML for HTML syntax.
  * Not support menu button that toggles underline text decoration.
* Inner link.
  * link to another project's wiki
  * other than wiki, e.g. document, news
  * text decoration at title.
* Table
  * Not support newline in cell.
  * Not support to display cell with align.
* Not support auto-complete.
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
