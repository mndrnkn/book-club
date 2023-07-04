"use client";
import styles from "./page.module.css";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import moment from "moment";
import { Members, members } from "@/members";
import _ from "lodash";

type Groups = {
  group1: string[];
  group2: string[];
};



const Home: React.FC = () => {
  const [language, setLanguage] = useState<"en" | "es" | null>(null);
  const [timeDate, setTimeDate] = useState<Date>(new Date());
  const [todaysMembers, setTodaysMembers] = useState<Members>(members);
  const [breakoutGroups, setBreakoutGroups] = useState<Groups | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentSegment, setCurrentSegment] = useState<'greetings' | 'breakout' | 'farewells'>('greetings')
  const [currentSegmentText, setCurrentSegmentText] = useState<string>('')
  const [breakoutSession, setBreakoutSession] = useState<'breakout1' | 'breakout2' | null>(null)

  const text: (english: string, spanish:string) => string = useCallback((english: string , spanish: string) => {
    if(!language) {
      return ''
    }
    if(language === 'en') {
      return english
    }
    return spanish

  }, [language])

  const handleCheckboxChange = (memberName: string, language: string) => {
    setTodaysMembers((prevMembers: Members) => ({
      ...prevMembers,
      [language]: prevMembers[language].includes(memberName)
        ? prevMembers[language].filter((name: string) => name !== memberName)
        : [...prevMembers[language], memberName],
    }));
  };

  useEffect(() => {
    // set language based on time and date
    // even days - start with english, odd with Spanish
    const minutes: number = timeDate.getMinutes();
    const day = timeDate.getDay();
    if (day % 2 === 0 && minutes < 30) {
      setLanguage("en");
    } else {
      setLanguage("es");
    }
  }, [timeDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDate(new Date());
    }, 60000); 

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if(timeDate.getMinutes() >= 55) {
      setCurrentSegment('farewells')
    }
  }, [currentSegment, timeDate])


  useEffect(() => {
    switch (currentSegment) {
      case 'greetings':
        setCurrentSegmentText(text('greetings', 'saludos'))
        break;
      case 'breakout':
        setCurrentSegmentText(text('breakout groups', 'grupos de discusión'))
        break;
      case 'farewells':
        setCurrentSegmentText(text('farewells', 'despedidas'))
        break;
      default:
        setCurrentSegmentText('')
    }
    
  }, [currentSegment, text, setCurrentSegment])

  const createBreakoutGroups = useCallback(() => {
    const { english, spanish } = todaysMembers;
    const totalMembers = english.length + spanish.length;

    if (totalMembers < 6) {
      return [];
    }

    const shuffledSpanish = [...spanish].sort(() => 0.5 - Math.random());
    const shuffledEnglish = [...english].sort(() => 0.5 - Math.random());

    const englishGroups = _.chunk(
      shuffledEnglish,
      Math.ceil(shuffledEnglish.length / 2)
    );
    const spanishGroups = _.chunk(
      shuffledSpanish,
      Math.ceil(shuffledSpanish.length / 2)
    );

    const group1 = [...englishGroups[0], ...spanishGroups[1]];
    const group2 = [...englishGroups[1], ...spanishGroups[0]];
    const groups = {
      group1: _.shuffle(group1),
      group2: _.shuffle(group2),
    };

    setBreakoutGroups(groups);
    setCurrentSegment('breakout');

    switch(breakoutSession) {
      case 'breakout1':
        setBreakoutSession('breakout2')
      default:
        setBreakoutSession('breakout1')
    }
  
  }, [todaysMembers, breakoutSession]);

 

  const reset = useCallback(() => {
    setBreakoutGroups(null)
    setCurrentSegment('greetings')
  }, [setBreakoutGroups])

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const currentTime = new Date();
      const minutes = currentTime.getMinutes();

      if (currentSegment === 'farewells') {
        const remainingMinutes = 60 - minutes - 1; // Subtract 1 for the current minute
        setTimeRemaining(remainingMinutes);
      } else if (currentSegment === 'breakout') {
        if (breakoutSession === 'breakout1' || breakoutSession === 'breakout2') {
          const remainingMinutes = Math.floor((53 - minutes - 1) / 2); // Subtract 1 for the current minute
          setTimeRemaining(remainingMinutes);
        } else {
          setTimeRemaining(0);
        }
      } else {
        setTimeRemaining(0);
      }
    };

    calculateTimeRemaining();

    const timerInterval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000); // Update every second

    return () => {
      clearInterval(timerInterval);
    };
  }, [currentSegment, breakoutSession]);

  return (
    <div className={styles.content}>
      <main className={styles.main}>
        <button onClick={reset}>{text('New session', 'Nueva sesión')}</button>
        <h1>Las Violetas</h1>
        {language && (
          <>
            <h2>{text('Book club', 'Club de lectura')}</h2>
            <div>
              <strong>{text('Currently reading', 'En la lectura actua')}:</strong>{' '}{text('The Paris Apartment', 'Un apartamento en Paris')}
            </div>

            <div className={styles.sessionInfo}>
              <input
                type="datetime-local"
                value={
                  timeDate ? moment(timeDate).format("YYYY-MM-DDTHH:mm") : ""
                }
                onChange={(e) => setTimeDate(moment(e.target.value).toDate())}
              />
              <ul>
              <li>{text('Current language', 'Idioma actual')}{': '}{text('English', 'español')}</li>
              <li>{text('Current segment', 'Segmento en curso')}{': '}{currentSegmentText}</li>
              <li>{text('Time remaining in segment', 'Tiempo restante en el segmento')}{': '}{timeRemaining}</li>
              </ul>
            </div>
            <h3>
              {text('Native English speakers', 'Anglohablantes')}
            </h3>
            {members.english.map((name) => (
              <div key={name}>
                <input
                  type="checkbox"
                  checked={todaysMembers.english.includes(name)}
                  onChange={() => handleCheckboxChange(name, "english")}
                />
                <label>{name}</label>
              </div>
            ))}
            <h3>
                 {text('Native Spanish speakers', 'Hispanohablantes')}
            </h3>
            {members.spanish.map((name) => (
              <div key={name}>
                <input
                  type="checkbox"
                  checked={todaysMembers.spanish.includes(name)}
                  onChange={() => handleCheckboxChange(name, "spanish")}
                />
                <label>{name}</label>
              </div>
            ))}
            <button onClick={createBreakoutGroups}>
            {text('Create breakout groups', 'Crear grupos de discusión')}
            </button>
            {breakoutGroups && (
              <div>
                <h3>{text('Breakout groups', 'Grupos de discusión')}</h3>
                <strong>Group 1:</strong>
                {breakoutGroups.group1.map((member) => (
                  <li key={member}>{member}</li>
                ))}
                <strong>Group 2:</strong>
                {breakoutGroups.group2.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
