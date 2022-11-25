import Home from "./pages/Home";
import Game from "./pages/Game";
import Stats from "./pages/Stats";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./styles/App.css";
import { CookiesProvider } from "react-cookie";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/game/:role",
    element: <Game/>,
  },
  {
    path: "/stats",
    element: <Stats/>,
  },
]);

function App() {

  return (
    <CookiesProvider>
      <RouterProvider router={router} />
    </CookiesProvider>
  );

}

export default App;
