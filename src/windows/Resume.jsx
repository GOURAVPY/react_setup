import { useState } from "react";
import { Download } from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import { Document, Page, pdfjs } from "react-pdf";


import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const Resume = () => {
  const [pageCount, setPageCount] = useState(1);

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="resume" />
        <h2>Resume.pdf</h2>
        <a
          href="files/resume.pdf"
          download
          className="cursor-pointer"
          title="Download resume"
        >
          {" "}
          <Download className="icon" />{" "}
        </a>
      </div>
      {/* every page of the résumé, one under the other */}
      <Document file="files/resume.pdf" onLoadSuccess={({ numPages }) => setPageCount(numPages)}>
        {Array.from({ length: pageCount }, (_, i) => (
          <Page key={i} pageNumber={i + 1} renderTextLayer renderAnnotationLayer />
        ))}
      </Document>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
