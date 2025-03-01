import { useEffect, useState } from 'react';
import { Data, gData } from "../globalEnvironment";
import DashBoard from '../DashBoard/DashBoard';
import Task from '../Task/Task';
import Statistics from '../Statistics/Statistics';
import Header from '../Header/Header';
import PhilosophyNotes from '../philosophyNotes/philosophyNotes';
import './App.css';

const localStorageKey = "Personal-Data";

function App() {
  const [viewSecretNotes, setViewSecretNotes] = useState(() => false);
  const [isTaskClicked, setIsTaskClicked] = useState(() => false);
  const [taskIndex, setTaskIndex] = useState(() => 0);
  const [isStatisticsClicked, setIsStatisticsClicked] = useState(() => false);
  const [showSelections, setShowSelections] = useState(() => true);
  const [data, setData] = useState<Data>(() => {
    let localStorageData = localStorage.getItem(localStorageKey);
    return localStorageData ? JSON.parse(localStorageData) : gData;
  });
  const [dayCount, setDayCount] = useState(() => {
    return Math.floor((new Date().getTime() - new Date(data.statistics.dayRegistered).getTime()) / (24 * 60 * 60 * 1000));
  });

  useEffect(() => {
    function getDaysInMonth(date: Date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    function addDays(date: Date, days: number) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }

    setData(prev => {
      const dayCount = Math.floor((new Date().getTime() - new Date(data.statistics.dayRegistered).getTime()) / (24 * 60 * 60 * 1000));
      for (let i = 0; i < dayCount; i++) {
        let total = 0;
        const array = prev.statistics.dayTaskScores.map(task =>
          task.scores[i]);
        total = array.reduce((prev, curr) =>
          prev + curr, 0);

        if (i < prev.statistics.dayTotalPointsCompleted.length)
          prev.statistics.dayTotalPointsCompleted[i] = total;
        else
          prev.statistics.dayTotalPointsCompleted.push(total);
      }

      prev.statistics.dayTaskScores.forEach(task => {
        let dayStart = new Date(prev.statistics.dayRegistered);
        const dayCount = Math.floor((new Date().getTime() - new Date(data.statistics.dayRegistered).getTime()) / (24 * 60 * 60 * 1000));
        const weekCount = Math.floor(dayCount / 7);
        const monthDaysEstimate = Math.floor(dayCount / 28);
        const monthDayCounts = [0];

        for (let i = 0; i < weekCount + 1; i++) {
          let total = 0;
          for (let j = 0; j < 7; j++) {
            if (j + i * 7 >= prev.statistics.dayProgression)
              break;
            total += task.scores[j + i * 7];
          }
          if (weekCount > task.weekScores.length)
            task.weekScores.push(total);
          else
            task.weekScores[i] = total;
        }

        for (let i = 0; i < monthDaysEstimate + 1; i++) {
          const daysOfMonth = getDaysInMonth(dayStart);
          dayStart = addDays(dayStart, daysOfMonth);
          const realTimeDay = Math.floor((new Date().getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000))
          if (realTimeDay > dayCount) break;
          prev.statistics.dayTaskScores.forEach(task => {
            let total = 0;
            for (let j = 0; j < daysOfMonth; j++) {
              const daysPassed = + monthDayCounts.reduce((prev, curr) => prev + curr, 0);
              if (j + daysPassed < dayCount)
                total += task.scores[j + daysPassed];
            }

            if (i > task.monthScores.length)
              task.monthScores.push(total);
            else
              task.monthScores[i] = total;
          })
          monthDayCounts.push(daysOfMonth);
        }
      });
      return { ...prev };
    });

    const secondsInterval = setInterval(() => {
      setData(prev => {
        const dayCount = Math.floor((new Date().getTime() - new Date(data.statistics.dayRegistered).getTime()) / (24 * 60 * 60 * 1000));
        if (dayCount < prev.statistics.dayProgression)
          return prev;

        prev.statistics.dayProgression += 1;
        prev.timers.forEach(timer => {
          for (let i = 0; i < 4; i++) {
            const randomMinute = Math.floor(Math.random() * 30 + 1) * 60;
            timer.taskTimers.push(randomMinute);
            timer.originalTimers.push(randomMinute);
          }
        });

        prev.statistics.dayTaskScores.forEach(task => {
          const prevLenght = task.scores.length;
          for (let i = 0; i < dayCount - prevLenght + 1; i++)
            task.scores.push(0);
        })
        return { ...prev };
      });
    }, 1000);

    const minutesIntervalId = setInterval(() => {
      setDayCount(Math.floor((new Date().getTime() - new Date(data.statistics.dayRegistered).getTime()) / (24 * 60 * 60 * 1000)))
    }, 1000 * 60);

    return () => {
      clearInterval(secondsInterval);
      clearInterval(minutesIntervalId);
    }
  }, []);

  function renderingMenus() {
    if (viewSecretNotes)
      return (
        <PhilosophyNotes
          data={data}
        />)

    if (isStatisticsClicked)
      return <Statistics
        data={data}
        dayCount={dayCount}
      />

    if (isTaskClicked)
      return (
        <Task
          setShowSelections={setShowSelections}
          taskIndex={taskIndex}
          dayCount={dayCount}
          data={data}
          setData={setData}
          setIsTaskClicked={setIsTaskClicked}
        />)
    return (
      <DashBoard
        data={data}
        taskIndex={taskIndex}
        dayCount={dayCount}
        setShowSelections={setShowSelections}
        setTaskIndex={setTaskIndex}
        setIsTaskClicked={setIsTaskClicked}
      />)
  }

  localStorage.setItem(localStorageKey, JSON.stringify(data));

  return (
    <div className='App'>
      <Header
        dayCount={dayCount}
        setShowSelections={setShowSelections}
        setViewSecretNotes={setViewSecretNotes}
      />
      {showSelections &&
        <>
          <label>Objectives</label>
          <div className='Selections'>
            <button
              onClick={() => {
                setIsStatisticsClicked(() => false);
                setIsTaskClicked(() => false);
              }}>DashBoard</button>
            <button
              onClick={() =>
                setIsStatisticsClicked(() => true)}>
              Statistics
            </button>
          </div>
        </>}
      {renderingMenus()}

    </div>
  )
}

export default App