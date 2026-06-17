import { Route, Routes } from "react-router-dom";
import NotFound from "../Views/NotFound";
// import NotFounfPage from "../Pages/NotFountPage";

// De esta manera se puede agregar el page 404 de manera mas escalable a cualquier route branch
export default function CustomRoutes(props: any) {
  const { children } = props;
  return (
    <Routes>
      {children}
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}
