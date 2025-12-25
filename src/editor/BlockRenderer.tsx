import React from "react";
import { useBlockStore } from "../store/blockStore";
import ParagraphBlock from "./blocks/ParagraphBlock";

export const BlockRenderer = React.memo(({ blockId }: { blockId: string }) => {
  const blockType = useBlockStore((state) => state.blocks[blockId]?.type);
  console.log("BLOCK ROOT");

  if (!blockType) {
    return null;
  }
  if (blockType === "paragraph") {
    return <ParagraphBlock blockId={blockId} />;
  }
  return <div />;
});
BlockRenderer.displayName = "BlockRenderer";
