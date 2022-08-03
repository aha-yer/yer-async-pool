const dist = new Map();

// [status: '', resolve: [], reject: [], response: {}]

async function cacheRequest(key, time) {
  if (!dist.get("one")) {
    dist.set("one", {
      status: "pending",
      resolve: [],
      reject: [],
      response: {},
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("data from server. All program can use it.");
      }, time);
    }).then((data) => {
      let cache = dist.get("one");
      cache.response = data;
      cache.status = "fulfilled";
      cache.resolve.forEach((resolve) => {
        resolve(data);
      });
      return "data from A";
    });
  } else {
    let cache = dist.get("one");
    return new Promise((resolve, reject) => {
      if (cache.status == "pending") {
        cache.resolve.push(resolve);
        cache.reject.push(reject);
      } else if (cache.status == "fulfilled") {
        resolve(cache.response);
      }
    });
  }
}

// async function cacheRequest(key, time) {
//   if (!dist.get("token")) {
//     dist.set("token", {
//       status: "pending",
//       resolve: [],
//       reject: [],
//       response: {},
//     });
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve("data from server. All program can use it");
//       }, time);
//     }).then((data) => {
//       const cache = dist.get("token");
//       cache.response.data = data;
//       cache.status = "fulfilled";
//       cache.resolve.forEach((item) => {
//         item(data);
//       });
//       return "data from A";
//     });
//   } else {
//     const cache = dist.get("token");
//     return new Promise((resolve, reject) => {
//       if (cache.status === "pending") {
//         cache.resolve.push(resolve);
//         cache.reject.push(reject);
//       } else if (cache.status === "fulfilled") {
//         resolve(cache.response);
//       }
//     });
//   }
// }

(async () => {
  console.log(await cacheRequest("A", parseInt(Math.random() * 1000)));
  console.log(await cacheRequest("B", parseInt(Math.random() * 1000)));
  console.log(await cacheRequest("C", parseInt(Math.random() * 1000)));
  console.log(await cacheRequest("D", parseInt(Math.random() * 1000)));
})();
