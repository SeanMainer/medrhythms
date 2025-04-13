<!-- @format -->

# Inventory Management System API Documentation

This document provides detailed information about the API endpoints available in the Inventory Management System.

## Base URL

All endpoints are prefixed with `/api`.

## Table of Contents

1. [Distributor Management](#distributor-management)
2. [Kit Management](#kit-management)
3. [Kit Assembly](#kit-assembly)
4. [Component Management](#component-management)
5. [Usage Records](#usage-records)
6. [Data Import/Export](#data-importexport)

## Distributor Management

### Get All Distributors

Retrieves all distributors in the system.

- **URL:** `/distributors`
- **Method:** `GET`
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "tel": "string",
        "address": "string",
        "city": "string",
        "contactPerson": "string",
        "status": "string",
        "createdAt": "timestamp"
      }
    ]
    ```
  - `500 Internal Server Error` - Server error

### Get Distributor by ID

Retrieves a specific distributor by ID.

- **URL:** `/distributors/<distributor_id>`
- **Method:** `GET`
- **URL Parameters:**
  - `distributor_id`: ID of the distributor
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "tel": "string",
      "address": "string",
      "city": "string",
      "contactPerson": "string",
      "status": "string",
      "createdAt": "timestamp"
    }
    ```
  - `404 Not Found` - Distributor not found

### Create Distributor

Creates a new distributor.

- **URL:** `/distributors/create`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "tel": "string",
    "address": "string",
    "city": "string",
    "contact_person": "string",
    "status": "string" (optional, default: "active")
  }
  ```
- **Response:**
  - `201 Created` - Success
    ```json
    {
      "message": "Distributor created successfully"
    }
    ```
  - `500 Internal Server Error` - Server error

### Update Distributor

Updates an existing distributor.

- **URL:** `/distributors/<distributor_id>`
- **Method:** `PUT`
- **URL Parameters:**
  - `distributor_id`: ID of the distributor
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "tel": "string",
    "address": "string",
    "city": "string",
    "contactPerson": "string",
    "status": "string"
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Distributor updated successfully"
    }
    ```
  - `500 Internal Server Error` - Server error

### Update Distributor Status

Updates the status of a distributor.

- **URL:** `/distributors/<distributor_id>/status`
- **Method:** `PATCH`
- **URL Parameters:**
  - `distributor_id`: ID of the distributor
- **Request Body:**
  ```json
  {
    "status": "active" | "inactive"
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Distributor status updated to <status> successfully."
    }
    ```
  - `400 Bad Request` - Invalid status
  - `500 Internal Server Error` - Server error

## Kit Management

### Get All Kits

Retrieves all kits in the system.

- **URL:** `/kits/getAll`
- **Method:** `GET`
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "number",
        "distributor": "string",
        "dispense_date": "timestamp"
      }
    ]
    ```
  - `500 Internal Server Error` - Server error

### Get Kit by ID

Retrieves a specific kit by ID.

- **URL:** `/kits/<kit_id>`
- **Method:** `GET`
- **URL Parameters:**
  - `kit_id`: ID of the kit
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "id": "string",
      "created_at": "timestamp",
      "status": "string",
      "batch_number": "number",
      "distributor": "object",
      "dispense_date": "timestamp",
      "components": {
        "phone": "string",
        "sim_card": "string",
        "right_sensor": "string",
        "left_sensor": "string",
        "headphone": "string",
        "box": "string"
      }
    }
    ```
  - `404 Not Found` - Kit not found

### Get Kits Sorted by Creation Date (Descending)

Retrieves all kits sorted by creation date in descending order.

- **URL:** `/kits/sortByCreatedAtDesc`
- **Method:** `GET`
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "string"
      }
    ]
    ```
  - `500 Internal Server Error` - Server error

### Filter Kits by Date Range

Retrieves kits created within a specific date range.

- **URL:** `/kits/filterByCreatedAtRange`
- **Method:** `GET`
- **Query Parameters:**
  - `startDate`: Start date in format 'YYYY-MM-DD'
  - `endDate`: End date in format 'YYYY-MM-DD'
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "string"
      }
    ]
    ```
  - `400 Bad Request` - Invalid date format
  - `500 Internal Server Error` - Server error

### Filter Kits by Batch Number

Retrieves kits with a specific batch number.

