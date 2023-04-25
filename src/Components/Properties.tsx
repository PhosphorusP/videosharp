import { Button, Form, Input, InputNumber } from "antd";
import { flattenDeep } from "lodash-es";
import { useState } from "react";
import { CompactPicker } from "react-color";
import { useSelector } from "react-redux";
import { formatTimestamp, saveState, updateState } from "../store/action";
import SelectedPreview from "./SelectedPreview";

const Properties: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <div style={{ padding: "8px" }}>
      {(() => {
        let selected:
          | VideoTrackClip
          | MapTrackClip
          | SubtitleTrackClip
          | undefined;
        selected = (state.videoTrack as VideoTrackClip[]).find(
          (i) => i.id === state.selectedId
        );
        if (selected) return <VideoProperties selected={selected} />;
        selected = (
          flattenDeep(
            (state.mapTracks as MapTrackItem[]).map((i) => i.clips)
          ) as MapTrackClip[]
        ).find((i) => i.id === state.selectedId) as MapTrackClip;
        if (selected) return <MapProperties selected={selected} />;
        selected = (
          flattenDeep(
            (state.subtitleTracks as SubtitleTrackItem[]).map((i) => i.clips)
          ) as SubtitleTrackClip[]
        ).find((i) => i.id === state.selectedId) as SubtitleTrackClip;
        if (selected) return <SubtitleProperties selected={selected} />;
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

type VideoPropertiesProps = {
  selected: VideoTrackClip;
};

const VideoProperties: React.FC<VideoPropertiesProps> = ({
  selected,
}: VideoPropertiesProps) => {
  const state: any = useSelector((state: any) => state.reducer);
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
};

type MapPropertiesProps = {
  selected: MapTrackClip;
};

const MapProperties: React.FC<MapPropertiesProps> = ({
  selected,
}: MapPropertiesProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  let mediaFile = (state.mediaFiles as MediaFile[]).find(
    (i) => i.id === selected!.mediaFileId
  ) as MediaFile;
  const [form] = Form.useForm();
  const formValues = {
    ...selected,
    composeSizeX: selected.composeSize[0],
    composeSizeY: selected.composeSize[1],
    composePosX: selected.composePos[0],
    composePosY: selected.composePos[1],
  };
  form.setFieldsValue(formValues);
  return (
    <>
      <SelectedPreview
        title="贴图"
        subtitle={`来自 ${mediaFile.fileName}`}
        thumbUrl={mediaFile.thumbnailDataUrl}
      />
      <Form
        form={form}
        colon={false}
        initialValues={formValues}
        onValuesChange={(changed, full) => {
          let mapTracks = state.mapTracks as MapTrackItem[];
          for (let i of mapTracks) {
            let clip = i.clips.find((i) => i.id === selected!.id);
            if (clip) {
              clip.composeSize = [full["composeSizeX"], full["composeSizeY"]];
              clip.composePos = [full["composePosX"], full["composePosY"]];
              clip.composeRotate = full["composeRotate"];
              saveState();
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
};

type SubtitlePropertiesProps = {
  selected: SubtitleTrackClip;
};

const SubtitleProperties: React.FC<SubtitlePropertiesProps> = ({
  selected,
}: SubtitlePropertiesProps) => {
  const state: any = useSelector((state: any) => state.reducer);
  const [form] = Form.useForm();
  const [color, setColor] = useState(selected.color);
  const formValues = {
    ...selected,
    color,
    composePosX: selected.composePos[0],
    composePosY: selected.composePos[1],
  };
  form.setFieldsValue(formValues);
  return (
    <>
      <Form
        form={form}
        colon={false}
        initialValues={formValues}
        onValuesChange={(changed, full) => {
          let subtitleTracks = state.subtitleTracks as SubtitleTrackItem[];
          for (let i of subtitleTracks) {
            let clip = i.clips.find((i) => i.id === selected!.id);
            if (clip) {
              clip.content = full["content"];
              clip.composePos = [full["composePosX"], full["composePosY"]];
              clip.fontSize = full["fontSize"];
              if (full["color"]["hex"]) clip.color = full["color"].hex;
              saveState();
              updateState({ subtitleTracks });
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
        <Form.Item label="内容" name="content">
          <Input />
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
        <Form.Item label="字号" name="fontSize">
          <InputNumber
            keyboard={false}
            controls={false}
            addonAfter="像素"
            style={{ width: "80px", marginRight: "8px" }}
          />
        </Form.Item>
        <Form.Item label="颜色" name="color" valuePropName="color">
          <CompactPicker
            color={
              (formValues.color as any).hex
                ? (formValues.color as any).hex
                : formValues.color
            }
            onChange={(value) => {
              setColor(value.hex);
            }}
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default Properties;
