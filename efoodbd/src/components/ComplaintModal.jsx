import React, { useState } from "react";

const ComplaintModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    complainant: "",
    respondent_id: "",
    description: "",
    rating: 2, // Default rating
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const id = localStorage.getItem("userId");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (e) => {
    setFormData({ ...formData, rating: parseInt(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit complaint");

      setSuccess("Complaint submitted successfully!");
      setError("");
      setFormData({ complainant: "", respondent_id: "", description: "", rating: 3 });

      // Close modal automatically
      document.getElementById("complaint_modal").close();
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
    setLoading(false);
  };

  return (
    <>
      <button className="bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-hover mb-4 lg:mb-0" onClick={() => document.getElementById("complaint_modal").showModal()}>
        Write a Review
      </button>

      <dialog id="complaint_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-primary-content p-6 rounded-lg shadow-sm shadow-primary">
          <h2 className="text-2xl text-center text-primary font-bold mb-4">Submit a Review</h2>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 px-2">Your Name</label>
              <input
                type="text"
                name="complainant"
                value={formData.complainant}
                onChange={handleChange}
                className="w-full px-6 py-2 rounded-lg border border-gray-800 bg-gray-900"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 px-2">Seller's ID</label>
              <input
                type="number"
                name="respondent_id"
                value={formData.respondent_id}
                onChange={handleChange}
                className="w-full px-6 py-2 rounded-lg border border-gray-800 bg-gray-900"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 px-2">Review Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-6 py-2 rounded-lg border border-gray-800 bg-gray-900"
                rows="3"
                required
              />
            </div>
            <div className="mb-6 flex items-center justify-center">
              <div className="rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <input
                    key={value}
                    type="radio"
                    name="rating"
                    value={value}
                    className="mask mask-star-2 bg-orange-400"
                    checked={formData.rating === value}
                    onChange={handleRatingChange}
                  />
                ))}
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="bg-gray-300 px-4 py-2 rounded-xl text-black font-medium hover:bg-gray-400">Close</button>
              </form>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-hover text-white rounded-xl font-medium"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default ComplaintModal;