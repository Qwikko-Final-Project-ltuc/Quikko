import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (!oobCode) return navigate("/customer/login");

    axios
      .post("http://localhost:3000/api/auth/verify-email", { oobCode })
      .then(() => {
        navigate("/customer/login", {
          state: { message: "Email verified successfully! Please log in." },
        });
      })
      .catch(() => {
        navigate("/customer/login", {
          state: { message: "Email verification failed.", error: true },
        });
      });
  }, [searchParams, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Verifying...</div>;
};

export default VerifyEmailPage;
