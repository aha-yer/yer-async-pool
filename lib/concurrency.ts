/**
 * 分批次加入待处理异步请求_1
 */
class Scheduler {
  private queue: (() => Promise<unknown>)[];
  private max: number;
  private index: number;
  constructor(n: number) {
    this.queue = [];
    this.max = n;
    this.index = 0;
    setTimeout(() => this.run(), 0); // 使用箭头函数绑定this
  }
  add(promiseFunc: () => Promise<unknown>) {
    this.queue.push(promiseFunc);
    this.run();
  }
  run() {
    while (this.index < this.queue.length && this.max > 0) {
      this.max--;
      this.queue[this.index++]().then(() => {
        this.max++;
        this.run();
      });
    }
  }
}
const scheduler = new Scheduler(2);
const delay = (time: number) => new Promise((r) => setTimeout(r, time));
const addTask = (time: number, order: number) => {
  scheduler.add(async () => {
    await delay(time);
    console.log(order);
  });
};
addTask(1000, 1);
addTask(500, 2);
addTask(300, 3);
addTask(400, 4);
// setTimeout(() => {
//   addTask(100, 5);
// }, 100);
// log: 2 3 1 4
