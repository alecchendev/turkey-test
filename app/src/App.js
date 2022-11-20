import Home from "./pages/Home";
import Game from "./pages/Game";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import "./styles/App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/game",
    element: <Game />,
  },
]);

function App() {

  return (
    <RouterProvider router={router} />
  );

}

export default App;
