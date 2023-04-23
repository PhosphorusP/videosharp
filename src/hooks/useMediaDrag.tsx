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
        let videoTrack = cloneDeep(state.videoTrack) as VideoTrackClip[];
        let mediaFiles = cloneDeep(state.mediaFiles) as MediaFile[];
        videoTrack.push({
          id: nanoid(),
          mediaFileId: active.id,
          mediaOffset: 0,
          beginOffset: getTrackDuration(videoTrack),
          duration: mediaFiles.find((i) => i.id === active.id)!.duration,
        } as VideoTrackClip);
        updateState({
          videoTrack,
        });
      } else if ((over.id as string).indexOf("track_map_") === 0) {
        let mapTracks = cloneDeep(state.mapTracks) as MapTrackItem[];
        let mapTrack = mapTracks.find(
          (i) => i.id === (over.id as string).split("track_map_").at(-1)
        ) as MapTrackItem;
        mapTrack.clips.push({
          id: nanoid(),
          mediaFileId: active.id,
          beginOffset: getTrackDuration(mapTrack.clips),
          duration: state.projectFPS * 3,
        } as MapTrackClip);
        updateState({
          mapTracks,
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
