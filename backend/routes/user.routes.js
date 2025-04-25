// d:\Base_Directory_Storage\Coding\dispensary-app\backend\routes\user.routes.js
const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller"); // Loads exports from user.controller.js

module.exports = function(app) {
  // Removed redundant CORS header setting middleware

  // --- Test/Placeholder Routes ---
  app.get("/api/test/all", controller.allAccess);
  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
  app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isAdminOrModerator], controller.moderatorBoard); // Assuming isAdminOrModerator exists
  app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

  // --- User Profile Routes ---
  // GET current user's profile
  app.get(
    "/api/users/me",
    [authJwt.verifyToken],
    controller.getCurrentUser
  );

  // PUT (update) current user's profile
  app.put(
    "/api/users/me",
    [authJwt.verifyToken],
    controller.updateCurrentUser
  );

  // --- Admin/Moderator User Management Routes ---
  // GET all users
  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdminOrModerator], // Or just isAdmin if preferred
    controller.getAllUsers
  );

  // DELETE a specific user by ID
  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin], // Only Admin can delete
    controller.deleteUser
  );

  // GET distinct store locations from users
  app.get(
    "/api/users/locations",
    [authJwt.verifyToken], // Added basic authentication
    controller.getDistinctUserLocations
  );
};
