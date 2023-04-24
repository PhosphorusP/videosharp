import { Tabs } from "antd";
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
}: PanelHeaderProps) => (
  <Tabs
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
    tabBarStyle={{ marginBottom: 0 }}
  />
);
export default PanelHeader;
