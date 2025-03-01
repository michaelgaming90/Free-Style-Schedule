import React, { useRef, useState, useEffect, ReactElement, JSX } from "react";
import { Data, Rect } from "../globalEnvironment";
import './Statistics.css';

type StatisticsProps = {
  data: Data;
  dayCount: number;
};

function Statistics(Props: StatisticsProps) {
  const [allowedTasksToCompare, setAllowedTasksToCompare] = useState<{ task: string; scores: number[] }[]>(() => Props.data.statistics.dayTaskScores);
  const [editTaskComparison, setEditTaskComparison] = useState(() => false);
  const [svgElementComputedRect, setSVGElementComputedRect] = useState<Rect>(() => ({ height: 0, width: 0 }));
  const [graphFrequency, setGraphFrequency] = useState(() => "Daily");
  const [currentGraphFrequency, setCurrentGraphFrequency] = useState(() => "Day")
  const dailySVGElement = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setSVGElementComputedRect(prev => {
      if (!dailySVGElement.current) return prev;
      prev.height = Number(dailySVGElement.current.getBoundingClientRect().height - 30);
      prev.width = Number(dailySVGElement.current.getBoundingClientRect().width - 10);
      return { ...prev };
    })
  }, []);

  function renderProgressiveGraph(): ReactElement[] {
    function getDaysInMonth(date: Date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    function subtractDays(date: Date, days: number) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - days);
      return newDate;
    }

    let arrayOfElements: JSX.Element[] = [];
    let multiplier = 1.6;
    let dateNow = new Date();
    let daysCountedForMonths = 0;

    const dateStarted = new Date(Props.data.statistics.dayRegistered);
    const numberOfBars = 8;
    const reverseIndices = [6, 5, 4, 3, 2, 1, 0];
    const weekCount = Math.ceil(Props.dayCount/7);

    for (let i = 0; i < 7; i++) {
      let value = 0;
      let marker = 0;
      switch (graphFrequency) {
        case "Daily":
          value = Props.data.statistics.dayTotalPointsCompleted[Props.dayCount - i - 1];
          marker = Props.dayCount - i + 1;
          break;
        case "Weekly":
          for(let j = 0; j < 7; j++)
          {
            if((reverseIndices[i]+1)*7 + (weekCount - 7)*7 - j + 1 > Props.dayCount) continue; 
            value += Props.data.statistics.dayTotalPointsCompleted[(reverseIndices[i]+1)*7 + (weekCount - 7)*7 - j];
          }
          marker = reverseIndices[i] + weekCount - 7 + 1;
          multiplier = 0.2380952380952381;
          break;
        case "Monthly":
          if(dateNow.getTime() < dateStarted.getTime()) break;
          for(let j = 0; j < getDaysInMonth(dateNow); j++)
          {
            //February (28-1)
            //January (31-1)
            console.log(Props.dayCount - (j + daysCountedForMonths)); 
          }
          console.log("confirm", getDaysInMonth(dateNow)); 
          daysCountedForMonths += getDaysInMonth(dateNow); 
          dateNow = subtractDays(dateNow, getDaysInMonth(dateNow));
          //value = task.monthScores[Math.floor(Props.dayCount / getDaysInMonth(new Date(Props.data.statistics.dayRegistered)))];
          //multiplier = 0.35;
          break;
      }

      arrayOfElements.push(
        <React.Fragment
          key={i}>
          <rect
            x={svgElementComputedRect.width / numberOfBars * reverseIndices[i] + 25 + "px"}
            y={svgElementComputedRect.height - (value * multiplier) + "px"}
            height={value * multiplier}
            width={svgElementComputedRect.width / (numberOfBars + 1)}
            fill='cyan' />
          <text
            x={svgElementComputedRect.width / numberOfBars * reverseIndices[i] + 30 + "px"}
            y={svgElementComputedRect.height + 20}
            fill='white'
          >#{marker}
          </text>
          <text
            x={svgElementComputedRect.width / numberOfBars * reverseIndices[i] + 30 + "px"}
            y={svgElementComputedRect.height - (value * multiplier) - 5 + "px"}
            fill='white'
          >{value}
          </text>
        </React.Fragment>)
    }
    return arrayOfElements;
  }


  function renderMostCompletedTask() {
    const allTaskTotalScores = allowedTasksToCompare.map((task) =>
      task.scores[Props.dayCount]);

    const highestScore = Math.max(...allTaskTotalScores);
    const index = allTaskTotalScores.findIndex((score) => score === highestScore);
    const colors = ['red', 'green', 'blue', 'yellow'];
    return (
      <circle
        cx="0"
        cy="50"
        r="15"
        fill={colors[index]}
      />
    )
  }

  return (
    <div className="Statistics_Div">
      <div className="SlideContainer">
        <div className="BarGraph_Div">
          <label>{currentGraphFrequency} Progress</label>
          <div>
            <select>
              <option>Bar Graph</option>
              <option>Line Graph</option>
            </select>
            <select onChange={e => setCurrentGraphFrequency(() => e.target.value)}>
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
            </select>
          </div>
          <svg ref={dailySVGElement}>
            {Props.data.statistics.dayTaskScores.map((task, index) => {
              function getDaysInMonth(date: Date) {
                return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              }

              const numberOfBars = 4.5;
              let multiplier = 1.6;
              let value = 0;
              switch (currentGraphFrequency) {
                case "Day":
                  value = task.scores[Props.dayCount];
                  break;
                case "Week":
                  value = task.weekScores[Math.floor(Props.dayCount / 7)];
                  break;
                case "Month":
                  value = task.monthScores[Math.floor(Props.dayCount / getDaysInMonth(new Date(Props.data.statistics.dayRegistered)))];
                  multiplier = 0.35;
                  break;
              }

              return (
                <React.Fragment
                  key={index}>
                  <rect
                    x={svgElementComputedRect.width / numberOfBars * index + 25 + "px"}
                    y={svgElementComputedRect.height - (value * multiplier) + "px"}
                    height={value * multiplier}
                    width={svgElementComputedRect.width / (numberOfBars + 1)}
                    fill='cyan' />
                  <text
                    x={svgElementComputedRect.width / numberOfBars * index + ((4 - index + 1) * 7) + "px"}
                    y={svgElementComputedRect.height + 20}
                    fill='white'
                  >{task.task}
                  </text>
                  <text
                    x={svgElementComputedRect.width / numberOfBars * index + 45 + "px"}
                    y={svgElementComputedRect.height - (value * multiplier) - 5 + "px"}
                    fill='white'
                  >{value}
                  </text>
                </React.Fragment>)
            })}

            <line x1="20" y1="10" x2="20" y2={svgElementComputedRect.height + "px"} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="20" y1={svgElementComputedRect.height} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
            <line x1="30" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
            <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height + 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
            <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height - 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
          </svg>
        </div>

        <div className="BarGraph_Div">
          <label>{graphFrequency} Progress</label>
          <div>
            <select>
              <option>Bar Graph</option>
              <option>Line Graph</option>
            </select>
            <select onChange={e => setGraphFrequency(() => e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <svg ref={dailySVGElement}>
            {renderProgressiveGraph()}
            <line x1="20" y1="10" x2="20" y2={svgElementComputedRect.height + "px"} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="20" y1={svgElementComputedRect.height} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
            <line x1="30" y1="20" x2="20" y2="10" stroke="white" strokeWidth="4" />
            <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height + 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
            <line x1={svgElementComputedRect.width - 10} y1={svgElementComputedRect.height - 10} x2={svgElementComputedRect.width} y2={svgElementComputedRect.height} stroke="white" strokeWidth="4" />
          </svg>
        </div>
      </div>

      <div className="TaskComparison_Div">
        <label>Daily Task Comparison</label>
        <button
          onClick={() => setEditTaskComparison(() => !editTaskComparison)}>
          ⚙️
        </button>
        {editTaskComparison &&
          <div className="TaskComparisonConfigurations_Div">
            {Props.data.statistics.dayTaskScores.map((task, index) => {
              return (
                <label key={index}>
                  <input
                    type="checkbox"
                    value={task.task}
                    checked={allowedTasksToCompare.includes(task)}
                    onChange={e =>
                      setAllowedTasksToCompare(prev => {
                        if (e.target.checked)
                          return [...prev, task];
                        return prev.filter((task) => task.task !== e.target.value);
                      })
                    } />
                  {task.task}
                </label>)
            })}
          </div>}
        <svg width="100%" height="150" viewBox="0 0 100 100">
          {allowedTasksToCompare.map((task, index) => {
            const allTaskTotalScores = allowedTasksToCompare.map((task) =>
              task.scores[Props.dayCount]);

            const colors = ['red', 'green', 'blue', 'yellow'];
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const tasktotalScore = allTaskTotalScores[index];
            const allTaskTotalScore = allTaskTotalScores.reduce((prev, curr) => prev + curr, 0);
            const calculation = (tasktotalScore / allTaskTotalScore) * circumference;

            let adjustment = 0;
            for (let i = 0; i < index; i++)
              if (allTaskTotalScore > 0)
                adjustment += allTaskTotalScores[i] / allTaskTotalScore * 360;
            return (
              <React.Fragment
                key={index}>

                <circle
                  key={index}
                  cx="0"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="20"
                  strokeDasharray={`${calculation} ${circumference}`}
                  transform={`rotate(${-90 + adjustment} 0 50)`} />

                <text
                  fontSize="1rem"
                  fontWeight="bold"
                  fill={colors[index]}
                  x="50"
                  y={index * 20 + 20}>
                  • {task.task} - {task.scores[Props.dayCount]}
                </text>
              </React.Fragment>
            )
          })}
          {renderMostCompletedTask()}
        </svg>
      </div>
    </div>
  );
}

export default Statistics;