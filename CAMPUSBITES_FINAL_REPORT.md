# REPORT ON MINI PROJECT

## "CAMPUS BITES - COLLEGE CANTEEN PRE-ORDERING SYSTEM"

Submitted in the partial fulfilment for the award of the degree of

### BACHELOR OF ENGINEERING

### IN

### COMPUTER SCIENCE AND ENGINEERING

Submitted by

| Sl No. | Name of the Student | SRN |
|--------|---------------------|-----|
| 01 | AKSHAY N | 24SUUBECS0111 |
| 02 | AKSHAY GUPTHA L | 24SUUBECS0108 |
| 03 | AKSHAY RAVI B D | 24SUUBECS0113 |

Under the supervision of

**NAME OF THE GUIDE:** Deepak P Rao Thodkar

**Designation:** Assistant Professor, Dept. of CSE

**For the Academic year of 2025-26 [Semester: 4]**

---

### DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING

### SCHOOL OF ENGINEERING AND TECHNOLOGY

(An ISO 9001:2015 and 14001: 2015 certified Institution)

14/5, Chikkasandra, Hesaraghatta Main Road, Bengaluru - 560057.

---

## CERTIFICATE

Certified that the MINI PROJECT entitled "CAMPUS BITES - COLLEGE CANTEEN PRE-ORDERING SYSTEM" is carried out by AKSHAY.N (24SUUBECS0111), AKSHAY GUPTHA L (24SUUBECS0108), AKSHAY RAVI B.D (24SUUBECS0113), bona fide students of School of Engineering and Technology in partial fulfilment for the award of Bachelor of Engineering in department of COMPUTER SCIENCE and Engineering of SAPTHAGIRI NPS University, during the academic year 2025-2026.

It is certified that all corrections/suggestions indicated in the Internal Assessment have been incorporated in the report submitted. The mini project report has been approved as it satisfies the academic requirements in respect of mini project prescribed for the Bachelor of Engineering Degree.

**Signature of the Guide**

Deepak P Rao Thodkar

Assistant Professor

**Signature of the Director**

Director

---

## ACKNOWLEDGEMENT

We, the mini project group, express our sincere gratitude to Dr. N.C. Mahendra Babu, Dean, for his continuous support, guidance, and motivation throughout the course of this mini project. We also extend our heartfelt thanks to our Director DR. Shantharam Nayak for providing the required facilities and an encouraging environment that enabled us to carry out this work successfully.

We would like to convey our special thanks to our Project Guide Deepak P Rao Thodkar for the valuable guidance, timely suggestions, and constant supervision, which greatly contributed to the completion of this project.

Finally, we thank all faculty members, classmates, and everyone who directly or indirectly supported us in accomplishing this mini project.

| Sl.No | Name of the Student | SRN | Signature |
|-------|---------------------|-----|-----------|
| 01 | AKSHAY N | 24SUUBECS0111 | |
| 02 | AKSHAY GUPTHA L | 24SUUBECS0108 | |
| 03 | AKSHAY RAVI B D | 24SUUBECS0113 | |

---

## ABSTRACT

The Campus Bites system is a full-stack web-based application developed to streamline college canteen operations by enabling students, lecturers, and staff to pre-order food and eliminate long queues. The system aims to simplify the process of menu browsing, order placement, payment processing, order tracking, kitchen management, and delivery coordination within educational institutions.

The application is developed using modern technologies such as HTML, CSS, JavaScript, React.js, Node.js, Express.js, and MongoDB. It demonstrates the practical implementation of Database Management System concepts including document relationships, embedded schemas, CRUD operations, and secure data management.

The system supports five distinct user roles: Students, Admin, Kitchen Staff, Lecturers, and Delivery Personnel. Students can browse a categorized menu, place pre-orders with scheduled pickup times, pay via Razorpay payment gateway, and track their order in real-time. Lecturers get food delivered directly to their campus cabins. Kitchen staff manage order preparation via a live dashboard. Delivery personnel handle cabin deliveries for lecturers.

The project focuses on improving canteen efficiency, reducing wait times, enhancing user experience, and ensuring timely food delivery. It provides practical exposure to database management, real-time systems, payment integration, and full-stack web application development.

This project helps in understanding real-world food ordering systems and enhances technical skills in software development, database design, API development, and system integration.

