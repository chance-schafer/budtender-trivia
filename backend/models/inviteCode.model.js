// d:\Base_Directory_Storage\Coding\dispensary-app\backend\models\inviteCode.model.js
module.exports = (sequelize, Sequelize) => {
  const InviteCode = sequelize.define("invite_codes", { // Ensure table name matches your DB
      code: {
          type: Sequelize.STRING,
          allowNull: false, // Code cannot be empty
          unique: true      // Code must be unique in the database
      },
      storeLocation: {
          type: Sequelize.STRING,
          allowNull: false // **** Crucial: If this is false, it MUST be provided when creating ****
                           // If it can sometimes be null, set allowNull: true
      },
      isReusable: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false // Should always have a true/false value
      },
      maxUses: {
          type: Sequelize.INTEGER,
          allowNull: true // Allow null (e.g., if not reusable, or reusable infinitely)
      },
      usesCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false // Should always have a count, starting at 0
      },
      // Optional: Track who created the code (requires req.userId from middleware)
      // createdBy: {
      //    type: Sequelize.INTEGER,
      //    allowNull: true, // Or false if you always want to track it
      //    references: {
      //        model: 'users', // Assumes your users table is named 'users'
      //        key: 'id'
      //    }
      // },
      // Optional: Add an expiration date for codes
      // expiresAt: {
      //    type: Sequelize.DATE,
      //    allowNull: true
      // }
  });

  // Optional: Add associations if needed (e.g., linking to the user who created it)
  // InviteCode.associate = models => {
  //     InviteCode.belongsTo(models.user, {
  //         foreignKey: 'createdBy',
  //         as: 'creator'
  //     });
  // };

  return InviteCode;
};
