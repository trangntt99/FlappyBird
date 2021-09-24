import LevelGame from "./level-game";
const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuGame extends cc.Component {
  @property(cc.Prefab)
  levelBtnPrefab: cc.Prefab = null;

  @property(LevelGame)
  levelGame: LevelGame[] = [null, null, null];

  @property(cc.Sprite)
  backGround: cc.Sprite = null;

  @property(cc.Node)
  selectLevel: cc.Node = null;

  @property(cc.Label)
  title: cc.Label = null;

  level: cc.Node[] = [null, null, null];
  currentLevel: number = -1;

  start() {
    this.createLevelBtn();

    //the first level always unlock
    if (this.level[0]) {
      this.unlockLevelBtn(this.level[0]);
    }
  }

  update(dt: number) {
    //If the previous level is completed, the next level will be unlocked
    const completedLevelString = cc.sys.localStorage.getItem("levelComplete");
    if (completedLevelString) {
      const completedLevel = completedLevelString >> 0;
      const levelUnlock = Math.min(completedLevel + 1, this.levelGame.length);
      for (let i = 1; i <= levelUnlock; i++) {
        this.unlockLevelBtn(this.level[i]);
      }
    }
  }

  createLevelBtn() {
    for (let i = 0; i < this.level.length; i++) {
      const levelBtn = cc.instantiate(this.levelBtnPrefab);
      const nodeParent = this.node.getChildByName("SelectLevel") || this.node;

      levelBtn.getComponentInChildren(cc.Label).string = `Level ${i + 1}`;
      levelBtn.position = new cc.Vec3(0, 32 - 80 * i);
      levelBtn.getChildByName("CheckComplete").active =
        this.checkCompleteLevel(i);
      levelBtn.getComponent(cc.Button).enabled = false;
      this.level[i] = levelBtn;

      this.eventButton(this.level[i], i);
      nodeParent.addChild(this.level[i]);
    }
  }

  checkCompleteLevel(index: number) {
    const levelComplete = cc.sys.localStorage.getItem("levelComplete");

    return levelComplete && index <= levelComplete;
  }

  eventButton(levelBtn: cc.Node, index: number) {
    const clickEventHandler = new cc.Component.EventHandler();
    clickEventHandler.target = this.node;
    clickEventHandler.component = "menu-game";
    clickEventHandler.handler = "loadLevel";
    clickEventHandler.customEventData = index.toString();

    const button = levelBtn.getComponent(cc.Button);
    button.clickEvents.push(clickEventHandler);
  }

  setActive(value: boolean) {
    this.backGround.node.active = value;
    this.selectLevel.active = value;
    this.title.node.active = value;
  }

  loadLevel(event: cc.Event, customEventData: string) {
    this.setActive(false);

    this.currentLevel = +customEventData;

    const levelGame = cc.instantiate(this.levelGame[0].levelGamePrefab);

    //add Prefab corresponding to current level
    const levelGamePb = this.levelGame[this.currentLevel].levelGamePrefab;
    if (levelGamePb && this.currentLevel > 0) {
      const nextLevel = cc.instantiate(levelGamePb);
      levelGame.addChild(nextLevel);
    }

    cc.Canvas.instance.node.addChild(levelGame);
  }

  backToMenu() {
    this.setActive(true);

    const levelComplete = cc.sys.localStorage.getItem("levelComplete");
    if (levelComplete) {
      for (let i = 0; i <= +levelComplete; i++) {
        this.level[i].getChildByName("CheckComplete").active = true;
      }
    }
  }

  backToHome() {
    cc.director.loadScene("Home");
  }

  unlockLevelBtn(levelNode: cc.Node) {
    if (levelNode) {
      levelNode.getComponent(cc.Button).enabled = true;
      levelNode.getChildByName("LockSprite").active = false;
    }
  }
}
