import { useSelector } from "react-redux";
const DebugPanel: React.FC = () => {
  const state: any = useSelector((state: any) => state.reducer);
  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          boxShadow: "0 0 8px #000",
          width: '320px',
          height: '160px',
          overflow: 'scroll'
        }}
      >
        <div>debug</div>
      </div>
    </>
  );
};
export default DebugPanel;
