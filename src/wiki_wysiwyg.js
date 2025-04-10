import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "./wiki_wysiwyg.css";


document.addEventListener('DOMContentLoaded', function() {
  let wysiwygEditor = null;

  const editTab = document.querySelector('div.jstTabs .tab-edit');
  const previewTab = document.querySelector('div.jstTabs .tab-preview');
  const wysiwygTab = document.querySelector('.tab-wysiwyg');
  if (previewTab && wysiwygTab) {
    previewTab.closest('ul').insertBefore(wysiwygTab.parentNode, previewTab.parentNode.nextSibling);
  } else {
    wysiwygTab.style.display = 'none';
  }

  const editContent = document.querySelector('#content_text');
  const previewContent = document.querySelector('#preview_content_text');
  const wysiwygContent = document.querySelector('#wysiwyg_content_text');
  if (previewContent && wysiwygContent) {
    previewContent.parentNode.appendChild(wysiwygContent);
  } else {
    wysiwygContent.style.display = 'none';
  }

  const submitButton = document.querySelector('input[name="commit"]');

  const disablewysiwygContent = () => {
    wysiwygTab.classList.remove('selected');
    wysiwygContent.classList.add('hidden');
    if (wysiwygEditor != null) {
      editContent.value = wysiwygEditor.getMarkdown();
      wysiwygEditor.destroy();
      wysiwygEditor = null;
    }

    submitButton.disabled = false;
  };

  const enablewysiwygContent = (e) => {
    e.preventDefault();

    if (e.target.classList.contains('selected')) {
      return;
    }

    submitButton.disabled = true;

    editTab.classList.remove('selected');
    previewTab.classList.remove('selected');
    wysiwygTab.classList.add('selected');

    document.querySelector('div.jstTabs .jstElements').classList.add('hidden');

    editContent.classList.add('hidden');
    previewContent.classList.add('hidden');
    wysiwygContent.classList.remove('hidden');

    wysiwygContent.innerHTML = '';

    wysiwygEditor = new Crepe({
       root: wysiwygContent,
       defaultValue: editContent.value,
       features: {
          [Crepe.Feature.LinkTooltip]: false,
          [Crepe.Feature.ImageBlock]: false,
          [Crepe.Feature.Placeholder]: false,
          [Crepe.Feature.Latex]: false
       }
    });

    wysiwygEditor.on((listener) => {
      listener.updated(function() {
        // Use jQuery change method because dispatchEvent does not work expectedly.
        $('#content_text').change();
      });
    });

    wysiwygEditor.create();
  };

  editTab && editTab.parentNode.addEventListener('click', disablewysiwygContent);
  previewTab && previewTab.parentNode.addEventListener('click', disablewysiwygContent);
  wysiwygTab && wysiwygTab.addEventListener('click', enablewysiwygContent);
});
