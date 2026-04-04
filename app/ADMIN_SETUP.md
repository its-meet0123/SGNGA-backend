# Admin Management Guide

This guide explains how to manage admin users in the SGNGA e-commerce system.

## ✅ User Schema Requirements

The User schema already includes a `role` field with two options:
- `user` (default) - Regular user
- `admin` - Administrator with special privileges

## 🔐 Admin Privileges

Admin users can:
- ✅ Create new products
- ✅ Add product images
- ✅ Update product details
- ✅ Update product prices
- ✅ Delete products

Regular users:
- ❌ Cannot create products
- ❌ Cannot add product images
- ❌ Cannot update product prices
- ❌ Cannot delete products

## 📝 How to Set Up Admins

### Option 1: Create a New Admin User (Interactive)

Run the interactive script to create a new admin user:

```bash
node src/utils/createAdmin.js
```

This will prompt you for:
- First Name
- Last Name
- WhatsApp Phone Number
- Password
- Address details (Village, City, State, Zip Code, Country)

**Example:**
```
$ node src/utils/createAdmin.js
Connected to MongoDB

============================================================
CREATE NEW ADMIN USER
============================================================

First Name: John
Last Name: Doe
WhatsApp Phone Number (e.g., +919876543210): +919876543210
Password (min 6 characters): admin123
Village (optional): Sample Village
City (required): New York
State (required): NY
Zip Code (required): 10001
Country (required): USA

============================================================
✅ ADMIN USER CREATED SUCCESSFULLY
============================================================
Name: John Doe
Phone: +919876543210
Role: 👑 ADMIN
Location: New York, NY
============================================================
```

### Option 2: Promote an Existing User to Admin

If a user already exists in the database, promote them to admin:

```bash
node src/utils/setAdmin.js <phone_number>
```

**Example:**
```bash
node src/utils/setAdmin.js +919876543210
node src/utils/setAdmin.js +919876543211
node src/utils/setAdmin.js +919876543212
```

## 📋 View All Users and Their Roles

To see all users in the database and their roles:

```bash
node src/utils/listUsers.js
```

**Output Example:**
```
================================================================================
ALL USERS IN DATABASE
================================================================================

1. John Doe
   Phone: +919876543210
   Role: 👑 ADMIN
   Status: ✅ Active
   Created: 4/4/2026

2. Jane Smith
   Phone: +919876543211
   Role: 👑 ADMIN
   Status: ✅ Active
   Created: 4/4/2026

3. Mike Johnson
   Phone: +919876543212
   Role: 👤 USER
   Status: ✅ Active
   Created: 4/4/2026

================================================================================
Total Users: 3 | Admins: 2 | Regular Users: 1
================================================================================
```

## 🔒 Admin Middleware

The `isAdmin` middleware is used to protect admin-only routes:

- Located at: `src/middleware/isAdmin.js`
- Checks if user is authenticated
- Verifies user role is 'admin'
- Returns 403 Forbidden if user is not admin

## 📡 Protected Admin Routes

### Product Management Routes

#### 1. Create Product (Admin Only)
```
POST /api/products
Headers: Authorization: Bearer <token>
Body: {
  "name": "Product Name",
  "description": "Product Description",
  "price": 100,
  "category": "Electronics",
  "stock": 50
}
```

#### 2. Add Product Images (Admin Only)
```
POST /api/products/:id/images
Headers: Authorization: Bearer <token>
Body: {
  "images": [
    { "url": "image-url-1", "altText": "Product image 1" },
    { "url": "image-url-2", "altText": "Product image 2" }
  ]
}
```

#### 3. Update Product (Admin Only)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
Body: { any product fields to update }
```

#### 4. Update Product Price (Admin Only)
```
PATCH /api/products/:id/price
Headers: Authorization: Bearer <token>
Body: {
  "price": 150
}
```

#### 5. Delete Product (Admin Only)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

## 🧠 Admin User Setup Commands

Quick setup to create 3 admins:

```bash
# Method 1: Interactive creation
node src/utils/createAdmin.js  # Create first admin
node src/utils/createAdmin.js  # Create second admin
node src/utils/createAdmin.js  # Create third admin

# Method 2: Register through API, then promote
# First register users via POST /api/auth/register
# Then promote them using:
node src/utils/setAdmin.js +919876543210
node src/utils/setAdmin.js +919876543211
node src/utils/setAdmin.js +919876543212
```

## 🔄 Change User Role from Admin to User

You can also create a script to demote an admin. Edit the `setAdmin.js` to support both directions:

```bash
# Future enhancement: node src/utils/changeRole.js <phone> <role>
```

## ⚠️ Important Notes

1. **Password Security**: Passwords are hashed with bcryptjs before storing
2. **Phone Unique**: Each user must have a unique WhatsApp phone number
3. **Role Enforcement**: Only admins can access admin routes
4. **Token Required**: All admin routes require a valid JWT token from login

## 🐛 Troubleshooting

### User Not Found
If you get "User not found", ensure:
- The phone number format is correct (e.g., +919876543210)
- The user exists in the database (check with `listUsers.js`)

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Verify the connection string is correct

### Password Validation Failed
- Password must be at least 6 characters
- Check that all required address fields are provided

## 📚 Related Files

- User Schema: `src/models/User.js`
- Admin Middleware: `src/middleware/isAdmin.js`
- Product Routes: `src/routes/productRoutes.js`
- Product Controller: `src/controllers/productController.js`
- Admin Setup Scripts: `src/utils/`
