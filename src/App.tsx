import { FileOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { useEffect } from "react";
import "./App.css";
import Import from "./Components/Import";
import MediaFiles from "./Components/MediaFiles";
import PanelHeader from "./Components/PanelHeader";
import Preview from "./Components/Preview";
import PreviewBottom from "./Components/PreviewBottom";
import Properties from "./Components/Properties";
import Timeline from "./Components/Timeline";
import { initFF } from "./store/action";

function App() {
  const { token } = theme.useToken();
  useEffect(() => {
    initFF();
  }, []);
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
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
            flex: 1,
            boxSizing: "border-box",
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <PanelHeader
            label={<>媒体文件</>}
            icon={<FileOutlined style={{ margin: "0 4px" }} />}
          />
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
            icon={<PlayCircleOutlined style={{ margin: "0 4px" }} />}
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
        {true && (
          <div style={{ flex: 1 }}>
            <Properties />
          </div>
        )}
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
    </div>
  );
}

export default App;
