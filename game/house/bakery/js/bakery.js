/* =========================
   🍰 菜比之家｜烘焙房
========================= */

const bakeryRoom =
  document.getElementById("bakeryRoom");

const playerCharacter =
  document.getElementById("playerCharacter");

const livingRoomEntrance =
  document.getElementById("livingRoomEntrance");

const backyardEntrance =
  document.getElementById("backyardEntrance");

const cookingStation =
  document.getElementById("cookingStation");

const cookingModal =
  document.getElementById("cookingModal");

const closeCookingModal =
  document.getElementById("closeCookingModal");

const startCookingButton =
  document.getElementById("startCookingButton");

const ingredientList =
  document.getElementById("ingredientList");

const bowlIngredients =
  document.getElementById(
    "bowlIngredients"
  );

const cookingHint =
  document.getElementById(
    "cookingHint"
  );

const recipeBookButton =
  document.getElementById(
    "recipeBookButton"
  );

const productSection =
  document.getElementById(
    "productSection"
  );

const productList =
  document.getElementById(
    "productList"
  );

const cookingPage =
  document.getElementById(
    "cookingPage"
  );

const recipeBookPage =
  document.getElementById(
    "recipeBookPage"
  );

const recipeBookText =
  recipeBookButton.querySelector(
    ".recipe-book-text"
  );

const recipeBookIcon =
  recipeBookButton.querySelector(
    ".recipe-book-icon"
  );

/* =========================
   🚶 玩家移動資料
========================= */

let playerX = 50;
let playerY = 78;

let targetX = playerX;
let targetY = playerY;

const MOVE_SPEED = 0.6;

const pressedKeys = new Set();

/* =========================
   🚶 更新玩家位置
========================= */

function updatePlayerPosition() {

  playerCharacter.style.left =
    `${playerX}%`;

  playerCharacter.style.top =
    `${playerY}%`;
}


/* =========================
   ⌨️ 鍵盤控制
========================= */

window.addEventListener("keydown", (event) => {

  const key = event.key.toLowerCase();

  if (
    key === "w" ||
    key === "a" ||
    key === "s" ||
    key === "d" ||
    key.startsWith("arrow")
  ) {
    event.preventDefault();
    pressedKeys.add(key);
  }

});


window.addEventListener("keyup", (event) => {

  pressedKeys.delete(
    event.key.toLowerCase()
  );

});


/* =========================
   🖱️ 滑鼠／📱觸控點地移動
========================= */

bakeryRoom.addEventListener(
  "pointerdown",
  (event) => {

    /* 點到按鈕時不要移動 */
    if (
      event.target.closest("button")
    ) {
      return;
    }

    const rect =
      bakeryRoom.getBoundingClientRect();

    targetX =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    targetY =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    /* 暫時限制在主要木地板 */
    targetX =
      Math.max(
        10,
        Math.min(90, targetX)
      );

    targetY =
      Math.max(
        45,
        Math.min(88, targetY)
      );
  }
);


/* =========================
   🎮 移動循環
========================= */

