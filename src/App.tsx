import { useEffect } from "react";
import "./App.css";
import Import from "./Components/Import";
import MediaFiles from "./Components/MediaFiles";
import Preview from "./Components/Preview";
import Properties from "./Components/Properties";
import Timeline from "./Components/Timeline";
import { initFF } from "./store/action";

function App() {
  useEffect(() => {
    initFF();
  }, []);
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow:'hidden' }}>
        <div style={{ flex: 1 }}>
          <Import />
          <MediaFiles />
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          <Preview />
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
        }}
      >
        <Timeline />
      </div>
    </div>
  );
}

export default App;
