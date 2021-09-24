import EnemySpawner from "./enemy-spawner";
const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyPathing extends cc.Component {
  enemySpawner: EnemySpawner = null;
  wayPointIndex: number = 0;
  moveTimer: number = 0;

  onLoad() {
    this.enemySpawner =
      cc.Canvas.instance.getComponentInChildren("enemy-spawner");

    this.node
      .getChildByName("Explosion")
      .getChildByName("Explosion_Particle").active = false;
  }

  start() {
    this.moveEnemies();
  }

  moveEnemies() {
    this.moveTimer = setInterval(() => {
      // if that is the last WayPoint, keep x-axis
      const x_Axis =
        this.wayPointIndex == this.enemySpawner.wayPoints.length - 1
          ? this.enemySpawner.wayPoints[this.wayPointIndex].position.x
          : this.enemySpawner.wayPoints[this.wayPointIndex].position.x +
            Math.random() * -20;

      cc.tween(this.node)
        .to(
          1,
          {
            position: new cc.Vec3(
              x_Axis,
              this.enemySpawner.wayPoints[this.wayPointIndex].position.y +
                Math.random() * 100
            ),
          },
          { easing: "sineOutIn" }
        )
        .start();

      this.wayPointIndex++;
    }, 1000);

    setTimeout(() => {
      clearInterval(this.moveTimer);
    }, 1200 * this.enemySpawner.wayPoints.length);
  }

  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    //if the enemy moves out of range of the background, it will die
    if (other.tag == 2) {
      this.node
        .getChildByName("Explosion")
        .getChildByName("Explosion_Particle").active = true;

      setTimeout(() => {
        this.node.destroy();
      }, 100);
    }
  }

  stopMoveEnemies() {
    cc.Tween.stopAll();
    clearInterval(this.moveTimer);

    setTimeout(() => {
      this.node?.destroy();
    }, 100);
  }
}
