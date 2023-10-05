import './style.scss';

import { Application } from './modules/Application';
import { PreparationScene } from './modules/scenes/PreparationScene';
import { ComputerScene } from './modules/scenes/ComputerScene';

const app = new Application({
  preparation: PreparationScene,
  computer: ComputerScene,
  // online: OnlineScene,
});

app.start('preparation');
