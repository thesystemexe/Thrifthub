import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { adminGetMe } from "./features/auth/authSlice.js";

function App() {
  const { user, isInitialized } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(adminGetMe());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div>
        <h1>Fetching users..</h1>
      </div>
    );
  }

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
