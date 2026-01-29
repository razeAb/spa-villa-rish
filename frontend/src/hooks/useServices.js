import { useEffect, useState } from "react";
import { api } from "../api/client";

let cachedServices = null;
let inflightRequest = null;

export const useServices = () => {
  const [services, setServices] = useState(cachedServices || []);
  const [loading, setLoading] = useState(!cachedServices);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cachedServices) return;
    let alive = true;
    setLoading(true);
    const request = inflightRequest || api.listServices();
    inflightRequest = request;
    request
      .then((data) => {
        cachedServices = Array.isArray(data) ? data : [];
        if (alive) setServices(cachedServices);
      })
      .catch((err) => {
        if (alive) setError(err?.payload?.error || err.message || "Failed to load services");
      })
      .finally(() => {
        if (alive) setLoading(false);
        if (inflightRequest === request) {
          inflightRequest = null;
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  return { services, loading, error };
};
