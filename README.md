# Sweetshop Frontend

A modern React-based web application for managing and browsing a sweet shop inventory. The application features role-based access control, allowing administrators to manage products while regular users can browse and purchase sweets.

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
   - Regular users are redirected to `/homepage`
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