---

## CONTENTS

| Chapter No. | Description | Page No. |
|-------------|-------------|----------|
| 1 | Introduction | 2 |
| 2 | Literature Review / Background Study | 3 |
| 3 | Problem Definition, Objectives and Methodology | 5 |
| 4 | Data Design | 7 |
| 5 | Work Carried Out | 10 |
| 6 | Results and Discussion | 14 |
| 7 | Conclusions and Scope for Future Work | 16 |
| 8 | References | 18 |
| 9 | Appendix / Annexure (if any) | 19 |

---

## LIST OF FIGURES

| Figure No. | Description | Page No. |
|------------|-------------|----------|
| 1.1 | ER Diagram | 8 |
| 6.1 | Output Screenshot - Student Dashboard | 14 |
| 6.2 | Output Screenshot - Menu & Cart | 15 |
| 6.3 | Output Screenshot - Kitchen View | 15 |

---

## LIST OF TABLES

| Table No. | Description | Page No. |
|-----------|-------------|----------|
| 4.2.1 | User Collection | 8 |
| 4.2.2 | Product Collection | 9 |
| 4.2.3 | Order Collection | 9 |

---

## 1. INTRODUCTION

The Campus Bites system is a full-stack web-based application developed to manage college canteen pre-ordering efficiently in educational institutions. The primary objective of the system is to eliminate long queues, streamline food ordering, and improve the overall canteen experience for students, lecturers, and staff.

In educational institutions, managing canteen operations is a challenging task. Traditional methods of food ordering involve long waiting hours, manual order tracking, and inefficient kitchen management. These challenges can lead to student dissatisfaction, food wastage, delayed service, and increased operational costs.

The Campus Bites system provides a centralized platform for browsing menus, placing pre-orders, processing payments, tracking orders in real-time, and managing kitchen operations. The system enables students to select food items, schedule pickup times, make digital payments, and receive order status notifications. It also supports cabin delivery for lecturers, ensuring convenient food service.

The application follows a client-server architecture where the frontend is built using React.js with a modern glassmorphism UI design, and the backend is developed using Node.js with Express.js. MongoDB is used as the database to securely store all relevant information including user profiles, product catalogs, and order records. The system integrates Razorpay for payment processing and WhatsApp for order notifications.

The main objective of developing this system is to improve canteen efficiency, reduce wait times, enhance user experience, ensure timely food delivery, and provide real-time order tracking. The project also helps students understand concepts such as database management, full-stack web development, payment gateway integration, real-time systems, and role-based access control.

Overall, the Campus Bites system serves as an effective solution for college canteen management and provides practical experience in developing real-world food ordering applications using modern software technologies.

---

## 2. LITERATURE REVIEW / BACKGROUND STUDY

### 2.1 Overview of Canteen Management Systems

Canteen Management refers to the process of planning, organizing, and controlling food service operations within educational institutions. Effective management ensures that students and staff always have access to quality food with minimal wait times.

With the increasing demand for convenient food services in colleges, proper canteen management has become essential to reduce queues, improve service speed, and enhance customer satisfaction.

### 2.2 Evolution of Food Ordering Systems

Traditionally, college canteens managed orders using manual billing and token systems. These methods were time-consuming, prone to errors, and difficult to maintain during peak hours.

With advancements in information technology, food service organizations adopted digital ordering systems that provide online menu browsing, pre-ordering capabilities, digital payments, real-time order tracking, and automated kitchen management. Modern systems use web technologies and databases to manage orders efficiently.

### 2.3 Importance of Canteen Pre-Ordering Systems

Food services play a critical role in educational institutions. An effective pre-ordering system helps organizations reduce wait times, minimize food wastage, improve resource utilization, and enhance student satisfaction.

Benefits include:
- Reduced queue wait times
- Improved order accuracy
- Better inventory management
- Faster service delivery
- Enhanced customer satisfaction
- Reduced food wastage
- Digital payment convenience

### 2.4 Technologies Used in Canteen Management Systems

Modern canteen management systems utilize various technologies to ensure efficiency and reliability.

**Frontend Technologies:**
- HTML5
- CSS3 (Glassmorphism Design)
- JavaScript (ES6+)
- React.js

**Backend Technologies:**
- Node.js
- Express.js

