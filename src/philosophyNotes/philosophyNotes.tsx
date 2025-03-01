import { useState, useRef, useEffect, useMemo } from "react";
import { Data, Rect } from "../globalEnvironment";
import "./philosophyNotes.css";

type PhilosophyNotesProps = {
  data: Data;
};

function Philosophy(Props: PhilosophyNotesProps) {
  const [noteIndex, setNoteIndex] = useState(() => 0);
  const [viewNote, setViewNote] = useState(() => false);
  const [svgElementComputedRect, setSVGElementComputedRect] = useState<Rect>(() => ({ height: 0, width: 0 }));

  const dailySVGElement = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setSVGElementComputedRect(prev => {
      if (!dailySVGElement.current) return prev;
      prev.height = Number(dailySVGElement.current.getBoundingClientRect().height - 30);
      prev.width = Number(dailySVGElement.current.getBoundingClientRect().width - 30);
      return { ...prev };
    })
  }, []);

  const lineCoordinates = useMemo(() =>
    [
      {
        x1: 30, y1: svgElementComputedRect.height / 2,
        x2: svgElementComputedRect.width, y2: svgElementComputedRect.height / 2
      },
      {
        x1: 30, y1: svgElementComputedRect.height / 2,
        x2: 30 + 10, y2: svgElementComputedRect.height / 2 + 10
      },
      {
        x1: 30, y1: svgElementComputedRect.height / 2,
        x2: 30 + 10, y2: svgElementComputedRect.height / 2 - 10
      },
      {
        x1: svgElementComputedRect.width, y1: svgElementComputedRect.height / 2,
        x2: svgElementComputedRect.width - 10, y2: svgElementComputedRect.height / 2 + 10
      },
      {
        x1: svgElementComputedRect.width, y1: svgElementComputedRect.height / 2,
        x2: svgElementComputedRect.width - 10, y2: svgElementComputedRect.height / 2 - 10
      }
    ], [svgElementComputedRect]);

  const monthsOfAYear = useMemo(() => [
    "January", "February", "March", "April",
    "May", "June", "July", "August", "September",
    "October", "November", "December"
  ], []);

  return (
    <div className="Philosophy">
      <div className="Notes">
        <label>Philosophy</label>
        <div className="Grid">
          {Props.data.notes.map((note, index) => {
            const dateModified = new Date(note.dateModified);
            const year = dateModified.getFullYear();
            const month = dateModified.getMonth();
            const day = dateModified.getDate();
            return (
              <div
                key={index}
                onClick={() => {
                  setNoteIndex(() => index);
                  setViewNote(() => true);
                }}>
                <label>{index + 1}. {note.title}</label>
                <label>{note.description}</label>
                <label>({monthsOfAYear[month]} {day}, {year})</label>
              </div>)
          })}
        </div>
        <button>sort</button>
        <div className={`Display ${viewNote && "active"}`}>
          <label>{Props.data.notes[noteIndex].title}</label>
          <label>{Props.data.notes[noteIndex].description}</label>
          <button onClick={() => setViewNote(() => false)}>✘</button>
          <button>✏️</button>
          <button>✓</button>
          <button>🗑️</button>
        </div>
      </div>
      <div className="Timeline">
        <label>Timeline View</label>
        <svg ref={dailySVGElement}>
          {lineCoordinates.map((coordinate, index) =>
            <line
              key={index}
              x1={coordinate.x1}
              y1={coordinate.y1}
              x2={coordinate.x2}
              y2={coordinate.y2}
              stroke="white"
              strokeWidth="5px"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {monthsOfAYear.map((month, index) =>
            <text 
              key={index}
              x={svgElementComputedRect.width/13 * (index+1)} 
              y="80" 
              fontSize="5" 
              fill="white"
            >#{month}
            </text>
          )}
          {Props.data.notes.map((note, index) =>
          {
            const dateModified = new Date(note.dateModified);
            const month = dateModified.getMonth();

            return(
              <text 
                key={index}
                x={svgElementComputedRect.width/13 * (month)} 
                y="40" 
                fontSize="5" 
                fill="white"
              >#{index}
              </text>
            )
          })}
        </svg>
      </div>
      <label>Notes to Philosophy</label>
    </div>
  )
}

export default Philosophy;