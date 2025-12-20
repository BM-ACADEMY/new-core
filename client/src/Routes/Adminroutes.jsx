import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../Context/PrivateRoute";
import ResponsiveDashboard from "@/Admin/ResponsiveDashboard";
import Gallery from "@/Admin/Pages/Gallery";
import Reviews from "@/Admin/Pages/Reviews";
import Banner from "@/Admin/Pages/Banner";


const Adminroutes = () => {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly={true}>
            <ResponsiveDashboard />
          </PrivateRoute>
        }
      >
        {/* ✅ Default route: redirect /admin to /admin/menu */}

        <Route path="gallery" element={<Gallery />} />
        <Route path="review" element={<Reviews />} />
        <Route path="banner" element={<Banner />} />
      </Route>
    </Routes>
  );
};

export default Adminroutes;
