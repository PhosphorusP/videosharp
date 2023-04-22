import { Tabs } from "antd";
import { ReactNode } from "react";

type PanelHeaderProps = {
  icon: ReactNode;
  label: ReactNode;
};
const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  label,
}: PanelHeaderProps) => (
  <Tabs
    activeKey="null"
    size="small"
    items={[
      {
        key: "a",
        label: (
          <>
            {icon}
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
