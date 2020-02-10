const { Entity, asEntites } = require('./Models/entity');
const Model = require('./Models/model');
const AppUser = require('./AuthModels/AppUser');
const AppUserToAppRole = require('./AuthModels/AppUserToAppRole');

module.exports = {
  Entity: Entity,
  asEntites: asEntites,
  Model: Model,
  AppUser: AppUser,
  AppUserToAppRole: AppUserToAppRole
}