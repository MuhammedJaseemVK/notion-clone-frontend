"use client";
import { useEditoreStore } from "../store/editorStore";
import { BlockRenderer } from "./BlockRenderer";

const EditorRoot = () => {
  const orderedBlockIds = useEditoreStore((state) => state.orderedBlockIds);
  console.log("EDITOR ROOT");

  return (
    <div>
      {orderedBlockIds.map((id) => (
        <BlockRenderer key={id} blockId={id} />
      ))}
    </div>
  );
};

export default EditorRoot;
