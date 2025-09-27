const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Google Gemini API configuration
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS) || 8192;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const recipesFile = './recipes.json';
const favoritesFile = './favorites.json'; // New file for favorites

// Helper function to read recipes from the file
const readRecipes = () => {
    return JSON.parse(fs.readFileSync(recipesFile));
};

// Helper function to write recipes to the file
const writeRecipes = (recipes) => {
    fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2));
};

// Helper function to read favorites from the file
const readFavorites = () => {
    return JSON.parse(fs.readFileSync(favoritesFile));
};

// Helper function to write favorites to the file
const writeFavorites = (favorites) => {
    fs.writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2));
};

// Get all recipes
app.get('/recipes', (req, res) => {
    const recipes = readRecipes();
    res.json(recipes);
});

app.get('/favorites', (req, res) => {
    const filePath = path.join(__dirname, 'favorites.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the JSON file:', err);
        return res.status(500).json({ error: 'Failed to load favorites' });
      }
      try {
        res.json(JSON.parse(data));
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return res.status(500).json({ error: 'Failed to parse favorites data' });
      }
    });
  });

  

// Add a new recipe
app.post('/recipes', (req, res) => {
    const newRecipe = req.body;
    const recipes = readRecipes();
    recipes.push(newRecipe);
    writeRecipes(recipes);
    res.status(201).json(newRecipe);
});

// Delete a recipe
app.delete('/recipes/:id', (req, res) => {
    const recipeId = req.params.id;
    let recipes = readRecipes();
    recipes = recipes.filter(recipe => recipe.id !== recipeId);
    writeRecipes(recipes);
    res.status(204).end();
});

// ---------------- Favorites Logic -------------------

// Get all favorite recipes
app.get('/favorites', (req, res) => {
    const favorites = readFavorites();
    res.json(favorites);
});

// Add a recipe to favorites
app.post('/favorites', (req, res) => {
    const favoriteRecipe = req.body;
    let favorites = readFavorites();
    
    // Avoid duplicate additions
    const alreadyFavorite = favorites.some(recipe => recipe.id === favoriteRecipe.id);
    if (alreadyFavorite) {
        return res.status(400).json({ message: 'Recipe is already in favorites.' });
    }

    favorites.push(favoriteRecipe);
    writeFavorites(favorites);
    res.status(201).json(favoriteRecipe);
});

// Remove a recipe from favorites
app.delete('/favorites/:id', (req, res) => {
    const recipeId = req.params.id;
    let favorites = readFavorites();
    favorites = favorites.filter(recipe => recipe.id !== recipeId);
    writeFavorites(favorites);
    res.status(204).end();
});

/**
 * Helper function to generate cooking instructions using Google Gemini API
 * @param {string} recipeName - The name of the recipe
 * @returns {Promise<string>} - The cooking instructions
 */
