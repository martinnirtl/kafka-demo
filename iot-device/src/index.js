const { Kafka } = require('kafkajs');
const exitHook = require('async-exit-hook');
const protobuf = require('protobufjs');
const { logger } = require('./logging');
const { getName, generate } = require('./generator');

const PROTO_PATH = __dirname + '/../protos/device.proto';
const root = protobuf.loadSync(PROTO_PATH);
const Payload = root.lookupType('device.Payload');

const clientId = getName();

const kafka = new Kafka({
  logLevel: 0, // disable logging
  clientId,
  brokers: (process.env.KAFKA_BROKERS || '').replace(/\s/, '').split(','),
});

const producer = kafka.producer();

const run = async () => {
  logger.info(`connecting to kafka...`);
  await producer.connect();

  setInterval(async () => {
    const payload = generate();

    logger.info(payload, 'sending observation...');

    try {
      await producer.send({
        topic: process.env.KAFKA_TOPIC,
        messages: [{ value: Payload.encode(payload).finish() }],
      });
    } catch (error) {
      logger.error(error);
    }
  }, parseInt(process.env.INTERVAL || 1000));
};

run().catch(logger.error);

exitHook(async () => {
  logger.info('going down...');

  await producer.disconnect();
});
