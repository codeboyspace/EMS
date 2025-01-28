// pages/AdminDashboard.js

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const AdminDashboard = (props) => {
  const { isLoggedIn, setIsLoggedIn } = props;
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    place: "",
    time: "",
    date: "",
    description: "",
    organizer: "",
    image: null,
  });
  const [newUser, setNewUser] = useState("");
  const [userRole, setUserRole] = useState("moderator"); // Default role is "moderator"
  const URL = process.env.REACT_APP_BACKEND_URL + "/api/admin/events";
  const URLUSERS = process.env.REACT_APP_BACKEND_URL + "/admin/users";


  useEffect(() => {
    // Fetch existing events and users
    const fetchData = async () => {
      try {
        const eventsRes = await axios.get(URL);
        setEvents(eventsRes.data.events);
        const usersRes = await axios.get(URLUSERS);
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data. Please try again later.");
      }
    };

    fetchData();
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/admin/login");
  };

  const handleEventSubmit = async (ev) => {
    ev.preventDefault();

    // Create FormData for file upload
    const eventData = new FormData();
    eventData.append("category", formData.category);
    eventData.append("place", formData.place);
    eventData.append("time", formData.time);
    eventData.append("date", formData.date);
    eventData.append("description", formData.description);
    eventData.append("organizer", formData.organizer);
    if (formData.image) {
      eventData.append("image", formData.image);
    }

    try {
      const res = await axios.post(URL+"/create", eventData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setEvents([...events, res.data.event]);
      setFormData({
        category: "",
        place: "",
        time: "",
        date: "",
        description: "",
        organizer: "",
        image: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add event. Please try again later.");
    }
  };

  const handleAddUser = async () => {
    const data = {
      username: newUser,
      role: userRole, // Send the role to the API
    };

    try {
      const response = await fetch("http://localhost:8000/api/admin/users/add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("User added successfully", result);
        // You can add a success notification here
      } else {
        console.error("Error adding user:", result);
        // You can add an error notification here
      }
    } catch (error) {
      console.error("Request failed", error);
      // Handle network or other errors here
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">Admin Dashboard</h1>

      <button
        onClick={handleLogout}
        className="mb-6 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>

      <div className="bg-white p-6 rounded shadow-lg mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-indigo-600">Add Event</h2>
        <form onSubmit={handleEventSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="text"
              placeholder="Place"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          ></textarea>

          <input
            type="text"
            placeholder="Organizer"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Image Upload */}
          <div>
            <label htmlFor="eventImage" className="block text-gray-700 mb-2">
              Upload Event Image
            </label>
            <input
              type="file"
              id="eventImage"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full border p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700">
            Add Event
          </button>
        </form>
      </div>

      <div className="flex space-x-4">
      <input
        type="text"
        placeholder="Enter username"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
        className="block border p-3 rounded-md w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <select
        value={userRole}
        onChange={(e) => setUserRole(e.target.value)}
        className="block border p-3 rounded-md w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={handleAddUser}
        className="text-white bg-green-600 px-6 py-3 rounded-md shadow-md hover:bg-green-700"
      >
        Add User
      </button>
    </div>

      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-indigo-600">Events</h2>
        <ul className="space-y-6">
          {events.map((event, idx) => (
            <li key={idx} className="border p-6 rounded-md shadow-md bg-gray-50">
              <h3 className="text-xl font-bold text-indigo-600">{event.category}</h3>
              <p className="text-gray-600">{event.place} - {event.date} {event.time}</p>
              <p className="text-gray-800">{event.description}</p>
              <p className="text-gray-600">Organizer: {event.organizer}</p>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.category}
                  className="mt-4 w-full h-auto rounded-md shadow-lg"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
