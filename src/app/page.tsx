'use client'
import styles from './page.module.css'
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import { Members, members } from '@/members';
import _ from 'lodash';


type Groups = {
  group1: string[]
  group2: string[]
}


const Home: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'es' | null>(null)
  const [timeDate, setTimeDate] = useState<Date>(new Date())
  const [todaysMembers, setTodaysMembers] = useState<Members>(members);
  const [breakoutGroups, setBreakoutGroups] = useState<Groups | null>(null)


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
    if( day % 2 === 0 && minutes < 30 ) {
      setLanguage('en')
    } else {
      setLanguage('es')
    }
  }, [timeDate])

  const createBreakoutGroups = useCallback(() => {
    const { english, spanish } = todaysMembers;
    const totalMembers = english.length + spanish.length;
  
    if (totalMembers < 6) {
      return [];
    }
  
    const shuffledSpanish = [...spanish].sort(() => 0.5 - Math.random());
    const shuffledEnglish = [...english].sort(() => 0.5 - Math.random());
    
    const englishGroups = _.chunk(shuffledEnglish, Math.ceil(shuffledEnglish.length/2)) 
    const spanishGroups = _.chunk(shuffledSpanish, Math.ceil(shuffledSpanish.length/2)) 

    const group1 = [...englishGroups[0], ...spanishGroups[1]]
    const group2 = [...englishGroups[1], ...spanishGroups[0]]
    const groups = {
      group1: _.shuffle(group1),
      group2: _.shuffle(group2)
    }

  setBreakoutGroups(groups)
   
  },[todaysMembers]);





  return (
    <div className={styles.content}>
    <main className={styles.main}>
      <h1>Las Violetas</h1>
      {language && <>
        <h2>{language === 'en' ? 'Book club' : 'Club de lectura'}</h2>
     <div>{language === 'en' ? <><strong>Currently reading: The Paris Apartment</strong></> : <><strong>En la lectura actua: </strong>Un apartamento en Paris</>}</div>
      <input
          type="datetime-local"
          value={timeDate ? moment(timeDate).format("YYYY-MM-DDTHH:mm") : ""}
          onChange={(e) =>
            setTimeDate(moment(e.target.value).toDate())
          }
        />
      <h3>{language === 'en' ? 'Native English speakers' : 'Anglohablantes'}</h3>
      {members.english.map((name) => (
        <div key={name}>
          <input
            type="checkbox"
            checked={todaysMembers.english.includes(name)}
            onChange={() => handleCheckboxChange(name, 'english')}
          />
          <label>{name}</label>
        </div>
      ))}
      <h3>{language === 'en' ? 'Native Spanish speakers' : 'Hispanohablantes'}</h3>
      {members.spanish.map((name) => (
        <div key={name}>
          <input
            type="checkbox"
            checked={todaysMembers.spanish.includes(name)}
            onChange={() => handleCheckboxChange(name, 'spanish')}
          />
          <label>{name}</label>
        </div>
      ))}
      <button onClick={createBreakoutGroups}>
      {language === 'en' ? 'Create breakout groups' : 'Crear grupos de discusión'}
      </button>
      {breakoutGroups && <div>
        <h3>Breakout Groups</h3>
        <strong>Group 1:</strong>
        {breakoutGroups.group1.map((member) => <li key={member}>{member}</li>)}
        <strong>Group 2:</strong>
        {breakoutGroups.group2.map((member) => <li key={member}>{member}</li>)}
        </div>}
      
      
      </>}
    
    </main>
    </div>
  );
};

export default Home;