function movePlayer() {

  let dx = 0;
  let dy = 0;

  if (
    pressedKeys.has("w") ||
    pressedKeys.has("arrowup")
  ) {
    dy -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("s") ||
    pressedKeys.has("arrowdown")
  ) {
    dy += MOVE_SPEED;
  }

  if (
    pressedKeys.has("a") ||
    pressedKeys.has("arrowleft")
  ) {
    dx -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("d") ||
    pressedKeys.has("arrowright")
  ) {
    dx += MOVE_SPEED;
  }


  /* 鍵盤優先 */
if (dx !== 0 || dy !== 0) {

  const nextX = playerX + dx;
  const nextY = playerY + dy;

  /* X、Y 分開判斷，撞到桌角比較不會卡死 */
  if (!isBakeryBlocked(nextX, playerY)) {
    playerX = nextX;
  }

  if (!isBakeryBlocked(playerX, nextY)) {
    playerY = nextY;
  }

  targetX = playerX;
  targetY = playerY;

  } else {

    /* 點擊／觸控後慢慢走向目標 */

    const distanceX =
      targetX - playerX;

    const distanceY =
      targetY - playerY;

    const distance =
      Math.hypot(
        distanceX,
        distanceY
      );

    if (distance > MOVE_SPEED) {

  const stepX =
    (distanceX / distance) * MOVE_SPEED;

  const stepY =
    (distanceY / distance) * MOVE_SPEED;

  const nextX = playerX + stepX;
  const nextY = playerY + stepY;

  /* X 軸碰撞 */
  if (!isBakeryBlocked(nextX, playerY)) {
    playerX = nextX;
  }

  /* Y 軸碰撞 */
  if (!isBakeryBlocked(playerX, nextY)) {
    playerY = nextY;
  }

  /* 如果完全走不動，就取消這次點地目標 */
  if (
    isBakeryBlocked(nextX, playerY) &&
    isBakeryBlocked(playerX, nextY)
  ) {
    targetX = playerX;
    targetY = playerY;
  }

} else {

  if (!isBakeryBlocked(targetX, targetY)) {
    playerX = targetX;
    playerY = targetY;
  }

  targetX = playerX;
  targetY = playerY;
}
  }


  /* 暫時限制可走範圍 */

  playerX =
    Math.max(
      10,
      Math.min(90, playerX)
    );

  playerY =
    Math.max(
      45,
      Math.min(88, playerY)
    );


  updatePlayerPosition();

  requestAnimationFrame(
    movePlayer
  );
}

/* =========================
   🧱 烘焙房家具碰撞區
========================= */

const bakeryObstacles = [
  {
    name: "中央料理工作台",
    left: 32,
    right: 68,
    top: 43,
    bottom: 55
  },

  {
    name: "左下角櫃子",
    left: 0,
    right: 15,
    top: 64,
    bottom: 100
  },

  {
  name: "右下角櫃子",
  left: 83,
  right: 100,
  top: 64,
  bottom: 100
  }

];

function isBakeryBlocked(x, y) {

  return bakeryObstacles.some((obstacle) => {

    return (
      x >= obstacle.left &&
      x <= obstacle.right &&
      y >= obstacle.top &&
      y <= obstacle.bottom
    );

  });
}

/* 啟動人物位置與移動 */

updatePlayerPosition();
movePlayer();

/* =========================
   🔐 檢查會員身分
========================= */