**Database Technologies:**
- MongoDB (NoSQL)
- Mongoose ODM

**Payment Integration:**
- Razorpay Payment Gateway

**Notification Systems:**
- WhatsApp (OpenWA API)
- Email (Nodemailer)

### 2.5 Features of Canteen Management Systems

A typical Canteen Management System includes:
- User Authentication and Role-Based Access
- Menu Management
- Pre-Ordering System
- Payment Processing
- Order Tracking
- Kitchen Management Dashboard
- Delivery Management
- Notification System
- Analytics and Reports

### 2.6 Security Considerations

Since user data and payment information are sensitive, security is a major concern.

Common security measures include:
- JWT-Based Authentication
- Password Encryption (bcrypt)
- Role-Based Access Control
- HTTPS Communication
- Rate Limiting
- CORS Protection
- Input Validation
- Helmet Security Headers

### 2.7 Challenges in Canteen Management

Educational institutions face several canteen-related challenges:
- Long queues during peak hours
- Manual order errors
- Delayed food preparation
- Cash-only payment limitations
- Lack of order tracking
- Food wastage
- Inefficient inventory management

Modern management systems help overcome these challenges through automation, digital payments, and real-time monitoring.

### 2.8 Relevance of the Campus Bites Project

The Campus Bites project provides practical experience in full-stack web development and database management. It helps students understand database design, API development, payment integration, real-time systems, and user interface design.

The project demonstrates how different components such as databases, user interfaces, payment gateways, kitchen management modules, and notification systems work together to create an efficient food ordering solution.

---

## 3. PROBLEM DEFINITION, OBJECTIVES AND METHODOLOGY

### 3.1 Problem Statement

Educational institutions such as colleges and universities depend on canteen services to provide meals and refreshments to students and staff. Managing canteen orders manually is often difficult, time-consuming, and prone to errors. Inadequate order management can lead to long queues, delayed service, order inaccuracies, and increased operational costs.

Many college canteens still rely on traditional methods for taking orders, making it challenging to maintain accurate records and manage kitchen operations efficiently. Delays in food preparation and delivery can directly affect student satisfaction and academic schedules.

Therefore, there is a need for an automated Canteen Pre-Ordering System that can efficiently manage menu browsing, order placement, payment processing, kitchen coordination, and delivery management.

**Problems Identified:**
- Long waiting queues during peak hours
- Manual order taking is time-consuming and error-prone
- Difficulty in tracking order status in real time
- Cash-only payment limitations
- No system for scheduled pickup times
- Lack of kitchen management dashboard
- No delivery system for lecturers
- Inefficient inventory and food wastage management
- No notification system for order updates

### 3.2 Objectives of the Project

The main objectives of the Campus Bites system are:
- To automate the canteen pre-ordering process
- To provide a user-friendly menu browsing interface
- To enable scheduled pickup time selection
- To integrate digital payment processing via Razorpay
- To provide real-time order tracking
- To develop a kitchen management dashboard
- To support role-based access for different users
- To implement WhatsApp notifications for order updates
- To reduce wait times and improve canteen efficiency
- To support cabin delivery for lecturers

### 3.3 Proposed Methodology

The Campus Bites system follows a systematic approach to manage canteen operations efficiently.

**User Authentication Module:**
- Secure login and access control for five user roles
- JWT-based token authentication
- Google OAuth 2.0 integration
- OTP-based password reset via email

**Menu Management Module:**
- Categorized menu display (Snacks, Meals, Beverages, Combos, Desserts)
- Veg/Non-Veg identification badges
- Product availability toggle
- Admin CRUD operations for menu items

**Pre-Ordering Module:**
- Add items to cart with quantity management
- Interactive analog clock UI for pickup time selection
- Quick-select time slots for convenience
- Shopping cart persistence in localStorage

**Payment Processing Module:**
- Razorpay payment gateway integration
- Order creation and payment verification
- HMAC signature validation
- Payment status tracking

**Order Tracking Module:**
- Real-time order status updates (Pending, Preparing, Ready, Completed)
- Visual progress bar for order tracking
- Order history with reorder functionality

**Kitchen Management Module:**
- Live order queue with auto-polling every 10 seconds
- Order tickets with customer and item details
- Status management (Accept, Mark Ready, Handover)
- Filter by order status

