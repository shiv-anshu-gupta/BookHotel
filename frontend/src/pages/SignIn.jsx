import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import { useAppContext } from "../context/AppContext"; // Fixed missing import
import { Link } from "react-router-dom";

const SignIn = () => {
  const location = useLocation();
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue, // ✅ Helps modify input values before submission
  } = useForm();

  // ✅ Updated mutation syntax for React Query v5
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: apiClient.signIn,
    onSuccess: async () => {
      showToast({ message: "Sign In Successful!", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      navigate(location.state?.from?.pathname || "/");
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred. Please try again.";
      showToast({ message: errorMessage, type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    // ✅ Trim email and password before sending request
    mutate({
      email: data.email.trim(),
      password: data.password.trim(),
    });
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <h2 className="text-3xl font-bold text-center">Sign In</h2>

      <label className="text-gray-700 text-sm font-bold flex-1">
        Email
        <input
          type="email"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("email", { required: "Email is required" })}
          onChange={(e) => setValue("email", e.target.value.trim())} // ✅ Trim spaces while typing
        />
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
      </label>

      <label className="text-gray-700 text-sm font-bold flex-1">
        Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          onChange={(e) => setValue("password", e.target.value.trim())} // ✅ Trim spaces while typing
        />
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
      </label>

      {/* ✅ Error message from API */}
      {isError && <p className="text-red-500">{error?.message}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm">
          Not Registered?{" "}
          <Link
            className="underline text-blue-600 hover:text-blue-800"
            to="/register"
          >
            Create an account
          </Link>
        </span>
        <button
          type="submit"
          disabled={isPending}
          className={`bg-blue-600 text-white p-2 font-bold text-xl rounded-lg transition-all duration-200 ${
            isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
          }`}
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default SignIn;
