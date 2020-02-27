
export default function replaceAt(text, index, replacementText, replacedTextLength) {
  return text.substr(0, index) + replacementText + text.substr(index + replacedTextLength);
}
