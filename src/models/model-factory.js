import Model from './model';
import Event from './event';

/**
 * @typedef {import('./model').Model} Model
 * @typedef {import('./event').Event} Event
 */

/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE'} EventType 
 */

/**
 * @callback modelFactoryFunc
 * @param {*} args
 * @returns {Promise<Readonly<Model>>}
 */

/**
 * @callback eventFactoryFunc
 * @param {*} args
 * @returns {Promise<Readonly<Event>>}
 */

/**
 * @callback isValidFunc
 * @returns {Promise<boolean>}
 */

/**
 * @callback registerModel
 * @param {String} modelName
 * @param {modelFactoryFunc} factory
 */

/**
 * @callback registerEvent
 * @param {String} eventType
 * @param {String} modelName
 * @param {eventFactoryFunc} factory
 */

/**
 * @callback createModel
 * @param {String} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Model>>}
 */

/**
 * @callback createEvent
 * @param {EventType} eventType
 * @param {String} modelName
 * @param {*} args
 * @returns {Promise<Readonly<Event>>}
 */

/**
 * @typedef {Object} ModelFactory
 * @property {registerModel} registerModel
 * @property {registerEvent} registerEvent
 * @property {createModel} createModel
 * @property {createEvent} createEvent
 */

const ModelFactory = (() => {
  let instance;

  /**
   * @readonly
   * @enum {EventType}
   */
  const EventTypes = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }

  /**
   * @param {String} modelName
   */
  function checkModelName(modelName) {
    if (typeof modelName === 'string') {
      return modelName.toUpperCase();
    }
    throw new Error('modelName missing or invalid');
  }

  /**
   * 
   * @param {EventType} eventType 
   */
  function checkEventType(eventType) {
    if (typeof eventType === 'string') {
      eventType = eventType.toUpperCase();
      if (Object.values(EventTypes).includes(eventType)) {
        return eventType;
      }
    }
    throw new Error('eventType missing or invalid');
  }

  /**
   * 
   * @param {EventType} eventType 
   * @param {String} modelName 
   */
  function createEventName(eventType, modelName) {
    return checkEventType(eventType) + checkModelName(modelName);
  }

  /**
   * @returns {ModelFactory} instance
   * 
   */
  function init() {

    const modelFactories = new Map();
    const eventFactories = {
      [EventTypes.CREATE]: new Map(),
      [EventTypes.UPDATE]: new Map(),
      [EventTypes.DELETE]: new Map()
    }

    return {
      /**
       * Register a factory function to create the model `modelName`
       * @param {String} modelName 
       * @param {modelFactoryFunc} fnFactory
       * @param {isValidFunc} [fnIsValid]
       */
      registerModel: (modelName, fnFactory, fnIsValid = () => true) => {
        modelName = checkModelName(modelName);

        if (!modelFactories.has(modelName)
          && typeof fnFactory === 'function'
          && typeof fnIsValid === 'function') {
          modelFactories.set(modelName, { fnFactory, fnIsValid });
        }
      },

      /**
       * Register a factory function to create an event for the model `modelName`
       * @param {EventType} eventType type of event
       * @param {String} modelName model the event is about
       * @param {Function} fnFactory factory function
       */
      registerEvent: (eventType, modelName, fnFactory) => {
        modelName = checkModelName(modelName);
        eventType = checkEventType(eventType);

        if (typeof fnFactory === 'function') {
          eventFactories[eventType].set(modelName, fnFactory);
        }
      },

      /**
       * Call the factory function previously registered for `modelName`
       * @param {String} modelName 
       * @param {*} args
       * @returns {Promise<Readonly<Model>>} the model instance
       */
      createModel: async (modelName, args) => {
        modelName = checkModelName(modelName);

        if (modelFactories.has(modelName)) {
          const model = await Model.create({
            modelName: modelName,
            isValid: modelFactories.get(modelName).fnIsValid,
            factory: modelFactories.get(modelName).fnFactory,
            args: args
          });
          return Object.freeze(model);
        }
        throw new Error('unregistered model');
      },

      /**
       * Call factory function previously registered for `eventType` and `model`
       * @param {EventType} eventType
       * @param {String} modelName 
       * @param {*} args 
       * @returns {Promise<Readonly<Event>>} the event instance
       */
      createEvent: async (eventType, modelName, args) => {
        modelName = checkModelName(modelName);
        eventType = checkEventType(eventType);

        if (eventFactories[eventType].has(modelName)) {
          const event = await Event.create({
            factory: eventFactories[eventType].get(modelName),
            args: args,
            eventType: eventType,
            modelName: modelName
          });
          return Object.freeze(event);
        }
        throw new Error('unregistered model event');
      },
    }
  }

  return {
    /**
     * Get singleton
     * @returns {ModelFactory}
     */
    getInstance: () => {
      if (!instance) {
        instance = init();
      }
      return instance;
    },

    /**
     * @param {EventType} eventType
     * @param {String} modelName
     */
    getEventName: (eventType, modelName) => {
      return createEventName(eventType, modelName);
    },

    EventTypes
  }
})();



export default ModelFactory;


