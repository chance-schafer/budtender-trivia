import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';

function TriviaGame() {
  console.log(">>> TriviaGame component function executing (mounting/re-rendering)");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitError, setScoreSubmitError] = useState(null);
  const sessionResults = useRef([]);
  const { currentUser } = useAuth();

  // Function to submit score
  const submitScoreAndStats = useCallback(async (finalScore, totalQuestions, results) => {
    console.log(">>> submitScore called. currentUser:", currentUser);
    if (!currentUser || !currentUser.accessToken) { console.log(">>> Skipping score submission."); setScoreSubmitError("Log in to save scores."); return; }
    if (totalQuestions <= 0 || !Array.isArray(results) || results.length !== totalQuestions) { console.warn(">>> Invalid data for score submission"); setScoreSubmitError("Internal error."); return; }
    setIsSubmittingScore(true); setScoreSubmitError(null);
    console.log(`>>> Attempting POST /api/scores:`, { score: finalScore, totalQuestions: totalQuestions, results: results });
    try {
      const response = await apiService.post('/scores', { score: finalScore, totalQuestions: totalQuestions, results: results });
      console.log(">>> Score submitted successfully:", response.data);
      // Set success state or clear error after successful submission
      setScoreSubmitError(null); // Clear any previous errors
    } catch (err) {
      console.error(">>> Error submitting score:", err.response?.data || err.message || err);
      const submitError = err.response?.data?.message || err.message || "Failed.";
      setScoreSubmitError(submitError);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [currentUser]);

  // Function to fetch questions
  const fetchQuestions = useCallback(async () => {
    console.log(">>> fetchQuestions CALLED.");
    setQuestions([]); setCurrentQuestionIndex(0); setScore(0); setSelectedAnswer(null); setIsAnswered(false); setShowExplanation(false); setIsLoading(true); setError(null); setScoreSubmitError(null); sessionResults.current = [];
    try {
      console.log(">>> Attempting API call to /trivia/questions");
      const response = await apiService.get('/trivia/questions');
      // *** IMPORTANT: Verify the structure of response.data ***
      // Ensure each question object in response.data.data (or wherever it is)
      // has the question text, options array, AND the correct answer string
      // under a consistent property name (e.g., 'answer').
      const fetchedData = response.data?.data || [];
      console.log(">>> API Response Data:", fetchedData);
      if (fetchedData.length > 0) {
          // Optional: Add a check here to ensure questions have the expected 'answer' property
          // fetchedData.forEach(q => { if (typeof q.answer === 'undefined') console.warn(`Question ID ${q.id} is missing 'answer' property!`); });
          const shuffled = [...fetchedData].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          console.log(">>> Questions state SET with:", shuffled);
      }
      else { setQuestions([]); console.log(">>> Questions state remains empty."); }
    } catch (err) { console.error(">>> Error fetching questions:", err); setError(err.response?.data?.message || err.message || 'Failed.'); setQuestions([]); }
    finally { setIsLoading(false); console.log(">>> fetchQuestions FINALLY block, isLoading: false"); }
  }, []);

  // Effect to fetch questions on mount
  useEffect(() => { console.log(">>> useEffect RUNNING."); fetchQuestions(); }, [fetchQuestions]); // Use fetchQuestions dependency

  // Event Handlers
  const handleAnswerSelect = (option) => {
    console.log(">>> handleAnswerSelect called with option:", option);
    if (isAnswered) { console.log(">>> Already answered."); return; }

    console.log(">>> handleAnswerSelect: Current 'questions' state array:", questions); // Log full state
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) { console.error(`>>> handleAnswerSelect: ERROR - Could not find question at index ${currentQuestionIndex} in state!`); return; }

    // *** FIX POINT 1: Use the correct property name for the answer ***
    // Replace 'answer' with the actual property name from your API response if different
    const correctAnswer = currentQuestion.answer;

    console.log(">>> handleAnswerSelect: Current Question Data derived from state:", currentQuestion);
    console.log(`>>> Comparing Selected: "${option}" (Type: ${typeof option})`);
    console.log(`>>> With Correct Answer from State: "${correctAnswer}" (Type: ${typeof correctAnswer})`); // Use the variable

    // Perform comparison using the retrieved correct answer
    const isCorrect = option === correctAnswer;
    console.log(">>> Comparison Result (isCorrect):", isCorrect);

    // Trimmed comparison (good practice)
    const selectedTrimmed = typeof option === 'string' ? option.trim() : option;
    const correctTrimmed = typeof correctAnswer === 'string' ? correctAnswer.trim() : correctAnswer; // Use the variable
    const isCorrectTrimmed = selectedTrimmed === correctTrimmed;
    console.log(`>>> Comparison Result (Trimmed):`, isCorrectTrimmed);

    setSelectedAnswer(option);
    setIsAnswered(true);
    setShowExplanation(true); // Show explanation immediately after answering

    if (isCorrectTrimmed) { console.log(">>> Incrementing score!"); setScore(prev => prev + 1); }
    else { console.log(">>> Answer incorrect."); }

    sessionResults.current.push({ questionId: currentQuestion.id, isCorrect: isCorrectTrimmed });
    console.log(">>> Recorded result:", sessionResults.current[sessionResults.current.length - 1]);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setSelectedAnswer(null); setIsAnswered(false); setShowExplanation(false);
    if (nextIndex < questions.length) { console.log(">>> handleNextQuestion: Moving to next:", nextIndex); setCurrentQuestionIndex(nextIndex); }
    else { console.log(`>>> handleNextQuestion: Game finished! Score: ${score}/${questions.length}`); submitScoreAndStats(score, questions.length, sessionResults.current); setCurrentQuestionIndex(questions.length); }
  };

   const handleRestartGame = () => { console.log("Restarting game..."); fetchQuestions(); };

  // --- Render Logic ---
  console.log(">>> Rendering State:", { isLoading, error, questionsLength: questions.length, currentQuestionIndex, isGameOver: currentQuestionIndex >= questions.length });
  if (isLoading) { console.log(">>> Rendering: Spinner"); return <Spinner />; }
  if (error) { console.log(">>> Rendering: Error"); return ( <div className="text-center p-4 bg-red-100 text-red-700 rounded-md shadow max-w-xl mx-auto"> <p className="font-semibold">Error:</p> <p>{error}</p> <button onClick={handleRestartGame} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded transition duration-200"> Try Again </button> </div> ); }
  if (!isLoading && questions.length === 0) { console.log(">>> Rendering: No Questions"); return <p className="text-center text-gray-500 dark:text-gray-400 p-5">No trivia questions available.</p>; }

   const isGameOver = currentQuestionIndex >= questions.length;

   // Render Game Over Screen
   if (isGameOver) {
       console.log(">>> Rendering: Game Over");
       const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
       let message = "Good effort!"; if (percentage >= 80) message = "Excellent knowledge!"; else if (percentage >= 60) message = "Well done!";
       return (
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl mx-auto border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400">Trivia Complete!</h2>
            <p className="text-xl mb-2 dark:text-gray-200">Your final score:</p>
            <p className="text-4xl font-bold mb-4 dark:text-gray-100">{score} / {questions.length}</p>
            <p className="text-2xl font-semibold mb-6 text-indigo-600 dark:text-indigo-400">({percentage}%)</p>
            <p className="text-lg mb-6 italic dark:text-gray-300">{message}</p>
            {/* Score Submission Status */}
            {currentUser && (
                 <div className="text-sm my-4 flex items-center justify-center min-h-[20px]">
                    {isSubmittingScore ? (
                        <><Spinner /> <span className="ml-2 text-gray-500 dark:text-gray-400">Submitting score...</span></>
                    ) : scoreSubmitError ? (
                        <span className="text-red-500 dark:text-red-400">Could not save score: {scoreSubmitError}</span>
                    ) : (
                         // Only show success if submission was attempted and no error occurred
                         // Check if isSubmittingScore *was* true but is now false, and no error
                         // A simple way is just checking if scoreSubmitError is null after potential submission
                         scoreSubmitError === null && <span className="text-green-600 dark:text-green-400">Score submitted!</span>
                    )}
                </div>
            )}
            {!currentUser && ( <p className="text-sm text-gray-500 dark:text-gray-400 my-4">Log in or register to save your score!</p> )}
            <button onClick={handleRestartGame} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 text-lg mt-4">Play Again?</button>
        </div>
       );
   }

  // Get current question object
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) { console.log(`>>> Rendering: Spinner (waiting for currentQuestion)`); return <Spinner />; }

  // *** FIX POINT 2: Use the correct property name for the answer ***
  // Replace 'answer' with the actual property name from your API response if different
  const correctAnswer = currentQuestion.answer;
  const correctTrimmedAnswer = typeof correctAnswer === 'string' ? correctAnswer.trim() : correctAnswer;

  // Render Active Question UI
  console.log(">>> Rendering: Active Question UI (ID:", currentQuestion.id, ")");
  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto font-inter border border-gray-200 dark:border-gray-700 w-full">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2">
        <div className="order-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full mr-1">{currentQuestion?.category || 'General'}</span>
            {currentQuestion?.sub_category && (<span className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{currentQuestion.sub_category}</span>)}
        </div>
        <span className="text-lg font-bold text-gray-700 dark:text-gray-300 order-3 sm:order-2 w-full sm:w-auto text-center sm:text-left"> Question {currentQuestionIndex + 1} / {questions.length} </span>
        <span className="text-lg font-bold text-green-600 dark:text-green-400 order-2 sm:order-3"> Score: {score} </span>
      </div>
      {/* Question */}
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 whitespace-pre-line"> {currentQuestion?.question || '...'} </h2>
      {/* Options */}
      <div className="space-y-3 mb-6">
        {Array.isArray(currentQuestion?.options) ? (
          currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full text-left p-3 border rounded-lg transition duration-150 ease-in-out text-gray-700 dark:text-gray-200 ";
            if (isAnswered) {
              buttonClass += 'cursor-not-allowed ';
              // Use trimmed comparison for styling as well
              const optionTrimmed = typeof option === 'string' ? option.trim() : option;
              const selectedTrimmed = typeof selectedAnswer === 'string' ? selectedAnswer.trim() : selectedAnswer;

              // *** FIX POINT 3: Use the correct property name for the answer ***
              const isCorrectOption = optionTrimmed === correctTrimmedAnswer;
              const isSelectedOption = optionTrimmed === selectedTrimmed;

              if (isCorrectOption) buttonClass += "bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600 text-green-800 dark:text-green-100 font-semibold ring-2 ring-green-300";
              else if (isSelectedOption) buttonClass += "bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-600 text-red-800 dark:text-red-100"; // Incorrect selection
              else buttonClass += "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-70"; // Other incorrect options
            } else { buttonClass += "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"; }
            return ( <button key={`${currentQuestion.id}-option-${index}`} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={buttonClass} aria-pressed={selectedAnswer === option}> {option} </button> );
          })
        ) : ( <p className="text-red-500 dark:text-red-400">Error: Options missing.</p> )}
      </div>
      {/* Explanation */}
      {isAnswered && showExplanation && (
        // *** FIX POINT 4: Use the correct property name for the answer ***
        <div className={`p-4 rounded-lg mb-6 text-sm ${(typeof selectedAnswer === 'string' ? selectedAnswer.trim() : selectedAnswer) === correctTrimmedAnswer ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'}`}>
          <h3 className="font-bold text-lg mb-2 dark:text-gray-100">{(typeof selectedAnswer === 'string' ? selectedAnswer.trim() : selectedAnswer) === correctTrimmedAnswer ? 'Correct!' : 'Incorrect'}</h3>
          {/* Display correct answer if incorrect */}
          {(typeof selectedAnswer === 'string' ? selectedAnswer.trim() : selectedAnswer) !== correctTrimmedAnswer && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">Correct Answer: <span className="font-semibold">{correctAnswer}</span></p>
          )}
          <p className="text-gray-700 dark:text-gray-300">{currentQuestion?.explanation || 'No explanation provided.'}</p>
        </div>
      )}
      {/* Next Button */}
      {isAnswered && ( <div className="text-center mt-6"> <button onClick={handleNextQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-8 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Trivia'} </button> </div> )}
      {/* Restart Button */}
      <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"> <button onClick={handleRestartGame} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline"> Restart Game </button> </div>
    </div>
  );
}
export default TriviaGame;
