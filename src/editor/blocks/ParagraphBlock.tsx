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
  const ordered = useEditoreStore.getState().orderedBlockIds;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLDivElement>) => {
      updateBlock(blockId, e.target.textContent || "");
    },
    [blockId, updateBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const selection = window.getSelection();
      const offset = selection?.anchorOffset ?? 0;
      const text = blockRef.current?.textContent ?? "";
      const isAtStart = offset === 0;
      const isAtEnd = offset === text.length;

      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();

        const before = text.slice(0, offset);
        const after = text.slice(offset);

        const next = before + "\n" + after;
        updateBlock(blockId, next);

        requestAnimationFrame(() => {
          const element = blockRef.current;
          if (!element) {
            return;
          }

          const textNode = element.firstChild;
          const range = document.createRange();
          range.setStart(textNode!, offset + 1);
          range.collapse(true);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);

          element.focus();
        });
      } else if (e.key === "Enter") {
        e.preventDefault();

        const selection = window.getSelection();
        const node = selection?.anchorNode;
        const offset = selection?.anchorOffset;

        if (!node || !blockRef.current?.contains(node)) {
          return;
        }

        const fullText = blockRef.current?.textContent ?? "";
        const before = fullText.slice(0, offset);
        const after = fullText.slice(offset);

        updateBlock(blockId, before);

        const newId = addBlockBelow(blockId);
        insertBlockAfter(blockId, newId);
        updateBlock(newId, after);

        requestAnimationFrame(() => {
          const element = document.getElementById(newId);
          if (!element) {
            return;
          }

          const range = document.createRange();
          const textNode = element.firstChild;
          range.setStart(textNode || element, 0);
          range.collapse(true);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          element?.focus();
        });
      } else if (e.key === "ArrowUp") {
        const selection = window.getSelection();
        const offset = selection?.anchorOffset ?? 0;

        if (offset !== 0) {
          return;
        }
        const ordered = useEditoreStore.getState().orderedBlockIds;
        const index = ordered.indexOf(blockId);
        if (index <= 0) {
          return;
        }
        const prevId = ordered[index - 1];

        e.preventDefault();

        requestAnimationFrame(() => {
          const element = document.getElementById(prevId);
          if (!element) {
            return;
          }
          const text = element.textContent ?? "";
          const range = document.createRange();
          const textNode = element.firstChild;

          range.setStart(textNode || element, text.length);
          range.collapse(true);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          element.focus();
        });
      } else if (e.key === "ArrowDown") {
        const selection = window.getSelection();
        const text = blockRef.current?.textContent ?? "";
        const offset = selection?.anchorOffset;

        if (offset !== text.length) {
          return;
        }

        const ordered = useEditoreStore.getState().orderedBlockIds;
        const index = ordered.indexOf(blockId);
        const nextId = ordered[index + 1];
        if (!nextId) {
          return;
        }

        e.preventDefault();

        requestAnimationFrame(() => {
          const element = document.getElementById(nextId);
          if (!element) {
            return;
          }

          const range = document.createRange();
          const textNode = element.firstChild;

          range.setStart(textNode || element, 0);
          range.collapse(false);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);

          element.focus();
        });
      } else if (e.key === "Delete") {
        if (!isAtEnd) {
          return;
        }

        const ordered = useEditoreStore.getState().orderedBlockIds;
        const index = ordered.indexOf(blockId);
        const nextId = ordered[index + 1];
        if (!nextId) {
          return;
        }

        e.preventDefault();

        const nextBlock = useBlockStore.getState().blocks[nextId];
        const caretOffset = text.length;

        updateBlock(blockId, text + (nextBlock.content ?? ""));
        removeBlockFromOrder(nextId);

        requestAnimationFrame(() => {
          const element = document.getElementById(blockId);
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
      updateBlock,
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
      style={{ outline: "none", whiteSpace: "pre-wrap" }}
    />
  );
};

export default ParagraphBlock;
