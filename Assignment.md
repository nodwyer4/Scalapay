Developer Task


You are developing a backend service for an e-commerce platform using NestJS as the framework and Sequelize as the ORM for MySQL. Your goal is to create a module that manages products in the database.


Requirements:
1. Database Setup:
Assume you have a MySQL database named `ecommerce` with a table named `products`.
The `products` table should have the following columns:
- `id` (auto-increment, primary key)
- `productToken` (unique string)
- `name` (string)
- `price` (decimal)
- `stock` (integer)


2. NestJS and Sequelize Implementation:
Create a NestJS microservice named `products-service` that uses Sequelize to interact with the MySQL database.

Implement the following functionalities within your `Products` module:
● **Create a Product:**
An endpoint that allows adding a new product to the database. The endpoint should
accept product details (name, productToken, price, stock) through the request body.
● **Read Products:**
A pagination-enabled endpoint that retrieves a list of all products from the database.
● **Get Product:**
An endpoint to retrieve the specific product.CommentHighlight
● **Update Product:**
An endpoint to update the stock quantity of a specific product.
● **Delete Product:**
An endpoint to delete a product from the database.

3. Usage Example:
- Provide an example demonstrating how to use the created NestJS module to perform the
mentioned CRUD operations. Include sample requests and responses.
4. Validation and Error Handling:
- Implement validation for incoming requests (e.g., using class-validator).
- Properly handle errors, ensuring meaningful error messages and http codes are returned
to the client.
5. Sequelize Models:
- Define a Sequelize model for the `products` table.
Note:
● Use the `sequelize` package for Sequelize ORM.
● Include necessary NestJS decorators (e.g., `@Controller()`, `@Post()`, `@Get()`,
`@Body()`, etc.).
● Use dependency injection for Sequelize integration in NestJS.
● Pay attention to proper NestJS and Sequelize best practices.
Evaluation Criteria:
● Correct implementation of CRUD operations using NestJS and Sequelize.
● Proper usage of Typescript
● Proper request validation and error handling.
● Effective usage of NestJS decorators and dependency injection.
● Adherence to best practices for NestJS and Sequelize integration.
● Tests
● Documentation
This exercise assesses the candidate's ability to work with NestJS and Sequelize for MySQL database interactions, considering the specific requirements of your project.

If you can get back to me when you think you can close out the task that would be
appreciated