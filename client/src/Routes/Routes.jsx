// Routes.jsx
import { Routes, Route } from "react-router-dom";
import Homeroutes from "./Homeroutes";
import Adminroutes from "./Adminroutes";
import PrivateRoute from "@/Context/PrivateRoute";
import PublicRoute from "@/Context/PublicRoute"; // Import this
import Login from "@/auth/Login";
import Aboutroutes from "./Aboutroutes";
import Servicesroute from "./Servicesroute";
import Contactroutes from "./Contactroutes";
import ThankYou from "@/Components/Contact/ThankYou";
import Blogroute from "./blogroute";
import BlogList from "@/Components/Blog/BlogLis";
import Privacypolicy from "@/Components/privacy-policy/Privacypolicy";

const Mainroutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homeroutes />} />
      <Route path="/about" element={<Aboutroutes />} />
      <Route path="/services" element={<Servicesroute />} />
      <Route path="/contact" element={<Contactroutes />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/blog/*" element={<Blogroute />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/privacy-policy" element={<Privacypolicy />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* All other routes under /* require admin */}
      <Route
        path="/*"
        element={
          <PrivateRoute adminOnly={true}>
            <Adminroutes />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default Mainroutes;
