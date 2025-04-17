# Redmine Wiki Wysiwyg

This plugin provides a WYSIWYG-style editor for wiki pages.

**Now this plugins is in early development phase.**

## Features

- Edit wiki using rich text editor powered by [milkdown](https://milkdown.dev/).

## Installatin

1. Download plugin in Redmine plugin directory.
   ```sh
   git clone https://github.com/9506hqwy/redmine_wiki_wysiwyg.git
   ```
2. Install dependency libraries in this plugin directory.
   ```sh
   npm run build
   ```
3. Start Redmine

## Configuration

1. Enable plugin module.

   Check [Wiki WYSIWYG] in project setting.

## Note

* WYSIWYG is not completed. e.g. table, code block, list.
* Move focus to previous line when press `ENTER` at table in IME mode using Firefox.
  * [#1484](https://github.com/ProseMirror/prosemirror/issues/1484) ?
* Not support Textile format.
* Not support image declaration.
* Not support auto-complete.

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
