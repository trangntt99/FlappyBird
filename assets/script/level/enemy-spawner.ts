import MainControl, { GameStatus } from "../level/main-control";
import EnemyPathing from "./enemy-pathing";
const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemySpawner extends cc.Component {
  @property(cc.Prefab)
  enemyPb: cc.Prefab = null;

  @property(cc.Node)
  wayPoints: cc.Node[] = [null, null, null];

  mainControl: MainControl = null;
  numberOfEnemies: number = 3;
  spawnAllWavesTimer: number = 0;
  spawnAllEnemiesTimer: number = 0;
  listEnemyPathing: EnemyPathing[] = [];
  flag: boolean = true;

  onLoad() {
    this.mainControl =
      cc.Canvas.instance.getComponentInChildren("main-control");
  }

  update() {
    if (this.mainControl.gameStatus !== GameStatus.GamePlaying) {
      this.stopEnemies();
      this.flag = true;
    } else if (
      this.mainControl.gameStatus === GameStatus.GamePlaying &&
      this.flag
    ) {
      this.spawnAllWavesTimer = setInterval(() => {
        this.spawnAllEnemiesInWave();
      }, 3000);
      this.flag = false;
    }
  }

  spawnAllEnemiesInWave() {
    this.spawnAllEnemiesTimer = setInterval(() => {
      let enemy = cc.instantiate(this.enemyPb);
      this.node.getChildByName("Enemies").addChild(enemy);
    }, 500);

    setTimeout(() => {
      clearInterval(this.spawnAllEnemiesTimer);
    }, 500 * this.numberOfEnemies);
  }

  stopEnemies() {
    clearInterval(this.spawnAllEnemiesTimer);
    clearInterval(this.spawnAllWavesTimer);

    this.listEnemyPathing = this.node.getComponentsInChildren("enemy-pathing");
    if (this.listEnemyPathing.length > 0) {
      this.listEnemyPathing.forEach((enemyPathing) => {
        enemyPathing.stopMoveEnemies();
      });
    }
  }
}
