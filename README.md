# FinTrack — Full-Stack Personal Finance Platform

FinTrack is an enterprise-grade personal finance management application built with a **Spring Boot 3** backend and a **React (Vite)** frontend. The application provides dynamic tracking of income, expenses, and budget analytics using structured API interfaces and optimized relational database queries.

---

## 🛠️ Tech Stack & Architecture

### Backend (`/fintrack-backend`)
* **Framework:** Java 17, Spring Boot 3.x
* **Data Access:** Spring Data JPA / Hibernate
* **Database:** MySQL 8.0
* **API Architecture:** RESTful APIs using DTO Records, Jakarta Bean Validation, and Centralized `@RestControllerAdvice` Exception Handling
* **Performance:** Optimized JPQL database aggregations for real-time financial reporting

### Frontend (`/fintrack-frontend`)
* **Framework:** React 18, Vite
* **Styling:** Modern CSS3 / Flexbox & Grid
* **Icons & Assets:** Custom SVG / Vector assets

---

## 📂 Repository Structure

```text
fintrack-app/
├── fintrack-backend/       # Spring Boot REST API service
│   ├── src/
│   ├── pom.xml
│   └── application.properties
└── fintrack-frontend/      # React single-page application
    ├── src/
    ├── public/
    └── package.json