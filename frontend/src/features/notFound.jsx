import { Link } from "react-router-dom";
import { BiError } from "react-icons/bi";
import { IoArrowBackSharp } from "react-icons/io5";

export default function NotFound() {
  return (
      <div className="bg-[white] h-screen flex justify-center items-center flex-col text-[black] font-normal not-italic">
        <h1 className="text-[5rem] flex items-center gap-2 text-red-600"><BiError className="flex justify-center items-center" /> 404</h1>
        <p className="text-[2rem] text-black">
          Oops! The page you're looking for does not exist
        </p>
        <Link to="/home" className="no-underline flex items-center gap-2 text-black mt-5 hover:text-[blue]"><IoArrowBackSharp /> Back To Home</Link>
      </div>
  );
}