async function generateGeminiCookingInstructions(recipeName) {
    try {
        console.log(`Generating cooking instructions for ${recipeName} using Google Gemini API...`);
        
        // Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        
        // Configure the generation parameters
        const generationConfig = {
            maxOutputTokens: DEFAULT_MAX_TOKENS,
            temperature: 0.7,
            topP: 1.0,
        };
        
        // Create the prompt for the recipe instructions
        const prompt = `You are a professional chef and cooking instructor specialized in creating detailed, step-by-step cooking instructions.
        
        Please provide a detailed cooking process for ${recipeName}. 
        Format your response with numbered steps (starting each step with "Step 1:", "Step 2:", etc.).
        Include preparation time, cooking time, and serving suggestions.
        After the steps, include a section called "Additional Tips" with 3-4 bullet points (using • symbol) of helpful advice for this specific recipe.
        End with an encouraging message about enjoying the dish.`;
        
        // Generate the content
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });
        
        const response = result.response;
        const cookingInstructions = response.text();
        
        if (cookingInstructions) {
            return cookingInstructions;
        } else {
            throw new Error('Empty response from Gemini API');
        }
    } catch (error) {
        console.error('Google Gemini API Error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
}

// Recipe Process Endpoint with AI Integration
app.get('/recipe-process/:recipeName', async (req, res) => {
    const { recipeName } = req.params;
    
    try {
        // Check if we have a valid API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.log('Using mock cooking process (no API key provided)');
            
            // Add a small delay to simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockCookingProcess = generateMockCookingProcess(recipeName);
            return res.json({ 
                cookingProcess: mockCookingProcess,
                note: 'Using demonstration data. To get AI-generated instructions, please configure your Google Gemini API key.'
            });
        }
        
        try {
            // Use the Gemini API to generate cooking instructions
            const cookingProcess = await generateGeminiCookingInstructions(recipeName);
            console.log('Successfully generated cooking process from Google Gemini API');
            return res.json({ cookingProcess });
        } catch (apiError) {
            // If the API call fails (rate limit, authentication, etc.), fall back to mock response
            console.warn('Google Gemini API call failed, using mock response instead:', apiError.message);
            
            // Generate a mock response
            const mockCookingProcess = generateMockCookingProcess(recipeName);
            return res.json({ 
                cookingProcess: mockCookingProcess,
                note: 'Generated using mock data due to Google Gemini API limitations. Please ensure your API key is valid and rate limits are not exceeded.'
            });
        }
        
    } catch (error) {
        console.error('Unexpected error in recipe process handler:', error);
        
        // Always fall back to mock data for any errors
        const mockCookingProcess = generateMockCookingProcess(recipeName);
        res.json({ 
            cookingProcess: mockCookingProcess,
            note: 'Generated using fallback data due to an unexpected error.'
        });
    }
});

