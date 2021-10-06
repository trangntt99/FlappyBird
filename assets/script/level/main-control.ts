import AudioControl from "./audio-control";
import { SoundType } from "./audio-control";
import MenuGame from "../game-scene/menu-game";
const { ccclass, property } = cc._decorator;

export enum GameStatus {
  GameStart = 0,
  GamePlaying,
  GameOver,
  GameComplete,
}

@ccclass
export default class MainControl extends cc.Component {
  @property(cc.Sprite)
  spBg: cc.Sprite[] = [null, null];

  @property(cc.Prefab)
  pipePrefab: cc.Prefab = null;

  @property(AudioControl)
  audioControl: AudioControl = null;

  @property(cc.Node)
  winGame: cc.Node = null;

  menuGame: MenuGame = null;
  enemies: cc.Node = null;
  lbTitle: cc.Label = null;
  spGameOver: cc.Sprite = null;
  startBtn: cc.Button = null;
  backBtn: cc.Button = null;
  progressBar: cc.Sprite = null;
  pipe: cc.Node[] = [null, null, null];
  minY: number = -100;
  maxY: number = 100;
  gameScore: number = 0;
  activeTimer: number = 0;
  restOfPipesToMoveUpDown: number = 0;
  movePipesUpDownContinue: boolean = false;

  //set GameStatus
  gameStatus: GameStatus = GameStatus.GameStart;

  onLoad() {
    //open Collision System
    var collisionManager = cc.director.getCollisionManager();
    collisionManager.enabled = true;

    //disable explosionParticle
    this.node
      .getChildByName("Bird")
      .getChildByName("Explosion")
      .getChildByName("Explosion_Particle").active = false;

    //find Title label
    this.lbTitle = this.node.getChildByName("Title").getComponent(cc.Label);

    //find GameOver and disabled
    this.spGameOver = this.node
      .getChildByName("GameOver")
      .getComponent(cc.Sprite);
    this.spGameOver.node.active = false;

    //find start button
    this.startBtn = this.node
      .getChildByName("StartBtn")
      .getComponent(cc.Button);
    this.startBtn.node.on(
      cc.Node.EventType.TOUCH_END,
      this.onTouchStartBtn,
      this
    );

    //find back button
    this.backBtn = this.node.getChildByName("BackBtn").getComponent(cc.Button);
    this.backBtn.node.on(
      cc.Node.EventType.TOUCH_END,
      this.onTouchBackBtn,
      this
    );

    //find progress bar and disabled
    this.progressBar = this.node
      .getChildByName("ProgressBar")
      .getComponent(cc.Sprite);
    this.progressBar.node.active = false;

    this.menuGame = cc.Canvas.instance.getComponent("menu-game");
  }

  start() {
    this.setBackground();
    this.createPipes();
  }

  update(dt: number) {
    if (this.gameStatus !== GameStatus.GamePlaying) {
      return;
    }

    this.moveBackground();
    this.movePipes();
  }

  createPipes() {
    for (let i = 0; i < this.pipe.length; i++) {
      let pipeNode = cc.instantiate(this.pipePrefab);
      pipeNode.x = 170 + 200 * i;
      pipeNode.y = this.minY + Math.random() * (this.maxY - this.minY);

      this.pipe[i] = pipeNode;

      let nodeParent = this.node.getChildByName("Pipe") || this.node;
      nodeParent.addChild(this.pipe[i]);
    }
  }

  moveBackground() {
    for (let i = 0; i < this.spBg.length; i++) {
      this.spBg[i].node.x -=
        this.menuGame.levels[this.menuGame.currentLevel].moveSpeed;
      if (this.spBg[i].node.x <= -288) {
        this.spBg[i].node.x = 288;
      }
    }
  }

