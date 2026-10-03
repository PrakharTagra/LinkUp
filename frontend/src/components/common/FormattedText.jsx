import React from "react";

// Strip decorative and gimmicky emojis cleanly from text
const stripEmojis = (str = "") => {
  return str
    .replace(
      /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu,
      ""
    )
    .replace(/[🚀🤖⚡🎯☁️🎨📈🛡️🏅🧵✅]/g, "")
    .trim();
};

// Render bold markup **text** safely
const renderFormattedLine = (line) => {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ color: "var(--text)", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

/**
 * FormattedText Component
 * Renders text with clean typographic bullet points, bolding support,
 * and removes excessive emojis.
 */
export default function FormattedText({
  content = "",
  fontSize = 14,
  lineHeight = 1.65,
  color = "var(--text-2)",
  style = {},
}) {
  if (!content) return null;

  const rawLines = content.split("\n");

  // Group lines into blocks (paragraphs vs bullet lists)
  const blocks = [];
  let currentList = [];

  rawLines.forEach((rawLine) => {
    const clean = stripEmojis(rawLine).trim();

    if (!clean) {
      if (currentList.length > 0) {
        blocks.push({ type: "list", items: currentList });
        currentList = [];
      }
      return;
    }

    // Check if line is a bullet item (•, -, *, 1., 2.)
    const isBullet = /^[•\-\*▪◦]\s+/.test(clean);
    const isNumbered = /^\d+[\.\)]\s+/.test(clean);

    if (isBullet || isNumbered) {
      const itemText = clean.replace(/^[•\-\*▪◦\d\.\)]\s+/, "");
      currentList.push(itemText);
    } else {
      if (currentList.length > 0) {
        blocks.push({ type: "list", items: currentList });
        currentList = [];
      }
      blocks.push({ type: "paragraph", text: clean });
    }
  });

  if (currentList.length > 0) {
    blocks.push({ type: "list", items: currentList });
  }

  return (
    <div
      style={{
        fontSize,
        lineHeight,
        color,
        fontFamily: "DM Sans, sans-serif",
        ...style,
      }}
    >
      {blocks.map((block, bIdx) => {
        if (block.type === "list") {
          return (
            <ul
              key={bIdx}
              style={{
                margin: "8px 0 14px 0",
                paddingLeft: 20,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                listStyleType: "disc",
              }}
            >
              {block.items.map((item, iIdx) => (
                <li
                  key={iIdx}
                  style={{
                    lineHeight,
                    color: "var(--text-2)",
                  }}
                >
                  {renderFormattedLine(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={bIdx}
            style={{
              margin: "0 0 10px 0",
              lineHeight,
              color,
            }}
          >
            {renderFormattedLine(block.text)}
          </p>
        );
      })}
    </div>
  );
}
