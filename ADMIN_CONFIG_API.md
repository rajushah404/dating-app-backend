# Admin Configuration API Documentation

## Overview
This API allows administrators to configure app-wide settings, specifically daily limits for free users.

---

## Default Configuration
When the server starts for the first time, these default values are automatically created:

```json
{
  "dailySendLimit": 20,      // Free users can send 20 likes per day
  "dailyRevealLimit": 2,     // Free users can see 2 pending requests per day
  "dailyReviewLimit": 2      // Free users can review 2 requests per day
}
```

---

## API Endpoints

### 1. Get Current Configuration
**GET** `/api/admin/config`

**Description:** Fetch the current app configuration (public endpoint)

**Headers:**
```
None required (public endpoint)
```

**Response:**
```json
{
  "success": true,
  "message": "App configuration retrieved successfully",
  "data": {
    "_id": "...",
    "key": "FREE_USER_LIMITS",
    "freeUserLimits": {
      "dailySendLimit": 20,
      "dailyRevealLimit": 2,
      "dailyReviewLimit": 2
    },
    "updatedBy": "system",
    "updatedAt": "2026-02-02T17:30:00.000Z",
    "createdAt": "2026-02-02T17:30:00.000Z"
  }
}
```

---

### 2. Update Configuration (Admin Only)
**PUT** `/api/admin/config`

**Description:** Update app configuration limits

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "dailySendLimit": 30,      // Optional: 0-1000
  "dailyRevealLimit": 5,     // Optional: 0-100
  "dailyReviewLimit": 3      // Optional: 0-100
}
```

**Response:**
```json
{
  "success": true,
  "message": "App configuration updated successfully",
  "data": {
    "_id": "...",
    "key": "FREE_USER_LIMITS",
    "freeUserLimits": {
      "dailySendLimit": 30,
      "dailyRevealLimit": 5,
      "dailyReviewLimit": 3
    },
    "updatedBy": "firebase_uid_here",
    "updatedAt": "2026-02-02T18:00:00.000Z",
    "createdAt": "2026-02-02T17:30:00.000Z"
  }
}
```

**Validation Rules:**
- `dailySendLimit`: Must be between 0 and 1000
- `dailyRevealLimit`: Must be between 0 and 100
- `dailyReviewLimit`: Must be between 0 and 100

**Error Response (400):**
```json
{
  "success": false,
  "message": "dailyRevealLimit must be between 0 and 100"
}
```

---

## How It Works

### For Free Users:

1. **Daily Send Limit** (`dailySendLimit`)
   - Controls how many "interested" requests a user can send per day
   - Default: 20 per day
   - Resets at UTC midnight

2. **Daily Reveal Limit** (`dailyRevealLimit`)
   - Controls how many pending requests a user can SEE per day
   - Default: 2 per day
   - Resets at UTC midnight

3. **Daily Review Limit** (`dailyReviewLimit`)
   - Controls how many requests a user can REVIEW (accept/reject) per day
   - Default: 2 per day
   - Resets at UTC midnight
   - **Important:** Once this limit is reached, no new requests are revealed

### For Premium Users:
- All limits are bypassed
- Unlimited sends, reveals, and reviews

---

## Example Use Cases

### Scenario 1: Increase Engagement
```bash
# Allow users to see more requests
PUT /api/admin/config
{
  "dailyRevealLimit": 5,
  "dailyReviewLimit": 5
}
```

### Scenario 2: Reduce Spam
```bash
# Limit how many likes users can send
PUT /api/admin/config
{
  "dailySendLimit": 10
}
```

### Scenario 3: Freemium Strategy
```bash
# Show many requests but limit reviews to encourage upgrades
PUT /api/admin/config
{
  "dailyRevealLimit": 10,
  "dailyReviewLimit": 2
}
```

---

## Testing with Postman/cURL

### Get Config:
```bash
curl -X GET http://localhost:3000/api/admin/config
```

### Update Config:
```bash
curl -X PUT http://localhost:3000/api/admin/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "dailySendLimit": 25,
    "dailyRevealLimit": 3,
    "dailyReviewLimit": 2
  }'
```

---

## Notes

1. **Admin Authentication:** Currently, any authenticated user can update the config. You should add an admin role check middleware for production.

2. **Real-time Effect:** Changes take effect immediately for all new API calls. Users currently in-app will see new limits on their next action.

3. **Database:** Configuration is stored in the `appconfigs` MongoDB collection.

4. **Initialization:** Default config is automatically created on server startup if it doesn't exist.

---

## TODO for Production

- [ ] Add admin role middleware to protect PUT endpoint
- [ ] Add audit logging for config changes
- [ ] Add validation to ensure `dailyReviewLimit <= dailyRevealLimit`
- [ ] Add frontend admin panel to manage these settings
- [ ] Add ability to configure different limits for different user tiers
