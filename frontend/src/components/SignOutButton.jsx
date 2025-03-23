import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../context/AppContext";

const SignOutButton = () => {
  const queryClient = useQueryClient(); // ✅ Corrected function call
  const { showToast } = useAppContext(); // ✅ Ensure it's a function

  const mutation = useMutation({
    mutationFn: apiClient.signOut, // ✅ Corrected mutation function
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] }); // ✅ Object syntax
      showToast({ message: "Signed Out!", type: "SUCCESS" });
    },
    onError: (err) => {
      showToast({ message: err.message, type: "ERROR" }); // ✅ Used `err.message`, not `error.message`
    },
  });

  const handleClick = () => {
    mutation.mutate();
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-600 font-bold bg-white hover:bg-gray-100 p-2 rounded"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
