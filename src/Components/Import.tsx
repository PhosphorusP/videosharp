import {
  CheckOutlined,
  EllipsisOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Form,
  InputNumber,
  Modal,
  Progress,
  Space,
  theme,
} from "antd";
import { CSSProperties, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFiles, importFiles, updateState } from "../store/action";
import FFMpegLogs from "./FFMpegLogs";

const Import: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const exportProgress = state.exportProgress as ExportProgress;
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [mask, setMask] = useState(false);
  const [projectSizeX, setProjectSizeX] = useState(640);
  const [projectSizeY, setProjectSizeY] = useState(360);
  const [projectFPS, setProjectFPS] = useState(30);
  const [initOpen, setInitOpen] = useState(true);
  useEffect(() => {
    const defaultHandler: EventListener = (e: Event) => e.preventDefault();
    document.addEventListener("dragleave", defaultHandler);
    document.addEventListener("drop", defaultHandler);
    document.addEventListener("dragenter", defaultHandler);
    document.addEventListener("dragover", defaultHandler);
    const dragEnterHandler = (e: DragEvent) => {
      if (initOpen) return;
      if (e.dataTransfer!.effectAllowed !== "move") setMask(true);
    };
    document.addEventListener("dragenter", dragEnterHandler);
    const dragLeaveListener: EventListener = (e: any) => {
      if (initOpen) return;
      if (
        e.target.nodeName === "HTML" ||
        e.target === e.explicitOriginalTarget ||
        (!e.fromElement &&
          (e.clientX <= 0 ||
            e.clientY <= 0 ||
            e.clientX >= window.innerWidth ||
            e.clientY >= window.innerHeight))
      ) {
        setMask(false);
      }
    };
    document.addEventListener("dragleave", dragLeaveListener);
    const dropHandler: any = async (e: DragEvent) => {
      if (initOpen) return;
      setMask(false);
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer!.effectAllowed !== "move") {
        let fileCnt = e.dataTransfer.files
          ? await importFiles(e.dataTransfer.files, message)
          : 0;
        if (fileCnt) message.success(`已导入${fileCnt}个文件`);
      }

      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("drop", dropHandler);

    return () => {
      document.removeEventListener("dragleave", defaultHandler);
      document.removeEventListener("drop", defaultHandler);
      document.removeEventListener("dragenter", defaultHandler);
      document.removeEventListener("dragover", defaultHandler);
      document.removeEventListener("dragenter", dragEnterHandler);
      document.removeEventListener("dragleave", dragLeaveListener);
      document.removeEventListener("drop", dropHandler);
    };
  });
  const maskStyle: CSSProperties = {
    zIndex: 20,
    position: "fixed",
    left: 0,
    top: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: token.colorBgMask,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };
  const statusIcons = {
    waiting: <EllipsisOutlined style={{ color: token.colorTextDisabled }} />,
    converting: <LoadingOutlined style={{ color: token.colorPrimary }} />,
    done: <CheckOutlined style={{ color: token.colorSuccess }} />,
  };
  return (
    <>
      <div style={{ padding: "8px 8px 0 8px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () =>
            importFiles(
              await getFiles("video/mp4, image/jpeg, image/png", true),
              message
            )
          }
          block
        >
          导入
        </Button>
      </div>
      <div
        style={{
          ...maskStyle,
          display: mask ? "flex" : "none",
        }}
      >
        <PlusOutlined
          style={{
            color: token.colorTextLightSolid,
            fontSize: "56px",
            marginBottom: "16px",
          }}
        />
        <div style={{ color: token.colorTextLightSolid, fontSize: "24px" }}>
          导入
        </div>
      </div>
      <Modal
        width={420}
        open={state.importing}
        title="正在导入文件"
        closable={false}
        keyboard={false}
        maskClosable={false}
        footer={null}
      >
        <Space direction="vertical">
          <div>
            {statusIcons[state.ffmpegLoading ? "converting" : "done"]}
            <span style={{ marginLeft: "8px" }}>加载FFmpeg</span>
          </div>
          {(state.importProgress as ImportProgress).map((i, index) => (
            <div key={index}>
              {
                {
                  waiting: (
                    <EllipsisOutlined
                      style={{ color: token.colorTextDisabled }}
                    />
                  ),
                  converting: (
                    <LoadingOutlined style={{ color: token.colorPrimary }} />
                  ),
                  done: <CheckOutlined style={{ color: token.colorSuccess }} />,
                }[i.progress]
              }
              <span style={{ marginLeft: "8px" }}>{i.fileName}</span>
            </div>
          ))}
        </Space>
        <FFMpegLogs />
      </Modal>
      <Modal
        width={420}
        open={state.exporting}
        title="正在导入导出"
        closable={false}
        keyboard={false}
        maskClosable={false}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            {statusIcons[state.ffmpegLoading ? "converting" : "done"]}
            <span style={{ marginLeft: "8px" }}>加载FFmpeg</span>
          </div>
          <div>
            {
              statusIcons[
                state.ffmpegLoading
                  ? "waiting"
                  : exportProgress.framesCurrent === exportProgress.framesTotal
                  ? "done"
                  : "converting"
              ]
            }
            <span style={{ marginLeft: "8px" }}>合成视频帧</span>
          </div>
          <Progress
            percent={
              exportProgress.framesTotal
                ? (exportProgress.framesCurrent / exportProgress.framesTotal) *
                  100
                : 0
            }
            showInfo={false}
          />
          <div style={{ textAlign: "right" }}>
            {exportProgress.framesCurrent}/{exportProgress.framesTotal}
          </div>
          <div>
            {
              statusIcons[
                exportProgress.framesCurrent === exportProgress.framesTotal
                  ? exportProgress.audioGenerated
                    ? "done"
                    : "converting"
                  : "waiting"
              ]
            }
            <span style={{ marginLeft: "8px" }}>生成音频</span>
          </div>
          <div>
            {
              statusIcons[
                exportProgress.audioGenerated ? "converting" : "waiting"
              ]
            }
            <span style={{ marginLeft: "8px" }}>导出文件</span>
          </div>
        </Space>
        <FFMpegLogs />
      </Modal>
      <Modal
        title="新建工程"
        width={200}
        open={initOpen}
        closable={false}
        keyboard={false}
        maskClosable={false}
        footer={
          <Button
            type="primary"
            onClick={() => {
              updateState({
                projectSize: [projectSizeX, projectSizeY],
                projectFPS: 30,
              });
              setInitOpen(false);
            }}
          >
            完成
          </Button>
        }
      >
        <Form colon={false} labelCol={{ span: 8 }} style={{ margin: "16px 0" }}>
          <Form.Item label="画面宽度">
            <InputNumber
              value={projectSizeX}
              onChange={(value) => setProjectSizeX(value as number)}
            />
          </Form.Item>
          <Form.Item label="画面高度">
            <InputNumber
              value={projectSizeY}
              onChange={(value) => setProjectSizeY(value as number)}
            />
          </Form.Item>
          <Form.Item label="帧速率">
            <InputNumber
              value={projectFPS}
              onChange={(value) => setProjectFPS(value as number)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default Import;