async function checkBakeryAccess() {

  const {
    data: { session },
    error
  } = await caibiSupabase.auth.getSession();


  /* 沒登入 → 回戶外 */
  if (error || !session) {

    console.log("🚪 尚未登入，返回戶外");

    window.location.href = "../../index.html";
    return;
  }

await loadPlayerInventory(
  session.user.id
);

  /* =========================
     👤 讀取玩家 Base
  ========================= */

  const {
    data: profile,
    error: profileError
  } =
    await caibiSupabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", session.user.id)
      .single();


  if (
    profileError ||
    !profile ||
    !profile.avatar_path
  ) {

    console.error(
      "讀取玩家 Base 失敗：",
      profileError
    );

    return;
  }


  /* =========================
     👗 取得角色分層
  ========================= */

  const playerBase =
    document.getElementById("playerBase");

  const playerSocks =
    document.getElementById("playerSocks");

  const playerShoes =
    document.getElementById("playerShoes");

  const playerBottom =
    document.getElementById("playerBottom");

  const playerTop =
    document.getElementById("playerTop");

  const playerDress =
    document.getElementById("playerDress");

  const playerOuterwear =
    document.getElementById("playerOuterwear");

  const playerHeadwear =
    document.getElementById("playerHeadwear");


  /* 👤 顯示玩家 Base */

  const { data: baseData } =
    caibiSupabase.storage
      .from("avatars")
      .getPublicUrl(
        profile.avatar_path
      );

  playerBase.src =
    baseData.publicUrl;


  /* =========================
     👗 讀取目前裝備
  ========================= */

  const {
    data: equipment,
    error: equipmentError
  } =
    await caibiSupabase
      .from("player_equipment")
      .select(`
        slot,
        clothing_item_id,
        clothing_items (
          name,
          category,
          image_path
        )
      `)
      .eq(
        "user_id",
        session.user.id
      );


  if (equipmentError) {

    console.error(
      "讀取玩家裝備失敗：",
      equipmentError
    );

    return;
  }


  /* 🧹 清空全部服裝層 */

  const clothingLayers = [
    playerSocks,
    playerShoes,
    playerBottom,
    playerTop,
    playerDress,
    playerOuterwear,
    playerHeadwear
  ];

  for (const layer of clothingLayers) {

    layer.removeAttribute("src");
    layer.style.display = "none";

  }


  /* 👚 套用目前裝備 */

  for (const equippedItem of equipment || []) {

    const item =
      equippedItem.clothing_items;

    if (
      !item ||
      !item.image_path
    ) {
      continue;
    }


    let targetLayer = null;

    switch (item.category) {

      case "socks":
        targetLayer = playerSocks;
        break;

      case "shoes":
        targetLayer = playerShoes;
        break;

      case "bottom":
        targetLayer = playerBottom;
        break;

      case "top":
        targetLayer = playerTop;
        break;

      case "dress":
        targetLayer = playerDress;
        break;

      case "outerwear":
        targetLayer = playerOuterwear;
        break;

      case "headwear":
        targetLayer = playerHeadwear;
        break;
    }


    if (!targetLayer) {
      continue;
    }


    const { data: clothingData } =
      caibiSupabase.storage
        .from("avatars")
        .getPublicUrl(
          item.image_path
        );

    targetLayer.src =
      clothingData.publicUrl;

    targetLayer.style.display =
      "block";
  }


  /* 👗 洋裝與上衣＋下身互斥 */

  const wearingDress =
    (equipment || []).some(
      item =>
        item.slot === "dress"
    );

  if (wearingDress) {

    playerTop.style.display =
      "none";

    playerBottom.style.display =
      "none";
  }


  /* 🧍 全部載入完成後才顯示 */

  playerCharacter.style.display =
    "block";


  console.log(
    "👗 烘焙房分層角色載入完成",
    equipment
  );
}

/* =========================
   🚪 左側拱門 → 客廳
========================= */

livingRoomEntrance.addEventListener(
  "click",
  () => {
    window.location.href = "../index.html";
  }
);

/* =========================
   🌾 右側花園門 → 後院
========================= */

backyardEntrance.addEventListener(
  "click",
  () => {
    window.location.href = "../backyard/index.html";
  }
);

/* =========================
   🚀 啟動烘焙房
========================= */

/* =========================
   🍳 中央料理工作台
========================= */

function openCookingModal() {

  pressedKeys.clear();

  targetX = playerX;
  targetY = playerY;

  cookingModal.classList.add(
    "is-open"
  );

  cookingModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeCooking() {

  cookingModal.classList.remove(
    "is-open"
  );

  cookingModal.setAttribute(
    "aria-hidden",
    "true"
  );
}


cookingStation.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    openCookingModal();
  }
);


closeCookingModal.addEventListener(
  "click",
  () => {

    closeCooking();
  }
);

/* =========================
   📖 食譜書開關
========================= */

let recipeBookOpen = false;


function updateRecipeBookView() {

  if (recipeBookOpen) {

    cookingPage.hidden = true;
    recipeBookPage.hidden = false;

    recipeBookIcon.textContent = "←";
    recipeBookText.textContent =
      "返回料理";

    recipeBookButton.setAttribute(
      "aria-label",
      "返回料理"
    );

  } else {

    cookingPage.hidden = false;
    recipeBookPage.hidden = true;

    recipeBookIcon.textContent = "📖";
    recipeBookText.textContent =
      "食譜";

    recipeBookButton.setAttribute(
      "aria-label",
      "打開食譜書"
    );
  }
}


recipeBookButton.addEventListener(
  "click",
  () => {

    recipeBookOpen =
      !recipeBookOpen;

    updateRecipeBookView();
  }
);

/* =========================
   🥣 料理食材與測試庫存
========================= */

/* 暫時測試庫存
   之後會改成 Supabase 真實資料 */
const ingredientInventory = {
  wheat: 0,
  milk: 0,
  egg: 0,
  flour: 0,
  butter: 0
};