// Function to generate a mock cooking process for demonstration
function generateMockCookingProcess(recipeName) {
    // Base steps that apply to all recipes
    let steps = [];
    const recipeLower = recipeName.toLowerCase();
    
    // Specific recipe instructions based on recipe name
    if (recipeLower.includes('butter chicken')) {
        steps = [
            `Step 1: Marinate chicken pieces in yogurt, lemon juice, ginger-garlic paste, and spices for at least 1 hour.`,
            `Step 2: In a large pan, heat butter and oil, then add chopped onions and sauté until golden brown.`,
            `Step 3: Add ginger-garlic paste and sauté for 2 minutes until the raw smell disappears.`,
            `Step 4: Add tomato puree, red chili powder, garam masala, and salt. Cook for 5-7 minutes.`,
            `Step 5: Add the marinated chicken and cook on medium heat for 15 minutes, stirring occasionally.`,
            `Step 6: Pour in cream, add kasuri methi (dried fenugreek leaves), and simmer for 5-10 more minutes.`,
            `Step 7: Garnish with fresh coriander leaves and a swirl of cream.`,
            `Step 8: Serve hot with naan, roti, or rice.`
        ];
    } else if (recipeLower.includes('chole bhature')) {
        steps = [
            `Step 1: For the chole (chickpeas), soak chickpeas overnight, then pressure cook with salt until soft.`,
            `Step 2: In a separate pan, heat oil and add cumin seeds, bay leaf, and cinnamon stick.`,
            `Step 3: Add chopped onions and sauté until golden brown, then add ginger-garlic paste.`,
            `Step 4: Add chopped tomatoes, spices (coriander, cumin, turmeric, garam masala), and salt.`,
            `Step 5: Cook until oil separates, then add boiled chickpeas and mash some slightly.`,
            `Step 6: Simmer for 10-15 minutes, then add tamarind paste and garnish with coriander.`,
            `Step 7: For bhature, make a dough with all-purpose flour, yogurt, oil, and let it ferment for 2-3 hours.`,
            `Step 8: Roll out small portions into oval shapes and deep fry until golden and puffy.`,
            `Step 9: Serve hot chole with freshly fried bhature, alongside sliced onions and pickle.`
        ];
    } else if (recipeLower.includes('biryani')) {
        steps = [
            `Step 1: Marinate meat (chicken/mutton) with yogurt, ginger-garlic paste, and spices for 2-4 hours.`,
            `Step 2: Soak basmati rice for 30 minutes, then parboil with whole spices until 70% cooked.`,
            `Step 3: In a heavy-bottomed pan, sauté onions until golden brown and set aside half for garnish.`,
            `Step 4: Add marinated meat to the pan and cook for 5-10 minutes.`,
            `Step 5: Layer partially cooked rice over the meat mixture.`,
            `Step 6: Sprinkle saffron-soaked milk, mint, coriander leaves, and fried onions on top.`,
            `Step 7: Seal the pot with dough or foil and cook on low heat (dum) for 20-25 minutes.`,
            `Step 8: Let it rest for 10 minutes before opening, then gently mix and serve hot.`
        ];
    } else if (recipeLower.includes('paneer') || recipeLower.includes('malai kofta')) {
        steps = [
            `Step 1: For koftas, mash paneer and potatoes, add spices, and form into small balls.`,
            `Step 2: Deep fry the kofta balls until golden brown and set aside.`,
            `Step 3: For the gravy, sauté onions, ginger, and garlic until golden.`,
            `Step 4: Add tomato puree and cook until oil separates from the sides.`,
            `Step 5: Add cashew paste, spices, and cream, then simmer for 5 minutes.`,
            `Step 6: Add water to achieve desired consistency and bring to a gentle boil.`,
            `Step 7: Add kofta balls to the gravy just before serving to keep them crispy.`,
            `Step 8: Garnish with cream and chopped coriander, serve hot with naan or rice.`
        ];
    } else if (recipeLower.includes('pasta')) {
        steps = [
            `Step 1: Bring a large pot of salted water to a boil and cook pasta according to package instructions.`,
            `Step 2: In a separate pan, heat olive oil and sauté minced garlic until fragrant.`,
            `Step 3: Add diced vegetables or protein of your choice and cook until done.`,
            `Step 4: Pour in pasta sauce and simmer for 5-10 minutes.`,
            `Step 5: Season with salt, pepper, and Italian herbs to taste.`,
            `Step 6: Drain the pasta, reserving 1/4 cup of pasta water.`,
            `Step 7: Add pasta to the sauce, along with a splash of pasta water, and toss to coat.`,
            `Step 8: Garnish with grated cheese and fresh herbs before serving.`
        ];
    } else if (recipeLower.includes('masala dosa')) {
        steps = [
            `Step 1: Soak rice and urad dal separately for 4-6 hours, then grind to a smooth batter.`,
            `Step 2: Mix the batters, add salt, and ferment overnight.`,
            `Step 3: For potato filling, boil and mash potatoes, then set aside.`,
            `Step 4: In a pan, sauté mustard seeds, curry leaves, onions, and green chilies.`,
            `Step 5: Add turmeric, mashed potatoes, and salt, then mix well and cook for 2-3 minutes.`,
            `Step 6: Heat a dosa tawa (griddle), spread a ladleful of batter in a circular motion.`,
            `Step 7: Drizzle oil around the edges and cook until the dosa is golden brown.`,
            `Step 8: Place a portion of potato filling in the center, fold the dosa, and serve hot with coconut chutney and sambar.`
        ];
    } else if (recipeLower.includes('gulab jamun') || recipeLower.includes('rasgulla')) {
        steps = [
            `Step 1: For gulab jamun, mix milk powder, flour, and a little ghee to form a soft dough.`,
            `Step 2: Shape small portions into smooth balls, ensuring there are no cracks.`,
            `Step 3: Heat oil or ghee on medium-low and fry the balls until they turn dark golden brown.`,
            `Step 4: Meanwhile, prepare sugar syrup by boiling sugar and water with cardamom and rose water.`,
            `Step 5: Drop the fried balls into warm sugar syrup and let them soak for at least 2 hours.`,
            `Step 6: The gulab jamuns will double in size as they absorb the syrup.`,
            `Step 7: Serve warm or at room temperature, garnished with chopped pistachios.`
        ];
    } else if (recipeLower.includes('pav bhaji')) {
        steps = [
            `Step 1: Boil and mash potatoes, cauliflower, peas, and carrots together.`,
            `Step 2: In a pan, heat butter and add cumin seeds until they splutter.`,
            `Step 3: Add finely chopped onions, ginger-garlic paste, and green chilies. Sauté until golden brown.`,
            `Step 4: Add chopped tomatoes, pav bhaji masala, red chili powder, and salt.`,
            `Step 5: Cook until oil separates, then add the mashed vegetables and mix well.`,
            `Step 6: Add water to adjust consistency and simmer for 15-20 minutes, mashing occasionally.`,
            `Step 7: Toast pav (bread rolls) with butter on a hot griddle until crisp.`,
            `Step 8: Serve hot bhaji topped with butter, chopped onions, coriander, and a lemon wedge alongside buttered pav.`
        ];
    } else {
        // Generic steps for any recipe not specifically handled
        steps = [
            `Step 1: Gather all ingredients for ${recipeName}.`,
            `Step 2: Prepare all ingredients by washing, chopping, and measuring as needed.`,
            `Step 3: Heat your cooking vessel to the appropriate temperature.`,
            `Step 4: Follow the sequence of adding ingredients according to traditional ${recipeName} recipes.`,
            `Step 5: Adjust seasonings and spices to taste, balancing flavors carefully.`,
            `Step 6: Cook for the recommended time, checking for proper doneness.`,
            `Step 7: Let the dish rest if needed to develop flavors.`,
            `Step 8: Plate your dish with appropriate garnishes and side accompaniments.`
        ];
    }
    
    // Add tips based on type of dish
    let tips = [];
    if (recipeLower.includes('chicken') || recipeLower.includes('mutton') || recipeLower.includes('meat')) {
        tips = [
            "• Ensure meat is cooked to the proper internal temperature for food safety.",
            "• Marinate the meat for longer periods for deeper flavor penetration.",
            "• Let meat rest after cooking to retain juices and improve texture."
        ];
    } else if (recipeLower.includes('paneer') || recipeLower.includes('cheese')) {
        tips = [
            "• Add paneer at the end of cooking to prevent it from becoming too tough.",
            "• Soak store-bought paneer in warm water for 10 minutes to soften it before cooking.",
            "• For a richer taste, lightly fry paneer cubes before adding to gravy."
        ];
    } else if (recipeLower.includes('dosa') || recipeLower.includes('idli') || recipeLower.includes('fermented')) {
        tips = [
            "• The fermentation process is crucial - ensure a warm environment for proper fermentation.",
            "• The batter consistency should be flowing but not too thin for perfect dosas.",
            "• Use a well-seasoned iron griddle for the best results."
        ];
    } else if (recipeLower.includes('bhaji') || recipeLower.includes('curry') || recipeLower.includes('gravy')) {
        tips = [
            "• Mash some of the vegetables or legumes to thicken the gravy naturally.",
            "• Add a little butter or cream at the end for richness and glossy appearance.",
            "• Allow the dish to simmer on low heat to develop deeper flavors."
        ];
    } else if (recipeLower.includes('sweet') || recipeLower.includes('dessert') || recipeLower.includes('jamun') || recipeLower.includes('rasgulla')) {
        tips = [
            "• Use the right sugar consistency for syrup - one-string for most Indian desserts.",
            "• Knead the dough well to ensure smooth texture in the final dessert.",
            "• Allow sweets to soak in syrup for adequate time for best taste and texture."
        ];
    } else {
        tips = [
            "• Balance flavors with the right amount of spices, salt, and acidity.",
            "• Freshly ground spices provide better flavor than pre-ground ones.",
            "• Let the dish rest for a few minutes before serving to allow flavors to meld together."
        ];
    }
    
    // Combine steps, tips and conclusion
    return [...steps, "", "Additional Tips:", ...tips, "", `Enjoy your delicious ${recipeName}!`].join('\n');
}

// ------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
