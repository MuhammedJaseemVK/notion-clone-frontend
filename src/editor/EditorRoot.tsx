"use client";
import { useEditoreStore } from "../store/editorStore";
import { BlockRenderer } from "./BlockRenderer";

type Props = {};

const EditorRoot = (props: Props) => {
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
