import { useEffect, useState } from "react";
import { api } from "../api/client";

let cachedPhotos = null;
let inflightRequest = null;

export const useGalleryPhotos = () => {
  const [photos, setPhotos] = useState(cachedPhotos || []);
  const [loading, setLoading] = useState(!cachedPhotos);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (!cachedPhotos) {
      setLoading(true);
    }
    const request = inflightRequest || api.listGalleryPhotos();
    inflightRequest = request;
    request
      .then((data) => {
        cachedPhotos = Array.isArray(data) ? data : [];
        if (alive) setPhotos(cachedPhotos);
      })
      .catch((err) => {
        if (alive) setError(err?.payload?.error || err.message || "Failed to load gallery photos");
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

  return { photos, loading, error };
};
