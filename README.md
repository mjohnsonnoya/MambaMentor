# Mambda Mentor

This project provides a seamless messeging integration that **elevates your charisma** by providing real-time, conversational suggestions. 

## 1. Running the backend

Steps:

1. Navigate to the root directory
2. Create a virtual environment with `python -m venv env`
3. Activate the virtual environment with `source venv/bin/activate`
4. Download requirements `pip install -r backend/requirements.txt`
5. Create a .env file in `/backend` with an OPENAI_API_KEY variable to enable suggestions functionality
   1. Create or find your OpenAI API Key here: https://platform.openai.com/api-keys
   2. Simply write into the .env file one line: `OPENAI_API_KEY=[YOUR_OPENAI_API_KEY_HERE]
6. Navigate back to the root directory and run `npm run start-backend`

## 2. Running the frontend

In the project directory, you can run:

Steps:

1. Navigate to the root directory
2. Run `npm install`
3. Run `npm start`

This runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

For reference, you can also run:

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
