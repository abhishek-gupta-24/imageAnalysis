import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function App() {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image!");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLabel(data.label);
    setImageUrl("http://localhost:5000/heatmap.jpg?" + new Date().getTime());
  };

  return (
    <div className={`${darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen transition-all duration-300 flex items-center justify-center px-4`}>
      <motion.div
        className="w-full max-w-4xl p-8 rounded-2xl shadow-2xl bg-white dark:bg-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-extrabold text-purple-600 dark:text-purple-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            🧠 Image Analyzer using Heatmap
          </motion.h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Moon className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input file-input-bordered file-input-accent w-full max-w-xs bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleUpload}
            className="btn bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2"
          >
            Analyze Image
          </button>
        </div>

        {label && (
          <motion.div
            className="text-lg font-semibold mb-6 text-center text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🏷️ Prediction: <span className="font-bold">{label}</span>
          </motion.div>
        )}
        {imageUrl && (
            <motion.div
            className="text-lg font-semibold mb-6 text-center text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            HeatMap Image of Original Image
          </motion.div>
        )}
        {imageUrl && (


          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
        <img
          src={imageUrl}
          alt="Grad-CAM heatmap"
          className="max-w-full w-[500px] h-auto rounded-xl shadow-xl border border-purple-300"
        />

          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
