import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import { Link, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Favorites from './Favorites';
import './App.css';

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch recipes from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/recipes')
      .then(response => setRecipes(response.data))
      .catch(error => console.error(error));
  }, []);

  const addToFavorites = (recipe) => {
    if (!favorites.find(fav => fav.id === recipe.id)) {
      setFavorites([...favorites, recipe]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(recipe => recipe.id !== id));
  };

  const addRecipe = (newRecipe) => {
    axios.post('http://localhost:5000/recipes', newRecipe)
      .then(response => setRecipes([...recipes, response.data]))
      .catch(error => console.error(error));
  };

  const deleteRecipe = (id) => {
    axios.delete(`http://localhost:5000/recipes/${id}`)
      .then(() => setRecipes(recipes.filter(recipe => recipe.id !== id)))
      .catch(error => console.error(error));
  };

  // Check login status from localStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem('isLoggedIn');
    if (loggedInUser === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">Recipe App</Link>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/favourites" className="nav-link">Favourites</Link>
          {isLoggedIn ? (
            <>
              <Link to="/add-recipe" className="nav-link">Add Recipe</Link>
              <button onClick={handleLogout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Routing */}
      <Routes>
        <Route
          path="/"
          element={
            <RecipeList
              recipes={recipes}
              favorites={favorites}
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              deleteRecipe={deleteRecipe}
            />
          }
        />
        <Route
          path="/favourites"
          element={
            <Favorites 
              favorites={favorites} 
              removeFromFavorites={removeFromFavorites}
            />
          }
        />
        <Route
          path="/login"
          element={<LoginPage handleLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={<SignUpPage />}
        />

        {/* Only allow RecipeForm to render if logged in */}
        <Route
          path="/add-recipe"
          element={isLoggedIn ? (
            <RecipeForm addRecipe={addRecipe} />
          ) : (
            <LoginPage handleLogin={handleLogin} />
          )}
        />
      </Routes>
    </div>
  );
};

export default App;