**Delivery Management Module:**
- Dedicated delivery portal for delivery personnel
- Cabin delivery system for lecturers
- Order filtering by status
- WhatsApp notification on delivery completion

**Notification Module:**
- WhatsApp messages for order placed, status updates, delivery confirmation
- Email notifications for OTP and password reset

**System Workflow:**
1. User registers/logs into the system
2. Student browses menu and adds items to cart
3. Student selects pickup time
4. Student makes payment via Razorpay
5. Order is placed and kitchen receives notification
6. Kitchen staff accepts and prepares the order
7. Order status is updated in real-time
8. Student picks up or delivery personnel delivers to cabin
9. WhatsApp notification sent on completion

**Benefits of the Proposed Solution:**

*For Students:*
- No waiting in queues
- Scheduled pickup times
- Digital payment convenience
- Real-time order tracking
- Order history and reorder facility

*For Kitchen Staff:*
- Clear order queue management
- Real-time order updates
- Reduced manual errors
- Better workflow organization

*For Lecturers:*
- Cabin delivery service
- No need to visit canteen
- Scheduled food delivery

*For Admin:*
- Complete menu management
- Order analytics
- User management
- Inventory visibility

---

## 4. DATA DESIGN

### 4.1 Database Design

Database design is one of the most important components of the Campus Bites system. It is responsible for storing, managing, and retrieving information related to users, products, and orders. A well-designed database ensures data consistency, security, scalability, and efficient system performance.

The database is designed using a NoSQL document model (MongoDB) where data is stored in collections of documents. Relationships between collections are established using references (foreign key equivalents in MongoDB).

#### 4.1.1 Objectives of Database Design
- Store user information securely
- Manage product catalog efficiently
- Track orders and payment status
- Maintain order history
- Support real-time order updates
- Enable fast data retrieval
- Ensure data integrity and consistency

### 4.2 Database Collections

The main collections used in the Campus Bites system are:
- Users
- Products
- Orders

#### 4.2.1 User Collection

Stores user and administrator information.

| Field Name | Data Type | Description |
|------------|-----------|-------------|
| _id | ObjectId (PK) | Unique User ID (Auto-generated) |
| name | String (Required) | User Name |
| email | String (Required, Unique) | Email Address |
| password | String (Required) | Encrypted Password (bcrypt) |
| role | String (Enum) | User Role (student/admin/staff/lecturer/delivery) |
| cabinNumber | String | Cabin Number (for Lecturers) |
| department | String | Department (for Lecturers) |
| phone | String | Contact Number |
| isVerified | Boolean | Email Verification Status |
| otp | String | Email Verification OTP |
| otpExpires | Date | OTP Expiration Time |
| resetPasswordOtp | String | Password Reset OTP |
| resetPasswordExpires | Date | Password Reset Expiration |
| createdAt | Date | Account Creation Timestamp |
| updatedAt | Date | Last Update Timestamp |

**Primary Key:** _id

**Role Enum Values:** student, admin, staff, lecturer, delivery

#### 4.2.2 Product Collection

Stores information about food items and menu products.

| Field Name | Data Type | Description |
|------------|-----------|-------------|
| _id | ObjectId (PK) | Unique Product ID (Auto-generated) |
| name | String (Required) | Product Name |
| description | String | Product Description |
| price | Number (Required) | Price in Rupees |
| category | String (Required) | Product Category |
| image | String | Product Image URL |
| isAvailable | Boolean | Availability Status |
| isVeg | Boolean | Vegetarian/Non-Vegetarian Flag |
| createdAt | Date | Product Creation Timestamp |
| updatedAt | Date | Last Update Timestamp |

**Primary Key:** _id

**Category Enum Values:** Snacks, Meals, Beverages

#### 4.2.3 Order Collection

Stores order and payment information.

