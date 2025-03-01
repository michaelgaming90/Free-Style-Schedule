import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Data, Rect } from "../globalEnvironment";
import './DashBoard.css';

type DashBoardProps = {
  setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsTaskClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSelections: React.Dispatch<React.SetStateAction<boolean>>;
  data: Data;
  taskIndex: number;
  dayCount: number;
};

function DashBoard(Props: DashBoardProps) {
  const [svgElementComputedRect, setSVGElementComputedRect] = useState<Rect>(() => ({ height: 0, width: 0 }));
  const [buttonEditState, setButtonEditState] = useState<boolean>(() => false);
  const [searchDay, setSearchDay] = useState(() => Props.dayCount);
  const [errorState, setErrorState] = useState(() => false);
  const dailySVGElement = useRef<SVGSVGElement>(null);
  const daySearchInput = useRef<HTMLInputElement>(null);
  const objectiveDivs = useRef<HTMLDivElement[]>([]);
  const sourceImages = useMemo(() => ["Study.png", "Work.png", "Health.png", "Meditation.png"], []);

  useEffect(() => {
    setSVGElementComputedRect(prev => {
      if (!dailySVGElement.current) return prev;
      prev.height = Number(dailySVGElement.current.getBoundingClientRect().height - 30);
      prev.width = Number(dailySVGElement.current.getBoundingClientRect().width - 10);
      return { ...prev };
    })
  }, []);

  return (
    <>
      <div className="Selections_Div">
        <div className='Objectives'>
          {Props.data.timers.map((task, index) =>
            <div
              ref={(el) => {
                if (el) objectiveDivs.current[index] = el;
              }}
              key={index}
              onClick={() => {
                Props.setIsTaskClicked(() => true);
                Props.setTaskIndex(index);
                Props.setShowSelections(() => false);
              }}>
              <img src={sourceImages[index]}></img>
              <label>{task.task}</label>
              <progress value={1 / Props.data.timers[index].taskTimers.length} max="1" />
              <button
                className='EditButtonState'
                onClick={e => {
                  e.stopPropagation();
                  Props.setTaskIndex(index);
                  setButtonEditState(prev => !prev);
                }}
              >...</button>
            </div>
          )}
        {buttonEditState &&
          <div style={{ left: objectiveDivs.current[Props.taskIndex].style.x }} className='EditButtons'>
            <button>Edit</button>
            <button>Settings</button>
          </div>}
        </div>
      </div>
      <div className='DailyBarGraph'>
        <label>Day Progress (Bar Graph)</label>
        <div>
          <input 
            placeholder='Day Search...' 
            type='number' 
            ref={daySearchInput}
            />
          <button
            onClick={() => {
              const inputValue = Number(daySearchInput.current?.value) -1;
              Math.abs(inputValue);
              if(inputValue > Props.dayCount) 
              {
                setErrorState(() => true);
                return;
              }
              setSearchDay(() => inputValue);
              setErrorState(() => false);
            }}
          >Search</button>
        </div>
        <svg ref={dailySVGElement}>
          {Props.data.statistics.dayTaskScores.map((task, index) =>
            <React.Fragment
              key={index}>
              <rect
                x={svgElementComputedRect.width / 5 * index + 25 + "px"}
                y={svgElementComputedRect.height - (task.scores[searchDay] * 1.6) + "px"}
                height={task.scores[searchDay] * 1.6}
                width={svgElementComputedRect.width / 6}
                fill='cyan' />
              <text
                x={svgElementComputedRect.width / 5 * index + 25 + "px"}
                y={svgElementComputedRect.height + 20}
                fill='white'
              >{Props.data.statistics.dayTaskScores[index].task}
              </text>
              <text
                x={svgElementComputedRect.width / 5 * index + 45 + "px"}
                y={svgElementComputedRect.height - (task.scores[searchDay] * 1.6) - 5 + "px"}
                fill='white'
              >{task.scores[searchDay]}
              </text>
            </React.Fragment>)
          }

          <line x1="20" y1="10" x2="20" y2={svgElementComputedRect.height + "px"} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="20" y1={svgElementComputedRect.height} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
          <line x1="30" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
          <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height + 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
          <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height - 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
        </svg>
        {errorState &&
          <label
            className='errorMessage'
          >Day #{daySearchInput.current?.value} hasn't been reach yet</label>}
      </div>
    </>
  );
}

export default DashBoard;