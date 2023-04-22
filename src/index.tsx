import { App, ConfigProvider, theme } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import MyApp from "./App";
import store from "./store/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <App>
      <ConfigProvider theme={{algorithm: [theme.compactAlgorithm]}}>
        <MyApp />
      </ConfigProvider>
    </App>
  </Provider>
);