| Field Name | Data Type | Description |
|------------|-----------|-------------|
| _id | ObjectId (PK) | Unique Order ID (Auto-generated) |
| user | ObjectId (FK -> User) | Reference to User |
| items | Array | Ordered Items with product, quantity, price |
| totalAmount | Number (Required) | Total Order Amount |
| status | String (Enum) | Order Status |
| paymentStatus | String (Enum) | Payment Status |
| orderType | String | Order Type (pickup/default) |
| deliveryType | String | Delivery Type (pickup/cabin) |
| cabinNumber | String | Cabin Number for Delivery |
| pickupTime | String | Scheduled Pickup Time |
| razorpayOrderId | String | Razorpay Order Reference |
| razorpayPaymentId | String | Razorpay Payment Reference |
| razorpaySignature | String | Payment Signature Verification |
| expiresAt | Date | TTL Index (Auto-delete after 24h) |
| createdAt | Date | Order Creation Timestamp |
| updatedAt | Date | Last Update Timestamp |

**Primary Key:** _id

**Foreign Key:** user (references User._id)

**Status Enum Values:** pending, preparing, ready, completed, cancelled

**Payment Status Enum Values:** pending, paid, failed

**Delivery Type Enum Values:** pickup, cabin

**TTL Index:** expiresAt with expireAfterSeconds: 0 (auto-deletes 24 hours after order completion)

### 4.3 Entity Relationships

```
User (1) ----< (many) Order       [Order.user -> User._id]
Product (1) ----< (many) OrderItem [Order.items.product -> Product._id]
```

- A **User** can place multiple **Orders** (One-to-Many)
- An **Order** contains multiple **Order Items**, each referencing a **Product** (Many-to-Many through embedded array)
- A **Product** can appear in multiple **Orders** (One-to-Many)

### 4.4 Database Normalization

Although MongoDB is a NoSQL database, the design follows normalization principles:

**Document Structure:**
- Each collection stores atomic, non-redundant data
- References are used instead of duplicating data across collections
- Order items embed product price as a snapshot to preserve historical pricing

**Data Integrity:**
- Unique constraints on email fields
- Required fields enforced at schema level
- Enum validations for status and role fields
- TTL index for automatic data cleanup

**Advantages of the Database Design:**
- Efficient document storage
- Reduced data redundancy
- Fast query performance with indexing
- Flexible schema for future expansion
- Automatic data cleanup with TTL
- Real-time updates with MongoDB change streams

### ER DIAGRAM

```
+------------------+          +---------------------+          +-------------------+
|      USER        |          |       ORDER         |          |     PRODUCT       |
+------------------+          +---------------------+          +-------------------+
| _id (PK)         |  1    *  | _id (PK)            |   *   1  | _id (PK)          |
| name             |----------| user (FK -> User)   |----------| name              |
| email (unique)   |          | items[]             |          | description       |
| password (hash)  |          |   product (FK)      |          | price             |
| role             |          |   quantity          |          | category          |
| cabinNumber      |          |   price (snapshot)  |          | image             |
| department       |          | totalAmount         |          | isAvailable       |
| phone            |          | status              |          | isVeg             |
| isVerified       |          | paymentStatus       |          | createdAt         |
| otp              |          | orderType           |          | updatedAt         |
| otpExpires       |          | deliveryType        |          +-------------------+
| resetPasswordOtp |          | cabinNumber         |
| resetPasswordExp.|          | pickupTime          |
| createdAt        |          | razorpayOrderId     |
| updatedAt        |          | razorpayPaymentId   |
+------------------+          | razorpaySignature   |
                              | expiresAt (TTL)     |
                              | createdAt           |
                              | updatedAt           |
                              +---------------------+
```

---

## 5. WORK CARRIED OUT

The Campus Bites system was developed to provide an efficient and reliable solution for managing college canteen pre-ordering. The project involved several stages including requirement analysis, system design, data design, frontend development, backend development, payment integration, notification system, testing, and implementation.

The work carried out during the project focused on developing a user-friendly system that helps educational institutions manage canteen operations, enable pre-ordering, process digital payments, and provide real-time order tracking.

### 5.1 Requirement Analysis

The first phase involved gathering and analyzing the requirements of a college canteen pre-ordering system.

**Activities Performed:**
- Studied existing food ordering systems (Zomato, Swiggy)
- Analyzed college canteen management requirements
- Identified user needs for five different roles
- Defined project scope and functionalities
- Prepared project documentation

**Outcome:** A clear understanding of the features and functionalities required for the Campus Bites system.

### 5.2 System Design

After requirement analysis, the overall architecture and design of the system were prepared.

**Activities Performed:**
- Designed client-server architecture
- Prepared ER diagrams for MongoDB collections
- Designed Mongoose schemas
- Planned user interface layouts with glassmorphism design
- Defined system workflow and API endpoints

