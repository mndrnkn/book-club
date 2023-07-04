"use client";
import styles from "./page.module.css";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import moment from "moment";
import { Members, members } from "@/members";
import useSound from "use-sound";
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
  const [play, { stop }] = useSound("bell.wav");

  const text: (english: string, spanish: string) => string = useCallback(
    (english: string, spanish: string) => {
      if (!language) {
        return "";
      }
      if (language === "en") {
        return english;
      }
      return spanish;
    },
    [language]
  );

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
    }, 1000 * 30);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (timeDate.getMinutes() === 30 || timeDate.getMinutes() === 55) {
      play();
    }
  }, [timeDate, play]);

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
  }, [todaysMembers]);

  const reset = useCallback(() => {
    setBreakoutGroups(null);
    setTodaysMembers(members);
  }, [setBreakoutGroups]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const currentTime = new Date();
      const minutes = currentTime.getMinutes();
      const remaining = 55 - minutes;
      if (remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(null);
        setBreakoutGroups(null);
      }
    };

    calculateTimeRemaining();
    const timerInterval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000 * 60); // Update every minute

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className={styles.content}>
      <main className={styles.main}>
        <h1>Las Violetas</h1>

        <h2>{text("Book club", "Club de lectura")}</h2>
        <div className={styles.currentReading}>
          <strong>{text("Currently reading", "En la lectura actual")}:</strong>{" "}
          {text("The Paris Apartment", "Un apartamento en Paris")}
        </div>

        <div className={styles.dateSetter}>
          <input
            type="datetime-local"
            value={timeDate ? moment(timeDate).format("YYYY-MM-DDTHH:mm") : ""}
            onChange={(e) => setTimeDate(moment(e.target.value).toDate())}
          />
        </div>
        {!breakoutGroups && (
          <div className={styles.session}>
            <div className={styles.members}>
              <div className={styles.memberGroup}>
                <h3>{text("Native English speakers", "Anglohablantes")}</h3>
                <ul>
                  {members.english.map((name) => (
                    <li key={name}>
                      <input
                        type="checkbox"
                        checked={todaysMembers.english.includes(name)}
                        onChange={() => handleCheckboxChange(name, "english")}
                      />
                      <label>{name}</label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.memberGroup}>
                <h3>{text("Native Spanish speakers", "Hispanohablantes")}</h3>
                <ul>
                  {members.spanish.map((name) => (
                    <li key={name}>
                      <input
                        type="checkbox"
                        checked={todaysMembers.spanish.includes(name)}
                        onChange={() => handleCheckboxChange(name, "spanish")}
                      />
                      <label>{name}</label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button onClick={createBreakoutGroups}>
              {text("Create groups", "Crear grupos")}
            </button>
          </div>
        )}

        {breakoutGroups && (
          <>
        <h3>{text("Breakout groups", "Grupos de discusión")}</h3>
          <div className={styles.breakouts}>
            <div className={styles.members}>
              <div className={styles.memberGroup}>
                <h4>Group 1:</h4>
                <ul>
                  {breakoutGroups.group1.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.memberGroup}>
                <h4>Group 2:</h4>
                <ul>
                  {breakoutGroups.group2.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.timer}>
              <label>
              {text(
                "Time remaining in groups",
                "Tiempo restante en grupos"
              )}{": "}</label>
              <div className={styles.counter}>{timeRemaining}</div>
            </div>
            </div>
            
            <button onClick={reset}>
            {text("New session", "Nueva sesión")}
          </button>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
