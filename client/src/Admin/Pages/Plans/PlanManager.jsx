import React, { useState, useEffect } from "react";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "@/services/adminPlanService";
import { toast } from "react-toastify";
import { Trash2, Edit, Plus, History, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlanManager = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    resumeLimit: "",
    durationInDays: 30,
    description: "",
  });

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getAllPlans();
      if (res.success) setPlans(res.data);
    } catch (error) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({ name: "", price: "", resumeLimit: "", durationInDays: 30, description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      resumeLimit: plan.resumeLimit,
      durationInDays: plan.durationInDays,
      description: plan.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlan(editingPlan._id, formData);
        toast.success("Plan updated successfully");
      } else {
        await createPlan(formData);
        toast.success("Plan created successfully");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id);
        toast.success("Plan deleted");
        fetchPlans();
      } catch (error) {
        toast.error("Failed to delete plan");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Membership Plans</h1>
          <p className="text-gray-500 mt-1">Manage pricing tiers and limits</p>
        </div>

        <div className="flex gap-3">
          {/* HISTORY BUTTON */}
          <button
            onClick={() => navigate("/admin/history")}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium"
          >
            <History size={18} /> Purchase History
          </button>

          {/* CREATE BUTTON */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 font-medium"
          >
            <Plus size={18} /> Create Plan
          </button>
        </div>
      </div>

      {/* Plans Grid / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Plan Details</th>
                <th className="px-6 py-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Price</th>
                <th className="px-6 py-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Limits</th>
                <th className="px-6 py-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Duration</th>
                <th className="px-6 py-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500 animate-pulse">Loading plans...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500">No plans created yet.</td></tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-blue-50/30 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg">{plan.name}</span>
                        <span className="text-sm text-gray-500 line-clamp-1">{plan.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                         ₹{plan.price}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">{plan.resumeLimit}</span> Resumes
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {plan.durationInDays} Days
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(plan)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(plan._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">{editingPlan ? "Edit Plan" : "Create New Plan"}</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputGroup label="Plan Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Pro Plan" />

              <div className="grid grid-cols-2 gap-5">
                <InputGroup label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} />
                <InputGroup label="Resume Limit" name="resumeLimit" type="number" value={formData.resumeLimit} onChange={handleChange} />
              </div>

              <InputGroup label="Duration (Days)" name="durationInDays" type="number" value={formData.durationInDays} onChange={handleChange} />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  rows="3"
                  placeholder="What does this plan include?"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition"
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Input Component for cleaner code
const InputGroup = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      required
    />
  </div>
);

export default PlanManager;
