import React, { useState } from "react";

const ComplaintModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    complainant: "",
    respondent: "",
    respondent_id: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading
    try {
      const response = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      setLoading(false);
      
      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      setSuccess("Complaint submitted successfully!");
      setError("");
      setFormData({ complainant: "", respondent: "", description: "" });
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
    setTimeout(() => {
      onClose();
    }, 500); 
  };

  return (
    <div className="fixed inset-0 bg-primary-content bg-opacity-70 flex items-center justify-center">
      <div className="bg-primary-content p-6 rounded-lg shadow-sm w-96 shadow-primary">
        <h2 className="text-2xl text-center text-primary font-bold mb-4">Submit a Complaint</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="complainant">
              Your Name
            </label>
            <input
              type="text"
              id="complainant"
              name="complainant"
              value={formData.complainant}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-800 bg-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="respondent">
              Respondent's Name
            </label>
            <input
              type="text"
              id="respondent"
              name="respondent"
              value={formData.respondent}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-800 bg-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="respondent_id">
              Respondent's ID
            </label>
            <input
              type="number"
              id="respondent_id"
              name="respondent_id"
              value={formData.respondent_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-800 bg-gray-900"
              required
            />
          </div>
          <div className="mb-2 py-4">
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Complaint Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-800 bg-gray-900"
              rows="3"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-lg mr-4"
            >
              Cancel
            </button>
            <button type="submit" className="w-full px-4 py-2 bg-primary hover:bg-hover text-white rounded-lg font-semibold"
              disabled={loading}
            >
              {loading ? <span className="loading loading-ring loading-md"></span> : "submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
