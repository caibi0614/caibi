/* =========================================================
   菜比之家｜CAIBI HOME
   game.js
========================================================= */


/* =========================
   DOM 元素
========================= */

const chick = document.getElementById("chick");
const kitten = document.getElementById("kitten");

const petDialog = document.getElementById("petDialog");
const dialogClose = document.getElementById("dialogClose");

const dialogPetImage = document.getElementById("dialogPetImage");
const dialogPetName = document.getElementById("dialogPetName");
const dialogPetText = document.getElementById("dialogPetText");

const affectionValue = document.getElementById("affectionValue");
const hungerValue = document.getElementById("hungerValue");

const petTouchBtn = document.getElementById("petTouchBtn");
const petFeedBtn = document.getElementById("petFeedBtn");

const wheatCount = document.getElementById("wheatCount");
const cookieCount = document.getElementById("cookieCount");


/* =========================
   農田 DOM
========================= */

const farmSpot = document.getElementById("farmSpot");
const farmDialog = document.getElementById("farmDialog");
const farmDialogClose = document.getElementById("farmDialogClose");
const farmDialogText = document.getElementById("farmDialogText");
const plantWheatBtn = document.getElementById("plantWheatBtn");


/* =========================
   烤爐 DOM
========================= */

const ovenSpot = document.getElementById("ovenSpot");
const ovenDialog = document.getElementById("ovenDialog");
const ovenDialogClose = document.getElementById("ovenDialogClose");
const ovenDialogText = document.getElementById("ovenDialogText");
const bakeCookieBtn = document.getElementById("bakeCookieBtn");


/* =========================
   目前選擇的寵物
========================= */

let currentPet = null;


/* =========================================================
   寵物資料
========================================================= */

const DEFAULT_PET_DATA = {
  affection: 50,
  hunger: 100,
  lastTouchTime: Date.now(),
  lastHungerTime: Date.now()
};

let petData = {
  chick: loadPetData("chick"),
  kitten: loadPetData("kitten")
};


function loadPetData(pet) {
  const saved = localStorage.getItem(`caibi-${pet}`);

  if (!saved) {
    return { ...DEFAULT_PET_DATA };
  }

  return JSON.parse(saved);
}


function savePetData(pet) {
  localStorage.setItem(
    `caibi-${pet}`,
    JSON.stringify(petData[pet])
  );
}


/* =========================================================
   背包
========================================================= */

let inventory = loadInventory();


function loadInventory() {
  const saved = localStorage.getItem("caibi-inventory");

  if (!saved) {
    return {
      wheat: 0,
      cookie: 3
    };
  }

  return JSON.parse(saved);
}


function saveInventory() {
  localStorage.setItem(
    "caibi-inventory",
    JSON.stringify(inventory)
  );
}


function updateInventory() {
  wheatCount.textContent = inventory.wheat;
  cookieCount.textContent = inventory.cookie;
}


/* =========================================================
   工具
========================================================= */

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}


function formatTime(milliseconds) {
  const totalSeconds =
    Math.max(0, Math.ceil(milliseconds / 1000));

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}


/* =========================================================
   寵物時間衰減
========================================================= */

function applyTimeDecay(pet) {
  const now = Date.now();
  const data = petData[pet];

  /*
    ❤️ 親密度：
    每 1 小時沒有摸摸 -1

    🍽️ 飽食度：
    每 4 小時 -10
  */

  const oneHour =
    60 * 60 * 1000;

  const fourHours =
    4 * 60 * 60 * 1000;


  const touchElapsed =
    now - data.lastTouchTime;

  const hungerElapsed =
    now - data.lastHungerTime;


  const affectionLoss =
    Math.floor(
      touchElapsed / oneHour
    );

  const hungerLossSteps =
    Math.floor(
      hungerElapsed / fourHours
    );


  /* 親密度下降 */

  if (affectionLoss > 0) {
    data.affection = clamp(
      data.affection - affectionLoss,
      0,
      100
    );

    data.lastTouchTime +=
      affectionLoss * oneHour;
  }


  /* 飽食度下降 */

  if (hungerLossSteps > 0) {
    data.hunger = clamp(
      data.hunger - hungerLossSteps * 10,
      0,
      100
    );

    data.lastHungerTime +=
      hungerLossSteps * fourHours;
  }


  savePetData(pet);
}


