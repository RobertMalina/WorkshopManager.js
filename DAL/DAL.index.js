const { Entity, flatten, asModel } = require('./Models/entity');
const { Model, isModel } = require('./Models/model');
const AppUser = require('./AuthModels/AppUser');
const AppUserToAppRole = require('./AuthModels/AppUserToAppRole');

module.exports = {
  Entity: Entity,
  flatten: flatten,
  asModel: asModel,
  Model: Model,
  isModel: isModel,
  AppUser: AppUser,
  AppUserToAppRole: AppUserToAppRole
}