/* 攪拌盆目前放入的數量 */
const selectedIngredients = {
  wheat: 0,
  milk: 0,
  egg: 0,

  flour: 0,
  butter: 0
};

const ingredientInfo = {
  wheat: {
    name: "小麥",
    icon: "🌾"
  },

  milk: {
    name: "牛奶",
    icon: "🥛"
  },

  egg: {
    name: "雞蛋",
    icon: "🥚"
  },

  flour: {
    name: "麵粉",
    icon: "🥣"
  },

  butter: {
    name: "奶油",
    icon: "🧈"
  }
};

/* =========================
   🎒 從 Supabase 讀取玩家庫存
========================= */

async function loadPlayerInventory(userId) {

  const {
    data: inventoryRows,
    error: inventoryError
  } = await caibiSupabase
    .from("player_inventory")
    .select(`
      quantity,
      game_items (
        item_key,
        category
      )
    `)
    .eq("user_id", userId);


  if (inventoryError) {

    console.error(
      "讀取玩家庫存失敗：",
      inventoryError
    );

    return;
  }


  /* 先歸零，避免重複載入時殘留舊數量 */
  for (
    const ingredient
    of Object.keys(ingredientInventory)
  ) {
    ingredientInventory[ingredient] = 0;
  }


  productInventory.cake = 0;


  for (const row of inventoryRows || []) {

    const item = row.game_items;

    if (!item) {
      continue;
    }


    if (
      item.category === "ingredient" &&
      Object.hasOwn(
        ingredientInventory,
        item.item_key
      )
    ) {

      ingredientInventory[item.item_key] =
        row.quantity;

    } else if (
      item.category === "food" &&
      Object.hasOwn(
        productInventory,
        item.item_key
      )
    ) {

      productInventory[item.item_key] =
        row.quantity;
    }
  }


  renderIngredientList();
  renderProductList();
  updateBowlDisplay();


  console.log(
    "🎒 玩家真實庫存載入完成",
    {
      ingredients: ingredientInventory,
      products: productInventory
    }
  );
}

/* =========================
   💾 儲存單一玩家物品數量
========================= */

async function saveInventoryItem(
  userId,
  itemKey,
  quantity
) {

  /* 先取得 game_items 的物品 id */
  const {
    data: item,
    error: itemError
  } = await caibiSupabase
    .from("game_items")
    .select("id")
    .eq("item_key", itemKey)
    .single();


  if (itemError || !item) {

    console.error(
      "找不到物品：",
      itemKey,
      itemError
    );

    return false;
  }


  /* 有就更新，沒有就新增 */
  const {
    error: inventoryError
  } = await caibiSupabase
    .from("player_inventory")
    .upsert(
      {
        user_id: userId,
        item_id: item.id,
        quantity: quantity
      },
      {
        onConflict: "user_id,item_id"
      }
    );


  if (inventoryError) {

    console.error(
      "儲存玩家庫存失敗：",
      inventoryError
    );

    return false;
  }


  return true;
}

/* =========================
   🎂 料理成品測試庫存
========================= */

const productInventory = {
  cake: 0
};

const productInfo = {
  cake: {
    name: "蛋糕",
    icon: "🎂"
  }
};


/* =========================
   🎂 顯示料理成品
========================= */

function renderProductList() {

  productList.innerHTML = "";

  let hasProduct = false;


  for (
    const [product, quantity]
    of Object.entries(
      productInventory
    )
  ) {

    if (quantity <= 0) {
      continue;
    }


    const info =
      productInfo[product];

    if (!info) {
      continue;
    }


    hasProduct = true;


    const item =
      document.createElement("div");

    item.className =
      "product-item";


    const icon =
      document.createElement("span");

    icon.className =
      "product-icon";

    icon.textContent =
      info.icon;


    const name =
      document.createElement("span");

    name.className =
      "product-name";

    name.textContent =
      info.name;


    const count =
      document.createElement("span");

    count.className =
      "product-count";

    count.textContent =
      `持有 ×${quantity}`;


    item.append(
      icon,
      name,
      count
    );


    productList.appendChild(
      item
    );
  }


  productSection.hidden =
    !hasProduct;
}

