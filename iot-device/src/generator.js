const faker = require('faker');

let lastObservation = {
  device: faker.datatype.uuid(),
  cpu: 20,
  cpuTemp: 67.4,
  memory: 200427,
  status: 'ok',
};

exports.getName = () => lastObservation.device;

exports.generate = () => ({
  device: lastObservation.device,
  cpu: faker.datatype.float({ min: lastObservation.cpu - 2, max: lastObservation.cpu + 2, precision: 1 }),
  cpuTemp: faker.datatype.float({
    min: lastObservation.cpuTemp - 0.4,
    max: lastObservation.cpuTemp + 0.4,
    precision: 1,
  }),
  memory: faker.datatype.number({ min: lastObservation.memory - 100, max: lastObservation.memory + 100 }),
  status: 'ok',
  timestamp: Date.now(),
});
