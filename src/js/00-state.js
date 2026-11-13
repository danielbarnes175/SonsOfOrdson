setup.data = {};
setup.stateSchemaVersion = 2;

setup.deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;

  Object.values(value).forEach((child) => setup.deepFreeze(child));
  return Object.freeze(value);
};

setup.registerDefinitions = (category, definitions) => {
  if (setup.data[category]) {
    throw new Error(`Definitions have already been registered for ${category}.`);
  }

  const registry = {};
  Object.entries(definitions).forEach(([id, definition]) => {
    registry[id] = setup.deepFreeze({
      ...definition,
      id,
    });
  });

  setup.data[category] = Object.freeze(registry);
  return setup.data[category];
};

setup.getDefinition = (category, id) => {
  const registry = setup.data[category];
  return registry && registry[id] ? registry[id] : null;
};

setup.ensureSystemState = () => {
  if (!State.variables.system) {
    State.variables.system = {
      nextEntityId: 1,
      schemaVersion: setup.stateSchemaVersion,
    };
  }
  return State.variables.system;
};

setup.createRuntimeInstance = (category, definitionId, prefix, runtimeState = {}) => {
  const definition = setup.getDefinition(category, definitionId);
  if (!definition) {
    throw new Error(`Unknown ${category} definition: ${definitionId}`);
  }

  const system = setup.ensureSystemState();
  const instance = {
    ...clone(runtimeState),
    definitionId,
    id: `${prefix}-${system.nextEntityId}`,
  };
  system.nextEntityId += 1;
  return instance;
};

State.variables.system = {
  nextEntityId: 1,
  schemaVersion: setup.stateSchemaVersion,
};
