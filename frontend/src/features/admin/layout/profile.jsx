export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <p className="text-center mt-10">Please login first.</p>;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl text-center font-bold mb-4 text-gray-800 dark:text-gray-100">
        Admin Profile
      </h2>
      <div className="flex items-center mb-4 space-x-4">
        <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xl">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0].toUpperCase())
                .slice(0, 2)
                .join("")
            : "A"}
        </div>
        <div className="text-gray-800 dark:text-gray-100">
          <p className="font-semibold text-lg">{user.name}</p>
          <p className="text-sm">{user.role}</p>
        </div>
      </div>

      <div className="text-gray-800 dark:text-gray-100 space-y-2">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone || "-"}
        </p>
        <p>
          <strong>Address:</strong> {user.address || "-"}
        </p>
      </div>
    </div>
  );
}
