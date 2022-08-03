/**
 * 一次性加入待处理异步请求
 */
function asyncPool1(poolLimit, iterable, iteratorFn) {
  let i = 0;
  const ret = [];
  const executing = new Set();

  const enqueue = function () {
    if (i === iterable.length) {
      return Promise.resolve();
    }
    const item = iterable[i++];

    const p = Promise.resolve().then(() => iteratorFn(item, iterable));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);

    let r = Promise.resolve();
    if (executing.size >= poolLimit) {
      /**
       * 用 Promise.race() 达到暂停后续 then 的目的
       * 即，暂停后续函数的递归
       */
      r = Promise.race(executing);
    }
    return r.then(() => enqueue());
  };

  return enqueue().then(() => Promise.all(ret));
}

function asyncPool2(poolLimit, array, iteratorFn) {
  const arrayCopy = [...array];
  if (arrayCopy.length <= poolLimit) {
    const promiseArray = array.map((urlId) => iteratorFn(urlId));
    return Promise.all(promiseArray);
  }

  const promiseArray = arrayCopy
    .splice(0, poolLimit)
    .map((urlId) => iteratorFn(urlId));
  arrayCopy
    .reduce(
      (prePromise, urlId) =>
        prePromise
          .then(() => Promise.race(promiseArray))
          .catch((error) => console.log(error))
          .then((resolvedId) => {
            let resolvedIdPosition = promiseArray.findIndex(
              (id) => resolvedId === id
            );
            promiseArray.splice(resolvedIdPosition, 1);
            promiseArray.push(iteratorFn(urlId));
          }),
      Promise.resolve()
    )
    .then(() => Promise.all(promiseArray));
}

// function asyncPool3(fn, arr, limit = 10) {
//   let args = [...arr]; //不修改原参数数组
//   let results = []; //存放最终结果
//   let runningCount = 0; //正在运行的数量
//   let resultIndex = 0; //结果的下标，用于控制结果的顺序
//   let resultCount = 0; //结果的数量

//   return new Promise((resolve) => {
//     function run() {
//       while (runningCount < limit && args.length > 0) {
//         runningCount++;
//         ((i) => {
//           //闭包用于保存结果下标，便于在resolve时把结果放到合适的位置
//           let v = args.shift();
//           console.log("正在运行" + runningCount);
//           fn(v)
//             .then(
//               (val) => {
//                 results[i] = val;
//               },
//               () => {
//                 throw new Error(`An error occurred: ${v}`);
//               }
//             )
//             .finally(() => {
//               runningCount--;
//               resultCount++;
//               if (resultCount === arr.length) {
//                 //这里之所以用resultCount做判断，而不用results的长度和args的长度，是因为这两个都不准确
//                 resolve(results);
//               } else {
//                 run();
//               }
//             });
//         })(resultIndex++);
//       }
//     }
//     run();
//   });
// }

function asyncPool3(fn, arr, limit = 10) {
  const ret = [];
  let index = 0;
  return new Promise((resolve) => {
    const run = () => {
      while (index < arr.length && limit) {
        limit--;
        const myIndex = index++;
        fn(arr[myIndex])
          .then(
            (data) => {
              limit++;
              ret[myIndex] = data;
            },
            () => {
              throw new Error(`An error occurred: ${arr[myIndex]}`);
            }
          )
          .finally(() => {
            if (myIndex === arr.length - 1) {
              resolve(ret);
            } else {
              run();
            }
          });
      }
    };
    run();
  });
}

function getWeather(city) {
  // return fetch(`https://api2.jirengu.com/getWeather.php?city=${city}`).then(
  //   (res) => res.json()
  // );
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`开始获取${city}的天气`);
      resolve(city);
    }, Math.random() * 5000);
  });
}

let citys = [
  "北京",
  "上海",
  "杭州",
  "成都",
  "武汉",
  "天津",
  "深圳",
  "广州",
  "合肥",
  "郑州",
];
asyncPool3(getWeather, citys, 2).then((results) => console.log(results));
