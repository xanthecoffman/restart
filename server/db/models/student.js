const crypto = require('crypto')
const Sequelize = require('sequelize')
const db = require('../db')

const Student = db.define('student', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    // Making `.password` act like a func hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    get() {
      return () => this.getDataValue('password')
    }
  },
  salt: {
    type: Sequelize.STRING,
    // Making `.salt` act like a function hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    get() {
      return () => this.getDataValue('salt')
    }
  },
  googleId: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  subjects: {
    type: Sequelize.ARRAY,
    defaultValue: []
  }
})

module.exports = Student

/**
 * instanceMethods
 */
Student.prototype.correctPassword = function(candidatePwd) {
  return Student.encryptPassword(candidatePwd, this.salt()) === this.password()
}

/**
 * classMethods
 */
Student.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64')
}

Student.encryptPassword = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
}

/**
 * hooks
 */
const setSaltAndPassword = student => {
  if (student.changed('password')) {
    student.salt = Student.generateSalt()
    student.password = Student.encryptPassword(
      student.password(),
      student.salt()
    )
  }
}

Student.beforeCreate(setSaltAndPassword)
Student.beforeUpdate(setSaltAndPassword)
