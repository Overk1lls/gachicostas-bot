import { DIContainer } from './di/container';

const start = () => {
  DIContainer.createDependencies();
};

start();
