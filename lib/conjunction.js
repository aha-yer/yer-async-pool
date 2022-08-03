/**
 * 多条请求合并为1条
 */
function fetchTokenFromBackEnd(key) {
  console.log("begin fetchTokenFromBackEnd:", key);
  const time = Math.random() * 1000; // time的区间是 [0, 1000)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = "123456";
      resolve({
        token,
      });
    }, time);
  });
}

class Token {
  constructor() {
    this.dist = new Map();
  }
  async getToken(key) {
    if (!this.dist.get("one")) {
      this.dist.set("one", {
        status: "pending",
        resolve: [],
        data: {},
      });
      const response = await fetchTokenFromBackEnd(key);
      const cache = this.dist.get("one");
      cache.status = "fulfilled";
      cache.data = response;
      cache.resolve.forEach((resolve) => {
        resolve(cache.data.token);
      });
      return response.token;
    } else {
      const cache = this.dist.get("one");
      if (cache.status == "pending") {
        return new Promise((resolve) => {
          cache.resolve.push(resolve);
        });
      } else if (cache.status == "fulfilled") {
        return cache.data.token;
      }
    }
  }
}

async function created() {
  const tokenInstance = new Token();
  async function _getToken(key) {
    let res = "";
    try {
      res = await tokenInstance.getToken(key);
    } catch (err) {}
    return res;
  }

  _getToken("A").then((res) => {
    console.log(`a = ${res}`);
  });
  _getToken("B").then((res) => {
    console.log(`b = ${res}`);
  });
  _getToken("C").then((res) => {
    console.log(`c = ${res}`);
  });

  setTimeout(async () => {
    _getToken("D").then((res) => {
      console.log(`d = ${res}`);
    });
  }, 1000);
}
created();
