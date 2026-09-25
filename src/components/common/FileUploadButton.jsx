import { useRef } from "react";

// A lightweight upload control. In this prototype it just reads the chosen
// file's name and hands it back — swap onFile's caller for a real upload
// call (e.g. POST /api/documents) when wiring a backend.
export default function FileUploadButton({ label = "Upload", onFile, accept = ".pdf,.doc,.docx", className = "btn btn-secondary btn-sm" }) {
  const inputRef = useRef(null);
  return (
    <>
      <button type="button" className={className} onClick={() => inputRef.current?.click()}>
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file.name);
          e.target.value = "";
        }}
      />
    </>
  );
}