/* =========================================================
   更新寵物狀態
========================================================= */

function updateStatus() {
  if (!currentPet) {
    return;
  }

  applyTimeDecay(currentPet);

  affectionValue.textContent =
    petData[currentPet].affection;

  hungerValue.textContent =
    petData[currentPet].hunger;
}


/* =========================================================
   寵物心情文字
========================================================= */

function getPetMoodText(pet) {
  const data = petData[pet];


  /* 餓壞 */

  if (data.hunger === 0) {
    return pet === "chick"
      ? "小菜雞餓壞了，眼巴巴地看著你。"
      : "小比乾肚子餓得咕嚕咕嚕叫。";
  }


  /* 有點餓 */

  if (data.hunger <= 30) {
    return pet === "chick"
      ? "小菜雞看起來有點餓。"
      : "小比乾一直偷偷看你的手，好像在找吃的。";
  }


  /* 親密度低 */

  if (data.affection <= 20) {
    return pet === "chick"
      ? "小菜雞看著你，但好像還有點生疏。"
      : "小比乾保持了一點距離，安靜地看著你。";
  }


  /* 親密度高 */

  if (data.affection >= 80) {
    return pet === "chick"
      ? "小菜雞一看到你就開心地跑過來。"
      : "小比乾主動靠過來，在你旁邊蹭了蹭。";
  }


  /* 一般狀態 */

  return pet === "chick"
    ? "啾啾！小菜雞抬頭看著你。"
    : "喵～小比乾歪著頭看著你。";
}


/* =========================================================
   打開寵物視窗
========================================================= */

function openPetDialog(pet) {
  currentPet = pet;

  applyTimeDecay(pet);


  if (pet === "chick") {
    dialogPetImage.src =
      "assets/images/chick.png";

    dialogPetImage.alt =
      "小菜雞";

    dialogPetName.textContent =
      "小菜雞";
  }


  if (pet === "kitten") {
    dialogPetImage.src =
      "assets/images/kitten.png";

    dialogPetImage.alt =
      "小比乾";

    dialogPetName.textContent =
      "小比乾";
  }


  dialogPetText.textContent =
    getPetMoodText(pet);

  updateStatus();

  petDialog.classList.add("show");
}


/* =========================================================
   點擊寵物
========================================================= */

chick.addEventListener("click", () => {
  openPetDialog("chick");
});


kitten.addEventListener("click", () => {
  openPetDialog("kitten");
});


/* =========================================================
   關閉寵物視窗
========================================================= */

dialogClose.addEventListener("click", () => {
  petDialog.classList.remove("show");
});


petDialog.addEventListener("click", (event) => {
  if (event.target === petDialog) {
    petDialog.classList.remove("show");
  }
});


/* =========================================================
   摸摸
========================================================= */

petTouchBtn.addEventListener("click", () => {
  if (!currentPet) {
    return;
  }

  const data =
    petData[currentPet];


  data.affection = clamp(
    data.affection + 3,
    0,
    100
  );


  /*
    摸摸後重新計算
    下一個 1 小時從現在開始
  */

  data.lastTouchTime =
    Date.now();


  savePetData(currentPet);

  updateStatus();


  if (currentPet === "chick") {
    dialogPetText.textContent =
      "小菜雞舒服地瞇起眼睛，開心地蹭了蹭你的手。❤️ +3";
  }


  if (currentPet === "kitten") {
    dialogPetText.textContent =
      "小比乾舒服地瞇起眼睛，發出呼嚕呼嚕的聲音。❤️ +3";
  }
});


/* =========================================================
   餵食
========================================================= */

