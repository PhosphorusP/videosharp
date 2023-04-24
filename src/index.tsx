import { App, ConfigProvider, theme } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { useMediaQuery } from "react-responsive";
import MyApp from "./App";
import store from "./store/store";
import { updateState } from "./store/action";

const AppProvider: React.FC = () => {
  const systemPrefersDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)",
    },
    undefined
  )
    ? 1
    : 0;
  window.document.body.style.colorScheme = systemPrefersDark ? "dark" : "light";
  window.document.body.style.color = systemPrefersDark ? "#FFF" : "#000";
  updateState({
    darkMode: systemPrefersDark,
  });
  return (
    <Provider store={store}>
      <ConfigProvider
        autoInsertSpaceInButton={false}
        theme={{
          algorithm: [
            systemPrefersDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            theme.compactAlgorithm,
          ],
        }}
      >
        <App>
          <MyApp />
        </App>
      </ConfigProvider>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProvider />
);