**Outcome:** A structured blueprint for system development and implementation.

### 5.3 Data Development

A NoSQL database was designed using MongoDB to store and manage system data efficiently.

**Collections Created:**
- Users
- Products
- Orders

**Activities Performed:**
- Defined Mongoose schemas with validations
- Established document references (foreign key equivalents)
- Applied TTL indexes for automatic cleanup
- Optimized database structure for query performance

### 5.4 Frontend Development

The frontend interface was developed using React.js to provide users with a modern, interactive experience featuring glassmorphism design.

**Pages Developed:**

*Student Portal:*
- Splash Screen - Animated loading screen
- Login Page - Email/password + Google OAuth
- Register Page - Student registration
- Forgot Password - OTP-based reset
- Dashboard - Navigation shell with bottom dock
- Menu Page - Category filtering, search, veg/non-veg toggle
- Cart Page - Clock UI for pickup time, Razorpay checkout
- Orders Page - Order tracking with progress bar
- Profile Page - User profile management

*Admin Portal:*
- Admin Dashboard - Sidebar navigation
- Manage Menu - CRUD product management
- Analytics - Revenue and order statistics

*Kitchen Portal:*
- Kitchen View - Real-time order queue with auto-polling

*Lecturer Portal:*
- Lecturer Login - Dedicated authentication
- Lecturer Portal - Menu browsing with cabin delivery

*Delivery Portal:*
- Delivery Login - Dedicated authentication
- Delivery Portal - Order management and delivery tracking

### 5.5 Backend Development

The backend was developed using Node.js with Express.js to handle business logic and database communication.

**Activities Performed:**
- Implemented JWT authentication with role-based access control
- Developed RESTful API endpoints for all operations
- Created middleware for authentication and authorization
- Implemented input validation and error handling
- Configured CORS, Helmet, and rate limiting

**Major Functionalities:**
- User Management (Registration, Login, Google OAuth, OTP)
- Product Management (CRUD operations)
- Order Management (Placement, Tracking, Status Updates)
- Payment Integration (Razorpay order creation and verification)
- Notification System (WhatsApp via OpenWA, Email via Nodemailer)

### 5.6 Payment Integration Module

Razorpay payment gateway was integrated for secure digital payments.

**Features Developed:**
- Razorpay order creation with amount and receipt
- Client-side Razorpay checkout widget
- Payment verification with HMAC signature
- Payment status tracking in order records
- Secure transaction processing

### 5.7 Notification System Module

WhatsApp and email notifications were implemented for real-time updates.

**Features Developed:**
- WhatsApp order confirmation messages
- Order status update notifications
- Delivery completion notifications
- Email OTP for verification
- Email password reset links

### 5.8 Kitchen Management Module

A real-time kitchen dashboard was developed for order preparation management.

**Features Developed:**
- Live order queue with 10-second auto-polling
- Order tickets with customer details and item list
- Veg/Non-Veg badges on order items
- Status management (Accept, Mark Ready, Handover)
- Filter by order status
- Stats overview (Incoming, Cooking, Ready, Done)

### 5.9 Security Implementation

Several security mechanisms were implemented to protect system data.

**Security Features:**
- JWT-based authentication with token verification
- Password encryption using bcrypt
- Role-based access control middleware
- Helmet security headers
- CORS whitelist configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation on all endpoints
- Session management with localStorage

### 5.10 Testing and Debugging

Extensive testing was conducted to ensure system reliability and performance.

**Types of Testing:**
- Unit Testing - Individual component testing
- Integration Testing - API endpoint testing
- System Testing - End-to-end workflow testing
- User Acceptance Testing - Role-based user testing

**Outcome:** The Campus Bites system functioned successfully and satisfied all project requirements while providing efficient canteen pre-ordering, payment processing, and order management capabilities.

---

## 6. RESULTS AND DISCUSSION

### Results:

The Campus Bites system was successfully developed and implemented to manage college canteen pre-ordering efficiently. The application provides essential functionalities such as user authentication, menu management, pre-ordering, payment processing, order tracking, kitchen management, and delivery coordination.