petFeedBtn.addEventListener("click", () => {
  if (!currentPet) {
    return;
  }
const data = petData[currentPet];

  /* 飽食度已滿 */
  if (data.hunger >= 100) {

    if (currentPet === "chick") {
      dialogPetText.textContent =
        "小菜雞已經吃得飽飽的啦！現在不想再吃餅乾。";
    }

    if (currentPet === "kitten") {
      dialogPetText.textContent =
        "小比乾肚子已經飽飽的，暫時吃不下餅乾了。";
    }

    return;
  }

  /* 沒有餅乾 */

  if (inventory.cookie <= 0) {

    if (currentPet === "chick") {
      dialogPetText.textContent =
        "小菜雞期待地看著你，但背包裡已經沒有餅乾了。";
    }


    if (currentPet === "kitten") {
      dialogPetText.textContent =
        "小比乾聞了聞你的手，但背包裡已經沒有餅乾了。";
    }

    return;
  }

  /* 扣除餅乾 */

  inventory.cookie -= 1;

  saveInventory();
  updateInventory();


  /* 增加飽食度 */

  data.hunger = clamp(
    data.hunger + 25,
    0,
    100
  );


  /*
    餵食後重新計算
    下一次飽食下降從現在開始
  */

  data.lastHungerTime =
    Date.now();


  savePetData(currentPet);

  updateStatus();


  if (currentPet === "chick") {
    dialogPetText.textContent =
      "小菜雞開心地吃掉了一塊餅乾！🍪 飽食度 +25";
  }


  if (currentPet === "kitten") {
    dialogPetText.textContent =
      "小比乾抱著餅乾吃得津津有味。🍪 飽食度 +25";
  }
});


/* =========================================================
   農田資料
========================================================= */

/*
  測試版：
  小麥 1 分鐘成熟
*/

const WHEAT_GROW_TIME =
  60 * 1000;


let farmData =
  loadFarmData();


function loadFarmData() {
  const saved =
    localStorage.getItem("caibi-farm");


  if (!saved) {
    return {
      state: "empty",
      plantedAt: null
    };
  }


  return JSON.parse(saved);
}


function saveFarmData() {
  localStorage.setItem(
    "caibi-farm",
    JSON.stringify(farmData)
  );
}


/* =========================================================
   更新農田視窗
========================================================= */

function updateFarmDialog() {

  /* 土地是空的 */

  if (farmData.state === "empty") {

    farmDialogText.textContent =
      "目前土地是空的。";


    plantWheatBtn.disabled =
      false;


    plantWheatBtn.textContent =
      "🌱 種植小麥";


    return;
  }


  /* 小麥生長中 */

  if (farmData.state === "growing") {

    const now =
      Date.now();


    const finishTime =
      farmData.plantedAt +
      WHEAT_GROW_TIME;


    const remaining =
      finishTime - now;


    /* 成熟 */

    if (remaining <= 0) {

      farmDialogText.textContent =
        "🌾 小麥成熟了！可以收成囉。";


      plantWheatBtn.disabled =
        false;


      plantWheatBtn.textContent =
        "🌾 收成";


      return;
    }


    /* 尚未成熟 */

    farmDialogText.textContent =
      `🌱 小麥正在努力長大中。\n還剩 ${formatTime(remaining)}`;


    plantWheatBtn.disabled =
      true;


    plantWheatBtn.textContent =
      "🌱 生長中";
  }
}


/* =========================================================
   打開 / 關閉農田
========================================================= */

farmSpot.addEventListener("click", () => {

  updateFarmDialog();

  farmDialog.classList.add("show");
});


farmDialogClose.addEventListener("click", () => {

  farmDialog.classList.remove("show");
});


farmDialog.addEventListener("click", (event) => {

  if (event.target === farmDialog) {

    farmDialog.classList.remove("show");
  }

});


/* =========================================================
   種植 / 收成
========================================================= */

plantWheatBtn.addEventListener("click", () => {

  /* 種植 */

  if (farmData.state === "empty") {

    farmData.state =
      "growing";


    farmData.plantedAt =
      Date.now();


    saveFarmData();

    updateFarmDialog();

    return;
  }


  /* 收成 */

  if (farmData.state === "growing") {

    const finishTime =
      farmData.plantedAt +
      WHEAT_GROW_TIME;


    if (Date.now() >= finishTime) {

      /* 小麥 +3 */

      inventory.wheat += 3;


      saveInventory();

      updateInventory();


      /* 農田恢復 */

      farmData.state =
        "empty";


      farmData.plantedAt =
        null;


      saveFarmData();


      farmDialogText.textContent =
        "🌾 收成完成！獲得小麥 ×3";


      plantWheatBtn.disabled =
        false;


      plantWheatBtn.textContent =
        "🌱 再種一輪";
    }
  }

});


