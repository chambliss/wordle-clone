import React from "react";

import { sample } from "../../utils";
import { WORDS } from "../../data";
import { checkGuess } from "../../game-helpers";
import { NUM_OF_GUESSES_ALLOWED, KEYBOARD_LETTER_ROWS } from "../../constants";

// Pick a random word on every pageload.
const answer = sample(WORDS);
// To make debugging easier, we'll log the solution in the console.
console.info({ answer });

function GuessForm({ guessVal, setGuessVal, handleGuess }) {
  return (
    <form onSubmit={handleGuess} className="guess-input-wrapper">
      <label htmlFor="guess-input">Enter guess:</label>
      <input
        id="guess-input"
        type="text"
        required
        minLength="5"
        maxLength="5"
        placeholder="GUESS"
        name="guess"
        pattern="[a-zA-Z]{5}"
        value={guessVal}
        onChange={(e) => {
          setGuessVal(e.target.value.toUpperCase());
        }}
      />
    </form>
  );
}

function GuessRow({ guessStatus }) {
  return (
    <div className="guess">
      {/* I don't really like this. Would redo with more time. */}
      {Array(5)
        .fill(1)
        .map((_, index) => {
          const { letter, status } = guessStatus[index] || {
            letter: null,
            status: null,
          };
          return (
            <span className={`cell ${status}`} key={`guess-letter-${index}`}>
              {letter}
            </span>
          );
        })}
    </div>
  );
}

function GuessRows({ guessStatuses, nRows }) {
  return (
    <div className="guess-results">
      {/* Array.fill.map seems like a smell. 
    Is there a better way to iterate an arbitary number of times in JSX as an expression? Originally created the rows in the component body w/ a for loop, but creating markup in component body is also a smell. */}
      {Array(nRows)
        .fill(1)
        .map((_, index) => {
          return <GuessRow guessStatus={guessStatuses[index] || {}} />;
        })}
    </div>
  );
}

function Keyboard({ guessStatuses }) {
  // populate data about individual letter statuses
  const letterStatuses = {};
  guessStatuses.forEach((arr) => {
    arr.forEach((obj) => {
      const { letter, status } = obj;
      if (!(letter in letterStatuses)) {
        letterStatuses[letter] = status;
      }
    });
  });

  const letterStylesFromStatus = (status) => {
    const bgColor =
      status === "correct"
        ? "darkgreen"
        : status === "incorrect"
        ? "dimgrey"
        : status === "misplaced"
        ? "darkgoldenrod"
        : "lightgrey";
    const textColor = bgColor === "lightgrey" ? "black" : "white";
    return { backgroundColor: bgColor, color: textColor };
  };

  const rowStyles = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.5rem",
  };
  const letterStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    width: "2rem",
    height: "2rem",
    padding: "2px",
    borderRadius: "4px",
  };

  return (
    <div>
      {KEYBOARD_LETTER_ROWS.map((row) => {
        return (
          <div style={rowStyles}>
            {row.map((letter) => {
              return (
                <div
                  style={{
                    ...letterStyles,
                    ...letterStylesFromStatus(letterStatuses[letter]),
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function GameOverBanner({ winOrLose, nGuesses }) {
  return (
    <div className={`${winOrLose === "win" ? "happy" : "sad"} banner`}>
      <p>
        {winOrLose === "win" ? (
          <>
            <strong>Congratulations!</strong>
            <strong>Got it in {nGuesses} guesses.</strong>
          </>
        ) : (
          <>
            Sorry, the correct answer is <strong>{answer}</strong>.
          </>
        )}
      </p>
    </div>
  );
}

function Game() {
  const [guessInput, setGuessInput] = React.useState("");
  const [allGuesses, setAllGuesses] = React.useState([]);
  const [guessStatuses, setGuessStatuses] = React.useState([]);
  const [guessedCorrect, setGuessedCorrect] = React.useState(false);
  const maxGuesses = NUM_OF_GUESSES_ALLOWED;
  const outOfGuesses = allGuesses.length === maxGuesses;
  const gameOver = guessedCorrect || outOfGuesses;

  const checkCorrectGuess = (guessStatus) => {
    if (
      guessStatus.every((letterEntry) => {
        return letterEntry.status === "correct";
      })
    ) {
      setGuessedCorrect(true);
    }
  };

  const handleGuess = (e) => {
    e.preventDefault();

    if (allGuesses.includes(guessInput)) {
      window.alert("You already guessed that!");
    } else if (allGuesses.length < maxGuesses) {
      setAllGuesses([...allGuesses, guessInput]);
      setGuessInput("");

      // Update letter statuses and see if player won
      const guessStatus = checkGuess(guessInput, answer);
      setGuessStatuses([...guessStatuses, guessStatus]);
      checkCorrectGuess(guessStatus);
    }
  };

  return (
    <>
      <GuessRows guessStatuses={guessStatuses} nRows={maxGuesses} />
      <GuessForm
        handleGuess={handleGuess}
        guessVal={guessInput}
        setGuessVal={setGuessInput}
      />
      {gameOver && (
        <GameOverBanner
          winOrLose={guessedCorrect ? "win" : "lose"}
          nGuesses={allGuesses.length}
        />
      )}
      <Keyboard guessStatuses={guessStatuses} />
    </>
  );
}

export default Game;
