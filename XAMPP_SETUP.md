# XAMPP Setup Guide for Money Transfer App

## 1. Installation
1. Download XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org)
2. Run the installer with default settings
3. Install to either:
   - Windows: `C:\xampp`
   - Linux: `/opt/lampp`

## 2. Project Setup
1. Copy the entire project folder to:
   - Windows: `C:\xampp\htdocs\money-transfer`
   - Linux: `/opt/lampp/htdocs/money-transfer`

## 3. Database Configuration
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin at [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
4. Create a new database named `money_transfer`
5. Import the SQL schema (will be generated after first run)

## 4. Running the Application
1. Start the Node.js backend:
```bash
cd C:\xampp\htdocs\money-transfer\backend
npm install
npm start
```

2. Access the application:
- Frontend: [http://localhost/money-transfer/frontend](http://localhost/money-transfer/frontend)
- Test Page: [http://localhost/money-transfer/frontend/test-xampp.php](http://localhost/money-transfer/frontend/test-xampp.php)

## 5. Troubleshooting
- **Port conflicts**: Ensure port 3000 is free for Node.js
- **MySQL errors**: Verify root password is empty in `.env` file
- **API connection**: Test proxy at [http://localhost/money-transfer/frontend/api-proxy.php/api/status](http://localhost/money-transfer/frontend/api-proxy.php/api/status)

## 6. First Run
1. The system will automatically create database tables on first startup
2. Register your first admin user through the web interface
3. Employees can then be added via the admin panel