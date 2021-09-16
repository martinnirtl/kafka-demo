const protobuf = require('protobufjs');
const axios = require('axios');
const { logger } = require('./logging');

const PROTO_PATH = __dirname + '/../protos/device.proto';
const root = protobuf.loadSync(PROTO_PATH);
const Payload = root.lookupType('device.Payload');

const transform = ({ device, cpu, cpuTemp, memory, status, timestamp }) => {
  logger.debug('transforming to line protocol...');
  const payload = [
    `iot.device.cpu,device=${device},status=${status} ${cpu} ${timestamp}`,
    `iot.device.cpu_temp,device=${device},status=${status} ${cpuTemp} ${timestamp}`,
    `iot.device.memory,device=${device},status=${status} ${memory} ${timestamp}`,
  ];

  return payload;
};

exports.eachMessage = async ({ topic, partition, message }) => {
  logger.info(`message received on ${topic} via partition ${partition}`);

  const payload = Payload.decode(message.value);
  const ingest = transform(payload).join('\n');

  try {
    logger.debug({ ingest }, 'ingesting metrics...');
    const { data } = await axios.post(`${process.env.DT_TENANT_BASE_URL}/api/v2/metrics/ingest`, ingest, {
      headers: {
        'content-type': 'text/plain',
        Authorization: `Api-Token ${process.env.DT_API_TOKEN}`,
      },
    });

    logger.info(data);
  } catch (error) {
    logger.error(error);
  }
};
