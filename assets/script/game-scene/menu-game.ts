import LevelGame from "./level-game";
const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuGame extends cc.Component {
  @property(cc.Prefab)
  nodeParentPb: cc.Prefab = null;

  @property(cc.Prefab)
  levelBtnPrefab: cc.Prefab = null;

  @property(LevelGame)
  levels: LevelGame[] = [];

  @property(cc.Sprite)
  backGround: cc.Sprite = null;

  @property(cc.Node)
  selectLevel: cc.Node = null;

  @property(cc.Label)
  title: cc.Label = null;

  @property(cc.Button)
  nextBtn: cc.Button = null;

  @property(cc.Button)
  previousBtn: cc.Button = null;

  level: cc.Node[] = [];
  currentLevel: number = -1;
  recordsPerPage: number = 3;
  currentPage: number = 1;

  onLoad() {
    this.previousBtn.node.active = false;
  }

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
      const levelUnlock = Math.min(completedLevel + 1, this.levels.length);
      for (let i = 0; i <= levelUnlock; i++) {
        this.unlockLevelBtn(this.level[i]);
      }
    }
  }

  createLevelBtn() {
    if (this.levels.length <= this.recordsPerPage) {
      this.nextBtn.node.active = false;
    }

    const firstIndex = (this.currentPage - 1) * this.recordsPerPage;
    const records = Math.min(
      this.currentPage * this.recordsPerPage,
      this.levels.length
    );
    let count = 0;

    for (let i = firstIndex; i < records; i++) {
      const levelBtn = cc.instantiate(this.levelBtnPrefab);
      const nodeParent = this.node.getChildByName("SelectLevel") || this.node;

      levelBtn.getComponentInChildren(cc.Label).string = `Level ${i + 1}`;

      //align yAxis
      levelBtn.position = new cc.Vec3(0, 32 - 80 * count++);
      if (count >= 3) {
        count = 0;
      }

      levelBtn.getChildByName("CheckComplete").active =
        this.checkCompleteLevel(i);
      levelBtn.getComponent(cc.Button).enabled = false;

      this.level[i] = levelBtn;
      this.eventButton(this.level[i], i);
      nodeParent.addChild(this.level[i]);
    }
  }

  hideLevelButton() {
    const firstIndex = (this.currentPage - 1) * this.recordsPerPage;
    for (let i = firstIndex; i < this.currentPage * this.recordsPerPage; i++) {
      if (this.level[i]) {
        this.level[i].active = false;
      }
    }
  }

  calculateNumberOfPages() {
    return Math.ceil(this.levels.length / this.recordsPerPage);
  }

  previousPage() {
    console.log("page: " + this.currentPage);
    if (this.currentPage > 1) {
      this.hideLevelButton();
      this.currentPage--;
      this.createLevelBtn();
      this.nextBtn.node.active = true;

      if (this.currentPage <= 1) {
        this.previousBtn.node.active = false;
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.calculateNumberOfPages()) {
      this.hideLevelButton();
      this.currentPage++;
      this.createLevelBtn();
      this.previousBtn.node.active = true;

      if (this.currentPage >= this.calculateNumberOfPages()) {
        this.nextBtn.node.active = false;
      }
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

    const levels = cc.instantiate(this.nodeParentPb);

    //add Prefab corresponding to current level
    const levelsPb = this.levels[this.currentLevel].levelsPrefab;
    if (levelsPb) {
      const nextLevel = cc.instantiate(levelsPb);
      levels.addChild(nextLevel);
    }

    cc.Canvas.instance.node.addChild(levels);
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
