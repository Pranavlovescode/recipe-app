import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/favorites')
      .then(response => {
        setFavorites(response.data);
      })
      .catch(error => {
        console.error('Error fetching favorites:', error);
      });
  }, []);

  const removeFromFavorites = (id) => {
    axios.delete(`http://localhost:5000/favorites/${id}`)
      .then(() => {
        setFavorites(favorites.filter(recipe => recipe.id !== id));
      })
      .catch(error => {
        console.error('Error removing from favorites:', error);
      });
  };

  return (
    <div>
      <h1>Favorite Recipes</h1>
      <div className="recipe-container">
        {favorites.map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
            <img src={`images/${recipe.photo}`} alt={recipe.name} className="recipe-photo" />
            <div className="recipe-info">
              <h2 className="recipe-title">{recipe.name}</h2>
              <p className="recipe-ingredients">{recipe.ingredients}</p>
              <button onClick={() => removeFromFavorites(recipe.id)} className="btn btn-remove">
                Remove from Favorites
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
