import { VerticalAlignMiddleOutlined } from "@ant-design/icons";
import { Button, Tooltip, theme } from "antd";
import { useSelector } from "react-redux";
import { getTrackDuration, updateState } from "../store/action";

const PreviewBottom: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  return (
    <>
      <div style={{ flex: 1 }}>
        <span style={{ color: token.colorText, fontWeight: "bold" }}>
          {(
            "0" +
            Math.floor(state.currentFrame / state.projectFPS / 60).toString()
          ).slice(-2)}
          :
          {(
            "0" +
            Math.floor((state.currentFrame / state.projectFPS) % 60).toString()
          ).slice(-2)}
          :
          {("0" + (state.currentFrame % state.projectFPS).toString()).slice(-2)}
        </span>
      </div>
      <div>
        <Tooltip
          title={`时间轴水平缩放 (${
            state.timelineRatio === 1 ? "关闭" : "打开"
          }紧凑模式)`}
          children={
            <Button
              type="text"
              size="small"
              icon={
                <VerticalAlignMiddleOutlined
                  rotate={90}
                  style={{
                    color:
                      state.timelineRatio === 1
                        ? token.colorPrimary
                        : undefined,
                  }}
                />
              }
              onClick={() => {
                updateState({
                  timelineRatio: state.timelineRatio === 1 ? 2 : 1,
                });
              }}
            />
          }
        />
        <Tooltip
          title={`时间轴垂直缩放 (${
            state.timelineRatio === 1 ? "关闭" : "打开"
          }紧凑模式)`}
          children={
            <Button
              type="text"
              size="small"
              icon={
                <VerticalAlignMiddleOutlined
                  style={{
                    color: state.timelineCollapsed
                      ? token.colorPrimary
                      : undefined,
                  }}
                />
              }
              onClick={() => {
                updateState({
                  timelineCollapsed: !state.timelineCollapsed,
                });
              }}
            />
          }
        />
      </div>
    </>
  );
};

export default PreviewBottom;
