import React, { useState } from "react";
import { Stage, Layer, Image, Rect, Line, Circle } from "react-konva";
import useImage from "../hooks/use-image";
import {
  FaSquare,
  FaDrawPolygon,
  FaCheck,
  FaDownload,
  FaTrash,
  FaSave,
  FaFileExport,
  FaUndo,
} from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";

const AnnotationCanvas = ({ imageSrc }) => {
  const [image] = useImage(imageSrc);
  const [tool, setTool] = useState("rectangle");
  const [boxes, setBoxes] = useState([]);
  const [newBox, setNewBox] = useState(null);
  const [newPolygon, setNewPolygon] = useState([]);
  const [annotations, setAnnotations] = useState(null);
  const [idCounter, setIdCounter] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [labelInput, setLabelInput] = useState(""); // Label input
  const [pendingShape, setPendingShape] = useState(null); // Store the shape to add

  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();

    if (tool === "rectangle") {
      setNewBox({ x, y, width: 0, height: 0 });
    } else if (tool === "polygon") {
      setNewPolygon((prev) => [...prev, [x, y]]);
    }
  };

  const handleMouseMove = (e) => {
    if (tool === "rectangle" && newBox) {
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewBox((prev) => ({
        ...prev,
        width: x - prev.x,
        height: y - prev.y,
      }));
    }
  };

  const handleMouseUp = () => {
    if (tool === "rectangle" && newBox) {
      setPendingShape({
        x: newBox.x.toFixed(2),
        y: newBox.y.toFixed(2),
        width: newBox.width.toFixed(2),
        height: newBox.height.toFixed(2),
      });
      setIsModalOpen(true);
      setNewBox(null);
    }
  };

  const handlePolygonComplete = () => {
    if (newPolygon.length > 2) {
      const points = newPolygon.map(([x, y]) => [x.toFixed(2), y.toFixed(2)]);
      const xCoords = newPolygon.map(([x]) => x);
      const yCoords = newPolygon.map(([_, y]) => y);
      const x = Math.min(...xCoords).toFixed(2);
      const y = Math.min(...yCoords).toFixed(2);
      const width = (Math.max(...xCoords) - Math.min(...xCoords)).toFixed(2);
      const height = (Math.max(...yCoords) - Math.min(...yCoords)).toFixed(2);

      setPendingShape({
        x,
        y,
        width,
        height,
        points,
      });
      setIsModalOpen(true);
      setNewPolygon([]);
    } else {
      alert("Polygon must have at least 3 points!");
    }
  };

  const saveShape = () => {
    if (labelInput.trim() === "") {
      alert("Label cannot be empty.");
      return;
    }
    setBoxes((prev) => [
      ...prev,
      { id: idCounter.toString(), label: labelInput, ...pendingShape },
    ]);
    setIdCounter((prev) => prev + 1);
    setIsModalOpen(false);
    setLabelInput("");
    setPendingShape(null);
  };

  const undoLastAction = () => {
    if (tool === "polygon" && newPolygon.length > 0) {
      // Remove the last point from the incomplete polygon
      setNewPolygon((prev) => prev.slice(0, -1));
    } else if (boxes.length > 0) {
      // Remove the last completed shape
      setBoxes((prev) => prev.slice(0, -1));
    }
  };

  const exportAnnotations = () => {
    const output = {
      boxes,
      width: 800,
      height: 600,
    };
    setAnnotations(output);
    console.log(JSON.stringify(output, null, 2));
  };

  const saveAnnotatedImage = () => {
    const stage = document.getElementsByTagName("canvas")[0];
    const link = document.createElement("a");
    link.download = "annotated-image.png";
    link.href = stage.toDataURL("image/png");
    link.click();
  };

  const exportJsonFile = () => {
    const output = {
      boxes,
      width: 800,
      height: 600,
    };
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "annotations.json";
    link.click();
  };

  const clearAnnotations = () => {
    setBoxes([]);
    setNewBox(null);
    setNewPolygon([]);
    setAnnotations(null);
  };

  const getLabelSummary = () => {
    const labelCounts = boxes.reduce((acc, box) => {
      acc[box.label] = (acc[box.label] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(labelCounts).map(([label, count]) => ({
      label,
      count,
    }));
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap w-full">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-200 p-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Tools</h2>
        <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-7 gap-2 w-full">
          <button
            onClick={() => setTool("rectangle")}
            title="Rectangle Tool: Draw rectangles on the canvas"
            className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded ${
              tool === "rectangle"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            <MdOutlineRectangle />
          </button>
          <button
            onClick={() => setTool("polygon")}
            className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded ${
              tool === "polygon"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
            title="Polygon Tool: Draw polygons on the canvas"
          >
            <FaDrawPolygon />
          </button>
          <button
            onClick={handlePolygonComplete}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-green-500 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded"
            title="Complete Polygon: Finish the current polygon"
            disabled={newPolygon.length < 3}
          >
            <FaCheck />
          </button>
          <button
            onClick={undoLastAction}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-yellow-500 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white rounded"
            disabled={boxes.length === 0 && newPolygon.length === 0}
            title="Undo: Undo the last action"
          >
            <FaUndo />
          </button>
          <button
            onClick={exportAnnotations}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed text-white rounded"
            title="Export Annotations: View the current annotations in JSON format"
            disabled={boxes.length === 0}
          >
            <FaDownload />
          </button>
          <button
            onClick={saveAnnotatedImage}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-teal-500 text-white rounded"
            title="Save Image: Save the annotated image to your computer"
          >
            <FaSave />
          </button>
          <button
            onClick={clearAnnotations}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-red-500 text-white rounded"
            title="Clear All: Remove all annotations from the canvas"
          >
            <FaTrash />
          </button>
        </div>

        <div className="mt-auto p-4 flex flex-col items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
          <p className="font-semibold">Helping Note:</p>
          <p className="font-semibold text-red-400">
            Hover on the buttons to see corresponding actions!
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="w-full md:w-1/2 bg-gray-50 p-4 border">
        <Stage
          width={window.innerWidth > 768 ? 800 : window.innerWidth - 40}
          height={window.innerWidth > 768 ? 600 : window.innerWidth / 2}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            <Image image={image} />
            {boxes.map((box, index) => {
              if (box.points) {
                return (
                  <Line
                    key={index}
                    points={box.points.flat()}
                    closed
                    stroke="green"
                    strokeWidth={2}
                  />
                );
              } else {
                return (
                  <Rect
                    key={index}
                    x={parseFloat(box.x)}
                    y={parseFloat(box.y)}
                    width={parseFloat(box.width)}
                    height={parseFloat(box.height)}
                    stroke="red"
                    strokeWidth={2}
                  />
                );
              }
            })}
            {newBox && (
              <Rect
                x={newBox.x}
                y={newBox.y}
                width={newBox.width}
                height={newBox.height}
                stroke="blue"
                strokeWidth={2}
              />
            )}
            {newPolygon.map(([x, y], index) => (
              <Circle
                key={index}
                x={x}
                y={y}
                radius={3}
                fill="blue"
                stroke="black"
                strokeWidth={1}
              />
            ))}
            {newPolygon.length > 1 && (
              <Line points={newPolygon.flat()} stroke="blue" strokeWidth={2} />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-100 p-4">
        <h2 className="text-lg font-bold mb-4">Annotations</h2>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-[400px]">
          {annotations ? JSON.stringify(annotations, null, 2) : "No data"}
        </pre>
        <button
          onClick={exportJsonFile}
          className="w-full flex items-center gap-2 mt-2 py-2 px-4 bg-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded"
          disabled={!annotations}
        >
          <FaFileExport />
          Export JSON
        </button>
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Label Summary</h3>
          <ul className="list-disc pl-4">
            {getLabelSummary()?.map(({ label, count }) => (
              <li key={label}>
                {label}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h3 className="text-lg font-bold mb-4">Enter Label</h3>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded mb-4"
              placeholder="Enter shape label"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveShape}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;
