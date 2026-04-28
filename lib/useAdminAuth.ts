import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const isAuthed = localStorage.getItem("admin_authed") === "true";
    if (!isAuthed) {
      router.replace("/admin");
    } else {
      setAuthed(true);
    }
  }, []);

  return authed;
}