- **URL:** `/kits/filterByBatchNumber`
- **Method:** `GET`
- **Query Parameters:**
  - `batchNumber`: Batch number
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "string"
      }
    ]
    ```
  - `404 Not Found` - No kits found with the batch number
  - `500 Internal Server Error` - Server error

### Filter Kits by Status

Retrieves kits with a specific status.

- **URL:** `/kits/filterByStatus`
- **Method:** `GET`
- **Query Parameters:**
  - `status`: Kit status (Available, Unavailable, Bound, Scrapped, Furbishing, Other)
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "string"
      }
    ]
    ```
  - `400 Bad Request` - Invalid status
  - `500 Internal Server Error` - Server error

### Filter Kits by Distributor ID

Retrieves kits associated with a specific distributor.

- **URL:** `/kits/filterByDistributorId`
- **Method:** `GET`
- **Query Parameters:**
  - `distributorId`: ID of the distributor
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "string",
        "created_at": "timestamp",
        "status": "string",
        "batch_number": "string",
        "distributor_id": "string",
        "distributor_name": "string",
        "dispense_date": "timestamp"
      }
    ]
    ```
  - `400 Bad Request` - Missing distributor ID
  - `404 Not Found` - No kits found for the distributor
  - `500 Internal Server Error` - Server error

### Distribute Kits

Assigns kits to a distributor.

- **URL:** `/kits/distribute`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "kits": ["string", "string"],
    "distributor_id": "string",
    "start_time": "timestamp" (optional)
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "X kits distributed successfully"
    }
    ```
  - `400 Bad Request` - Missing required fields
  - `404 Not Found` - Distributor or kit not found
  - `500 Internal Server Error` - Server error

### Collect Kits

Updates the end time for component usage records when kits are collected.

- **URL:** `/kits/collect`
- **Method:** `PATCH`
- **Request Body:**
  ```json
  {
    "kits": ["string", "string"],
    "endTime": "timestamp" (optional)
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "X kits collected successfully"
    }
    ```
  - `400 Bad Request` - Missing required fields
  - `404 Not Found` - Kit not found
  - `500 Internal Server Error` - Server error

## Kit Assembly

### Create Kit

Creates a new kit with specified components.

- **URL:** `/kits/create`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "phone_ID": "string",
    "SIM_card_ID": "string",
    "right_sensor_ID": "string",
    "left_sensor_ID": "string",
    "headphones_ID": "string",
    "box_ID": "string"
  }
  ```
- **Response:**
  - `201 Created` - Success
    ```json
    {
      "message": "Kit created successfully",
      "kit_ID": "string"
    }
    ```
  - `400 Bad Request` - Components not available or error creating kit

### Disassemble Kit

Disassembles a kit, changing component status to 'refurbishing'.

- **URL:** `/kits/disassemble`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "kit_ID": "string"
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Kit disassembled successfully",
      "updated_components": [
        {
          "component_type": "string",
          "component_ID": "string",
          "status": "string"
        }
      ]
    }
    ```
  - `400 Bad Request` - Missing kit ID or error disassembling
  - `404 Not Found` - Kit not found

### Batch Disassemble Kits

Disassembles multiple kits in a single operation.

