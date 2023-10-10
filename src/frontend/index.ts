import './style.scss';

import { Application } from './modules/Application';

const app = new Application();
//перенести в конец конструктора Application?
app.start('preparation');
