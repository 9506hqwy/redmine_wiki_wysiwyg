# frozen_string_literal: true

basedir = File.expand_path('../lib', __FILE__)
libraries =
  [
    'redmine_wiki_wysiwyg/view_listener',
  ]

libraries.each do |library|
  require_dependency File.expand_path(library, basedir)
end

Redmine::Plugin.register :redmine_wiki_wysiwyg do
  name 'Redmine Wiki Wsyisyg Plugin'
  author '9506hqwy'
  description 'This is a Wiki wysiwyg plugin for Redmine'
  version '0.1.0'
  url 'https://github.com/9506hqwy/redmine_wiki_wysiwyg'
  author_url 'https://github.com/9506hqwy'

  project_module :wiki_wysiwyg do
    # CAUTION: not used
    permission :manage_wiki_wysiwyg, { }
  end
end
