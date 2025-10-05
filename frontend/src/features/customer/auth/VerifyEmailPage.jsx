import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (oobCode) {
      axios.post("http://localhost:3000/api/auth/verify-email", { oobCode })
        .then(() => {
          alert("Email verified successfully!");
          navigate("/auth/login");
        })
        .catch(() => alert("Verification failed"));
    }
  }, [searchParams, navigate]);

  return <div>Verifying...</div>;
};

export default VerifyEmailPage;
