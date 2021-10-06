const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopControl extends cc.Component {
  listItem: cc.Sprite[] = [];
  traces: number[] = [];

  onLoad() {
    this.listItem = this.node
      .getChildByName("view")
      ?.getChildByName("content")
      ?.getComponentsInChildren(cc.Sprite);

    for (let i = 0; i < this.listItem.length; i++) {
      this.traces[i] = 0;
    }

    const indexItemString = cc.sys.localStorage.getItem("item");
    if (indexItemString) {
      const indexItem = indexItemString >> 0;
      this.traces[indexItem] = 1;
      cc.tween(this.listItem[indexItem].node).to(1, { scale: 1.5 }).start();
    }
  }

  start() {
    this.addEventButton();
  }

  addEventButton() {
    for (let i = 0; i < this.listItem.length; i++) {
      this.listItem[i].node.getComponent(cc.Button).node.on(
        cc.Node.EventType.TOUCH_START,
        () => {
          this.handleEvenButton(i);
        },
        this
      );
    }
  }

  handleEvenButton(index: number) {
    if (this.traces[index] == 0) {
      cc.sys.localStorage.setItem("item", index);
      cc.tween(this.listItem[index].node).to(1, { scale: 1.5 }).start();
      for (let i = 0; i < this.traces.length; i++) {
        if (this.traces[i] == 1) {
          this.traces[i] == 0;
          cc.tween(this.listItem[i].node).to(1, { scale: 1 }).start();
        }
      }
      this.traces[index] = 1;
    } else {
      this.traces[index] = 0;
      cc.tween(this.listItem[index].node).to(1, { scale: 1 }).start();
      cc.sys.localStorage.removeItem("item");
    }
  }

  HandleBackBtn() {
    cc.director.loadScene("Home");
  }
}
