// pages/Home.js

import React, { useEffect, useState } from "react";
import { redirect } from "react-router-dom";

const Home = (props) => {
  const { isLoggedIn } = props;
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (isLoggedIn === false) redirect("/");

    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/admin/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        console.log(data); // Log the response to check the structure
        if (Array.isArray(data.events)) {
          setEvents(data.events); // Set events if it's an array under `events`
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        setError(err.message); // Set error message in case of failure
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchEvents();
  }, [isLoggedIn]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex items-center justify-center mt-10">
<div className="w-full p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-lg shadow-xl dark:bg-gray-900">
<h2 className="font-bold text-4xl text-center text-white mb-10">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-in-out transform"
            >
              <h3 className="font-semibold text-2xl text-gray-900 dark:text-white mb-4">
                {event.category}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Date:</strong> {event.date}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Time:</strong> {event.time}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Location:</strong> {event.place}
              </p>
              <p className="text-gray-800 dark:text-gray-400 mt-3">
                {event.description}
              </p>
              {event.image && (
                <div className="mt-6">
                  <img
                    src={`http://localhost:8000/uploads/${event.image}`} // Adjust the path if necessary
                    alt={event.category}
                    className="w-full h-72 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className="inline-flex items-center rounded-lg bg-purple-700 px-6 py-3 text-center text-lg font-medium text-white hover:bg-purple-800 transition-all duration-200"
                >
                  View Details
                </a>
                <a
                  href="#"
                  className="inline-flex items-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-center text-lg font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Register
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );    
};

export default Home;