- **URL:** `/kits/disassemble_many`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "kit_IDs": ["string", "string"]
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Batch disassemble completed",
      "updated_components": [
        {
          "kit_ID": "string",
          "component_type": "string",
          "component_ID": "string",
          "status": "string"
        }
      ],
      "failed_kits": [
        {
          "kit_ID": "string",
          "message": "string"
        }
      ]
    }
    ```
  - `400 Bad Request` - Invalid or missing kit IDs

### Create Multiple Kits

Creates multiple kits in a batch operation.

- **URL:** `/kits/create_many`
- **Method:** `POST`
- **Request Body:**
  ```json
  [
    {
      "phone_ID": "string",
      "SIM_card_ID": "string",
      "right_sensor_ID": "string",
      "left_sensor_ID": "string",
      "headphones_ID": "string",
      "box_ID": "string"
    }
  ]
  ```
- **Response:**
  - `201 Created` - Success
    ```json
    {
      "message": "Created X kits successfully",
      "created_kits": ["string", "string"],
      "errors": []
    }
    ```
  - `400 Bad Request` - Error creating kits

## Component Management

### Create Components by Batch

Creates multiple components of a specific type in a batch.

- **URL:** `/<component_type>/createByBatch`
- **Method:** `POST`
- **URL Parameters:**
  - `component_type`: Type of component (phone, sim_card, right_sensor, left_sensor, headphone, box)
- **Request Body:**
  ```json
  {
    "batch_number": "string",
    "ids": [
      {
        "id": "string",
        "model_number": "string"
      }
    ]
  }
  ```
- **Response:**
  - `201 Created` - Success
    ```json
    {
      "message": "Successfully created X component_type(s)",
      "data": [
        {
          "id": "string",
          "model_number": "string",
          "batch_number": "string",
          "status": "string"
        }
      ]
    }
    ```
  - `400 Bad Request` - Invalid component type, missing IDs or batch number
  - `500 Internal Server Error` - Server error

### Update Component Status

Updates the status of a component.

- **URL:** `/components/status_update/<component_id>`
- **Method:** `PUT`
- **URL Parameters:**
  - `component_id`: ID of the component
- **Request Body:**
  ```json
  {
    "status": "string"
  }
  ```
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Status updated successfully",
      "component": {
        "id": "string",
        "type": "string",
        "status": "string",
        "updated_at": "timestamp",
        "discarded_at": "timestamp"
      }
    }
    ```
  - `400 Bad Request` - Missing status or error updating
  - `500 Internal Server Error` - Server error

### Get All Components

Retrieves all components in the system.

- **URL:** `/components`
- **Method:** `GET`
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Components retrieved successfully",
      "components": [
        {
          "id": "string",
          "batch_number": "string",
          "status": "string",
          "created_at": "timestamp",
          "discarded_at": "timestamp",
          "kit_id": "string",
          "type": "string"
        }
      ]
    }
    ```
  - `500 Internal Server Error` - Server error

### Get Components by Batch Number

Retrieves components with a specific batch number.

- **URL:** `/components/batch_query/<batch_number>`
- **Method:** `GET`
- **URL Parameters:**
  - `batch_number`: The batch number to query
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Components with batch number X retrieved successfully",
      "components": [
        {
          "id": "string",
          "batch_number": "string",
          "status": "string",
          "created_at": "timestamp",
          "discarded_at": "timestamp",
          "kit_id": "string",
          "type": "string"
        }
      ]
    }
    ```
  - `500 Internal Server Error` - Server error

## Usage Records

### Get All Usage Records

Retrieves all component usage records.

- **URL:** `/usage`
- **Method:** `GET`
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "number",
        "component_id": "string",
        "component_type": "string",
        "kit_id": "string",
        "distributor_id": "string",
        "start_time": "timestamp",
        "end_time": "timestamp"
      }
    ]
    ```

### Get Usage Records by Component ID

Retrieves usage records for a specific component.

- **URL:** `/usage/component/<component_id>`
- **Method:** `GET`
- **URL Parameters:**
  - `component_id`: ID of the component
- **Response:**
  - `200 OK` - Success
    ```json
    [
      {
        "id": "number",
        "component_id": "string",
        "component_type": "string",
        "kit_id": "string",
        "distributor_id": "string",
        "start_time": "timestamp",
        "end_time": "timestamp"
      }
    ]
    ```
  - `404 Not Found` - No usage records found for the component

### Get Discard Rate

Retrieves component discard rate statistics.

- **URL:** `/discard-rate`
- **Method:** `GET`
- **Query Parameters:**
  - `months`: Number of months to analyze (default: 6)
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "data": [
        {
          "month": "YYYY-MM",
          "collected": "number",
          "scrapped": "number",
          "rate": "number"
        }
      ]
    }
    ```
  - `500 Internal Server Error` - Server error

## Data Import/Export

### Import Data

Imports data from a JSON file.

- **URL:** `/import`
- **Method:** `POST`
- **Request Body:** Form data with a file field
- **Response:**
  - `200 OK` - Success
    ```json
    {
      "message": "Data imported successfully"
    }
    ```
  - `400 Bad Request` - No file or invalid file
  - `500 Internal Server Error` - Server error

### Export Data

Exports database data in JSON or CSV format.

- **URL:** `/exportdb`
- **Method:** `GET`
- **Query Parameters:**
  - `format`: Output format (json or csv, default: json)
- **Response:**
  - `200 OK` - Success (returns file download)
  - `400 Bad Request` - Invalid format
  - `500 Internal Server Error` - Server error
