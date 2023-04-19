import { useState } from "react";
import "./App.css";
import Import from "./Components/Import";
import DebugPanel from "./Components/DebugPanel";
import MediaFiles from "./Components/MediaFiles";
import Preview from "./Components/Preview";
import Properties from "./Components/Properties";
import Timeline from "./Components/Timeline";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 1 }}>
          <Import />
          <MediaFiles />
        </div>
        <div style={{ flex: 1 }}>
          <Preview />
        </div>
        <div style={{ flex: 1 }}>
          <Properties />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: 'relative' }}>
        <Timeline />
      </div>
    </div>
  );
}

export default App;
