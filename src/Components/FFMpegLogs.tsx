import { theme } from "antd";
import { useRef } from "react";
import { useSelector } from "react-redux";

const FFMpegLogs: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const bottomRef = useRef(null);
  (bottomRef.current as any)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div
      style={{
        backgroundColor: token.colorBgContainerDisabled,
        marginTop: "4px",
        borderRadius: "4px",
        maxHeight: "160px",
        overflowY: "scroll",
      }}
    >
      {(state.ffmpegLogs as string[]).map((i, index) => (
        <div key={index} style={{ margin: "4px 8px", fontFamily: "monospace" }}>
          {i}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default FFMpegLogs;
