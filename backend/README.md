# Auratten API

High-performance NestJS backend for the Auratten attendance management system. This API handles secure QR-based attendance marking, institutional analytics, and automated reporting.

## Core Services

- **Attendance Service**: Manages scanning logic, duplicate protection, and device fingerprinting.
- **QR Service**: Handles generation of secure, rotating tokens for session-based attendance.
- **Notification Service**: Integrated with AWS SES/SNS for automated parent alerts and student confirmations.
- **Auth Service**: Robust JWT-based authentication with role-based access control (RBAC).

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Security**: Passport.js with JWT Strategy
- **Cloud Services**: AWS SES (Email), AWS SNS (SMS)

## Setup and Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Database Migration**:
    ```bash
    npx prisma migrate dev
    ```

3.  **Run Development Server**:
    ```bash
    npm run start:dev
    ```

4.  **Build and Production**:
    ```bash
    npm run build
    npm run start:prod
    ```

## Development

- **Linting**: `npm run lint`
- **Testing**: `npm run test`
- **Prisma Studio**: `npx prisma studio`

## License

This project is proprietary and confidential.
