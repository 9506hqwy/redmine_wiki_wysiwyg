import { imageSchema } from "@milkdown/preset-commonmark";
import { $view } from "@milkdown/utils";

// View image AST.
export const imageView = $view(imageSchema.node, (ctx) => {
  return (node, view, getPos, decorations, innerDecorations) => {
    const image = document.createElement("img");
    const url = toUrl(node.attrs.src);

    if (url === node.attrs.src) {
      // external site.
      image.src = url;
    } else {
      const name = node.attrs.src;
      const existing = findExistingAttachment(name);
      if (existing) {
        // already attach file.
        image.src = `/attachments/download/${existing}/${name}`;
      } else {
        const newAt = findNewAttachment(name);
        if (newAt) {
          // new attach file.
          image.src = `/attachments/download/${newAt}/${name}`;
        } else {
          // fallback.
          image.src = url;
        }
      }
    }

    image.alt = node.attrs.alt;
    image.title = node.attrs.title;

    return {
      dom: image,
    };
  };
});

function toUrl(value) {
  const a = document.createElement("a");
  a.href = value;
  return a.href;
}

function findExistingAttachment(name) {
  const attachment = document.querySelector(
    `span.existing-attachment:has(input.filename[value="${name}"])`,
  );
  if (attachment) {
    const id = attachment.querySelector("input.deleted_attachment");
    if (id) {
      return id.value;
    }
  }

  return null;
}

function findNewAttachment(name) {
  for (const attachment of document.querySelectorAll(
    "span.attachments_form span.attachments_fields span",
  )) {
    const filename = attachment.querySelector("input.filename");
    if (filename.value === name) {
      const link = attachment.querySelector("a.icon-del");
      return URL.parse(link.href).pathname.split("/").pop().split(".")[0];
    }
  }

  return null;
}
