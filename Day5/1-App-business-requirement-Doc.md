# Business Requirements Document (BRD)
## Role-Based Login & Dashboard Application

**Document Version:** 1.0  
**Project Type:** Sample Web Application  
**Purpose:** Demonstrate AI-assisted application development using AWS KIRO

---

## 1. Business Objective

The objective is to build a simple web-based application that supports user authentication and Role-Based Access Control (RBAC).

The application will support two types of users:

1. **Admin** – Has administrative privileges and access to the Admin Dashboard.
2. **Normal User** – Has standard user privileges and access to the User Dashboard.

After successful login, users must automatically be redirected to their respective dashboards based on their assigned roles.

The application must provide a logout facility to allow users to securely terminate their sessions.

## 2. Application Scope

The application will include the following capabilities:

- User login using username/email and password.
- Authentication and authorization.
- Role-Based Access Control (RBAC).
- Separate dashboards for Admin and Normal Users.
- Secure session management.
- Logout functionality.
- Initial database population with one Admin user and one Normal User.

## 3. User Roles and Access Control

The application will support the following roles:

| Capability | Admin | Normal User |
|---|---|---|
| Login | Yes | Yes |
| Access Admin Dashboard | Yes | No |
| Access User Dashboard | Yes | Yes |
| View own user information | Yes | Yes |
| Access restricted Admin functions | Yes | No |
| Logout | Yes | Yes |

### 3.1 Admin User

The Admin user must be able to:
- Log in to the application.
- Access the Admin Dashboard.
- View an Admin-specific welcome message.
- View basic application information.
- Log out of the application.

### 3.2 Normal User

The Normal User must be able to:
- Log in to the application.
- Access the Normal User Dashboard.
- View a User-specific welcome message.
- View basic application information.
- Log out of the application.

## 4. Functional Requirements

### FR-01: Login Page
- The application must provide a login page.
- Users must enter their registered email/username and password.
- The system must validate the supplied credentials.
- Invalid credentials must display an appropriate error message.
- Successful authentication must redirect the user to the appropriate dashboard based on their role.

### FR-02: User Authentication
- The backend must authenticate users against the user records stored in DynamoDB.
- Passwords must be stored securely using a one-way password hashing mechanism.
- Authentication must be performed through backend APIs.
- The application must not expose passwords or sensitive authentication information.

### FR-03: Role-Based Access Control
- The system must identify the user's role after successful authentication.
- Admin users must be redirected to the Admin Dashboard.
- Normal Users must be redirected to the User Dashboard.
- Users must not be able to access dashboards or protected APIs that are not authorized for their role.
- Role validation must be enforced at the backend and not just through frontend navigation.

### FR-04: Admin Dashboard
The Admin Dashboard must:
- Display the Admin Dashboard title.
- Display a welcome message for the logged-in Admin.
- Display the logged-in user's basic information and role.
- Provide a Logout button.

### FR-05: Normal User Dashboard
The Normal User Dashboard must:
- Display the User Dashboard title.
- Display a welcome message for the logged-in user.
- Display the logged-in user's basic information and role.
- Provide a Logout button.

### FR-06: Logout
- Both dashboards must provide a Logout button.
- On logout, the user's authenticated session/token must be invalidated or otherwise made unusable according to the selected authentication design.
- The user must be redirected to the login page.
- The user must not be able to access protected pages using the previous session.

### FR-07: Initial User Seeding
After application deployment, the system must contain two initial users:

| User | Role | Purpose |
|---|---|---|
| Admin | ADMIN | Administrative access |
| Normal User | USER | Standard user access |

- Both users must have unique login credentials.
- Passwords must be securely hashed before storing in DynamoDB.
- Initial users must be seeded through a controlled deployment/setup process.
- Seed operations must not create duplicate users on repeated executions.

## 5. User Interface Requirements

The application must provide the following screens:

1. **Login Screen**
   - Application name/logo.
   - Username/email field.
   - Password field.
   - Login button.
   - Authentication error message area.

2. **Admin Dashboard**
   - Admin dashboard heading.
   - Welcome message.
   - User information.
   - User role.
   - Logout button.

3. **Normal User Dashboard**
   - User dashboard heading.
   - Welcome message.
   - User information.
   - User role.
   - Logout button.

The interface must be simple, responsive and user-friendly.

## 6. Technical Infrastructure Requirements

The application must be deployed using AWS managed services.

| Component | AWS Service | Responsibility |
|---|---|---|
| Frontend Hosting | Amazon S3 | Host frontend application files |
| CDN | Amazon CloudFront | Securely distribute frontend content |
| Backend | AWS Lambda | Execute application business logic |
| API Layer | Amazon API Gateway | Expose backend REST APIs |
| Database | Amazon DynamoDB | Store user information and roles |
| Authentication | Backend-based authentication | Validate credentials and manage sessions |

### 6.1 High-Level Architecture

**Frontend Flow:**
- Users access the application through the CloudFront URL.
- CloudFront delivers frontend content from the S3 bucket.
- Users interact with the login page and dashboards.

**Backend Flow:**
- Frontend invokes backend APIs through API Gateway.
- API Gateway invokes the relevant Lambda functions.
- Lambda functions perform authentication and authorization.
- Lambda functions retrieve user records from DynamoDB.
- Authentication results are returned to the frontend.

**Database:**
- DynamoDB stores user identity, password hash and assigned role.
- Initial Admin and Normal User records are populated during setup.

## 7. Non-Functional Requirements

### Security
- HTTPS communication through CloudFront and API Gateway.
- Passwords must never be stored in plaintext.
- Backend APIs must enforce RBAC.
- Authentication tokens must have an expiry mechanism.
- Protected APIs must reject unauthenticated requests.
- AWS IAM permissions must follow least-privilege principles.

### Performance
- Login response should be returned within a reasonable response time.
- Dashboard loading should be lightweight.
- DynamoDB access should use efficient key-based queries.

### Availability
- Application should use managed AWS services.
- Frontend and backend should be independently deployable.

### Maintainability
- Frontend, backend and infrastructure code should be logically separated.
- Application code should be maintained in Git.
- Infrastructure should be deployable through repeatable deployment scripts.

## 8. Acceptance Criteria

The application will be considered successfully implemented when:

1. The login page is accessible through the CloudFront URL.
2. The Admin user can successfully log in.
3. The Admin user is redirected to the Admin Dashboard.
4. The Normal User can successfully log in.
5. The Normal User is redirected to the Normal User Dashboard.
6. An Admin cannot be impersonated by changing frontend parameters.
7. A Normal User cannot access Admin-protected pages or APIs.
8. Invalid login credentials are rejected.
9. Both dashboards provide a working Logout button.
10. Logged-out users cannot access protected functionality.
11. Both initial user records are available in DynamoDB.
12. Passwords are stored as secure hashes and not plaintext.
13. The complete application is accessible through CloudFront.

## 9. Out of Scope

The following capabilities are excluded from this sample application:

- User self-registration.
- Forgot password and password reset.
- Multi-factor authentication.
- User management and creation through Admin Dashboard.
- Multiple Admin and Normal User management workflows.
- Third-party identity providers.
- Multi-tenant support.
- Advanced reporting and analytics.

## 10. Expected Deliverables

1. Functional web application.
2. Login page.
3. Admin Dashboard.
4. Normal User Dashboard.
5. Backend authentication and authorization APIs.
6. DynamoDB user table.
7. Initial Admin and Normal User seed records.
8. AWS infrastructure deployment templates.
9. Application source code.
10. Deployment and testing documentation.

---

**End of Business Requirements Document**
