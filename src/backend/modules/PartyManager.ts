import { Socket } from 'socket.io';
import { Party } from './Party.js';
import { Player } from './Player.js';
import { Ship } from './Ship.js';
import { getRandomString } from './utils.js';

export class PartyManager {
  players: Player[] = [];
  parties: Party[] = [];

  waitingRandom: Player[] = [];
  waitingChallenge: Map<string, Player> = new Map();

  connection(socket: Socket) {
    let player = new Player(socket);
    this.players.push(player);

    const isFree = () => {
      if (this.waitingRandom.includes(player)) {
        return false;
      }

      const values = Array.from(this.waitingChallenge.values());

      if (values.includes(player)) {
        return false;
      }

      if (player.party) {
        return false;
      }

      return true;
    };

    socket.on('shipSet', (ships: Ship[]) => {
      if (!isFree()) {
        return;
      }

      player.battlefield.clear();
      for (const { size, direction, x, y } of ships) {
        const ship = new Ship(size, direction, x, y);
        player.battlefield.addShip(ship);
      }
    });

    socket.on('findRandomOpponent', () => {
      if (!isFree()) {
        return;
      }

      this.waitingRandom.push(player);
      player.emit('statusChange', 'randomFinding');

      if (this.waitingRandom.length >= 2) {
        const [player1, player2] = this.waitingRandom.splice(0, 2);
        const party = new Party(this.parties, player1, player2);
        this.parties.push(party);
      }
    });

    socket.on('challengeOpponent', (key = '') => {
      if (!isFree()) {
        return;
      }

      if (this.waitingChallenge.has(key)) {
        const opponent = this.waitingChallenge.get(key)!;
        this.waitingChallenge.delete(key);

        const party = new Party(this.parties, opponent, player);
        this.parties.push(party);
      } else {
        key = getRandomString(20);
        socket.emit('challengeOpponent', key);
        socket.emit('statusChange', 'waiting');

        this.waitingChallenge.set(key, player);
      }
    });

    socket.on('gaveup', () => {
      if (player.party) {
        player.party.gaveup(player);
      }

      if (this.waitingRandom.includes(player)) {
        const index = this.waitingRandom.indexOf(player);
        this.waitingRandom.splice(index, 1);
      }

      const values = Array.from(this.waitingChallenge.values());
      if (values.includes(player)) {
        const index = values.indexOf(player);
        const keys = Array.from(this.waitingChallenge.keys());
        const key = keys[index];
        this.waitingChallenge.delete(key);
      }
    });

    socket.on('addShot', (x: number, y: number) => {
      if (player.party) {
        player.party.addShot(player, x, y);
      }
    });
  }

  disconnect(socket: Socket) {
    const player = this.players.find((player) => player.socket === socket);

    if (!player) {
      return;
    }

    if (this.waitingRandom.includes(player)) {
      const index = this.waitingRandom.indexOf(player);
      this.waitingRandom.splice(index, 1);
    }

    const values = Array.from(this.waitingChallenge.values());
    if (values.includes(player)) {
      const index = values.indexOf(player);
      const keys = Array.from(this.waitingChallenge.keys());
      const key = keys[index];
      this.waitingChallenge.delete(key);
    }

    if (player.party) {
      const opponent = player === player.party.player1 ? player.party.player2 : player.party.player1;
      opponent.emit('statusChange', 'winner');
      player.party.stop();
    }

    const index = this.players.indexOf(player);
    this.players.splice(index, 1);
  }

  removeParty(party: Party) {
    if (!this.parties.includes(party)) {
      return false;
    }

    const index = this.parties.indexOf(party);
    this.parties.splice(index, 1);

    return true;
  }
}