The system allows students to browse categorized menus, add items to cart, select pickup times, make digital payments via Razorpay, and track orders in real-time. All order-related data is stored securely in MongoDB and can be retrieved quickly whenever required.

The kitchen management module successfully monitors incoming orders and provides a real-time dashboard for order preparation. The delivery module enables efficient cabin delivery for lecturers with WhatsApp notifications.

The admin module allows menu management with CRUD operations and provides analytics for operational insights.

### Discussion:

The project provided practical exposure to full-stack web development and database-driven application development. The implementation of a NoSQL database (MongoDB) improved data flexibility and allowed rapid development of document-based schemas.

One of the major advantages observed during development was the ability to track orders in real-time. This feature ensures that students, kitchen staff, and delivery personnel stay informed about order status at all times.

The integration of Razorpay payment gateway provided a secure and convenient digital payment experience. The HMAC signature verification ensures payment integrity and prevents fraud.

The multi-role architecture (Student, Admin, Staff, Lecturer, Delivery) enabled a comprehensive canteen management solution where each user type has access to relevant features and data.

The glassmorphism UI design with dark theme provided a modern and visually appealing interface that enhances user experience across all devices.

The WhatsApp notification system ensured that users receive timely updates about their orders without needing to check the application repeatedly.

Overall, the Campus Bites system successfully achieved its objectives by providing a reliable, secure, and efficient solution for college canteen pre-ordering.

### 6.1 OUTPUT SCREENSHOT - Student Dashboard

The student dashboard provides a centralized navigation hub with bottom dock navigation, quick access to menu, cart, orders, and profile sections.

### 6.2 OUTPUT SCREENSHOT - Menu & Cart

The menu page displays categorized food items with veg/non-eg badges, search functionality, and category filters. The cart page features an interactive analog clock UI for pickup time selection.

### 6.3 OUTPUT SCREENSHOT - Kitchen View

The kitchen dashboard shows real-time order queue with order tickets containing customer details, item lists, veg/non-veg badges, and status management buttons.

---

## 7. CONCLUSIONS AND SCOPE FOR FUTURE WORK

### Conclusion:

The Campus Bites system was successfully designed, developed, and implemented as an efficient canteen pre-ordering solution for educational institutions. The project achieved its primary objective of automating the food ordering process, menu management, payment processing, kitchen coordination, and delivery management.

The system provides several important functionalities such as user authentication with five role types, menu browsing with categories and filters, pre-ordering with scheduled pickup times, Razorpay payment integration, real-time order tracking, kitchen management dashboard, cabin delivery for lecturers, and WhatsApp notifications.

The data design ensures efficient storage and retrieval of information while maintaining data integrity through proper document references and schema validations. The use of MongoDB provides flexibility for future schema evolution.

Comprehensive testing was conducted to evaluate the functionality, reliability, and usability of the application. The results demonstrated that the system operates efficiently and fulfills the intended requirements.

From an educational perspective, this project provided practical exposure to full-stack web development, database management, payment gateway integration, real-time systems, and role-based access control.

Overall, the Campus Bites system successfully achieved its objectives and serves as a useful solution for managing college canteen pre-ordering in educational environments.

### Scope for Future Work:

Although the current implementation successfully fulfills the essential requirements of a canteen pre-ordering system, several enhancements can be incorporated in future versions.

**1. AI-Based Food Recommendation Engine**
- Predict user preferences based on order history
- Personalized menu suggestions
- Usage pattern analysis
- Benefits: Better user experience, increased order frequency

**2. Real-Time Chat Support**
- Live chat between students and kitchen staff
- Order customization requests
- Query resolution
- Benefits: Improved communication, better service

**3. Mobile Application Development**
- Develop Android and iOS applications
- Push notifications for order updates
- Benefits: Better accessibility, improved user convenience

**4. Cloud-Based Deployment**
- Deploy the system on cloud platforms
- Support multiple college campuses
- Platforms: AWS, Azure, Google Cloud Platform
- Benefits: High availability, better scalability

**5. Advanced Analytics Dashboard**
- Revenue analysis and forecasting
- Popular item trends
- Peak hour analysis
- Benefits: Better decision-making, improved inventory management

**6. Enhanced Security Features**
- Two-Factor Authentication (2FA)
- Biometric Authentication
- Advanced Access Control
- Benefits: Improved data protection, increased system security

