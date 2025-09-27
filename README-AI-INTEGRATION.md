# Recipe App - Google Gemini-Powered Cooking Instructions

This application allows users to view and manage recipes, featuring an AI-powered cooking assistant that provides detailed cooking instructions when clicking on a recipe card. The app uses Google's Gemini AI models to generate personalized cooking instructions for any recipe.

## Setup Instructions

### Google Gemini API Setup

1. Create a Google Cloud account at [cloud.google.com](https://cloud.google.com/) if you don't have one.

2. Generate a Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API key"
   - Copy the generated key (store it safely as you'll need it for the application)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Configure the Gemini API:
   - Rename `.env.example` to `.env` or create a new `.env` file
   - Add your Google Gemini API key to the `.env` file:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     GEMINI_MODEL=gemini-pro
     GEMINI_MAX_TOKENS=8192
     ```
   - Replace `your_gemini_api_key_here` with the API key you generated

4. Start the backend server:
   ```
   npm start
   ```
   The server will run on port 5000.

### Frontend Setup

1. Navigate to the root directory (if you're in the backend directory, use `cd ..`):

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```
   The application will run on port 3000.

## Using the Application

- View all recipes on the homepage
- Click on any recipe card to view detailed cooking instructions powered by AI
- Use the search bar to filter recipes
- Add or remove recipes from favorites
- Delete unwanted recipes

## Google Gemini Integration Details

The application integrates with Google's Gemini AI models to provide detailed cooking instructions for recipes. When a user clicks on a recipe card, the application:

1. Sends the recipe name to the backend server
2. The server makes a request to Google Gemini API with a carefully crafted prompt
3. Gemini generates detailed, step-by-step cooking instructions
4. The response is formatted and displayed in the recipe modal

The system uses a specialized prompt that instructs the AI to:
- Provide numbered steps for the cooking process
- Include preparation and cooking times
- Add helpful tips specific to the recipe
- Format the output in a user-friendly way

### Fallback System

If the Gemini API is unavailable or encounters an error (e.g., rate limits, network issues), the application falls back to pre-configured cooking instructions to ensure users always get a response.

## API Rate Limits and Usage

Google's Gemini API offers generous rate limits:

- Free tier: Up to 60 requests per minute
- Higher quotas available for Google Cloud projects

Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/) to keep track of API calls.

## Advanced Configuration

For advanced customization:

1. Modify the prompt in the `generateGeminiCookingInstructions` function in `server.js` to tailor the instructions
2. Adjust parameters like `temperature` (creativity level) and `maxOutputTokens` (response length) in the API request
3. Add additional features like:
   - Dietary restriction support (e.g., "vegetarian butter chicken")
   - Cooking method variations (e.g., "instant pot biryani")
   - Serving size adjustments
   
4. Use the `gemini-pro-vision` model to analyze recipe images (would require additional frontend changes)