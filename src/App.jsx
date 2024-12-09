import React, { useState } from "react";
import AnnotationCanvas from "./components/AnnotationCanvas";

function App() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Image Annotation Tool</h1>
      <div className="flex gap-4 mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border border-gray-300 rounded px-4 py-2"
        />
        {image && (
          <button
            onClick={clearImage}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Image
          </button>
        )}
      </div>
      {!image ? (
        <div className="flex flex-col items-center justify-center w-full h-96 bg-gray-100 border border-dashed border-gray-400 rounded">
          <p className="text-gray-500">No image selected.</p>
          <p className="text-gray-500 text-sm">
            Please upload an image to start annotating.
          </p>
        </div>
      ) : (
        <AnnotationCanvas imageSrc={image} />
      )}
    </div>
  );
}

export default App;
