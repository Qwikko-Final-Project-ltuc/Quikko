import { useEffect, useState } from "react";
import { GetAllCMS } from "./aboutApi";

export default function AboutPage() {
  const [about1, setAbout1] = useState(null);
  const [about2, setAbout2] = useState(null);
  const [about3, setAbout3] = useState(null);
  const [about4, setAbout4] = useState(null);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const cms1 = await GetAllCMS("user", "About Page 1");
        const cms2 = await GetAllCMS("user", "About Page 2");
        const cms3 = await GetAllCMS("user", "About Page 3");
        const cms4 = await GetAllCMS("user", "About Page 4");

        setAbout1(cms1[0] || null);
        setAbout2(cms2[0] || null);
        setAbout3(cms3[0] || null);
        setAbout4(cms4[0] || null);
      } catch (err) {
        console.error("Failed to fetch CMS:", err);
      }
    };

    fetchCms();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-xl font-bold mb-2">About Us</h2>

      {about1 && (
        <section className="bg-gray-50 p-4 rounded shadow">
          <p>{about1.content}</p>
          {about1.image_url && (
            <img
              src={about1.image_url}
              alt="About 1"
              className="mt-2 w-64 h-auto rounded"
            />
          )}
        </section>
      )}

      {about2 && (
        <section className="bg-gray-50 p-4 rounded shadow">
          <p>{about2.content}</p>
          {about2.image_url && (
            <img
              src={about2.image_url}
              alt="About 2"
              className="mt-2 w-64 h-auto rounded"
            />
          )}
        </section>
      )}

      {about3 && (
        <section className="bg-gray-50 p-4 rounded shadow">
          <p>{about3.content}</p>
          {about3.image_url && (
            <img
              src={about3.image_url}
              alt="About 3"
              className="mt-2 w-64 h-auto rounded"
            />
          )}
        </section>
      )}

      {about4 && (
        <section className="bg-gray-50 p-4 rounded shadow">
          <p>{about4.content}</p>
          {about4.image_url && (
            <img
              src={about4.image_url}
              alt="About 4"
              className="mt-2 w-64 h-auto rounded"
            />
          )}
        </section>
      )}
    </div>
  );
}
