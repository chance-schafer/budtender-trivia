// --- File: backend/models/role.model.js --- (Revised)

module.exports = (sequelize, Sequelize) => {
  // Define the model, using 'role' as the singular name for convention
  // Sequelize will automatically pluralize this to 'roles' for the table name by default
  // unless tableName is explicitly set.
  const Role = sequelize.define("role", { // Changed from "roles" to "role" for model name convention
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
      tableName: 'roles', // Explicitly keep table name as 'roles'
      timestamps: true // Assuming you want timestamps
  });

  Role.associate = (models) => {
    // A Role can belong to many Users through the user_roles table
    // *** Access the User model using models.users ***
    Role.belongsToMany(models.users, { // Corrected from models.user to models.users
      through: "user_roles",
      foreignKey: "roleId",
      otherKey: "userId"
    });
  };

  return Role;
};
