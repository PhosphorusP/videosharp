import {
  BarsOutlined,
  DownloadOutlined,
  FileOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Button, theme } from "antd";
import { CSSProperties, useEffect } from "react";
import { Item, Menu } from "react-contexify";
import { useSelector } from "react-redux";
import "./App.css";
import Import from "./Components/Import";
import MediaFileItem from "./Components/MediaFileItem";
import MediaFiles from "./Components/MediaFiles";
import PanelHeader from "./Components/PanelHeader";
import Preview from "./Components/Preview";
import PreviewBottom from "./Components/PreviewBottom";
import Properties from "./Components/Properties";
import Timeline from "./Components/Timeline";
import { useMediaDrag } from "./hooks/useMediaDrag";
import {
  deleteClip,
  deleteMediaFile,
  exportVideo,
  initFF,
} from "./store/action";

function App() {
  const { token } = theme.useToken();
  const state: any = useSelector((state: any) => state.reducer);
  useEffect(() => {
    initFF();
  }, []);
  const { draggingID, handleDragStart, handleDragEnd } = useMediaDrag();
  const contextMenuStyle = {
    "--contexify-activeItem-bgColor": token.colorPrimary,
    "--contexify-activeItem-color": token.colorTextLightSolid,
    "--contexify-menu-shadow": "0 0 8px rgba(0,0,0,0.2)",
  } as CSSProperties;
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "200px",
              boxSizing: "border-box",
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              overflowY: "scroll",
            }}
          >
            <PanelHeader label={<>媒体文件</>} icon={<FileOutlined />} />
            <Import />
            <MediaFiles />
          </div>
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRight: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <PanelHeader
              label={<>预览</>}
              icon={<PlayCircleOutlined />}
              extra={
                <Button
                  type="primary"
                  size="small"
                  onClick={() => exportVideo()}
                  style={{ margin: "0 8px" }}
                  icon={<DownloadOutlined />}
                >
                  导出
                </Button>
              }
            />
            <Preview />
            <div
              style={{
                height: "30px",
                display: "flex",
                alignItems: "center",
                padding: "2px 4px",
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <PreviewBottom />
            </div>
          </div>
          <div
            style={{
              width: "300px",
              overflowY: "scroll",
            }}
          >
            <PanelHeader label={<>属性</>} icon={<BarsOutlined />} />
            <Properties />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            boxSizing: "border-box",
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Timeline />
        </div>
        <DragOverlay dropAnimation={null}>
          {(() => {
            let mediaFile = (state.mediaFiles as MediaFile[]).find(
              (i) => i.id === draggingID
            );
            return mediaFile ? (
              <div style={{ opacity: 1 }}>
                <MediaFileItem
                  id={mediaFile.id}
                  fileName={mediaFile.fileName}
                  thumbnailDataUrl={mediaFile.thumbnailDataUrl}
                  dragOverlay={true}
                  type="video"
                />
              </div>
            ) : undefined;
          })()}
        </DragOverlay>
      </DndContext>
      <Menu
        id="contextmenu_mediafiles"
        theme={state.darkMode ? "dark" : "light"}
        style={contextMenuStyle}
      >
        <Item onClick={(e) => deleteMediaFile(e.props.id)}>删除</Item>
      </Menu>
      <Menu
        id="contextmenu_clips"
        theme={state.darkMode ? "dark" : "light"}
        style={contextMenuStyle}
      >
        <Item onClick={(e) => deleteClip(e.props.id)}>删除此片段</Item>
      </Menu>
    </div>
  );
}

export default App;
