import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeModal.css';

const RecipeModal = ({ isOpen, onClose, recipe }) => {
  const [cookingProcess, setCookingProcess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    // Only fetch the cooking process when the modal is open and we have a recipe
    if (isOpen && recipe) {
      setLoading(true);
      setError(null);
      setIsUsingMockData(false);

      axios.get(`http://localhost:5000/recipe-process/${encodeURIComponent(recipe.name)}`)
        .then(response => {
          setCookingProcess(response.data.cookingProcess);
          
          // Check if the response includes a note about using mock data
          if (response.data.note && response.data.note.includes('mock')) {
            setIsUsingMockData(true);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching cooking process:', err);
          setError('Failed to load the cooking process. Please try again later.');
          setLoading(false);
        });
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  // Close the modal when clicking outside the content area
  const handleModalBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleModalBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{recipe.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="recipe-modal-image-container">
            <img 
              src={`images/${recipe.photo}`} 
              alt={recipe.name} 
              className="recipe-modal-image" 
            />
          </div>
          
          <div className="recipe-modal-details">
            <h3>Ingredients</h3>
            <p className="ingredients-list">{recipe.ingredients}</p>
            
            <h3>Cooking Process</h3>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Fetching cooking instructions...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="cooking-process">
                {isUsingMockData && (
                  <div className="mock-data-notice">
                    <p>Using pre-configured cooking instructions. For personalized AI-generated instructions, please ensure the API key is configured correctly.</p>
                  </div>
                )}
                
                {cookingProcess.split('\n').map((step, index) => {
                  if (!step.trim()) return null;
                  
                  if (step.startsWith('Step')) {
                    return (
                      <div key={index} className="cooking-step step-instruction">
                        <span className="step-number">{step.split(':')[0]}</span>
                        <span className="step-text">{step.split(':').slice(1).join(':')}</span>
                      </div>
                    );
                  } else if (step.startsWith('•')) {
                    return (
                      <div key={index} className="cooking-step tip-item">
                        <span className="tip-bullet">•</span>
                        <span className="tip-text">{step.substring(1).trim()}</span>
                      </div>
                    );
                  } else if (step === "Additional Tips:") {
                    return <h4 key={index} className="tips-header">{step}</h4>;
                  } else if (step.includes("Enjoy your delicious")) {
                    return <p key={index} className="cooking-conclusion">{step}</p>;
                  } else {
                    return <p key={index} className="cooking-step">{step}</p>;
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;