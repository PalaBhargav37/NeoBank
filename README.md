# 🏦 NeoBank

A modern **Full-Stack Digital Banking Application** built using **Spring Boot** and **Angular**. NeoBank simulates real-world banking operations by providing secure authentication, account management, transactions, loans, budgeting, rewards, notifications, and an admin dashboard.

---

## 📖 Overview

NeoBank is designed to demonstrate a complete banking system with separate customer and administrator functionalities. It follows industry-standard development practices with a layered architecture, RESTful APIs, JWT authentication, and a responsive Angular frontend.

This project showcases:

- Secure authentication using JWT
- Banking operations and transaction management
- Admin management system
- Responsive UI with Angular
- REST API integration
- MySQL database connectivity

---

## ✨ Features

### 👤 Customer Features

- User Registration & Login
- Secure JWT Authentication
- Dashboard Overview
- Account Creation & Management
- Deposit & Withdrawal
- Fund Transfer
- Transaction History
- Bill Payments
- Budget Planning
- Loan Requests
- Rewards & Loyalty Program
- Notifications
- Profile Management

---

### 👨‍💼 Admin Features

- Manage Users
- Manage Accounts
- Monitor Transactions
- Bill & Payment Management
- Loan Approval & Management
- Deposit & Withdrawal Monitoring
- System Dashboard
- Audit Logs

---

# 🛠 Tech Stack

## Backend

- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven
- MySQL

## Frontend

- Angular
- TypeScript
- HTML5
- CSS3
- RxJS
- Angular Routing

---

# 🏗 Architecture

```
Angular Frontend
       │
       ▼
Spring Boot REST APIs
       │
       ▼
Spring Security (JWT)
       │
       ▼
MySQL Database
```

---

# 📂 Project Structure

```
NeoBank/
│
├── Backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── angular.json
│
└── README.md
```

---

# ⚙ Installation

## Prerequisites

Install the following:

- Java 17 or above
- Maven
- Node.js
- npm
- MySQL

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/Bhargav_NeoBank.git

cd Bhargav_NeoBank
```

---

## 2️⃣ Backend Setup

```bash
cd Backend

mvn spring-boot:run
```

### Windows

```bash
cd Backend

mvnw.cmd spring-boot:run
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

ng serve
```

---

## 4️⃣ Database Configuration

Update the following file:

```
Backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/neobank
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

---

# ▶ Running the Application

After starting both backend and frontend:

Frontend

```
http://localhost:4200
```

Backend

```
http://localhost:8080
```

---

# 🔐 Authentication

NeoBank uses **JWT (JSON Web Token)** authentication.

After successful login:

- User receives a JWT Token
- Token is required to access secured APIs
- Spring Security validates every request

---

# 📦 Application Modules

- Authentication Module
- User Module
- Profile Module
- Account Module
- Transaction Module
- Transfer Module
- Deposit Module
- Withdrawal Module
- Bill Payment Module
- Budget Module
- Loan Module
- Rewards Module
- Notification Module
- Admin Module

---

# 🚀 Future Enhancements

- Email Notifications
- SMS Alerts
- OTP Verification
- UPI Payments
- Credit Card Module
- Fixed Deposits
- Investment Dashboard
- Analytics Dashboard
- Multi-language Support
- Mobile Application

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 📜 License

This project is developed for **educational, learning, and portfolio purposes**.

---

# 👨‍💻 Author

**Bhargav Pala**

GitHub:
https://github.com/PalaBhargav37

LinkedIn:
https://www.linkedin.com/in/bhargav-pala/

---

⭐ If you like this project, consider giving it a **Star** on GitHub!
