
export function replaceAt(text, index, replacementText, replacedTextLength) {
  return text.substring(0, index) + replacementText + text.substring(index + replacedTextLength);
}
