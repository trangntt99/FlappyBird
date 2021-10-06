import MenuGame from "../game-scene/menu-game";
import { SoundType } from "./audio-control";
import MainControl from "./main-control";
import { GameStatus } from "./main-control";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BirdControl extends cc.Component {
  @property(cc.SpriteFrame)
  spfBird: cc.SpriteFrame[] = [null, null, null, null];

  //speed of bird
  moveSpeed: number = 0;
  mainControl: MainControl = null;
  menuGame: MenuGame = null;
  passTimer: number = 0;

  onLoad() {
    cc.Canvas.instance.node.on(
      cc.Node.EventType.TOUCH_START,
      this.onTouchStart,
      this
    );

    this.mainControl =
      cc.Canvas.instance.getComponentInChildren("main-control");

    this.menuGame = cc.Canvas.instance.getComponent("menu-game");

    const indexItemString = cc.sys.localStorage.getItem("item");
    if (indexItemString) {
      const indexItem = indexItemString >> 0;
      this.node.getComponent(cc.Sprite).spriteFrame = this.spfBird[indexItem];
      const clips = this.node.getComponent(cc.Animation).getClips();
      this.node.getComponent(cc.Animation).play(clips[indexItem].name);
      this.node.width = 36;
      this.node.height = 26;
    }
  }

  update(dt: number) {
    //if gameStatus is not GamePlaying, stop movement of bird
    if (this.mainControl.gameStatus !== GameStatus.GamePlaying) {
      return;
    }

    this.moveSpeed -= 0.05;
    this.node.y += this.moveSpeed;

    let tiltAngle = -(this.moveSpeed / 2) * 30;
    if (tiltAngle >= 30) {
      tiltAngle = 30;
    }
    this.node.angle = -tiltAngle;
  }

  onTouchStart() {
    const levels = this.menuGame.levels[this.menuGame.currentLevel];
    this.moveSpeed = levels.speedOfBird;

    this.mainControl.audioControl.playAudio(SoundType.AudioFly);
  }

  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    //when the bird collides with the pipe, GameOver is displayed
    if (other.tag === 0) {
      this.moveSpeed = 0;
      clearTimeout(this.passTimer);
      this.mainControl.gameOver();
    } else if (other.tag === 1) {
      this.passTimer = setTimeout(() => {
        this.mainControl.audioControl.playAudio(SoundType.AudioScore);
        this.mainControl.gameScore++;

        const completedCondition =
          this.menuGame.levels[this.menuGame.currentLevel].completionLevel;

        this.mainControl.progressBar.getComponent(cc.ProgressBar).progress =
          this.mainControl.gameScore / completedCondition;

        if (this.mainControl.gameScore == completedCondition) {
          this.mainControl.completeLevel();
        }
      }, 1000);
    }
  }
}
