import { marked } from 'marked';
import * as DOMPurify from "dompurify";

const renderer = new marked.Renderer();

renderer.image = function (text) {
  return text || '';
};

marked.setOptions({
  breaks: false,
  renderer: renderer
});

// open links in new tab
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener');
  }
});

export default (value: string) => DOMPurify.sanitize(marked.parse(value));