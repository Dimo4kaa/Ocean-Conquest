import { Observer } from "./Observer.js";
import { Player } from "./Player.js";
import { Shot } from "./Shot.js";

export class Party extends Observer {
  player1: Player | null;
  player2: Player | null;

  turnPlayer: Player | null;
  play = true;

  get nextPlayer() {
    return this.turnPlayer === this.player1 ? this.player2 : this.player1;
  }

  constructor(player1: Player, player2: Player) {
    super();

		this.player1 = player1;
		this.player2 = player2;

    this.turnPlayer = player1;

    for (const player of [player1, player2]) {
      player.party = this;
      player.emit('statusChange', 'play');
    }

    this.turnUpdate();
  }

  turnUpdate() {
    this.player1!.emit('turnUpdate', this.player1 === this.turnPlayer);
    this.player2!.emit('turnUpdate', this.player2 === this.turnPlayer);
  }

  stop() {
    if (!this.play) {
      return;
    }

    this.play = false;
    this.dispatch();

    this.player1!.party = null;
    this.player2!.party = null;

    this.player1 = null;
    this.player2 = null;
  }

  gaveup(player: Player) {
    const { player1, player2 } = this;

    player1!.emit('statusChange', player1 === player ? 'loser' : 'winner');
    player2!.emit('statusChange', player2 === player ? 'loser' : 'winner');

    this.stop();
  }

  addShot(player: Player, x: number, y: number) {
    if (this.turnPlayer !== player || !this.play) {
      return;
    }

    const { player1, player2 } = this;
    const shot = new Shot(x, y);
    const result = this.nextPlayer!.battlefield.addShot(shot);

    if (result) {
      const player1Shots = player1!.battlefield.shots.map((shot) => ({
        x: shot.x,
        y: shot.y,
        variant: shot.variant,
      }));

      const player2Shots = player2!.battlefield.shots.map((shot) => ({
        x: shot.x,
        y: shot.y,
        variant: shot.variant,
      }));

      player1!.emit('setShots', player1Shots, player2Shots);
      player2!.emit('setShots', player2Shots, player1Shots);

      if (shot.variant === 'miss') {
        this.turnPlayer = this.nextPlayer;
        this.turnUpdate();
      }
    }

    if (player1!.battlefield.loser || player2!.battlefield.loser) {
      this.stop();

      player1!.emit('statusChange', player1!.battlefield.loser ? 'loser' : 'winner');

      player2!.emit('statusChange', player2!.battlefield.loser ? 'loser' : 'winner');
    }
  }

  sendMessage(message: any) {
    const { player1, player2 } = this;

    player1!.emit('message', message);
    player2!.emit('message', message);
  }

  reconnection(player: Player) {
    player.emit(
      'reconnection',
      player.battlefield.ships.map((ship) => ({
        size: ship.size,
        direction: ship.direction,
        x: ship.x,
        y: ship.y,
      })),
    );

    const player1Shots = this.player1!.battlefield.shots.map((shot) => ({
      x: shot.x,
      y: shot.y,
      variant: shot.variant,
    }));

    const player2Shots = this.player2!.battlefield.shots.map((shot) => ({
      x: shot.x,
      y: shot.y,
      variant: shot.variant,
    }));

    if (player === this.player1) {
      player.emit('setShots', player1Shots, player2Shots);
    } else {
      player.emit('setShots', player2Shots, player1Shots);
    }

    player.emit('statusChange', 'play');
    player.emit('turnUpdate', this.turnPlayer === player);

    if (!this.play) {
      player.emit('statusChange', player.battlefield.loser ? 'loser' : 'winner');
    }
  }
}
