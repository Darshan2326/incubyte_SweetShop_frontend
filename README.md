### Work Overview

- first i start with the normal coding impliment and testing in local but after that i deploy my frontend into vercel and start working in CICD with vercel.
- in github history you can check evry push and evry comment about the work


### AI Usage Policy (Important)

in frontend i use react and i don't have enough experience in react i am flutter developer with more then 8 month experince so for react i used some AI , the list of open sorce usege are below

- used chatGPT for learn how to attech the APIs in react 
- used https://reactbits.dev/ website for UI components
- once i complete the UI i give it to lmarena.ai AI to convert the into modern UI
- i took the refrenc of https://ant.design/ and https://primereact.org/ website for design 
- for solveing the errors in deployement i take help of qoder AI and copilot AI

- **AI Co-authorship** :- ChatGPT , Lmarena.AI , qoder , copilot.
- **Websites** :- reactbits.dev , ant.design , primereact.org


### what i learn 
- i realy enjoy this assesment and i learn about the react now atleast i am capable to create basic react projec
- i learn Vercel and Render deployement with Github and gain my CICD skill
- i learn the new errors that i didn't heread yet during the deployement  




## Features

### User Roles
- **Regular Users**: Can browse sweets, search by various criteria, and purchase items
- **Administrators**: Have full CRUD (Create, Read, Update, Delete) access to manage the sweet inventory

### Functionality
- **Authentication**: Secure login system with role-based redirection
- **Product Management**: 
  - View all sweets with detailed information (name, category, price, stock quantity)
  - Search/filter sweets by name, category, or price range
  - Admins can add new sweets to the inventory
  - Admins can update existing sweet details (name, category, price)
  - Admins can restock items with specified quantities
  - Admins can delete sweets from the inventory
- **Purchase System**: Users can purchase sweets with quantity selection
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React 19 with Hooks
- **Routing**: React Router DOM v7
- **Build Tool**: Vite 7
- **Styling**: CSS-in-JS with styled components approach
- **State Management**: Built-in React useState and useEffect hooks
- **API Communication**: Native Fetch API

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd sweetshop-frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Environment Variables

The application uses environment variables to configure the API base URL:

- `VITE_API_BASE_URL`: The base URL for API requests

For local development, create a `.env.development` file with:
```
VITE_API_BASE_URL=http://localhost:5173
```

For production deployment, create a `.env.production` file with:
```
VITE_API_BASE_URL=https://incubyte-sweetshop-backend.onrender.com
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
├── components/
│   └── auth.jsx          # Authentication component
├── pages/
│   ├── AdminPage.jsx     # Admin dashboard with full CRUD functionality
│   └── Homepage.jsx      # User-facing page for browsing sweets
├── App.jsx               # Main application component with routing
├── main.jsx              # Application entry point
└── index.css             # Global styles
```

## API Integration

The frontend communicates with a backend API hosted at `https://incubyte-sweetshop-backend.onrender.com` for all data operations including:
- User authentication
- Sweet inventory management
- Purchase operations
- Search functionality

## Authentication Flow

1. Users log in with email and password
2. Upon successful authentication, users are redirected based on their role:
   - Administrators are redirected to `/admin`
   - Regular users are redirected to `/`
3. Authentication tokens are stored in localStorage for persistent sessions
4. All API requests include the authentication token in the Authorization header

## Role-Based Access Control

- Route protection ensures users can only access pages appropriate to their role
- Admin-only actions (add, update, delete, restock) are only available on the admin page
- Regular users have read-only access to browse and purchase sweets

## Deployment

The application is configured to work with Vite's standard deployment process. For deployment to production:

1. Run the build command
2. Deploy the generated `dist/` folder to your hosting provider
3. Ensure environment variables are properly configured for production API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is proprietary and intended for educational purposes.