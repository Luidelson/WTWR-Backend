# DELETE Requests - JSON Response Documentation

## Your Express backend has two DELETE endpoints that return JSON objects:

---

## 1. DELETE /items/:itemId (Delete Clothing Item)

### Successful Deletion Response:
**Status Code:** `200` (OK)
**JSON Response:**
```json
{
  "message": "Item deleted successfully",
  "data": {
    "_id": "64f5a1b2c8d9e1f2a3b4c5d6",
    "name": "Winter Jacket",
    "weather": "cold",
    "imageUrl": "https://example.com/jacket.jpg",
    "owner": "64f5a1a1c8d9e1f2a3b4c5d1",
    "likes": [],
    "createdAt": "2023-09-03T10:30:00.000Z",
    "__v": 0
  }
}
```

### Error Responses:

#### Item Not Found:
**Status Code:** `404` (Not Found)
**JSON Response:**
```json
{
  "message": "Item not found"
}
```

#### Not Owner (Forbidden):
**Status Code:** `403` (Forbidden)
**JSON Response:**
```json
{
  "message": "You are not allowed to delete this item"
}
```

#### Invalid Item ID:
**Status Code:** `400` (Bad Request)
**JSON Response:**
```json
{
  "message": "Invalid item ID"
}
```

#### No Authentication:
**Status Code:** `401` (Unauthorized)
**JSON Response:**
```json
{
  "message": "Authorization required"
}
```

---

## 2. DELETE /items/:itemId/likes (Unlike Item)

### Successful Unlike Response:
**Status Code:** `200` (OK)
**JSON Response:**
```json
{
  "_id": "64f5a1b2c8d9e1f2a3b4c5d6",
  "name": "Winter Jacket",
  "weather": "cold",
  "imageUrl": "https://example.com/jacket.jpg",
  "owner": "64f5a1a1c8d9e1f2a3b4c5d1",
  "likes": ["64f5a1a1c8d9e1f2a3b4c5d2"],
  "createdAt": "2023-09-03T10:30:00.000Z",
  "__v": 0
}
```

### Error Responses:

#### Item Not Found:
**Status Code:** `404` (Not Found)
**JSON Response:**
```json
{
  "message": "Item not found"
}
```

#### Invalid Item ID:
**Status Code:** `400` (Bad Request)
**JSON Response:**
```json
{
  "message": "Invalid item ID"
}
```

#### No Authentication:
**Status Code:** `401` (Unauthorized)
**JSON Response:**
```json
{
  "message": "Authorization required"
}
```

---

## Code Analysis

### DELETE Item Controller:
```javascript
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");        // 👈 404 JSON error
      }
      if (item.owner.toString() !== userId) {
        throw new ForbiddenError("You are not allowed to delete this item"); // 👈 403 JSON error
      }
      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) =>
        res.status(STATUS_OK).send({ 
          message: "Item deleted successfully",           // 👈 200 JSON success
          data: deletedItem 
        })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));     // 👈 400 JSON error
      }
      // ... other error handling
    });
};
```

### DELETE Unlike Controller:
```javascript
const unlikeItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;
  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");        // 👈 404 JSON error
      }
      return res.status(STATUS_OK).send(item);           // 👈 200 JSON success (updated item)
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));     // 👈 400 JSON error
      }
      // ... other error handling
    });
};
```

---

## Manual Testing Commands:

```bash
# 1. Create user and get token
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","avatar":"https://example.com/avatar.jpg"}'

curl -X POST http://localhost:3001/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Create item to delete
curl -X POST http://localhost:3001/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Jacket","weather":"cold","imageUrl":"https://example.com/jacket.jpg"}'

# 3. Delete the item
curl -X DELETE http://localhost:3001/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Unlike an item
curl -X DELETE http://localhost:3001/items/ITEM_ID/likes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Test error cases
curl -X DELETE http://localhost:3001/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"  # Non-existent item

curl -X DELETE http://localhost:3001/items/invalid-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"  # Invalid ID format
```

## ✅ Confirmation

Both of your DELETE endpoints correctly return JSON objects:
- **Successful operations** return structured JSON with data/message
- **Error cases** return proper JSON error responses with appropriate HTTP status codes
- **All responses are valid JSON** - no HTML or plain text responses

Your error handling middleware ensures consistent JSON formatting across all endpoints! 🎉
