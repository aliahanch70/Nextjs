# Add Shopping Information API Documentation

## Endpoint
POST /api/add-shopping-info

## Headers
- Content-Type: application/json

## Request Body
The request body should be a JSON object with the following structure:

```json
{
  "id": "string",
  "prices": [
    {
      "name": "string",
      "price": "string",
      "url": "string",
      "explain": "string"
    }
  ]
}
```

### Fields
- `id`: A unique identifier for the shopping item (required)
- `prices`: An array of price objects (required, must contain at least one price object)
  - `name`: The name of the shopping item (required, used for the overall product name)
  - `price`: The price value as a string (required, will be parsed to a number)
  - `url`: The URL where the price was found (required)
  - `explain`: An explanation or description of the price (required)

## Response

### Success Response
- Status Code: 200 OK
- Body: 
```json
{
  "message": "Shopping information updated successfully"
}
```

### Error Responses
- Status Code: 400 Bad Request
  - Body: 
  ```json
  {
    "error": "Invalid request body"
  }
  ```
  This error occurs when the request body is missing required fields or has an invalid structure.

- Status Code: 400 Bad Request
  - Body:
  ```json
  {
    "error": "All fields are required for each price entry"
  }
  ```
  This error occurs when one or more price objects in the `prices` array are missing required fields.

- Status Code: 500 Internal Server Error
  - Body:
  ```json
  {
    "error": "Failed to update shopping information"
  }
  ```
  This error occurs when there's an internal server error while processing the request.

## Notes
- Ensure that all required fields are provided in the request body.
- The `id` field is required and must be a non-empty string.
- The `prices` array must contain at least one price object.
- Each price object in the `prices` array must have all required fields (name, price, url, explain).
- The `name` for the overall product is taken from the first price object in the `prices` array.
- The `price` is parsed to a number and must be a valid numeric string.
- The `url` is sanitized to handle some common encoding issues (e.g., &#39; is replaced with ').
- The `url` must be a valid URL after sanitization.
- If an item with the same `id` already exists, it will be updated with the new information.
- If the `id` is new, a new item will be added to the shopping information.

## Important Implementation Details
- The built-in Next.js body parser is disabled for this route. Ensure that the client sends the request body as raw JSON.
- If you're using `fetch` or a similar API, make sure to set the `Content-Type` header to `application/json`.

## Troubleshooting
If you're encountering a 400 Bad Request error:
1. Double-check that the request is being sent to the correct URL: `/api/add-shopping-info`.
2. Ensure that the request method is POST.
3. Verify that the request body is valid JSON and matches the expected structure:
   - Make sure the `id` field is present and not empty.
   - Ensure the `prices` array contains at least one price object.
   - Check that each price object in the `prices` array has all required fields (name, price, url, explain).
   - Confirm that the `name` field is present in each price object, not at the top level of the request body.
4. Validate that the `price` values can be parsed as numbers.
5. Check that the `url` values are valid URLs after sanitization.
6. Review the server logs for any specific error messages or unexpected behavior.

If the issue persists:
- Investigate the Next.js configuration and middleware setup.
- Review the client-side code sending the request.
- Check for any network-level issues between the client and server.

## Validation Process
The API performs the following validations:
1. Checks if the request body is a valid JSON object.
2. Ensures that `id` and `prices` are present and valid.
3. Extracts the `name` from the first price object and ensures it exists.
4. For each price entry:
   - Validates that all required fields are present.
   - Parses and validates the price as a number.
   - Sanitizes and validates the URL.