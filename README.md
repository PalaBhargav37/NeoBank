# NeoBank

NeoBank is a modern full-stack digital banking application designed to simulate real-world banking operations. The project combines a powerful Spring Boot backend with a responsive Angular frontend to provide users with a complete online banking experience, including account management, transactions, payments, loans, rewards, notifications, and an administrative dashboard.

## 🌟 Overview

This project was built to showcase a practical banking system with both customer-facing and admin-facing features. It demonstrates how a modern web application can manage secure user authentication, financial operations, and administrative control in a scalable architecture.

## ✨ Key Features

### Customer Features
- User registration and secure login
- Dashboard with account summary
- Account creation and management
- Fund transfer between accounts
- Deposit and withdrawal operations
- Transaction history and tracking
- Bill payments
- Budget planning and monitoring
- Loan requests and management
- Rewards and loyalty features
- Profile management
- Notifications center

### Admin Features
- Manage users
- Manage accounts
- Monitor transactions
- Review bills and payments
- Control loans and deposits
- View withdrawals and system health
- Audit logs and administrative insights

## 🧰 Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.11
- Spring Security
- Spring Data JPA
- MySQL Database
- JWT Authentication
- Maven

### Frontend
- Angular 21
- TypeScript
- RxJS
- HTML/CSS
- Angular Routing

## 🏗️ Architecture

The application follows a layered architecture:

- Frontend: Angular-based client application
- Backend: RESTful APIs built with Spring Boot
- Database: MySQL for persistent storage
- Security: JWT-based authentication and authorization

## 📁 Project Structure


Bhargav_NeoBank/
├── Backend/
│   └── src/main/java/com/neobank
├── frontend/
│   └── src/app
└── README.md

⚙️ Installation and Setup
Prerequisites
Make sure you have the following installed:

Java 17+
Maven
Node.js and npm
MySQL
1. Clone the Repository
git clone https://github.com/your-username/Bhargav_NeoBank.git
cd Bhargav_NeoBank
2. Backend Setup
cd Backend
./mvnw spring-boot:run
For Windows:
cd Backend
mvnw.cmd spring-boot:run

3. Frontend Setup
cd frontend
npm install
npm start

4. Database Configuration
Open the backend configuration file and update your MySQL connection settings:
Backend/src/main/resources/application.properties
Example:
spring.datasource.url=jdbc:mysql://localhost:3306/neobank
spring.datasource.username=root
spring.datasource.password=your_password

▶️ Running the Application
Once both backend and frontend are running:

Frontend: http://localhost:4200
Backend API: http://localhost:8080
🔐 Authentication
The application uses JWT-based authentication for secure access to protected endpoints. Users can log in and receive a token that authorizes them to interact with the system.

📊 Application Modules
Authentication Module
User Profile Module
Account Module
Transaction Module
Payment Module
Budget Module
Loan Module
Rewards Module
Notification Module
Admin Module
🤝 Contributing
Contributions are welcome. If you want to improve the project, please fork the repository and submit a pull request with your changes.

📄 License
This project is intended for educational, learning, and demonstration purposes.

👨‍💻 Author
Bhargav_NeoBank


