import { useBlockStore } from "@/src/store/blockStore";
import { useEditoreStore } from "@/src/store/editorStore";
import React, { useCallback, useLayoutEffect, useRef } from "react";

interface ParagraphBlockProps {
  blockId: string;
}

const ParagraphBlock = ({ blockId }: ParagraphBlockProps) => {
  const content = useBlockStore((state) => state.blocks[blockId]?.content);
  const blockRef = useRef<HTMLDivElement>(null);

  const updateBlock = useBlockStore((state) => state.updateBlock);
  const addBlockBelow = useBlockStore((state) => state.addBlockBelow);
  const insertBlockAfter = useEditoreStore((state) => state.insertBlockAfter);
  const mergeBlcoks = useBlockStore((state) => state.mergeBlocks);
  const removeBlockFromOrder = useEditoreStore(
    (state) => state.removeBlockFromOrder
  );
  const ordered = useEditoreStore((state) => state.orderedBlockIds);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLDivElement>) => {
      updateBlock(blockId, e.target.textContent || "");
    },
    [blockId, updateBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const newId = addBlockBelow(blockId);
        insertBlockAfter(blockId, newId);

        requestAnimationFrame(() => {
          const element = document.getElementById(newId);
          element?.focus();
        });
      } else if (e.key === "Backspace") {
        const selection = window.getSelection();
        const isAtStart =
          selection &&
          selection.anchorOffset === 0 &&
          selection.focusOffset === 0;
        if (!isAtStart) {
          return;
        }

        e.preventDefault();

        const index = ordered.indexOf(blockId);
        if (index <= 0) {
          return;
        }

        const prevId = ordered[index - 1];
        const prev = useBlockStore.getState().blocks[prevId];
        const caretOffset = prev.content.length;

        mergeBlcoks(prevId, blockId);
        removeBlockFromOrder(blockId);

        requestAnimationFrame(() => {
          const element = document.getElementById(prevId);
          if (!element) {
            return;
          }

          const range = document.createRange();
          const textNode = element.firstChild;
          range.setStart(textNode!, caretOffset);
          range.collapse(true);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          element.focus();
        });
      }
    },
    [
      blockId,
      addBlockBelow,
      insertBlockAfter,
      mergeBlcoks,
      ordered,
      removeBlockFromOrder,
    ]
  );

  useLayoutEffect(() => {
    if (!blockRef.current) {
      return;
    }
    if (blockRef.current.textContent !== content) {
      blockRef.current.textContent = content;
    }
  }, [content]);
  console.log(`Paragraph block ${blockId} rendered`);
  return (
    <div
      id={blockId}
      ref={blockRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleChange}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
    />
  );
};

export default ParagraphBlock;
