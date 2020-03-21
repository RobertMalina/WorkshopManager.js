const { Entity, digest, asModel } = require('./Models/entity');
const { Model, isModel } = require('./Models/model');
const AppUser = require('./AuthModels/AppUser');
const AppUserToAppRole = require('./AuthModels/AppUserToAppRole');

module.exports = {
  Entity: Entity,
  digest: digest,
  asModel: asModel,
  Model: Model,
  isModel: isModel,
  AppUser: AppUser,
  AppUserToAppRole: AppUserToAppRole,
};
