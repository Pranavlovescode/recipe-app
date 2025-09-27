import React, { useState } from 'react';
import './RecipeForm.css'; // We'll create this file

const RecipeForm = ({ addRecipe }) => {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [photo, setPhoto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecipe = { id: Date.now().toString(), name, ingredients, photo };
    addRecipe(newRecipe);
    setName('');
    setIngredients('');
    setPhoto('');
  };

  return (
    <div className="recipe-form-container">
      <h2 className="form-title">Add a New Recipe</h2>
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="recipe-name">Recipe Name</label>
          <input
            id="recipe-name"
            type="text"
            placeholder="Enter recipe name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipe-ingredients">Ingredients</label>
          <textarea
            id="recipe-ingredients"
            placeholder="Enter ingredients (separated by commas)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipe-photo">Photo Filename</label>
          <input
            id="recipe-photo"
            type="text"
            placeholder="Enter image filename (e.g., pasta.jpeg)"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            required
          />
          <small className="form-tip">
            Make sure the image exists in the public/images folder
          </small>
        </div>

        <button type="submit" className="submit-button">Add Recipe</button>
      </form>
    </div>
  );
};

export default RecipeForm;
