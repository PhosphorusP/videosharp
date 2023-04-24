import {
  AlignLeftOutlined,
  PictureOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Popover, theme } from "antd";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  appendMapTrack,
  appendSubtitleTrack,
  composeCurrentFrame,
  getTracksDuration,
  setCurrentFrame,
  updateState,
} from "../store/action";
import MapTrack from "./Tracks/MapTrack";
import VideoTrack from "./Tracks/VideoTrack";
import { ReactSortable } from "react-sortablejs";
import SubtitleTrack from "./Tracks/SubtitleTrack";

const Timeline: React.FC = () => {
  const padding = 2;
  const { token } = theme.useToken();
  const state: any = useSelector((state: any) => state.reducer);
  const rulerRef = useRef(null);
  const trackDuration = getTracksDuration();
  const timelineDragHandler: any = (e: React.MouseEvent) => {
    if (state.clipOrigin === "timeline") {
      let offsetX =
        Math.round(
          e.clientX -
            (rulerRef.current as unknown as HTMLElement).getBoundingClientRect()
              .x
        ) / state.timelineRatio;
      if (e.buttons && offsetX <= trackDuration - 1 && offsetX >= 0)
        setCurrentFrame(Math.round(offsetX));
    }
  };
  const timelineDragEndHandler: any = () => {
    if (state.clipOrigin === "timeline")
      updateState({
        clipOrigin: "",
      });
  };
  useEffect(() => {
    document.addEventListener("mousemove", timelineDragHandler);
    document.addEventListener("mouseup", timelineDragEndHandler);
    return () => {
      document.removeEventListener("mousemove", timelineDragHandler);
      document.removeEventListener("mouseup", timelineDragEndHandler);
    };
  });
  if (trackDuration) composeCurrentFrame();
  return (
    <div
      style={{
        flex: 1,
        maxHeight: "50vh",
        overflowY: "scroll",
        overflowX: "scroll",
        paddingLeft: `${padding}px`,
        paddingRight: `${padding}px`,
        paddingBottom: "2px",
        position: "relative",
      }}
      onMouseDown={() => updateState({ selectedId: "" })}
    >
      <div
        style={{
          height: "18px",
          marginBottom: "-18px",
          width: `${state.timelineCollapsed ? 28 : 56}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Popover
          content={
            <>
              <Button
                type="text"
                icon={<PictureOutlined />}
                onClick={appendMapTrack}
              >
                贴图轨道
              </Button>
              <Button
                type="text"
                icon={<AlignLeftOutlined />}
                onClick={appendSubtitleTrack}
              >
                字幕轨道
              </Button>
            </>
          }
        >
          <PlusOutlined
            style={{ fontSize: "14px", color: token.colorPrimary }}
          />
        </Popover>
      </div>
      <div
        ref={rulerRef}
        style={{
          boxSizing: "border-box",
          marginLeft: `${state.timelineCollapsed ? 28 : 56}px`,
          height: "18px",
          width: `${
            trackDuration ? (trackDuration - 1) * state.timelineRatio : 0
          }px`,
          backgroundColor: token.colorBorderBg,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: "0 0 4px 4px",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          updateState({
            clipOrigin: "timeline",
          });
        }}
      >
        {new Array(
          Math.ceil((trackDuration ? trackDuration - 1 : 0) / state.projectFPS)
        )
          .fill("")
          .map((i, index) => (
            <div key={index}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${
                    index * state.projectFPS * state.timelineRatio - 1
                  }px`,
                  width: "1px",
                  height: "17px",
                  background: token.colorBorderSecondary,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${
                    index * state.projectFPS * state.timelineRatio + 2
                  }px`,
                  height: "16px",
                  fontSize: "12px",
                  lineHeight: "16px",
                  color:
                    Math.floor(state.currentFrame / state.projectFPS) === index
                      ? token.colorPrimary
                      : token.colorTextSecondary,
                  transformOrigin: "left",
                  transform: "scale(0.75)",
                }}
              >
                {index}
              </div>
            </div>
          ))}
      </div>
      {state.tracksSort.map((iObj: any) => {
        let i = iObj.toString();
        if (i === "track_video") return <VideoTrack key="track_video" />;
        else if (i.indexOf("track_map") === 0) {
          let mapTrack = state.mapTracks.find(
            (m: MapTrackItem) => m.id === i.split("track_map_").at(-1)
          ) as MapTrackItem;
          return <MapTrack key={mapTrack.id} mapTrack={mapTrack} />;
        } else if (i.indexOf("track_subtitle") === 0) {
          let subtitleTrack = state.subtitleTracks.find(
            (m: SubtitleTrackItem) => m.id === i.split("track_subtitle_").at(-1)
          ) as SubtitleTrackItem;
          return (
            <SubtitleTrack
              key={subtitleTrack.id}
              subtitleTrack={subtitleTrack}
            />
          );
        }
        return <></>;
      })}
      <div
        style={{
          position: "absolute",
          left: `${
            padding +
            state.currentFrame * state.timelineRatio +
            (state.timelineCollapsed ? 28 : 56)
          }px`,
          top: "0px",
          width: "1px",
          height: "100%",
          backgroundColor: token.colorPrimary,
          boxShadow: `0 0 8px ${token.colorPrimary}`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${8 / Math.sqrt(3)}px solid transparent`,
            borderRight: `${8 / Math.sqrt(3)}px solid transparent`,
            borderTop: `${8}px solid ${token.colorPrimary}`,
            filter: `drop-shadow(0 0 8px ${token.colorPrimary})`,
            transform: "translateX(-4px)",
          }}
        />
      </div>
      <ReactSortable
        list={state.tracksSort}
        setList={(value) => {
          updateState({ tracksSort: value });
        }}
        handle=".sortHandle"
        animation={300}
        easing="cubic-bezier(0.25, 1, 0.5, 1)"
        direction="vertical"
        style={{
          position: "absolute",
          top: "20px",
          left: "2px",
        }}
      >
        {state.tracksSort.map((iObj: string) => {
          let i = iObj.toString();
          let icon = <></>;
          if (i === "track_video")
            icon = (
              <VideoCameraOutlined
                style={{
                  fontSize: state.timelineCollapsed ? "12px" : "16px",
                  color: token.colorTextSecondary,
                }}
              />
            );
          else if (i.indexOf("track_map") === 0)
            icon = (
              <PictureOutlined
                style={{
                  fontSize: state.timelineCollapsed ? "12px" : "16px",
                  color: token.colorTextSecondary,
                }}
              />
            );
          else if (i.indexOf("track_subtitle") === 0)
            icon = (
              <AlignLeftOutlined
                style={{
                  fontSize: state.timelineCollapsed ? "12px" : "16px",
                  color: token.colorTextSecondary,
                }}
              />
            );
          return (
            <div
              key={i}
              style={{
                boxSizing: "border-box",
                height: `${state.timelineCollapsed ? 28 : 56}px`,
                width: `${state.timelineCollapsed ? 28 : 56}px`,
                marginTop: `${state.timelineCollapsed ? 0 : 18}px`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Popover placement="right" trigger="click" content={<>Hello</>}>
                <div
                  className="sortHandle"
                  style={{
                    padding: "8px",
                    cursor: "grab",
                    fontSize: "16px",
                    lineHeight: "16px",
                    backgroundColor: token.colorBgContainer,
                    borderRadius: "4px",
                  }}
                >
                  {icon}
                </div>
              </Popover>
            </div>
          );
        })}
      </ReactSortable>
    </div>
  );
};
export default Timeline;
