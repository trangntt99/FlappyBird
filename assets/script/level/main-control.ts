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

  menuGame: MenuGame = null;
  enemies: cc.Node = null;
  winGame: cc.Node = null;

  lbTitle: cc.Label = null;
  spGameOver: cc.Sprite = null;
  startBtn: cc.Button = null;
  backBtn: cc.Button = null;
  progressBar: cc.Sprite = null;

  pipe: cc.Node[] = [null, null, null];
  minY: number = -120;
  maxY: number = 120;
  gameScore: number = 0;

  //set GameStatus
  gameStatus: GameStatus = GameStatus.GameStart;

  onLoad() {
    //open Collision System
    var collisionManager = cc.director.getCollisionManager();
    collisionManager.enabled = true;

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

    //find winGame node and disabled
    this.winGame = this.node.getChildByName("WinGame");
    this.winGame.active = false;

    this.menuGame = cc.Canvas.instance.getComponent("menu-game");
  }

  start() {
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
      this.spBg[i].node.x -= 1.0;
      if (this.spBg[i].node.x <= -288) {
        this.spBg[i].node.x = 288;
      }
    }
  }

  movePipes() {
    for (let i = 0; i < this.pipe.length; i++) {
      this.pipe[i].x -= 1.0;

      if (this.pipe[i].x <= -170) {
        this.pipe[i].x = 430;
        this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
      }
    }
  }

  gameOver() {
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
    cc.sys.localStorage.setItem("levelComplete", this.menuGame.currentLevel);

    //display WinGame node
    this.winGame.active = true;

    //if it's last level, disable Nextlevel button
    if (this.menuGame.currentLevel >= this.menuGame.levelGame.length - 1) {
      this.winGame
        .getChildByName("NextLevelBtn")
        .getComponent(cc.Button).node.active = false;
    }

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

    //show progress bar
    this.progressBar.node.active = true;

    //set progress to 0 when start
    this.progressBar.getComponent(cc.ProgressBar).progress = 0;

    //set game status to playting
    this.gameStatus = GameStatus.GamePlaying;

    //hide gameOver node
    this.spGameOver.node.active = false;

    //reset pipes
    for (let i = 0; i < this.pipe.length; i++) {
      this.pipe[i].x = 170 + 200 * i;
      this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
    }

    //reset angle & position of bird
    const bird = this.node.getChildByName("Bird");
    bird.y = 0;
    bird.angle = 0;

    this.gameScore = 0;
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
      this.menuGame.levelGame[this.menuGame.currentLevel].levelGamePrefab;
    if (childNode) {
      this.node.removeChild(this.node.getChildByName(childNode.name));
    }

    //when click NextLevel Btn, currentLevel plus 1
    this.menuGame.currentLevel++;

    //add next level node
    const nextLevelPb =
      this.menuGame.levelGame[this.menuGame.currentLevel].levelGamePrefab;
    if (nextLevelPb) {
      const nextLevelGame = cc.instantiate(nextLevelPb);
      this.node.addChild(nextLevelGame);
    }

    //show title label
    this.lbTitle.node.active = true;

    //show start button
    this.startBtn.node.active = true;

    //show back button
    this.backBtn.node.active = true;
  }
}
