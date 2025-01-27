import { publishTrend } from "@/api/trend";
import { useLocalStore } from "@/lib/store";
import { TrendSnapshot } from "@/types/trend";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

export default function CreatePanel() {
  const tweetsInCart = useLocalStore((state) => state.tweets);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const snapshotContent = useLocalStore((state) => state.snapshotContent);
  const setSnapshotContent = useLocalStore((state) => state.setSnapshotContent);
  const [isPublishing, setIsPublishing] = useState(false);

  const quillRef = useRef<ReactQuill | null>(null); // Ref to access Quill instance
  const navigate = useNavigate();

  const handlePublish = async () => {
    const data = {
      title,
      description,
      data: snapshotContent,
      tweets: tweetsInCart,
    };
    setIsPublishing(true);
    const trend = (await publishTrend(data)) as TrendSnapshot;
    setIsPublishing(false);
    console.log("trend", trend);
    navigate(`/trend/${trend.id}`);
  };

  return (
    <div className="h-full flex flex-col min-h-[calc(100vh-180px)] md:min-h-0">
      <div className="flex flex-col flex-1 overflow-hidden">
        <label className="text-lg font-bold mb-2">Title</label>
        <input
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          value={title}
          className="border-2 border-gray-300 rounded-md p-2 pr-6 w-full"
          type="text"
          placeholder="Enter a title for your Trend Snapshot"
        />

        <div className="mt-4" />

        <label className="text-lg font-bold mb-2">Description</label>
        <textarea
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          rows={4}
          value={description}
          className="border-2 border-gray-300 rounded-md p-2 pr-6 w-full"
          placeholder="Enter a description for your Trend Snapshot"
        />

        <div className="mt-4" />

        <label className="text-lg font-bold mb-2">Trend Snapshot</label>
        <div className="flex-1 h-[calc(100vh-600px)]">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={snapshotContent}
            onChange={setSnapshotContent}
            className="h-[calc(100vh-600px)] mb-16"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ["bold", "italic", "underline", "strike"],
                ["blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ script: "sub" }, { script: "super" }],
                ["link"],
              ],
            }}
          />
        </div>
      </div>

      <div className="fixed shrink-0 bg-white p-4 bottom-0 left-0 right-0">
        <button
          disabled={isPublishing || !title || !description || !snapshotContent}
          onClick={handlePublish}
          className="bg-blue-500 text-white px-4 py-2 w-full rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? "Publishing..." : "Ready to Publish"}
        </button>
      </div>
    </div>
  );
}
