import { DragEndEvent } from "@dnd-kit/core";
import { cloneDeep } from "lodash-es";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getTrackDuration, updateState } from "../store/action";

export function useMediaDrag() {
  const state: any = useSelector((state: any) => state.reducer);
  const [draggingID, setDraggingId] = useState("");
  function handleDragStart(event: DragEndEvent) {
    setDraggingId(event.active.id as string);
  }
  function handleDragEnd(event: DragEndEvent) {
    setDraggingId("");
    const { active, over } = event;
    if (
      over &&
      over.data.current!.accepts.includes(active.data.current!.type)
    ) {
      if (over.id === "track_video") {
        let videoTrack = cloneDeep(state.videoTrack) as VideoTrackItem[];
        let mediaFiles = cloneDeep(state.mediaFiles) as MediaFile[];
        videoTrack.push({
          id: nanoid(),
          mediaFileId: active.id,
          mediaOffset: 0,
          beginOffset: getTrackDuration(videoTrack),
          duration: mediaFiles.find((i) => i.id === active.id)!.duration,
        } as VideoTrackItem);
        updateState({
          videoTrack: videoTrack,
        });
      }
    }
  }
  return {
    draggingID,
    handleDragStart,
    handleDragEnd,
  };
}