**7. Inventory Management System**
- Real-time ingredient tracking
- Auto-disable items when ingredients run out
- Supplier management
- Benefits: Reduced food wastage, better stock management

**8. Loyalty and Rewards Program**
- Points-based reward system
- Student discount coupons
- Referral bonuses
- Benefits: Increased user engagement, student retention

**9. Nutrition Information System**
- Calorie count per item
- Nutritional information display
- Dietary preference filters
- Benefits: Health-conscious ordering, regulatory compliance

---

## 8. REFERENCES

### Books:

1. Pressman, R. S., Software Engineering: A Practitioner's Approach, 8th Edition, McGraw-Hill Education, 2019.

2. Silberschatz, A., Korth, H. F., and Sudarshan, S., Database System Concepts, 7th Edition, McGraw-Hill Education, 2019.

3. Elmasri, R., and Navathe, S. B., Fundamentals of Database Systems, 7th Edition, Pearson Education, 2017.

4. Sommerville, I., Software Engineering, 10th Edition, Pearson Education, 2016.

5. Murdoch, M., Node.js Design Patterns, 2nd Edition, Packt Publishing, 2018.

### Research Papers and Journals:

6. Kumar, V., and Gupta, S., "Real-Time Food Ordering Systems: A Comprehensive Review," International Journal of Computer Applications, Vol. 182, No. 44, pp. 10-18, 2020.

7. Sharma, P., and Verma, R., "Web-Based Food Service Management Using Modern Technologies," International Journal of Advanced Computer Science and Applications, Vol. 11, No. 8, pp. 215-223, 2020.

8. Singh, A., and Patel, D., "Digital Payment Integration in Food Service Applications," International Journal of Information Systems and Healthcare Management, Vol. 19, No. 3, pp. 275-289, 2021.

### Online Resources:

9. MongoDB Official Documentation. https://docs.mongodb.com

10. Express.js Official Documentation. https://expressjs.com

11. React.js Official Documentation. https://reactjs.org

12. Node.js Official Documentation. https://nodejs.org

13. Razorpay Documentation. https://razorpay.com/docs

14. W3Schools Web Development Tutorials. https://www.w3schools.com

15. GeeksforGeeks Programming and Database Resources. https://www.geeksforgeeks.org

---

## APPENDIX

### API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | No | - | Student registration |
| POST | /api/auth/login | No | - | Student/Admin/Staff login |
| POST | /api/auth/google | No | - | Google OAuth login |
| POST | /api/auth/forgot-password | No | - | Send OTP for reset |
| POST | /api/auth/reset-password | No | - | Reset password with OTP |
| POST | /api/auth/verify-otp | No | - | Verify email OTP |
| POST | /api/auth/lecturer/register | No | - | Lecturer registration |
| POST | /api/auth/lecturer/login | No | - | Lecturer login |
| POST | /api/auth/delivery/register | No | - | Delivery registration |
| POST | /api/auth/delivery/login | No | - | Delivery login |
| GET | /api/products | No | - | Get all products |
| POST | /api/products | Yes | Admin | Create product |
| PUT | /api/products/:id | Yes | Admin | Update product |
| DELETE | /api/products/:id | Yes | Admin | Delete product |
| POST | /api/orders | Yes | Any | Place order |
| GET | /api/orders/mine | Yes | Any | Get my orders |
| GET | /api/orders/staff/active | Yes | Admin/Staff | Get active orders |
| PUT | /api/orders/:id/status | Yes | Admin/Staff | Update order status |
| POST | /api/orders/razorpay | Yes | Any | Create Razorpay order |
| POST | /api/orders/verify | Yes | Any | Verify payment |
| GET | /api/orders/delivery/active | Yes | Delivery | Get delivery orders |
| PUT | /api/orders/delivery/:id/complete | Yes | Delivery | Mark delivered |

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React.js 18 | UI Framework |
| Build Tool | Vite 5 | Development Server |
| Backend | Node.js + Express.js | Server & API |
| Database | MongoDB Atlas | Cloud Database |
| ODM | Mongoose 8 | Schema Validation |
| Authentication | JWT + bcrypt | Security |
| Payment | Razorpay | Digital Payments |
| Notifications | OpenWA + Nodemailer | Communication |
| Hosting | Vercel + Render | Deployment |
