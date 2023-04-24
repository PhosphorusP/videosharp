import { Button, Form, InputNumber } from "antd";
import { useSelector } from "react-redux";
import { formatTimestamp, updateState } from "../store/action";
import SelectedPreview from "./SelectedPreview";
import { flattenDeep } from "lodash-es";

const Properties: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <div style={{ padding: "8px" }}>
      {(() => {
        let selected: VideoTrackClip | MapTrackClip | undefined;
        selected = (state.videoTrack as VideoTrackClip[]).find(
          (i) => i.id === state.selectedId
        );
        if (selected)
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
        selected = (
          flattenDeep(
            (state.mapTracks as MapTrackItem[]).map((i) => i.clips)
          ) as MapTrackClip[]
        ).find((i) => i.id === state.selectedId) as MapTrackClip;
        if (selected)
          return (() => {
            let mediaFile = (state.mediaFiles as MediaFile[]).find(
              (i) => i.id === selected!.mediaFileId
            ) as MediaFile;
            return (
              <>
                <SelectedPreview
                  title="贴图"
                  subtitle={`来自 ${mediaFile.fileName}`}
                  thumbUrl={mediaFile.thumbnailDataUrl}
                />
                <Form
                  colon={false}
                  initialValues={{
                    ...selected,
                    composeSizeX: selected.composeSize[0],
                    composeSizeY: selected.composeSize[1],
                    composePosX: selected.composePos[0],
                    composePosY: selected.composePos[1],
                  }}
                  onValuesChange={(changed, full) => {
                    console.log(full);
                    let mapTracks = state.mapTracks as MapTrackItem[];
                    for (let i of mapTracks) {
                      let clip = i.clips.find((i) => i.id === selected!.id);
                      if (clip) {
                        clip.composeSize = [
                          full["composeSizeX"],
                          full["composeSizeY"],
                        ];
                        clip.composePos = [
                          full["composePosX"],
                          full["composePosY"],
                        ];
                        clip.composeRotate = full["composeRotate"];
                        updateState({ mapTracks });
                        break;
                      }
                    }
                  }}
                >
                  <Form.Item label="入点">
                    {formatTimestamp(selected!.beginOffset, state.projectFPS)}
                  </Form.Item>
                  <Form.Item label="出点">
                    {formatTimestamp(
                      selected!.beginOffset + selected!.duration,
                      state.projectFPS
                    )}
                  </Form.Item>
                  <Form.Item label="尺寸">
                    <Form.Item name="composeSizeX" noStyle>
                      <InputNumber
                        keyboard={false}
                        controls={false}
                        addonAfter="像素"
                        style={{ width: "80px", marginRight: "8px" }}
                      />
                    </Form.Item>
                    <Form.Item name="composeSizeY" noStyle>
                      <InputNumber
                        keyboard={false}
                        controls={false}
                        addonAfter="像素"
                        style={{ width: "80px" }}
                      />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item label="位置">
                    <Form.Item name="composePosX" noStyle>
                      <InputNumber
                        keyboard={false}
                        controls={false}
                        addonAfter="像素"
                        style={{ width: "80px", marginRight: "8px" }}
                      />
                    </Form.Item>
                    <Form.Item name="composePosY" noStyle>
                      <InputNumber
                        keyboard={false}
                        controls={false}
                        addonAfter="像素"
                        style={{ width: "80px" }}
                      />
                    </Form.Item>
                  </Form.Item>

                  <Form.Item label="旋转" name="composeRotate">
                    <InputNumber
                      keyboard={false}
                      controls={false}
                      addonAfter="°"
                      style={{ width: "80px" }}
                    />
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
