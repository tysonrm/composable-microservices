import { withId, withTimestamp, utc } from './mixins';
import asyncPipe from '../lib/async-pipe';
import uuid from '../lib/uuid';
import log from '../lib/logger';

/**
 * @typedef {Object} Model
 * @property {String} id - unique id
 * @property {String} modelName - model name
 * @property {String} created - time created
 * @property {Function} isValid - check model is valid
 */

const Model = (() => {

  const Model = ({ factory, args, modelName, isValid = async () => true }) => {
    return Promise.resolve(
      factory(args)
    ).then(model => ({
      modelName: modelName,
      isValid: isValid,
      ...model
    }));
  }

  const makeModel = asyncPipe(
    Model,
    withTimestamp(utc),
    withId(uuid),
  );

  /**
   * 
   * @param {Model} model 
   */
  const validate = async model => {
    try {
      return await model.isValid();
    } catch (e) {
      log(e);
    }
    return false;
  }

  return {
    /**
     * 
     * @param {{factory: Function, args: any, modelName: String, isValid?: Function}} options 
     * @returns {Promise<Model>}
     */
    create: async function (options) {
      return makeModel(options);
    },

    validate
  }
})();

export default Model;

