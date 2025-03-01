import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Data, Rect } from "../globalEnvironment";
import './Task.css';

type TaskProps = {
  taskIndex: number;
  dayCount: number;
  data: Data;
  setShowSelections: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  setIsTaskClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

function Task(Props: TaskProps) {
  const [timerIndex, setTimerIndex] = useState(() => 0);
  const [timerState, setTimerState] = useState(() => false);
  const [svgElementComputedRect, setSVGElementComputedRect] = useState<Rect>(() => ({ height: 0, width: 0 }));
  const dailySVGElement = useRef<SVGSVGElement>(null);
  const audioElement = useRef<HTMLAudioElement>(null);
  const sourceImages = useMemo(() => ["Study.png", "Work.png", "Health.png", "Meditation.png"], []);
  

  useEffect(() => {
    setSVGElementComputedRect(prev => {
      if (!dailySVGElement.current) return prev;
      prev.height = Number(dailySVGElement.current.getBoundingClientRect().height - 30);
      prev.width = Number(dailySVGElement.current.getBoundingClientRect().width - 10);
      return { ...prev };
    })
  }, []);

  useEffect(() => {
    if (!timerState) {
      if (Props.data.timers[Props.taskIndex].taskTimers[timerIndex] !== 0) return;
      Props.setData((prev) =>
      ({
        ...prev,
        timers:
          prev.timers.map((task, index) =>
            index === Props.taskIndex ?
              {
                ...task,
                taskTimers: task.taskTimers.filter((_, index) =>
                  index !== timerIndex),
                originalTimers:
                  task.originalTimers.filter((_, index) =>
                    index !== timerIndex)
              } : task),
        statistics: {
          ...prev.statistics,
          dayTaskScores:
            prev.statistics.dayTaskScores.map((task, index) => {
              if (index !== Props.taskIndex)
                return task;
              task.scores[Props.dayCount] += 2;
              return task;
            })
        }
      }));
      audioElement.current?.pause();
      return;
    }

    const intervalId = setInterval(() => {
      Props.setData((prev) =>
      ({
        ...prev,
        timers:
          prev.timers.map((task, index) =>
            index === Props.taskIndex ?
              {
                ...task,
                taskTimers: task.taskTimers.map((timer, index) => {
                  if (index !== timerIndex)
                    return timer;
                  if (timer > 0)
                    return timer - 1;

                  audioElement.current?.play();
                  clearInterval(intervalId);
                  return timer;
                })
              } : task)
      }));
    }, 1000);
    return () =>
      clearInterval(intervalId); // Cleanup on unmount
  }, [timerState]);

  const timerMinutes = (Math.floor(Props.data.timers[Props.taskIndex].taskTimers[timerIndex] / 60) % 60).toString().padStart(2, "0");
  const timerSeconds = (Math.floor(Props.data.timers[Props.taskIndex].taskTimers[timerIndex]) % 60).toString().padStart(2, "0");
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const calculation = Props.data.timers[Props.taskIndex].taskTimers[timerIndex] / Props.data.timers[Props.taskIndex].originalTimers[timerIndex] * circumference;

  return (
    <div className='Task'>
      <div className="Timer_Div">
        <label>{Props.data.timers[Props.taskIndex].task} Clock #{timerIndex + 1}</label>
        <label>{timerMinutes}:{timerSeconds}</label>
        <button
          className='arrowButtons'
          onClick={() =>
            setTimerIndex(prev => {
              prev -= 1;
              if (prev < 0)
                prev = Props.data.timers[Props.taskIndex].originalTimers.length - 1;
              prev %= Props.data.timers[Props.taskIndex].originalTimers.length;
              return prev;
            })}>
          {"<"}
        </button>
        <button
          className='arrowButtons'
          onClick={() =>
            setTimerIndex(prev => {
              prev += 1;
              prev %= Props.data.timers[Props.taskIndex].originalTimers.length;
              return prev;
            })}>
          {">"}
        </button>
        <svg className="circleContainer" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="blue"
            strokeWidth="20"
            strokeDasharray={`${calculation} ${circumference}`}
            transform="rotate(-90 50 50)" />
        </svg>
        <img src={sourceImages[Props.taskIndex]} />
        <button
          className={timerState ? "stop" : "start"}
          onClick={() => setTimerState((prev) => !prev)}>
          {timerState ? "stop" : "start"}
        </button>
        <svg
          onClick={() => {
            Props.setIsTaskClicked(() => false);
            Props.setShowSelections(() => true);
          }}

          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round">
          <line
            x1="10" y1="12"
            x2="20" y2="12"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round" />
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <progress value={1 / Props.data.timers[Props.taskIndex].taskTimers.length} max={1} />
        <audio
          ref={audioElement}
          src="./Alarm.mp3"
          loop={Props.data.timers[Props.taskIndex].taskTimers[timerIndex] === 0}
          autoPlay={Props.data.timers[Props.taskIndex].taskTimers[timerIndex] === 0} />
      </div>
      <div className='BarGraph_Div'>
        <label>Day Task Progress (Bar Graph)</label>
        <svg ref={dailySVGElement}>
          {Props.data.statistics.dayTaskScores[Props.taskIndex].scores.map((score, index) =>
            <React.Fragment
              key={index}>
              <rect
                x={svgElementComputedRect.width / 8 * index + 25 + "px"}
                y={svgElementComputedRect.height - (score * 1.6) + "px"}
                height={score * 1.6}
                width={svgElementComputedRect.width / 8}
                fill='cyan' />
              <text
                x={svgElementComputedRect.width / 8 * index + 35 + "px"}
                y={svgElementComputedRect.height + 20}
                fill='white'
              >#{index + 1}
              </text>
              <text
                x={svgElementComputedRect.width / 8 * index + 35 + "px"}
                y={svgElementComputedRect.height - (score * 1.6) - 5 + "px"}
                fill='white'
              >{score}
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
      </div>
    </div>
  );
}

export default Task;
