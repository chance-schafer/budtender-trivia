import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';

const GAME_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  EMPTY: 'empty',
  ERROR: 'error',
  FINISHED: 'finished',
};

const createSubmissionState = () => ({ isSubmitting: false, error: null, success: false });

const normaliseAnswer = (value) => (typeof value === 'string' ? value.trim() : value);

function TriviaGame() {
  const { currentUser } = useAuth();

  const [gameState, setGameState] = useState(GAME_STATES.LOADING);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [submissionState, setSubmissionState] = useState(() => createSubmissionState());

  const resultsRef = useRef([]);

  const totalQuestions = questions.length;
  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);
  const hasAnswered = selectedAnswer !== null;

  const resetGameState = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setFetchError(null);
    setSubmissionState(createSubmissionState());
    resultsRef.current = [];
  }, []);

  const loadQuestions = useCallback(async () => {
    resetGameState();
    setGameState(GAME_STATES.LOADING);

    try {
      const response = await apiService.get('/trivia/questions');
      const fetchedQuestions = Array.isArray(response.data?.data) ? response.data.data : [];

      if (fetchedQuestions.length === 0) {
        setFetchError(response.data?.message || 'No trivia questions available.');
        setGameState(GAME_STATES.EMPTY);
        return;
      }

      const sanitisedQuestions = fetchedQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        options: Array.isArray(question.options) ? question.options : [],
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        category: question.category,
        subCategory: question.sub_category,
      }));

      setQuestions(sanitisedQuestions);
      setGameState(GAME_STATES.READY);
    } catch (error) {
      setFetchError(error.response?.data?.message || error.message || 'Failed to fetch questions.');
      setGameState(GAME_STATES.ERROR);
    }
  }, [resetGameState]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = useCallback(
    (option) => {
      if (!currentQuestion || hasAnswered) {
        return;
      }

      const isCorrect = normaliseAnswer(option) === normaliseAnswer(currentQuestion.correctAnswer);

      setSelectedAnswer(option);
      setShowExplanation(true);
      if (isCorrect) {
        setScore((previous) => previous + 1);
      }

      const questionId = Number(currentQuestion.id);
      if (Number.isInteger(questionId)) {
        resultsRef.current.push({ questionId, isCorrect });
      } else {
        console.warn('Question missing numeric identifier. Skipping result submission for this question.', currentQuestion);
      }
    },
    [currentQuestion, hasAnswered]
  );

  const finaliseGame = useCallback(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameState(GAME_STATES.FINISHED);

    const sanitizedResults = resultsRef.current
      .map((result) => ({
        questionId: Number(result.questionId),
        isCorrect: Boolean(result.isCorrect),
      }))
      .filter((result) => Number.isInteger(result.questionId));

    resultsRef.current = sanitizedResults;

    const computedScore = sanitizedResults.filter((result) => result.isCorrect).length;
    setScore(computedScore);

    if (sanitizedResults.length !== totalQuestions) {
      setSubmissionState({
        isSubmitting: false,
        error: 'Unable to save score because some questions were missing identifiers.',
        success: false,
      });
      return;
    }

    if (!currentUser?.accessToken) {
      return;
    }

    setSubmissionState({ isSubmitting: true, error: null, success: false });

    (async () => {
      try {
        await apiService.post('/scores', {
          score: computedScore,
          totalQuestions: sanitizedResults.length,
          results: sanitizedResults,
        });
        setSubmissionState({ isSubmitting: false, error: null, success: true });
      } catch (error) {
        setSubmissionState({
          isSubmitting: false,
          error: error.response?.data?.message || error.message || 'Failed to save score.',
          success: false,
        });
      }
    })();
  }, [currentUser, totalQuestions]);

  const handleNextQuestion = useCallback(() => {
    if (!hasAnswered) {
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finaliseGame();
    }
  }, [currentIndex, finaliseGame, hasAnswered, totalQuestions]);

  const handleRestart = useCallback(() => {
    loadQuestions();
  }, [loadQuestions]);

  if (gameState === GAME_STATES.LOADING) {
    return <Spinner />;
  }

  if (gameState === GAME_STATES.ERROR || gameState === GAME_STATES.EMPTY) {
    return (
      <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md shadow max-w-xl mx-auto">
        <p className="font-semibold mb-2">{gameState === GAME_STATES.ERROR ? 'Something went wrong' : 'Notice'}</p>
        <p className="mb-4">{fetchError}</p>
        <button
          type="button"
          onClick={handleRestart}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (gameState === GAME_STATES.FINISHED) {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = 'Good effort!';
    if (percentage >= 80) {
      message = 'Excellent knowledge!';
    } else if (percentage >= 60) {
      message = 'Well done!';
    }

    return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl mx-auto border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400">Trivia Complete!</h2>
        <p className="text-xl mb-2 dark:text-gray-200">Your final score:</p>
        <p className="text-4xl font-bold mb-4 dark:text-gray-100">
          {score}
          {' '}/
          {totalQuestions}
        </p>
        <p className="text-2xl font-semibold mb-6 text-indigo-600 dark:text-indigo-400">({percentage}%)</p>
        <p className="text-lg mb-6 italic dark:text-gray-300">{message}</p>

        {currentUser ? (
          <div className="text-sm my-4 flex items-center justify-center min-h-[20px]">
            {submissionState.isSubmitting && (
              <>
                <Spinner size="sm" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">Submitting score...</span>
              </>
            )}
            {!submissionState.isSubmitting && submissionState.error && (
              <span className="text-red-500 dark:text-red-400">Could not save score: {submissionState.error}</span>
            )}
            {!submissionState.isSubmitting && !submissionState.error && submissionState.success && (
              <span className="text-green-600 dark:text-green-400">Score submitted!</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 my-4">Log in or register to save your score!</p>
        )}

        <button
          type="button"
          onClick={handleRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 text-lg mt-4"
        >
          Play Again?
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <Spinner />;
  }

  const correctAnswer = normaliseAnswer(currentQuestion.correctAnswer);
  const selectedAnswerNormalised = normaliseAnswer(selectedAnswer);

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto font-inter border border-gray-200 dark:border-gray-700 w-full">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2">
        <div className="order-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
          <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full mr-1">{currentQuestion.category || 'General'}</span>
          {currentQuestion.subCategory && (
            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{currentQuestion.subCategory}</span>
          )}
        </div>
        <span className="text-lg font-bold text-gray-700 dark:text-gray-300 order-3 sm:order-2 w-full sm:w-auto text-center sm:text-left">
          Question
          {' '}
          {currentIndex + 1}
          {' '}/
          {totalQuestions}
        </span>
        <span className="text-lg font-bold text-green-600 dark:text-green-400 order-2 sm:order-3">Score: {score}</span>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 whitespace-pre-line">
        {currentQuestion.question}
      </h2>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const optionNormalised = normaliseAnswer(option);
          let buttonClass = 'w-full text-left p-3 border rounded-lg transition duration-150 ease-in-out text-gray-700 dark:text-gray-200 ';

          if (hasAnswered) {
            buttonClass += 'cursor-not-allowed ';

            const isCorrectOption = optionNormalised === correctAnswer;
            const isSelectedOption = optionNormalised === selectedAnswerNormalised;

            if (isCorrectOption) {
              buttonClass += 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600 text-green-800 dark:text-green-100 font-semibold ring-2 ring-green-300 ';
            } else if (isSelectedOption) {
              buttonClass += 'bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-600 text-red-800 dark:text-red-100 ';
            } else {
              buttonClass += 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-70 ';
            }
          } else {
            buttonClass += 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ';
          }

          const key = `${currentQuestion.id}-option-${index}`;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
              className={buttonClass}
              aria-pressed={optionNormalised === selectedAnswerNormalised}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasAnswered && showExplanation && (
        <div
          className={`p-4 rounded-lg mb-6 text-sm ${selectedAnswerNormalised === correctAnswer ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'}`}
        >
          <h3 className="font-bold text-lg mb-2 dark:text-gray-100">
            {selectedAnswerNormalised === correctAnswer ? 'Correct!' : 'Incorrect'}
          </h3>
          {selectedAnswerNormalised !== correctAnswer && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer:
              {' '}
              <span className="font-semibold">{currentQuestion.correctAnswer ?? 'Not available'}</span>
            </p>
          )}
          {currentQuestion.explanation && (
            <p className="text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
          )}
          {!currentQuestion.explanation && selectedAnswerNormalised !== correctAnswer && (
            <p className="text-gray-700 dark:text-gray-300 italic">No explanation provided for this question.</p>
          )}
        </div>
      )}

      {hasAnswered && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleNextQuestion}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-8 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Trivia'}
          </button>
        </div>
      )}

      <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={handleRestart}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}

export default TriviaGame;
