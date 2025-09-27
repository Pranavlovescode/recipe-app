import React, { useState } from 'react';
import axios from 'axios';
import './RecipeList.css'; // Importing custom CSS for the cards
import RecipeModal from './RecipeModal'; // Import the RecipeModal component

const RecipeList = ({ recipes, addToFavorites, removeFromFavorites, deleteRecipe }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter recipes based on the search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle adding a recipe to the favorites and saving it to the backend
  const handleAddToFavorites = (recipe) => {
    axios.post('http://localhost:5000/favorites', recipe) // Adjust this URL if different
      .then(response => {
        addToFavorites(recipe); // Update local state (if needed)
        alert('Added to Favorites');
      })
      .catch(error => {
        console.error('Error adding to favorites:', error);
        alert('Failed to add to favorites');
      });
  };

  // Function to handle removing a recipe from favorites
  const handleRemoveFromFavorites = (recipeId) => {
    axios.delete(`http://localhost:5000/favorites/${recipeId}`) // Adjust this URL if different
      .then(response => {
        removeFromFavorites(recipeId); // Update local state
        alert('Removed from Favorites');
      })
      .catch(error => {
        console.error('Error removing from favorites:', error);
        alert('Failed to remove from favorites');
      });
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Recipe Cards */}
      <div className="recipe-container">
        {filteredRecipes.map((recipe) => (
          <div className="recipe-card" key={recipe.id} onClick={() => {
            setSelectedRecipe(recipe);
            setIsModalOpen(true);
          }}>
            <img src={`images/${recipe.photo}`} alt={recipe.name} className="recipe-photo" />
            <div className="recipe-info">
              <h2 className="recipe-title">{recipe.name}</h2>
              <p className="recipe-ingredients">{recipe.ingredients}</p>
              <div className="recipe-actions" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => handleAddToFavorites(recipe)}
                  className="btn btn-add"
                >
                  Add to Favorites
                </button>

                <button 
                  onClick={() => handleRemoveFromFavorites(recipe.id)} // Call remove function here
                  className="btn btn-remove"
                >
                  Remove from Favorites
                </button>
                <button onClick={() => deleteRecipe(recipe.id)} className="btn btn-delete">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recipe Details Modal */}
      <RecipeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        recipe={selectedRecipe}
      />
    </div>
  );
};

export default RecipeList;
