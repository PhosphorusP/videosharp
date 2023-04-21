import { App, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { importFiles } from "../store/action";
import { useSelector } from "react-redux";

const Import: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [mask, setMask] = useState(false);
  useEffect(() => {
    const defaultHandler: EventListener = (e: Event) => e.preventDefault();
    document.addEventListener("dragleave", defaultHandler);
    document.addEventListener("drop", defaultHandler);
    document.addEventListener("dragenter", defaultHandler);
    document.addEventListener("dragover", defaultHandler);
    const dragEnterHandler: EventListener = () => {
      setMask(true);
    };
    document.addEventListener("dragenter", dragEnterHandler);
    const dragLeaveListener: EventListener = (e: any) => {
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
      setMask(false);
      e.preventDefault();
      let fileCnt =
        e.dataTransfer && e.dataTransfer.files
          ? await importFiles(e.dataTransfer.files)
          : 0;
      if (fileCnt) message.success(`已导入${fileCnt}个文件`);
      else message.error("没有拖入可供导入的文件");
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("drop", dropHandler);
    // handle document paste
    const pasteHandler: any = async (e: ClipboardEvent) => {
      let fileCnt = e.clipboardData
        ? await importFiles(e.clipboardData.files)
        : 0;
      if (fileCnt) message.success(`已导入${fileCnt}个文件`);
      else message.error("剪贴板中没有可供导入的文件");
      e.preventDefault();
      e.stopPropagation();
    };

    return () => {
      document.removeEventListener("dragleave", defaultHandler);
      document.removeEventListener("drop", defaultHandler);
      document.removeEventListener("dragenter", defaultHandler);
      document.removeEventListener("dragover", defaultHandler);
      document.removeEventListener("dragenter", dragEnterHandler);
      document.removeEventListener("dragleave", dragLeaveListener);
      document.removeEventListener("drop", dropHandler);
    };
  }, []);
  return (
    <>
      <div
        style={{
          display: mask ? "flex" : "none",
          zIndex: 1,
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: token.colorBgMask,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
      <div
        style={{
          display: state.importing ? "flex" : "none",
          zIndex: 1,
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: token.colorBgMask,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: token.colorTextLightSolid, fontSize: "24px" }}>
          正在导入文件
        </div>
      </div>

      <div
        style={{
          display: state.appLoading ? "flex" : "none",
          zIndex: 1,
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: token.colorBgMask,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: token.colorTextLightSolid, fontSize: "24px" }}>
          正在加载FFMPEG
        </div>
      </div>
    </>
  );
};
export default Import;
