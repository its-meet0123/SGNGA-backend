# SGNGA E-Commerce Backend

A Node.js and Express-based e-commerce API backend with MongoDB integration.

## Features

- User authentication and authorization
- Product management
- Shopping cart functionality
- Order management
- Payment integration ready
- JWT token-based authentication
- Input validation and error handling
- Comprehensive logging

## Project Structure

```
src/
├── config/          # Configuration files and database setup
├── controllers/     # Business logic for routes
├── middleware/      # Custom middleware (auth, logger, error handler)
├── models/          # Mongoose schemas (User, Product, Order)
├── routes/          # API endpoint definitions
├── utils/           # Utility functions
└── validators/      # Input validation schemas
public/             # Static files
logs/               # Application logs
```

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd SGNGA-backend/app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs with nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Cart
- `GET /api/cart` - Get user cart (requires auth)
- `POST /api/cart` - Add to cart (requires auth)
- `PUT /api/cart/:itemId` - Update cart item (requires auth)
- `DELETE /api/cart/:itemId` - Remove from cart (requires auth)

### Orders
- `GET /api/orders` - Get user orders (requires auth)
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders/:orderId` - Get order details (requires auth)
- `PUT /api/orders/:orderId` - Update order (requires auth)
- `DELETE /api/orders/:orderId` - Cancel order (requires auth)

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)
- `POST /api/users/change-password` - Change password (requires auth)

## Environment Variables

See `.env.example` for the complete list of required environment variables:
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origins
- And more...

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **cors** - CORS middleware
- **multer** - File upload handling
- **stripe** - Payment processing

## Testing

```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## Code Quality

```bash
npm run lint       # Check code style
npm run lint:fix   # Fix code style issues
```

## Database

This project uses MongoDB. Ensure MongoDB is running before starting the application.

### MongoDB Connection
Update `MONGODB_URI` in `.env` with your MongoDB connection string.

Example:
- Local: `mongodb://localhost:27017/sgnga-ecommerce`
- Atlas: `mongodb+srv://user:password@cluster.mongodb.net/sgnga-ecommerce`

## Error Handling

The application includes comprehensive error handling:
- Validation errors
- MongoDB errors
- JWT authentication errors
- Custom error messages

## Logging

Application logs are stored in the `logs/` directory. Check `logs/app.log` for application activity.

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS protection
- Input validation and sanitization
- Rate limiting ready (use middleware like `express-rate-limit`)

## Next Steps

1. Implement cart management
2. Implement order processing
3. Add payment gateway integration (Stripe)
4. Add email notifications
5. Implement search and filtering
6. Add admin dashboard features
7. Add product reviews and ratings
8. Implement wishlist functionality

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
