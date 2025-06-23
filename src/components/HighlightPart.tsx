export const highlightPart = (text : String, highlight : String) => {
  if (!highlight) return text;

  // Escape special regex characters in highlight
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');

  const parts = text.split(regex);

  return parts.map((part : any, index : any) =>
    regex.test(part) ? (
      <span key={index} style={{ color : "gold", fontFamily : "cursive"}}>
        {part}
      </span>
    ) : (
      part
    )
  );
};