/* =========================
   🧺 依庫存生成食材列表
========================= */

function renderIngredientList() {

  ingredientList.innerHTML = "";


  for (
    const [ingredient, info]
    of Object.entries(
      ingredientInfo
    )
  ) {

    const owned =
      ingredientInventory[ingredient] || 0;

    const selected =
      selectedIngredients[ingredient] || 0;

    const remaining =
      owned - selected;


    /* 完全沒有這項食材就不顯示 */
    if (
      owned <= 0 &&
      selected <= 0
    ) {
      continue;
    }


    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "ingredient-item";

    button.dataset.ingredient =
      ingredient;


    const icon =
      document.createElement("span");

    icon.className =
      "ingredient-icon";

    icon.textContent =
      info.icon;


    const name =
      document.createElement("span");

    name.className =
      "ingredient-name";

    name.textContent =
      info.name;


    const count =
      document.createElement("span");

    count.className =
      "ingredient-count";

    count.textContent =
      `持有 ×${remaining}`;


    button.append(
      icon,
      name,
      count
    );


    if (selected > 0) {

      button.classList.add(
        "is-selected"
      );
    }


    button.disabled =
      remaining <= 0;


    ingredientList.appendChild(
      button
    );
  }
}

/* =========================
   🥣 更新攪拌盆畫面
========================= */

function updateBowlDisplay() {

  bowlIngredients.innerHTML = "";

  let totalSelected = 0;


  /* =========================
     🥣 更新盆內食材
  ========================= */

  for (
    const [ingredient, quantity]
    of Object.entries(
      selectedIngredients
    )
  ) {

    if (quantity <= 0) {
      continue;
    }

    totalSelected += quantity;

    const info =
      ingredientInfo[ingredient];

    const item =
      document.createElement("button");

    item.type = "button";

    item.className =
      "bowl-ingredient-item";

    item.dataset.ingredient =
      ingredient;

    item.textContent =
      `${info.icon} ${info.name} ×${quantity}`;

    item.title =
      "點擊拿回 1 個";

    bowlIngredients.appendChild(
      item
    );
  }


  /* =========================
     🧺 更新底下持有數量
  ========================= */

  const ingredientButtons =
    ingredientList.querySelectorAll(
      ".ingredient-item"
    );

  for (
    const button
    of ingredientButtons
  ) {

    const ingredient =
      button.dataset.ingredient;

    const owned =
      ingredientInventory[ingredient] || 0;

    const selected =
      selectedIngredients[ingredient] || 0;

    const remaining =
      owned - selected;


    let count =
      button.querySelector(
        ".ingredient-count"
      );

    if (!count) {

      count =
        document.createElement("span");

      count.className =
        "ingredient-count";

      button.appendChild(
        count
      );
    }


    count.textContent =
      `持有 ×${remaining}`;


    /* 全部都丟進盆裡時變淡 */
    button.disabled =
      remaining <= 0;


    button.classList.toggle(
      "is-selected",
      selected > 0
    );
  }


  /* =========================
     🍳 按鈕與提示
  ========================= */

  if (totalSelected === 0) {

    cookingHint.textContent =
      "選擇食材放進攪拌盆";

  } else {

    cookingHint.textContent =
      "點下方加入｜點盆內食材拿回";
  }


  startCookingButton.disabled =
    totalSelected === 0;
}


/* =========================
   🥚 點擊食材
========================= */

ingredientList.addEventListener(
  "click",
  (event) => {

    const ingredientButton =
      event.target.closest(
        ".ingredient-item"
      );

    if (!ingredientButton) {
      return;
    }

    const ingredient =
      ingredientButton.dataset.ingredient;

    const owned =
      ingredientInventory[ingredient] || 0;

    const selected =
      selectedIngredients[ingredient] || 0;


    /* 已經全部放進去了 */
    if (selected >= owned) {

      console.log(
        "🥣 已達持有數量上限"
      );

      return;
    }


    selectedIngredients[ingredient] =
  selected + 1;

renderIngredientList();
updateBowlDisplay();

    console.log(
      "🥣 目前攪拌盆：",
      selectedIngredients
    );
  }
);

