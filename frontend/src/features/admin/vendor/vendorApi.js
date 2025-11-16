export async function Vendor() {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/admin/vendors", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "vendor data failed. Please try again.");
  }

  return data;
}

export async function ApproveVendors(vendorId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/admin/vendors/${vendorId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve vendors");
  }

  return data;
}

export async function RejectVendors(vendorId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/admin/vendors/${vendorId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject vendors");
  }

  return data;
}