/* =========================================================
   烤爐資料
========================================================= */

/*
  配方：
  🌾 小麥 ×3
       ↓
  🍪 餅乾 ×1

  測試版：
  烘焙時間 30 秒
*/

const COOKIE_BAKE_TIME =
  30 * 1000;


let ovenData =
  loadOvenData();


function loadOvenData() {
  const saved =
    localStorage.getItem("caibi-oven");


  if (!saved) {
    return {
      state: "empty",
      startedAt: null
    };
  }


  return JSON.parse(saved);
}


function saveOvenData() {
  localStorage.setItem(
    "caibi-oven",
    JSON.stringify(ovenData)
  );
}


/* =========================================================
   更新烤爐視窗
========================================================= */

function updateOvenDialog() {

  /* 烤爐目前沒東西 */

  if (ovenData.state === "empty") {

    ovenDialogText.textContent =
      "把收成的小麥做成香噴噴的餅乾吧！";


    bakeCookieBtn.disabled =
      false;


    bakeCookieBtn.textContent =
      "🔥 烘焙餅乾";


    return;
  }


  /* 烘焙中 */

  if (ovenData.state === "baking") {

    const now =
      Date.now();


    const finishTime =
      ovenData.startedAt +
      COOKIE_BAKE_TIME;


    const remaining =
      finishTime - now;


    /* 烤好了 */

    if (remaining <= 0) {

      ovenDialogText.textContent =
        "🍪 餅乾烤好了！快來收取吧。";


      bakeCookieBtn.disabled =
        false;


      bakeCookieBtn.textContent =
        "🍪 收取餅乾";


      return;
    }


    /* 還在烤 */

    ovenDialogText.textContent =
      `🔥 餅乾正在烤爐裡烘焙中。\n還剩 ${formatTime(remaining)}`;


    bakeCookieBtn.disabled =
      true;


    bakeCookieBtn.textContent =
      "🔥 烘焙中";
  }
}


/* =========================================================
   打開 / 關閉烤爐
========================================================= */

ovenSpot.addEventListener("click", () => {

  updateOvenDialog();

  ovenDialog.classList.add("show");
});


ovenDialogClose.addEventListener("click", () => {

  ovenDialog.classList.remove("show");
});


ovenDialog.addEventListener("click", (event) => {

  if (event.target === ovenDialog) {

    ovenDialog.classList.remove("show");
  }

});


/* =========================================================
   烘焙 / 收取餅乾
========================================================= */

bakeCookieBtn.addEventListener("click", () => {

  /* =========================
     開始烘焙
  ========================= */

  if (ovenData.state === "empty") {

    /*
      需要至少 3 個小麥
    */

    if (inventory.wheat < 3) {

      ovenDialogText.textContent =
        "🌾 小麥不夠！製作一塊餅乾需要小麥 ×3。";

      return;
    }


    /* 扣除小麥 */

    inventory.wheat -= 3;


    saveInventory();

    updateInventory();


    /* 開始計時 */

    ovenData.state =
      "baking";


    ovenData.startedAt =
      Date.now();


    saveOvenData();

    updateOvenDialog();

    return;
  }


  /* =========================
     收取餅乾
  ========================= */

  if (ovenData.state === "baking") {

    const finishTime =
      ovenData.startedAt +
      COOKIE_BAKE_TIME;


    /*
      只有時間真的到了
      才可以領餅乾
    */

    if (Date.now() >= finishTime) {

      /* 餅乾 +1 */

      inventory.cookie += 1;


      saveInventory();

      updateInventory();


      /* 烤爐恢復空閒 */

      ovenData.state =
        "empty";


      ovenData.startedAt =
        null;


      saveOvenData();


      ovenDialogText.textContent =
        "🍪 完成！獲得餅乾 ×1";


      bakeCookieBtn.disabled =
        false;


      bakeCookieBtn.textContent =
        "🔥 再烤一塊";
    }
  }

});


/* =========================================================
   每秒更新倒數
========================================================= */

