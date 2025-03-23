import { useState } from "react";
import type { Task, Column as ColumnType } from "./types";
import { Column } from "../components/Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { format, addDays } from "date-fns";
import React from "react";

const INITIAL_DATES: ColumnType[] = [
  { id: format(new Date(), "yyyy-MM-dd"), title: "Day 1" },
  { id: format(addDays(new Date(), 1), "yyyy-MM-dd"), title: "Day 2" },
  { id: format(addDays(new Date(), 2), "yyyy-MM-dd"), title: "Day 3" },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Visit Eiffel Tower",
    description: "Enjoy the view from the top.",
    location: "Paris, France",
    date: INITIAL_DATES[0].id,
  },
  {
    id: "2",
    title: "Louvre Museum",
    description: "See the Mona Lisa.",
    location: "Paris, France",
    date: INITIAL_DATES[1].id,
  },
];

const LOCATION_SUGGESTIONS = [
  "Paris, France",
  "London, UK",
  "New York, USA",
  "Tokyo, Japan",
  "Bali, Indonesia",
  "Rome, Italy",
  "Dubai, UAE",
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [dates, setDates] = useState<ColumnType[]>(INITIAL_DATES);
  const [newDateTitle, setNewDateTitle] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATES[0].id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newDate = over.id as string;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, date: newDate } : task
      )
    );
  }

  function handleAddTask() {
    if (!newTaskTitle.trim() || !newTaskDescription.trim() || !locationSearch.trim()) {
      alert("Please fill in all fields before adding a task.");
      return;
    }
  
    const newTask: Task = {
      id: String(tasks.length + 1),
      title: newTaskTitle,
      description: newTaskDescription,
      location: locationSearch, 
      date: selectedDate,
    };
  
    setTasks((prevTasks) => [...prevTasks, newTask]);
  
    // Reset input fields
    setNewTaskTitle("");
    setNewTaskDescription("");
    setLocationSearch(""); 
  }
  
  function handleLocationSearch(query: string) {  
    setLocationSearch(query);
    if (query.trim()) {
      setFilteredLocations(
        LOCATION_SUGGESTIONS.filter((loc) =>
          loc.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredLocations([]);
    }
  }
const DragDrop = () => {
  return (
    <div className="p-4">
      {/* Add New Date Section */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="p-2 border rounded text-black"
          placeholder="New date name"
          value={newDateTitle}
          onChange={(e) => setNewDateTitle(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            if (newDateTitle.trim()) {
              setDates((prev) => [
                ...prev,
                { id: format(addDays(new Date(), prev.length), "yyyy-MM-dd"), title: newDateTitle },
              ]);
              setNewDateTitle("");
            }
          }}
        >
          Add Date
        </button>
      </div>

      {/* Add New Task Section */}
      <div className="mb-4 flex flex-col gap-2 w-full max-w-xl">
        <input
          type="text"
          className="p-2 border rounded text-black"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <input
          type="text"
          className="p-2 border rounded text-black"
          placeholder="Task description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />

        {/* Location Search Bar */}
        <div className="relative">
          <input
            type="text"
            className="p-2 border rounded text-black w-full"
            placeholder="Search for location"
            value={locationSearch}
            onChange={(e) => handleLocationSearch(e.target.value)}
          />
          {filteredLocations.length > 0 && (
            <div className="absolute left-0 right-0 bg-white border rounded shadow-lg z-10">
              {filteredLocations.map((location) => (
                <div
                  key={location}
                  className="p-2 hover:bg-gray-200 cursor-pointer text-black"
                  onClick={() => {
                    setSelectedLocation(location);
                    setLocationSearch(location);
                    setFilteredLocations([]);
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Date Dropdown */}
        <select
          className="p-2 border rounded text-black"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {dates.map((date) => (
            <option key={date.id} value={date.id}>
              {date.title}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleAddTask}
        >
          Add Task
        </button>
      </div>

      {/* Drag-and-Drop Context */}
      <div className="flex gap-8 overflow-x-auto">
        <DndContext onDragEnd={handleDragEnd}>
          {dates.map((date) => (
            <Column
              key={date.id}
              column={date}
              tasks={tasks.filter((task) => task.date === date.id)}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
}