import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import mammoth from "mammoth";

const EBookReader = () => {
  const [docs, setDocs] = useState([]);
  const [docxText, setDocxText] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      const url = URL.createObjectURL(file);
      setDocs([{ uri: url }]);
      setDocxText("");
    } else if (fileExtension === "docx") {
      // Read DOCX as text
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setDocxText(result.value);
      setDocs([]);
    } else {
      alert("Unsupported file format!");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>E-Book Reader</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <div style={{ marginTop: "20px", height: "80vh", border: "1px solid #ccc", overflow: "auto" }}>
        {docs.length > 0 && (
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            config={{ header: { disableHeader: false } }}
          />
        )}
        {docxText && <pre style={{ whiteSpace: "pre-wrap" }}>{docxText}</pre>}
        {!docs.length && !docxText && <p>No file selected</p>}
      </div>
    </div>
  );
};

export default EBookReader;

