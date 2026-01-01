import axiosInstance from "@/api/axiosInstance";

// Get all plans
export const getAllPlans = async () => {
  const response = await axiosInstance.get("/plans");
  return response.data;
};

// Create a new plan
export const createPlan = async (planData) => {
  const response = await axiosInstance.post("/plans", planData);
  return response.data;
};

// Update a plan
export const updatePlan = async (id, planData) => {
  const response = await axiosInstance.put(`/plans/${id}`, planData);
  return response.data;
};

// Delete a plan
export const deletePlan = async (id) => {
  const response = await axiosInstance.delete(`/plans/${id}`);
  return response.data;
};
