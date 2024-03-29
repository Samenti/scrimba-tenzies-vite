import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useStopwatch } from 'react-timer-hook';
import Confetti from 'react-confetti';
import Die from './components/Die';
import Timer from './components/Timer';

export default function App() {
  const [dice, setDice] = useState(allNewDice());
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [tenzies, setTenzies] = useState(false);
  const [results, setResults] = useState({ rolls: 99999, time: 99999 });
  const [_, setHighScore] = useState(loadHighScore());

  const stopWatch = useStopwatch({ autoStart: false });

  function generateNewDie() {
    return {
      id: nanoid(),
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
    };
  }

  function allNewDice() {
    let array = new Array();
    for (let i = 0; i < 10; i++) {
      array.push(generateNewDie());
    }
    return array;
  }

  function newGame() {
    setDice(allNewDice());
    setTenzies(false);
    setStarted(false);
    stopWatch.reset(null, false);
    setScore(0);
    setResults({ rolls: 99999, time: 99999 });
  }

  function rollDice() {
    if (!started) {
      setStarted(true);
    }
    setScore((prevScore) => prevScore + 1);
    setDice((prevDice) =>
      prevDice.map((die) => {
        return die.isHeld ? die : generateNewDie();
      })
    );
  }

  function holdDie(id) {
    if (!started) {
      setStarted(true);
    }
    setDice((prevDice) =>
      prevDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  function loadHighScore() {
    const storageValues = JSON.parse(window.localStorage.getItem('highscore'));
    if (storageValues) {
      return storageValues;
    } else {
      return results;
    }
  }

  const diceElements = dice.map((obj) => {
    const clickFunc = tenzies ? () => {} : () => holdDie(obj.id);
    return (
      <Die
        key={obj.id}
        face={obj.value}
        isHeld={tenzies ? true : obj.isHeld}
        hold={clickFunc}
      />
    );
  });

  useEffect(() => {
    if (dice.every((die) => die.value === dice[0].value)) {
      stopWatch.pause();
      const time =
        stopWatch.days * 86400 +
        stopWatch.hours * 3600 +
        stopWatch.minutes * 60 +
        stopWatch.seconds;
      setResults({ rolls: score, time: time });
      setTenzies(true);
      setStarted(false);
    }
    if (started && !stopWatch.isRunning) {
      stopWatch.start();
    }
  }, [dice]);

  useEffect(() => {
    setHighScore((prevHighScore) => {
      const newHighScore =
        prevHighScore.time >= results.time
          ? { rolls: results.rolls, time: results.time }
          : { rolls: prevHighScore.rolls, time: prevHighScore.time };
      window.localStorage.setItem('highscore', JSON.stringify(newHighScore));
      document.title = `*Tenzies* Best Time: \
        ${newHighScore.time === 99999 ? '∞' : newHighScore.time} \
        Rolls: ${newHighScore.rolls === 99999 ? '∞' : newHighScore.rolls}`;
      return newHighScore;
    });
  }, [tenzies]);

  return (
    <main className="container">
      {tenzies && (
        <Confetti
          width={window.innerWidth - 2}
          height={window.innerHeight - 2}
        />
      )}
      <h1 className="title-text">Tenzies</h1>
      {started || tenzies ? (
        <p className="instruction-text">
          {`Rolls: ${score}`}
          <Timer secs={stopWatch.seconds} mins={stopWatch.minutes} />
        </p>
      ) : (
        <p className="instruction-text">
          Roll until all dice are the same. Click each die to freeze it at its
          current value between rolls.
        </p>
      )}
      <div className="die-container">{diceElements}</div>
      <button
        className="roll-btn noselect"
        onClick={tenzies ? newGame : rollDice}
      >
        {tenzies ? 'New Game' : 'Roll'}
      </button>
    </main>
  );
}