  movePipes() {
    for (let i = 0; i < this.pipe.length; i++) {
      this.pipe[i].x -=
        this.menuGame.levels[this.menuGame.currentLevel].moveSpeed;

      if (this.pipe[i].x <= -170) {
        this.pipe[i].x = 430;
        this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);

        if (this.restOfPipesToMoveUpDown > 0) {
          this.movePipeUpDown(i);
          this.restOfPipesToMoveUpDown--;
        }
      }
    }
  }

  resetPositionUpPipeDownPipe() {
    for (let i = 0; i < this.pipe.length; i++) {
      this.pipe[i].getChildByName("Up").y = -240;
      this.pipe[i].getChildByName("Down").y = 240;
    }
  }

  movePipeUpDown(index: number) {
    const moveUpDown = ["Up", "Down"];
    const randomIndex = Math.floor(Math.random() * moveUpDown.length);
    const yAxis = this.pipe[index].getChildByName(moveUpDown[randomIndex]).y;
    const yMoveUp = moveUpDown[randomIndex] == "Up" ? yAxis + 20 : yAxis - 20;
    const yMoveDown = moveUpDown[randomIndex] == "Up" ? yAxis - 20 : yAxis + 20;

    cc.tween(this.pipe[index].getChildByName(moveUpDown[randomIndex]))
      .repeat(
        5 + index,
        cc
          .tween()
          .to(1, {
            position: new cc.Vec3(
              this.pipe[index].getChildByName(moveUpDown[randomIndex]).x,
              yMoveUp
            ),
          })
          .to(1, {
            position: new cc.Vec3(
              this.pipe[index].getChildByName(moveUpDown[randomIndex]).x,
              yMoveDown
            ),
          })
      )
      .call(() => {
        this.pipe[index].getChildByName("Up").y = -240;
        this.pipe[index].getChildByName("Down").y = 240;
      })
      .start();
  }

  gameOver() {
    //explosion when bird died
    const explosionParticle = this.node
      .getChildByName("Bird")
      .getChildByName("Explosion")
      .getChildByName("Explosion_Particle");
    explosionParticle.active = true;

    this.activeTimer = setTimeout(() => {
      console.log("activeTimer");
      explosionParticle.active = false;
      this.node.getChildByName("Bird").active = false;
    }, 600);

    cc.Tween.stopAll();
    this.resetPositionUpPipeDownPipe();

    this.spGameOver.node.active = true;

    //when game over, show start button
    this.startBtn.node.active = true;

    //when game over, show back button
    this.backBtn.node.active = true;

    //set status to gameover
    this.gameStatus = GameStatus.GameOver;

    //display audioDie when game over
    this.audioControl.playAudio(SoundType.AudioDie);
  }

  completeLevel() {
    //save the completed level
    const completedLevel = +cc.sys.localStorage.getItem("levelComplete");
    if (completedLevel <= this.menuGame.currentLevel) {
      cc.sys.localStorage.setItem("levelComplete", this.menuGame.currentLevel);
    }

    //active WinGame node
    this.winGame.active = true;

    //firework when complete level
    this.winGame
      .getChildByName("Congratulation")
      .getComponent(cc.Animation)
      .play();

    //if it's last level, disable Nextlevel button
    if (this.menuGame.currentLevel >= this.menuGame.levels.length - 1) {
      this.winGame
        .getChildByName("NextLevelBtn")
        .getComponent(cc.Button).node.active = false;
    }

    cc.Tween.stopAll();
    this.resetPositionUpPipeDownPipe();

    //set status to game complete
    this.gameStatus = GameStatus.GameComplete;
  }

  onTouchStartBtn() {
    //hide title label
    this.lbTitle.node.active = false;

    //hide start button
    this.startBtn.node.active = false;

    //hide back button
    this.backBtn.node.active = false;

    //clear activeTimer & hide explosion particle
    clearTimeout(this.activeTimer);
    this.node
      .getChildByName("Bird")
      .getChildByName("Explosion")
      .getChildByName("Explosion_Particle").active = false;

    //find bird & active
    this.node.getChildByName("Bird").active = true;

    //show progress bar
    this.progressBar.node.active = true;

    //set progress to 0 when start
    this.progressBar.getComponent(cc.ProgressBar).progress = 0;

    //set game status to playting
    this.gameStatus = GameStatus.GamePlaying;

    //hide gameOver node
    this.spGameOver.node.active = false;

    this.resetPipes();
    this.resetAngleAndPositionOfBird();

    this.gameScore = 0;

    // move pipes up down for the first time
    this.movePipesUpDownContinue = false;
    const numberOfPipesToMoveUpDown =
      +this.menuGame.levels[this.menuGame.currentLevel]
        .numberOfPipesToMoveUpDown;
    if (numberOfPipesToMoveUpDown > 0) {
      const rangeOfMove = Math.min(numberOfPipesToMoveUpDown, this.pipe.length);
      for (let i = 0; i < rangeOfMove; i++) {
        this.movePipeUpDown(i);
      }
      this.restOfPipesToMoveUpDown =
        numberOfPipesToMoveUpDown > this.pipe.length
          ? numberOfPipesToMoveUpDown - this.pipe.length
          : 0;
    }
  }

  resetPipes() {
    for (let i = 0; i < this.pipe.length; i++) {
      this.pipe[i].x = 170 + 200 * i;
      this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
    }
  }

  resetAngleAndPositionOfBird() {
    const bird = this.node.getChildByName("Bird");
    bird.y = 0;
    bird.angle = 0;
  }

  onTouchBackBtn() {
    this.gameStatus = GameStatus.GameStart;

    this.node.destroy();
    this.menuGame.backToMenu();
  }

  onTouchNextLevel() {
    //hide WinGame node
    this.winGame.active = false;

    //remove previous level node
    let childNode =
      this.menuGame.levels[this.menuGame.currentLevel].levelsPrefab;
    if (childNode) {
      this.node.removeChild(this.node.getChildByName(childNode.name));
    }

    //when click NextLevel Btn, currentLevel plus 1
    this.menuGame.currentLevel++;

    //add next level node
    const nextLevelPb =
      this.menuGame.levels[this.menuGame.currentLevel].levelsPrefab;
    if (nextLevelPb) {
      const nextLevelGame = cc.instantiate(nextLevelPb);
      this.node.addChild(nextLevelGame);
    }

    this.setBackground();

    //show title label
    this.lbTitle.node.active = true;

    //show start button
    this.startBtn.node.active = true;

    //show back button
    this.backBtn.node.active = true;

    this.resetPipes();
    this.resetAngleAndPositionOfBird();

    this.gameScore = 0;
    this.progressBar.getComponent(cc.ProgressBar).progress = this.gameScore;

    //hide progress bar
    this.progressBar.node.active = false;
  }

  setBackground() {
    if (this.menuGame.levels[this.menuGame.currentLevel].spfBg) {
      for (let i = 0; i < this.spBg.length; i++) {
        this.spBg[i].spriteFrame =
          this.menuGame.levels[this.menuGame.currentLevel].spfBg;
        this.spBg[i].node.width = 288;
        this.spBg[i].node.height = 512;
      }
    }
  }
}
