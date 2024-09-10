# GameVault

## A web app to manage your game backlog, fetch data from MobyGames, and keep your gaming organized!

GameVault is an interactive web application designed to help gamers organize, manage, and track their game backlogs with ease. 
Integrated with the MobyGames API, GameVault allows you to create a personalized library, search for games, and update their 
statuses, ensuring that you stay on top of your gaming journey.

Features
    * Personalised Game Library: Create an account to build and manage your own game collection.
    * Search and Add Games: Easily search for games and add them to your backlog.
    * Status Updates: Update the status of each game in your library to "Completed," "On Hold", or "Playing."
    * Clean and Simple Interface: Designed with a focus on functionality, GameVault prioritizes your backlog 
    management over unnecessary game details. 

## How to tweak this project for your own uses

1. Clone the repository:
    git clone https://github.com/leeuwinririnui/Gaming-Backlog.git

2. Navigate to root directory.

3. Install dependencies:
    npm install

4. In the root directory of your project, create a .env file.

5. Configure Environment Variables: Add the following lines to your .env file:
    URI=<Your MongoDB URI>
    JWT_SECRET=<Your Secret JWT String>
    MOBY_API=<Your MobyGames API Key>
    ENV=development

6. Run start command:
    npm start

7. Access the app in your browser at http://localhost:8080.

## Acknowledgements

MobyGames API for providing game data.
Open-source libraries and contributors for their invaluable tools. 