import { useState, useEffect} from "react";
import './Header.css';

type HeaderProps = {
  dayCount: number;
  setViewSecretNotes: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSelections: React.Dispatch<React.SetStateAction<boolean>>;
}
function Header(Props: HeaderProps) {
  const [timer, setTimer] = useState<string>(() => "");
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      const date = new Date();
      const minute = date.getMinutes().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      setTimer(() => `${hour}:${minute}`);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='Header_Div'>
      <label>{timer}</label>
      <label>For a whole year</label>
      <label>Day #{Props.dayCount + 1}</label>
      <button
      onClick={() =>{
        Props.setShowSelections(prev => !prev);
        Props.setViewSecretNotes(prev => !prev);
      }}
      >Notes</button>
      <img src="./Logo.jpg" />
  </div>
  );
}

export default Header;