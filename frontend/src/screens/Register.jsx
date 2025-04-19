import React , {useState , useContext} from "react";
import { Link , useNavigate} from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/userContext";

const Register = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const {setUser} = useContext(UserContext)

  function submitHandler(e) {
    e.preventDefault()
    const user = { email, password }
    axiosInstance.post("/users/register", user)
    .then((res) => {
      console.log(res.data)
      setUser(res.data.user)
      localStorage.setItem("token", res.data.token)
      navigate("/")
    })
    .catch((err) => {
      console.error(err)
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">Register</h2>
        <form className="space-y-4" onSubmit={submitHandler}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;