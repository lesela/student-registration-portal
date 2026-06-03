# Lesela eCourse Portal

Lesela eCourse is a course registration platform designed for students to plan and register for their academic semesters. The application provides an interactive dashboard, a weekly schedule calendar, and a course catalog to manage enrollments while preventing schedule conflicts.

## Purpose

The portal provides students with a workspace to:
* Search and filter the course catalog by department, day of the week, and keyword.
* Review course schedules and details in a unified directory.
* Add desired courses to a registration cart.
* Detect schedule conflicts automatically before finalizing registration.
* Confirm enrollment and view active classes on an interactive calendar timetable.

---

## Technical Stack

### Backend
* Java 21 and Spring Boot 3
* Spring Security with stateless JWT authentication
* Spring Data JPA and Hibernate
* H2 Database (in-memory mode for development)
* MapStruct for compiled Entity-DTO mapping
* Lombok for clean model structures

### Frontend
* React 19, TypeScript, and Vite
* CSS custom properties with a modern sage green and cream color scheme
* TanStack React Query for API caching and synchronization
* Framer Motion for sliding drawers, hover states, and transitions
* Lucide React for consistent icons

---

## Directory Structure

```
student-registration-portal/
├── backend/
│   ├── src/main/java/com/saas/portal/
│   │   ├── config/          # Security, database configuration, and data seeding
│   │   ├── controller/      # API endpoints for authentication and courses
│   │   ├── dto/             # Network request and response payloads
│   │   ├── exception/       # Exception definitions and global handlers
│   │   ├── mapper/          # MapStruct mapping interfaces
│   │   ├── model/           # Database entities (Student, Course, Registration)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   └── security/        # JWT generation and security filter chain
│   ├── src/main/resources/  # Configuration properties
│   └── pom.xml              # Maven dependencies
└── frontend/
    ├── src/
    │   ├── components/      # UI components (buttons, cards, modals, drawer)
    │   ├── context/         # Auth, Cart, and Toast providers
    │   ├── layouts/         # Dashboard layout structure
    │   ├── pages/           # Views (Login, Dashboard, Catalog, Management)
    │   ├── services/        # API clients and HTTP service calls
    │   ├── types/           # TypeScript interfaces
    │   └── utils/           # Utility functions
    ├── index.html           # Main HTML document
    └── package.json         # NPM package dependencies
```

---

## Running the Application

### Backend Service

1. Ensure Java 21 is installed.

2. Navigate to the backend directory and run:
   ```bash
   java -jar target/portal-0.0.1-SNAPSHOT.jar
   ```

* Seeding: The application automatically seeds 10 courses and a student profile on startup.
* Default Student Account: `lesela@university.edu` / `password`.
* API Documentation: Once running, Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

### Frontend Application

1. Navigate to the frontend directory.
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Scheduling & Conflict Detection

To prevent students from registering for overlapping classes, the application performs overlap validation both in the frontend cart context and in the backend registration service.

The overlap formula checks if two courses on the same day overlap:
`Max(Start_Time_A, Start_Time_B) < Min(End_Time_A, End_Time_B)`

If a conflict is detected, the frontend displays a warning inline and disables the enrollment checkout action.
