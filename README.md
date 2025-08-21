# ___Projet HBnB - Cloner AirBnB___

## ___Introduction___

HBnB is an Airbnb-inspired platform that allows users to publish, search, and comment on rental listings.
The project is based on a modular architecture, separating the API, business logic, data persistence, and a simple web client.

**This documentation includes:**

- The technical and software architecture (UML, layers, relationships).

- The project structure and organization.

- The main entities and their business logic.

- The class, entity, and API sequence diagrams.

- The simple web client for user interaction.

## ___Project Structure___

```bash
app/                  # Main code
 ├── api/             # REST API (Flask) – endpoints by version
 ├── models/          # Business classes (User, Place, Review, Amenity)
 ├── services/        # Façade – communication between layers
 └── persistence/     # Temporary memory repository (CRUD)

run.py                # Flask entry point
config.py             # Configuration (keys, debug, etc.)
requirements.txt      # Python dependencies
README.md             # Documentation
```

## ___Installing Dependencies___

Run the following command to install the dependencies:

```bash
pip install -r requirements.txt
```

## ___High-Level Architecture___

### ___Layers___

- **Presentation Layer (REST API)**

    - Endpoints: UserAPI, PlaceAPI, ReviewAPI, AmenityAPI

    - Role: User interface ↔ system (via HTTP).

    - Uses the Facade Pattern to simplify access to business logic.

- **Business Logic Layer**

    - Entities: User, Place, Review, Amenity, PlaceAmenity.

    - Role: Business rules, validations, entity management.

- **Persistence Layer**

    - Abstract database access (DatabaseAccess).

    - Role: Isolated CRUD to facilitate migrations and maintenance.

Main relationships:

    - Presentation → Business Logic: Facade Pattern

    - Business Logic → Persistence: Database Operations

## ___Business Logic Entities___

### ___User___

Represents a platform user.

- Attributes: `id`, `first_name`, `last_name`, `email`, `password`, `is_admin`, `created_at`, `updated_at`.

- Responsibilities: Manage identity, verify email uniqueness, manage admin roles, create/own locations, leave reviews.

- Key methods: `create()`, `update()`, `delete()`, `is_admin()`, `set_password()`.

### ___Place___

- Represents a rental listing published by a user.

- Attributes: `id`, `title`, `description`, `price`, `latitude`, `longitude`, `owner`, `created_at`, `updated_at`.

- Responsibilities: Validate price/coordinates, associate with a valid owner, list/filter/rate.

- Methods: `create()`, `update()`, `delete()`, `list()`.

### ___Review___

Represents a user review of a place.

- Attributes: `id`, `text`, `rating`, `place`, `user`, `created_at`, `updated_at`.

- Responsibilities: Check that rating ∈ [1,5], be associated with an existing user and place.

- Methods: `create()`, `update()`, `delete()`, `list_by_place()`.

### ___Amenity___

Represents an available facility or service (e.g., Wi-Fi, parking).

- Attributes: `id`, `name`, `description`, `created_at`, `updated_at`.

- Responsibilities: Can be linked to one or more locations, and can be filtered by facility.

- Methods: `create()`, `update()`, `delete()`, `list()`.

### ___Place_Amenity___

Many-to-many association table between `Place` and `Amenity`.

- Fields: `place_id`, `amenity_id`.

- No business data, only relationship management.

### ___Relations___

- A User can create multiple Places and leave multiple Reviews.

- A Place can receive multiple Reviews and have multiple Amenities (and vice versa).

## ___API Interaction Flow___

### ___User Registration___

- `POST /user` → Creates a new user with format validation and email uniqueness.

- Password hashed before storage.

- Responses: `400 Bad Request`, `500 Internal Error`, or `201 Created`.

### ___Place Creation___

- `POST /places` → reserved for administrators.

- Validates the data and inserts it into the database.

- Responses: `403 Forbidden`, `400 Bad Request`, `500 Internal Error`, or `201 Created`.

### ___Fetching Places___

- `GET /places?filters=...` → returns the list of places based on criteria.

- Responses: `400 Bad Request`, `200 OK` (empty list or results).

### ___Review Submission___

- `POST /reviews` → Adds a review to an existing location.

- Responses: `400 Bad Request`, `500 Internal Error`, or `201 Created`.

## ___Simple Web Client___

A minimal web client (HTML, CSS, JavaScript) allows you to:

- Authenticate a user.

- Browse and filter locations.

- Submit reviews.

## ___Conclusion___

HBnB is based on a clear, modular architecture, ensuring:

- A clear separation of responsibilities.

- Long-term scalability and maintainability.

- A solid foundation for future feature additions.

This document is the primary reference for project developers and contributors.

## ___Authors___

-[Vithushan Satkunanathan](https://github.com/Vitushan)  
-[Jules Ventura](https://github.com/Juleslgc)