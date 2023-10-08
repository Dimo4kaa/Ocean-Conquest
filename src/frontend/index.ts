import './style.scss';

import { Application } from './modules/Application';
import { PreparationScene } from './modules/scenes/PreparationScene';
import { ComputerScene } from './modules/scenes/ComputerScene';
import { OnlineScene } from './modules/scenes/OnlineScene';

const app = new Application({
  preparation: PreparationScene,
  computer: ComputerScene,
  online: OnlineScene,
});
//перенести в конец конструктора Application?
app.start('preparation');
