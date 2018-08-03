const Sequelize = require('sequelize')
const db = require('../db')

const Class = db.define('class', {
  time: {
    type: Sequelize.TIME,
    allowNull: false
  },
  students: {
    type: Sequelize.ARRAY,
    defaultValue: []
  }
})

module.exports = Class
