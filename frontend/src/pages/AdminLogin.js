import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const URL = process.env.REACT_APP_BACKEND_URL + "/api/admin/login";

const AdminLogin = (props) => {
  let navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setUsername } = props;

  useEffect(() => {
    if (isLoggedIn) navigate("admin/dashboard");
  });

  const handleLogin = async (ev) => {
    ev.preventDefault();
    const username = ev.target.username.value;
    const password = ev.target.password.value;
    const formData = { username, password };
  
    try {
      const res = await axios.post(URL, formData);
      const data = res.data;
  
      
      console.log("Response Data:", data);
  
      
      if (data.success === true) {
        toast.success(data.message);
      
        
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
      
    } catch (error) {
      
      console.error("Error during login:", error);
  
      
      if (error.response) {
        
        toast.error(error.response.data.message || "Login failed.");
      } else if (error.request) {
        
        toast.error("No response from the server. Please try again.");
      } else {
        
        toast.error("An unexpected error occurred.");
      }
    }
  };
  

  return (
    <div className="w-full flex justify-center my-4">
      <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
          Admin Login
        </h5>
        <form
          className="w-full flex max-w-md flex-col gap-4"
          onSubmit={handleLogin}
        >
          <div>
            <div className="mb-2 block">
              <label htmlFor="username" className="text-sm font-medium required">
                Username
              </label>
            </div>
            <input
              id="username"
              type="text"
              placeholder="Your Username"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2 block">
              <label
                htmlFor="password"
                className="text-sm font-medium required"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Your Password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="focus:outline-none text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-800"
          >
            Submit
          </button>

          <p className="text-center text-sm text-gray-500">
            Not yet registered?{" "}
            <a
              href="http://localhost:3000/admin/register/"
              className="font-semibold leading-6 text-purple-600 hover:text-purple-500"
            >
              Register Here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
