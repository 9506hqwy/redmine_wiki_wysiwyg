# frozen_string_literal: true

module RedmineWikiWysiwyg
  class ViewListener < Redmine::Hook::ViewListener
    render_on :view_layouts_base_html_head, partial: 'wiki_wysiwyg/html_head'
    render_on :view_layouts_base_body_bottom, partial: 'wiki_wysiwyg/body_bottom'
  end
end
