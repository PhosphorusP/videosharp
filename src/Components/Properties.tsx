import { Button, Form } from "antd";
import { useSelector } from "react-redux";
import { formatTimestamp } from "../store/action";
import SelectedPreview from "./SelectedPreview";

const Properties: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <div style={{ padding: "8px" }}>
      {(() => {
        if (
          (state.videoTrack as VideoTrackClip[]).find(
            (i) => i.id === state.selectedId
          )
        )
          return (() => {
            let selected = (state.videoTrack as VideoTrackClip[]).find(
              (i) => i.id === state.selectedId
            );
            let mediaFile = (state.mediaFiles as MediaFile[]).find(
              (i) => i.id === selected?.mediaFileId
            ) as MediaFile;
            return (
              <>
                <SelectedPreview
                  title="视频片段"
                  subtitle={`来自 ${mediaFile.fileName}`}
                  thumbUrl={mediaFile.thumbnailDataUrl}
                />
                <Form colon={false}>
                  <Form.Item label="入点">
                    {formatTimestamp(selected!.beginOffset, state.projectFPS)}
                  </Form.Item>
                  <Form.Item label="出点">
                    {formatTimestamp(
                      selected!.beginOffset + selected!.duration,
                      state.projectFPS
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Button danger>还原到素材长度</Button>
                  </Form.Item>
                </Form>
              </>
            );
          })();
        return (
          <>
            <Form>
              <Form.Item label="宽度">{state.projectSize[0]}</Form.Item>
              <Form.Item label="高度">{state.projectSize[1]}</Form.Item>
              <Form.Item label="帧速率">{state.projectFPS}fps</Form.Item>
            </Form>
          </>
        );
      })()}
    </div>
  );
};
export default Properties;
