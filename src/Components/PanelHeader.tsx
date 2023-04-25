import { Tabs, theme } from "antd";
import { ReactNode } from "react";

type PanelHeaderProps = {
  icon: ReactNode;
  label: ReactNode;
  extra?: ReactNode;
};
const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  label,
  extra,
}: PanelHeaderProps) => {
  const {token} = theme.useToken();
  return <Tabs
    activeKey="null"
    size="middle"
    tabBarExtraContent={extra ? extra : undefined}
    items={[
      {
        key: "a",
        label: (
          <>
            <div style={{ width: "8px", display: "inline-block" }} />
            {icon}

            <div
              style={{
                width: "0px",
                marginLeft: "-4px",
                display: "inline-block",
              }}
            />
            {label}
          </>
        ),
        children: <></>,
      },
    ]}
    style={{ position: "sticky", top: 0 , backgroundColor: token.colorBgContainer, zIndex: '1'}}
    tabBarStyle={{ marginBottom: 0 }}
  />
  };
export default PanelHeader;
