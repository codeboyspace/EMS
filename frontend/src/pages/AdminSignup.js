// pages/AdminRegister.js

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const URL = process.env.REACT_APP_BACKEND_URL + "/api/admin/register";

const AdminRegister = (props) => {
  const { isLoggedIn, setIsLoggedIn } = props;
  let navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/admin/dashboard");
  }, [isLoggedIn, navigate]);

  const handleAdminRegister = async (ev) => {
    ev.preventDefault();
    const username = ev.target.username.value;
    const password = ev.target.password.value;
    const confirmpassword = ev.target.confirmpassword.value;

    if (password !== confirmpassword) {
      toast.error("Passwords do not match!");
    } else {
      const formData = {
        username: username,
        password: password,
      };

      try {
        const res = await axios.post(URL, formData);
        const data = res.data;

        if (data.success === true) {
          toast.success(data.message);
          console.log(data.message);
          navigate("/admin/login")
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("An error occurred", err);
        toast.error("Registration failed. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-6 py-8 mx-auto my-5 lg:py-0">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
            Admin Registration
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            action="POST"
            onSubmit={handleAdminRegister}
          >
            <div>
              <div className="mb-2 block">
                <label htmlFor="username" className="text-sm font-medium required">
                  Username
                </label>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <label htmlFor="password" className="text-sm font-medium required">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <label htmlFor="confirmpassword" className="text-sm font-medium required">
                  Confirm Password
                </label>
              </div>
              <input
                id="confirmpassword"
                name="confirmpassword"
                type="password"
                placeholder="Re-enter your password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full focus:outline-none text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-800"
            >
              Register as Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