setInterval(() => {

  /* 農田 */

  if (
    farmDialog.classList.contains("show")
  ) {
    updateFarmDialog();
  }


  /* 烤爐 */

  if (
    ovenDialog.classList.contains("show")
  ) {
    updateOvenDialog();
  }

}, 1000);


/* =========================================================
   遊戲啟動
========================================================= */

updateInventory();

/*
  頁面開啟時先套用一次
  寵物離線時間衰減
*/

applyTimeDecay("chick");
applyTimeDecay("kitten");
/* =========================================================
   🏡 菜比之家｜小屋入口＆登入視窗
========================================================= */

const houseSpot = document.getElementById("houseSpot");
const loginScreen = document.getElementById("loginScreen");
const loginClose = document.getElementById("loginClose");


/* =========================
   點擊小屋
========================= */

houseSpot.addEventListener("click", async () => {

  /* 先檢查目前有沒有登入 */
  const {
    data: { session },
    error
  } = await caibiSupabase.auth.getSession();

  if (error) {
    console.error("讀取登入狀態失敗：", error);
  }

  /* 已登入 */
  if (session) {
    console.log("🏡 已登入，不需要重新輸入帳密：", session.user);

    const { data: profile, error: profileError } =
      await caibiSupabase
        .from("profiles")
        .select("username, display_name, role")
        .eq("id", session.user.id)
        .single();

    if (profileError || !profile) {
      console.error("讀取 profiles 失敗：", profileError);
      return;
    }

    console.log("🥦 歡迎回家：", profile);

/* 已登入 → 直接進入 1F 客廳 */
window.location.href = "house/index.html";

return;
  }

  /* 尚未登入 → 顯示登入視窗 */
  loginMessage.textContent = "";
  loginScreen.classList.remove("hidden");

});

/* =========================
   關閉登入畫面
========================= */

loginClose.addEventListener("click", () => {

  loginScreen.classList.add("hidden");

});


/* =========================
   點登入視窗外面也可以關閉
========================= */

loginScreen.addEventListener("click", (event) => {

  if (event.target === loginScreen) {
    loginScreen.classList.add("hidden");
  }

});
/* =========================================================
   🔐 菜比之家｜Supabase 會員登入
========================================================= */

const loginForm = document.getElementById("loginForm");
const loginAccount = document.getElementById("loginAccount");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = loginAccount.value.trim().toLowerCase();
  const password = loginPassword.value;

  /* 沒填完整 */
  if (!username || !password) {
    loginMessage.textContent = "請輸入帳號和密碼 ✨";
    return;
  }

  /* 登入中 */
  loginButton.disabled = true;
  loginButton.textContent = "登入中...";
  loginMessage.textContent = "";

  /* 菜比帳號 → Supabase 內部 Email */
  const email = `${username}@caibihome.local`;

  try {
    const { data, error } =
      await caibiSupabase.auth.signInWithPassword({
        email: email,
        password: password
      });

    /* 登入失敗 */
    if (error) {
      console.error("登入失敗：", error);

      loginMessage.textContent =
        "帳號或密碼錯誤，請再試一次。";

      return;
    }

   /* =========================
   登入成功 → 讀取玩家資料
========================= */

console.log("🏡 Auth 登入成功：", data.user);

const { data: profile, error: profileError } =
  await caibiSupabase
    .from("profiles")
    .select("username, display_name, role")
    .eq("id", data.user.id)
    .single();


/* 找不到玩家資料 */
if (profileError || !profile) {
  console.error("讀取 profiles 失敗：", profileError);

  loginMessage.textContent =
    "登入成功，但找不到玩家資料。";

  return;
}


/* 成功取得玩家資料 */
console.log("🥦 玩家資料：", profile);

loginMessage.textContent =
  `🏡 歡迎回家，${profile.display_name}！`;

/* 登入成功 → 進入 1F 客廳 */
setTimeout(() => {
  window.location.href = "house/index.html";
}, 600);
    } catch (error) {
    console.error("登入發生錯誤：", error);

    loginMessage.textContent =
      "登入時發生錯誤，請稍後再試。";

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "🔐 登入菜比之家";
  }
});