/* =========================
   🍳 開始製作
========================= */

startCookingButton.textContent =
  "開始製作";


startCookingButton.addEventListener(
  "click",
  async () => {

    /* 判斷目前是哪一道食譜 */
    let recipeKey = null;

    /* 🌾 小麥 ×3 → 🥣 麵粉 ×1 */
    if (
      selectedIngredients.wheat === 3 &&
      selectedIngredients.milk === 0 &&
      selectedIngredients.egg === 0 &&
      selectedIngredients.flour === 0 &&
      selectedIngredients.butter === 0
    ) {
      recipeKey = "flour";
    }

    /* 🥛 牛奶 ×1 → 🧈 奶油 ×1 */
    else if (
      selectedIngredients.wheat === 0 &&
      selectedIngredients.milk === 1 &&
      selectedIngredients.egg === 0 &&
      selectedIngredients.flour === 0 &&
      selectedIngredients.butter === 0
    ) {
      recipeKey = "butter";
    }

    /* 🥣 麵粉 ×2＋🧈 奶油 ×1＋🥚 雞蛋 ×2 → 🎂 蛋糕 ×1 */
    else if (
      selectedIngredients.wheat === 0 &&
      selectedIngredients.milk === 0 &&
      selectedIngredients.egg === 2 &&
      selectedIngredients.flour === 2 &&
      selectedIngredients.butter === 1
    ) {
      recipeKey = "cake";
    }

    /* 沒有符合食譜 */
    if (!recipeKey) {
      cookingHint.textContent =
        "這個組合目前還做不出東西";

      return;
    }

    startCookingButton.disabled = true;

    /* =========================
       🍳 呼叫 Supabase 原子料理函式
    ========================= */

    const {
      data,
      error
    } = await caibiSupabase.rpc(
      "craft_item",
      {
        p_recipe_key: recipeKey
      }
    );

    if (error) {

      console.error(
        "🍳 製作失敗：",
        error
      );

      cookingHint.textContent =
        error.message || "製作失敗，請再試一次";

      startCookingButton.disabled = false;

      return;
    }

    /* =========================
       🧹 清空攪拌盆
    ========================= */

    for (
      const ingredient
      of Object.keys(selectedIngredients)
    ) {
      selectedIngredients[ingredient] = 0;
    }

    /* =========================
       🎒 重新讀取資料庫真實庫存
    ========================= */

    const {
      data: { session }
    } = await caibiSupabase.auth.getSession();

    if (!session) {

      cookingHint.textContent =
        "登入狀態失效，請重新登入";

      return;
    }

    await loadPlayerInventory(
      session.user.id
    );

    /* =========================
       ✨ 成功訊息
    ========================= */

    if (recipeKey === "flour") {

      cookingHint.textContent =
        "製作成功！獲得 🥣 麵粉 ×1";

    } else if (recipeKey === "butter") {

      cookingHint.textContent =
        "製作成功！獲得 🧈 奶油 ×1";

    } else if (recipeKey === "cake") {

      cookingHint.textContent =
        "製作成功！獲得 🎂 蛋糕 ×1";
    }

    console.log(
      "🍳 Supabase 製作成功：",
      recipeKey,
      data
    );
  }
);

/* =========================
   ↩️ 從攪拌盆拿回食材
========================= */

bowlIngredients.addEventListener(
  "click",
  (event) => {

    const bowlItem =
      event.target.closest(
        ".bowl-ingredient-item"
      );

    if (!bowlItem) {
      return;
    }

    const ingredient =
      bowlItem.dataset.ingredient;

    if (
      !selectedIngredients[ingredient] ||
      selectedIngredients[ingredient] <= 0
    ) {
      return;
    }


   selectedIngredients[ingredient] -= 1;

renderIngredientList();
updateBowlDisplay();

    console.log(
      "↩️ 拿回食材：",
      ingredient,
      selectedIngredients[ingredient]
    );
  }
);

renderIngredientList();
renderProductList();
updateBowlDisplay();

checkBakeryAccess();