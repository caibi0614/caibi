/* =========================
   🏡 菜比之家｜1F
========================= */


/* =========================
   🔐 檢查會員身分
========================= */

async function checkHouseAccess() {

  const {
    data: { session },
    error
  } = await caibiSupabase.auth.getSession();

  /* 沒登入 → 回戶外 */
  if (error || !session) {
    console.log("🚪 尚未登入，返回戶外");

    window.location.href = "../index.html";
    return;
  }


  /* =========================
     👤 讀取玩家資料
  ========================= */

  const { data: profile, error: profileError } =
    await caibiSupabase
      .from("profiles")
      .select("username, display_name, role, avatar_path")
      .eq("id", session.user.id)
      .single();

  if (profileError || !profile) {
    console.error("找不到會員資料：", profileError);

    window.location.href = "../index.html";
    return;
  }


  /* =========================
     🏡 驗證成功
  ========================= */

  /* =========================
   👤 載入玩家 Base＋目前穿著
========================= */

const playerCharacter =
  document.getElementById("playerCharacter");

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


/* 👤 玩家專屬 Base */

if (!profile.avatar_path) {

  console.error(
    "找不到玩家 avatar_path"
  );

  return;
}

const { data: baseData } =
  caibiSupabase.storage
    .from("avatars")
    .getPublicUrl(
      profile.avatar_path
    );

playerBase.src =
  baseData.publicUrl;


/* 👗 讀取目前裝備 */

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


/* 🧹 先清空全部衣服 */

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


/* 👚 把裝備套到對應圖層 */

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


/* 🧍 全部載完才顯示 */

playerCharacter.style.display =
  "block";

console.log(
  "👗 1F 分層角色載入完成",
  equipment
);

/* =========================
   📮 官方管理員入口驗證
========================= */

const adminPhoneButton =
  document.getElementById("adminPhoneButton");

if (adminPhoneButton) {

  const { data: isAdmin, error: adminError } =
    await caibiSupabase.rpc("is_caibi_admin");

  if (adminError) {
    console.error("📮 管理員驗證失敗：", adminError);
  }

  if (!adminError && isAdmin === true) {
    adminPhoneButton.hidden = false;
    adminPhoneButton.style.display = "";
    console.log("📮 官方管理入口已開放");
  }

}

  console.log("🏡 進入菜比之家：", profile);

  document.getElementById("welcomeText").textContent =
    `歡迎回家，${profile.display_name}！`;

  document.getElementById("houseContent").style.display =
    "block";
}


/* =========================
   🚪 登出
========================= */

/* 🍰 烘焙房入口 */
const bakeryEntrance =
  document.getElementById("bakeryEntrance");

/* 🪜 私人房間入口 */
const privateRoomEntrance =
  document.getElementById("privateRoomEntrance");

const logoutButton =
  document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {

  const { error } =
    await caibiSupabase.auth.signOut();

  if (error) {
    console.error("登出失敗：", error);
    return;
  }

  console.log("🚪 已登出菜比之家");

  window.location.href = "../index.html";
});

/* =========================
   🍰 前往烘焙房
========================= */

bakeryEntrance.addEventListener("click", () => {
  window.location.href = "bakery/index.html";
});

/* 🪜 前往 2F 私人房間 */
privateRoomEntrance.addEventListener("click", () => {
  window.location.href = "room/index.html";
});

/* =========================
   📱 菜比手機
========================= */

const gamePhoneButton =
  document.getElementById("gamePhoneButton");

const gamePhonePanel =
  document.getElementById("gamePhonePanel");

const gamePhoneClose =
  document.getElementById("gamePhoneClose");


/* 📱 打開手機 */

gamePhoneButton.addEventListener("click", () => {

  gamePhonePanel.classList.add("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "false"
  );

});


/* ✕ 關閉手機 */

gamePhoneClose.addEventListener("click", () => {

  gamePhonePanel.classList.remove("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "true"
  );

});


/* 點手機外面的半透明區域也能關閉 */

gamePhonePanel.addEventListener("click", (event) => {

  if (event.target !== gamePhonePanel) {
    return;
  }

  gamePhonePanel.classList.remove("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "true"
  );

});

/* =========================
   🎒 菜比手機－背包
========================= */

const gamePhone =
  document.querySelector(".game-phone");

const gamePhoneGrid =
  document.querySelector(".game-phone-grid");

const backpackButton =
  document.querySelector(
    '[data-phone-app="backpack"]'
  );

const backpackPage =
  document.getElementById("backpackPage");

const backpackBackButton =
  document.getElementById("backpackBackButton");

const backpackGoldBeans =
  document.getElementById("backpackGoldBeans");

const backpackDiamonds =
  document.getElementById("backpackDiamonds");

const backpackItems =
  document.getElementById("backpackItems");

const backpackTabs =
  document.querySelectorAll(
    "[data-backpack-tab]"
  );

let backpackInventory = [];
let backpackClothing = [];
let backpackFurniture = [];

let currentBackpackTab = "all";

/* 💰 讀取玩家錢包 */

async function loadBackpackWallet() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();

  if (sessionError || !session) {
    console.error(
      "🎒 背包：找不到登入狀態",
      sessionError
    );
    return;
  }


  const {
    data: wallet,
    error: walletError
  } =
    await caibiSupabase
      .from("player_wallet")
      .select("gold_beans, diamonds")
      .eq("user_id", session.user.id)
      .single();


  if (walletError || !wallet) {

    console.error(
      "🎒 背包：讀取錢包失敗",
      walletError
    );

    backpackGoldBeans.textContent = "—";
    backpackDiamonds.textContent = "—";

    return;
  }


  backpackGoldBeans.textContent =
    wallet.gold_beans ?? 0;

  backpackDiamonds.textContent =
    wallet.diamonds ?? 0;
}

/* =========================
   🎒 讀取一般背包物品
========================= */

async function loadBackpackInventory() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();

  if (sessionError || !session) {
    console.error(
      "🎒 背包：找不到登入狀態",
      sessionError
    );
    return;
  }


  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_inventory")
      .select(`
        quantity,
        game_items (
          id,
          item_key,
          name,
          category
        )
      `)
      .eq("user_id", session.user.id)
      .gt("quantity", 0);


  if (error) {

    console.error(
      "🎒 背包：讀取物品失敗",
      error
    );

    backpackInventory = [];

    renderBackpackItems();

    return;
  }


  backpackInventory =
    data || [];

  renderBackpackItems();
}

/* =========================
   👗 讀取玩家衣服
========================= */

async function loadBackpackClothing() {

  const {
    data: { session }
  } = await caibiSupabase.auth.getSession();

  if (!session) return;


  const {
    data,
    error
  } = await caibiSupabase
    .from("player_clothing")
    .select(`
      quantity,
      clothing_items (
        id,
        name,
        category,
        image_path
      )
    `)
    .eq("user_id", session.user.id)
    .gt("quantity", 0);


  if (error) {
    console.error(
      "🎒 背包：讀取衣服失敗",
      error
    );

    backpackClothing = [];
    return;
  }


  backpackClothing = data || [];
}


/* =========================
   🪑 讀取玩家家具
========================= */

async function loadBackpackFurniture() {

  const {
    data: { session }
  } = await caibiSupabase.auth.getSession();

  if (!session) return;


  const {
    data,
    error
  } = await caibiSupabase
    .from("player_furniture")
    .select(`
      quantity,
      furniture_items (
        id,
        name,
        category,
        image_front
      )
    `)
    .eq("user_id", session.user.id)
    .gt("quantity", 0);


  if (error) {
    console.error(
      "🎒 背包：讀取家具失敗",
      error
    );

    backpackFurniture = [];
    return;
  }


  backpackFurniture = data || [];
}

/* =========================
   🖼️ 顯示背包物品
========================= */

function renderBackpackItems() {

  backpackItems.innerHTML = "";

  const displayItems = [];


  /* 📦 一般物品 */

  for (const row of backpackInventory) {

    const item = row.game_items;

    if (!item) continue;

    displayItems.push({
      type: item.category,
      key: item.item_key,
      name: item.name,
      quantity: row.quantity,
      imagePath: null
    });
  }


  /* 👗 衣服 */

  for (const row of backpackClothing) {

    const item = row.clothing_items;

    if (!item) continue;

    displayItems.push({
      type: "clothing",
      key: null,
      name: item.name,
      quantity: row.quantity,
      imagePath: item.image_path
    });
  }


  /* 🪑 家具 */

  for (const row of backpackFurniture) {

    const item = row.furniture_items;

    if (!item) continue;

    displayItems.push({
      type: "furniture",
      key: null,
      name: item.name,
      quantity: row.quantity,
      imagePath: item.image_front
    });
  }


  /* 🗂️ 分類 */

  const visibleItems =
    displayItems.filter((item) => {

      if (currentBackpackTab === "all") {
        return true;
      }

      return (
        item.type === currentBackpackTab
      );

    });


  if (visibleItems.length === 0) {

    backpackItems.innerHTML = `
      <div class="backpack-empty">
        這裡目前沒有東西～
      </div>
    `;

    return;
  }


  const itemIcons = {

    wheat: "🌾",
    milk: "🥛",
    egg: "🥚",
    flour: "🥣",
    butter: "🧈",
    cake: "🎂",

    food_waste: "🗑️",
    fertilizer: "🌱",

    wheat_seed: "🌱",
corn: "🌽",
corn_seed: "🌽",
popcorn: "🍿"

  };


  for (const item of visibleItems) {

    const itemElement =
      document.createElement("div");

    itemElement.className =
      "backpack-item";


    let visual = "📦";


    /* 👗🪑 有圖片就讀 Storage 圖片 */

    if (item.imagePath) {

      const { data } =
        caibiSupabase.storage
          .from("avatars")
          .getPublicUrl(item.imagePath);

      visual = `
        <img
          src="${data.publicUrl}"
          alt="${item.name}"
          class="backpack-item-image"
        >
      `;

    } else {

      visual =
        itemIcons[item.key] || "📦";

    }


    itemElement.innerHTML = `
      <div class="backpack-item-icon">
        ${visual}
      </div>

      <div class="backpack-item-name">
        ${item.name}
      </div>

      <div class="backpack-item-quantity">
        × ${item.quantity}
      </div>
    `;


    backpackItems.appendChild(
      itemElement
    );
  }
}


/* =========================
   🗂️ 背包分類
========================= */

for (const tab of backpackTabs) {

  tab.addEventListener(
    "click",
    () => {

      currentBackpackTab =
        tab.dataset.backpackTab;


      for (const otherTab of backpackTabs) {

        otherTab.classList.toggle(
          "is-active",
          otherTab === tab
        );

      }


      renderBackpackItems();

    }
  );

}

/* 🎒 打開背包 */

backpackButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "backpack-open"
    );

    backpackPage.hidden = false;

    await Promise.all([
  loadBackpackWallet(),
  loadBackpackInventory(),
  loadBackpackClothing(),
  loadBackpackFurniture()
]);

renderBackpackItems();

  }
);


/* ← 返回手機首頁 */

backpackBackButton.addEventListener(
  "click",
  () => {

    backpackPage.hidden = true;

    gamePhone.classList.remove(
      "backpack-open"
    );

  }
);

/* =========================
   🛒 菜比手機－商店
========================= */

const shopButton =
  document.querySelector(
    '[data-phone-app="shop"]'
  );

const shopPage =
  document.getElementById("shopPage");

const shopBackButton =
  document.getElementById("shopBackButton");

const shopItems =
  document.getElementById("shopItems");


/* 🫘 讀取商店金豆 */

async function loadShopWallet() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "🛒 商店：找不到登入狀態",
      sessionError
    );

    shopGoldBeans.textContent = "—";

    return;
  }


  const {
    data: wallet,
    error: walletError
  } =
    await caibiSupabase
      .from("player_wallet")
      .select("gold_beans")
      .eq("user_id", session.user.id)
      .single();


  if (walletError || !wallet) {

    console.error(
      "🛒 商店：讀取金豆失敗",
      walletError
    );

    shopGoldBeans.textContent = "—";

    return;
  }


  shopGoldBeans.textContent =
    wallet.gold_beans ?? 0;
}

/* =========================
   🛒 讀取商店商品
========================= */

async function loadShopItems() {

  shopItems.innerHTML = `
    <div class="shop-empty">
      🛒 商品讀取中…
    </div>
  `;

  const {
    data: products,
    error
  } =
    await caibiSupabase
      .from("shop_items")
      .select(`
        id,
        price,
        quantity,
        currency_type,
        is_active,
        game_items (
          item_key,
          name,
          category
        )
      `)
      .eq("is_active", true)
      .order("id", {
        ascending: true
      });


  if (error) {

    console.error(
      "🛒 商店：讀取商品失敗",
      error
    );

    shopItems.innerHTML = `
      <div class="shop-empty">
        ⚠️ 商品讀取失敗
      </div>
    `;

    return;
  }


  if (!products || products.length === 0) {

    shopItems.innerHTML = `
      <div class="shop-empty">
        🛒 目前沒有商品～
      </div>
    `;

    return;
  }


  shopItems.innerHTML = "";


  const itemIcons = {
    wheat_seed: "🌱",
    corn_seed: "🌽"
  };


  for (const product of products) {

  const item =
    product.game_items;

  if (!item) {
    continue;
  }


  const icon =
    itemIcons[item.item_key] || "📦";

  const currencyIcon =
    product.currency_type === "gold_beans"
      ? "🫘"
      : product.currency_type === "diamonds"
        ? "💎"
        : "💰";


  const productElement =
    document.createElement("div");

  productElement.className =
    "shop-item";

  productElement.dataset.shopItem =
    item.item_key;


  productElement.innerHTML = `
    <div class="shop-item-icon">
      ${icon}
    </div>

    <div class="shop-item-info">

      <strong>
        ${item.name}
      </strong>

      <small>
        每組 ×${product.quantity}
      </small>

    </div>

    <div class="shop-quantity-control">

      <button
        class="shop-quantity-button"
        type="button"
        data-shop-quantity-minus
      >
        −
      </button>

      <input
        class="shop-quantity-input"
        type="number"
        min="1"
        max="99"
        value="1"
        inputmode="numeric"
        aria-label="${item.name}購買數量"
      >

      <button
        class="shop-quantity-button"
        type="button"
        data-shop-quantity-plus
      >
        ＋
      </button>

    </div>

    <button
      class="shop-buy-button"
      type="button"
      data-shop-item-id="${product.id}"
      data-shop-item-name="${item.name}"
      data-shop-item-icon="${icon}"
      data-shop-item-price="${product.price}"
      data-shop-item-unit-quantity="${product.quantity}"
      data-shop-currency-icon="${currencyIcon}"
    >
      ${currencyIcon} ${product.price}・購買 ×${product.quantity}
    </button>
  `;


  shopItems.appendChild(
    productElement
  );
}

}

/* 🛒 打開商店 */

shopButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "shop-open"
    );

    shopPage.hidden = false;

    await Promise.all([
      loadShopWallet(),
      loadShopItems()
    ]);

  }
);


/* ← 返回手機首頁 */

shopBackButton.addEventListener(
  "click",
  () => {

    shopPage.hidden = true;

    gamePhone.classList.remove(
      "shop-open"
    );

  }
);

/* =========================
   🛒 商店－調整購買數量
========================= */

function getShopQuantity(productElement) {

  const input =
    productElement.querySelector(
      ".shop-quantity-input"
    );

  let quantity =
    Number(input.value);

  if (!Number.isInteger(quantity)) {
    quantity = 1;
  }

  quantity =
    Math.max(
      1,
      Math.min(99, quantity)
    );

  input.value = quantity;

  return quantity;
}


function updateShopPurchaseDisplay(
  productElement
) {

  const input =
    productElement.querySelector(
      ".shop-quantity-input"
    );

  const buyButton =
    productElement.querySelector(
      "[data-shop-item-id]"
    );

  if (!input || !buyButton) {
    return;
  }

  const quantity =
    getShopQuantity(productElement);

  const unitPrice =
    Number(
      buyButton.dataset.shopItemPrice
    );

  const unitQuantity =
    Number(
      buyButton.dataset.shopItemUnitQuantity
    );

  const currencyIcon =
    buyButton.dataset.shopCurrencyIcon;

  const totalPrice =
    unitPrice * quantity;

  const totalItems =
    unitQuantity * quantity;

  buyButton.textContent =
    `${currencyIcon} ${totalPrice}・購買 ×${totalItems}`;
}


/* ➖➕ 點擊數量按鈕 */

shopItems.addEventListener(
  "click",
  (event) => {

    const minusButton =
      event.target.closest(
        "[data-shop-quantity-minus]"
      );

    const plusButton =
      event.target.closest(
        "[data-shop-quantity-plus]"
      );

    if (!minusButton && !plusButton) {
      return;
    }

    const productElement =
      event.target.closest(
        ".shop-item"
      );

    const input =
      productElement.querySelector(
        ".shop-quantity-input"
      );

    let quantity =
      getShopQuantity(productElement);

    if (minusButton) {
      quantity--;
    }

    if (plusButton) {
      quantity++;
    }

    quantity =
      Math.max(
        1,
        Math.min(99, quantity)
      );

    input.value = quantity;

    updateShopPurchaseDisplay(
      productElement
    );
  }
);


/* ⌨️ 直接輸入數量 */

shopItems.addEventListener(
  "input",
  (event) => {

    if (
      !event.target.matches(
        ".shop-quantity-input"
      )
    ) {
      return;
    }

    const productElement =
      event.target.closest(
        ".shop-item"
      );

    updateShopPurchaseDisplay(
      productElement
    );
  }
);


/* 🛒 購買商品 */

shopItems.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        "[data-shop-item-id]"
      );

    if (!button) {
      return;
    }


    const productElement =
      button.closest(
        ".shop-item"
      );

    const purchaseQuantity =
      getShopQuantity(
        productElement
      );


    const shopItemId =
      Number(
        button.dataset.shopItemId
      );

    const itemName =
      button.dataset.shopItemName;

    const itemIcon =
      button.dataset.shopItemIcon;

    const unitQuantity =
      Number(
        button.dataset.shopItemUnitQuantity
      );

    const totalItems =
      unitQuantity * purchaseQuantity;


    /* 防止連續狂點 */

    button.disabled = true;

    const originalText =
      button.textContent;

    button.textContent =
      "購買中…";


    const {
      data,
      error
    } =
      await caibiSupabase.rpc(
        "buy_shop_item",
        {
          p_shop_item_id:
            shopItemId,

          p_quantity:
            purchaseQuantity
        }
      );


    if (error) {

      console.error(
        "🛒 購買失敗：",
        error
      );


      if (
        error.message?.includes(
          "INSUFFICIENT_GOLD_BEANS"
        )
      ) {

        alert(
          "🫘 金豆不足！"
        );

      } else {

        alert(
          "購買失敗，請稍後再試。"
        );

      }


      button.disabled = false;

      button.textContent =
        originalText;

      return;
    }


    console.log(
      "🛒 批量購買成功：",
      data
    );


    /* 🫘 更新金豆＋🎒背包 */

    await Promise.all([
      loadShopWallet(),
      loadBackpackInventory()
    ]);


    alert(
      `${itemIcon} ${itemName} ×${totalItems} 購買成功！`
    );


    button.disabled = false;

    updateShopPurchaseDisplay(
      productElement
    );

  }
);

/* =========================
   🎁 菜比手機－每日簽到
========================= */

const dailyButton =
  document.querySelector(
    '[data-phone-app="daily"]'
  );

const dailyPage =
  document.getElementById("dailyPage");

const dailyBackButton =
  document.getElementById("dailyBackButton");

const dailyCurrentDay =
  document.getElementById("dailyCurrentDay");

const dailyClaimButton =
  document.getElementById("dailyClaimButton");

const dailyRewardCards =
  document.querySelectorAll(
    "[data-daily-day]"
  );


/* =========================
   ✨ 更新每日獎勵卡狀態
========================= */

function renderDailyRewardCards(
  currentDay,
  claimedToday
) {

  for (const card of dailyRewardCards) {

    const cardDay =
      Number(card.dataset.dailyDay);

    card.classList.remove(
      "is-current",
      "is-claimed"
    );

    if (cardDay === currentDay) {

      card.classList.add(
        claimedToday
          ? "is-claimed"
          : "is-current"
      );

    }

  }

}


/* =========================
   📅 讀取每日簽到狀態
========================= */

async function loadDailyCheckin() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "🎁 每日簽到：找不到登入狀態",
      sessionError
    );

    return;
  }


  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_daily_checkin")
      .select("streak_day, last_claim_date")
      .eq("user_id", session.user.id)
      .maybeSingle();


  if (error) {

    console.error(
      "🎁 每日簽到：讀取失敗",
      error
    );

    return;
  }


  /* 第一次簽到，還沒有紀錄 */

  if (!data) {

    dailyCurrentDay.textContent = "1";

    renderDailyRewardCards(
      1,
      false
    );

    dailyClaimButton.disabled = false;

    dailyClaimButton.textContent =
      "🎁 今日簽到";

    return;
  }


  /* 🇹🇼 取得台灣今天日期 */

  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(new Date());


  /* 今天已經領過 */

  if (data.last_claim_date === today) {

    dailyCurrentDay.textContent =
      data.streak_day;

    renderDailyRewardCards(
      data.streak_day,
      true
    );

    dailyClaimButton.disabled = true;

    dailyClaimButton.textContent =
      "✅ 今日已簽到";

    return;
  }


  /* 尚未領取今天獎勵 */

/* 🇹🇼 算出台灣的昨天日期 */

const yesterdayDate =
  new Date();

yesterdayDate.setDate(
  yesterdayDate.getDate() - 1
);

const yesterday =
  new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(yesterdayDate);


/* 🔥 昨天有簽 → 延續；斷簽 → Day 1 */

let nextDailyDay = 1;

if (data.last_claim_date === yesterday) {

  nextDailyDay =
    data.streak_day >= 7
      ? 1
      : data.streak_day + 1;

}


dailyCurrentDay.textContent =
  nextDailyDay;

renderDailyRewardCards(
  nextDailyDay,
  false
);

  dailyClaimButton.disabled = false;

  dailyClaimButton.textContent =
    "🎁 今日簽到";
}


/* =========================
   🎁 領取每日簽到獎勵
========================= */

dailyClaimButton.addEventListener(
  "click",
  async () => {

    /* 防止連續狂點 */

    dailyClaimButton.disabled = true;

    dailyClaimButton.textContent =
      "領取中…";


    const {
      data,
      error
    } =
      await caibiSupabase.rpc(
        "claim_daily_reward"
      );


    /* ❌ 領取失敗 */

    if (error) {

      console.error(
        "🎁 每日簽到失敗：",
        error
      );


      /* 今天已經領過 */

      if (
        error.message?.includes(
          "ALREADY_CLAIMED_TODAY"
        )
      ) {

        await loadDailyCheckin();

        alert(
          "🎁 今天已經簽到過囉！"
        );

        return;
      }


      dailyClaimButton.disabled = false;

      dailyClaimButton.textContent =
        "🎁 今日簽到";

      alert(
        "簽到失敗，請稍後再試。"
      );

      return;
    }


    console.log(
      "🎁 每日簽到成功：",
      data
    );


    /* 🎁 顯示本次獎勵 */

    let rewardText = "";

    if (data.gold_beans > 0) {

      rewardText =
        `🫘 金豆 ×${data.gold_beans}`;

    } else if (data.diamonds > 0) {

      rewardText =
        `💎 鑽石 ×${data.diamonds}`;

    } else if (data.fertilizer > 0) {

      rewardText =
        `🌱 肥料 ×${data.fertilizer}`;

    }


    /* 🔄 同步簽到、錢包、背包 */

    await Promise.all([
      loadDailyCheckin(),
      loadBackpackWallet(),
      loadBackpackInventory()
    ]);


    alert(
      `🎁 Day ${data.day} 簽到成功！\n${rewardText}`
    );

  }
);

/* 🎁 打開每日簽到 */

dailyButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "daily-open"
    );

    dailyPage.hidden = false;

     await loadDailyCheckin();
  }
);


/* ← 返回手機首頁 */

dailyBackButton.addEventListener(
  "click",
  () => {

    dailyPage.hidden = true;

    gamePhone.classList.remove(
      "daily-open"
    );

  }
);

/* =========================
   📬 菜比手機－信箱
========================= */

const mailButton =
  document.querySelector(
    '[data-phone-app="mail"]'
  );

const mailPage =
  document.getElementById(
    "mailPage"
  );

const mailBackButton =
  document.getElementById(
    "mailBackButton"
  );

const mailList =
  document.getElementById(
    "mailList"
  );

const mailDetail =
  document.getElementById(
    "mailDetail"
  );

let playerMails = [];
let selectedMailId = null;


/* =========================
   📅 格式化信件日期
========================= */

function formatMailDate(dateString) {

  return new Date(
    dateString
  ).toLocaleDateString(
    "zh-TW",
    {
      timeZone: "Asia/Taipei"
    }
  );

}


/* =========================
   🎁 取得附件文字
========================= */

function getMailAttachmentText(mail) {

  if (
    mail.attachment_type === "currency" &&
    mail.attachment_key === "diamonds"
  ) {
    return `💎 鑽石 ×${mail.attachment_quantity}`;
  }

  if (
    mail.attachment_type === "currency" &&
    mail.attachment_key === "gold_beans"
  ) {
    return `🫘 金豆 ×${mail.attachment_quantity}`;
  }

  return "";
}


/* =========================
   📮 顯示左側信件列表
========================= */

function renderMailList() {

  mailList.innerHTML = "";

  if (playerMails.length === 0) {

    mailList.innerHTML = `
      <div class="mail-empty">
        📭
        <strong>目前沒有信件</strong>
        <small>有新消息時會出現在這裡。</small>
      </div>
    `;

    return;
  }


  for (const mail of playerMails) {

    const mailElement =
      document.createElement("button");

    mailElement.type = "button";

    mailElement.className =
  mail.is_read
    ? "mail-item is-read"
    : "mail-item";

    if (mail.id === selectedMailId) {
      mailElement.classList.add(
        "is-selected"
      );
    }


    mailElement.innerHTML = `
      <div class="mail-item-title">
        ${mail.is_read ? "✉️" : "🔴"}
        <span>${mail.title}</span>
      </div>

      <div class="mail-item-sender">
        ${mail.sender_name}
      </div>

      <div class="mail-item-date">
        ${formatMailDate(mail.created_at)}
      </div>
    `;


    mailElement.addEventListener(
  "click",
  async () => {

    selectedMailId = mail.id;


    /* 📖 第一次打開 → 標記已讀 */

    if (!mail.is_read) {

      const {
        error
      } =
        await caibiSupabase.rpc(
          "mark_mail_read",
          {
            p_mail_id: mail.id
          }
        );


      if (error) {

        console.error(
          "📬 信件標記已讀失敗：",
          error
        );

      } else {

        mail.is_read = true;

      }

    }


    renderMailList();
    renderMailDetail(mail);

  }
);


    mailList.appendChild(
      mailElement
    );

  }

}


/* =========================
   ✉️ 顯示右側信件內容
========================= */

function renderMailDetail(mail) {

  if (!mail) {

    mailDetail.innerHTML = `
      <div class="mail-detail-empty">
        ✉️
        <strong>選擇一封信件</strong>
        <small>點擊左側信件即可查看內容。</small>
      </div>
    `;

    return;
  }


  /* =========================
     ⏰ 信件期限
  ========================= */

  const now =
    new Date();

  const expiresAt =
    mail.expires_at
      ? new Date(mail.expires_at)
      : null;

  const isExpired =
    expiresAt &&
    now > expiresAt;


  let expirationHtml = "";

  if (expiresAt) {

    const expirationText =
      expiresAt.toLocaleString(
        "zh-TW",
        {
          timeZone: "Asia/Taipei",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }
      );


    expirationHtml =
      isExpired
        ? `
          <span class="mail-expired">
            ⌛ 已過期
          </span>
        `
        : `
          <span class="mail-expiration">
            ⏰ 有效期限：${expirationText}
          </span>
        `;

  }


  /* =========================
     🎁 附件
  ========================= */

  const attachmentText =
    getMailAttachmentText(mail);


  let claimButtonText =
    "🎁 領取附件";

  let claimButtonDisabled =
    false;


  if (mail.is_claimed) {

    claimButtonText =
      "✅ 已領取";

    claimButtonDisabled =
      true;

  } else if (isExpired) {

    claimButtonText =
      "⌛ 已過期";

    claimButtonDisabled =
      true;

  }


  const attachmentHtml =
    attachmentText
      ? `
        <div class="mail-detail-attachment">

          <strong>🎁 附件</strong>

          <div class="mail-attachment-reward">
            ${attachmentText}
          </div>

          <button
            type="button"
            class="mail-claim-button"
            ${claimButtonDisabled
              ? "disabled"
              : ""}
          >
            ${claimButtonText}
          </button>

        </div>
      `
      : "";


  /* =========================
     ✉️ 信件內容
  ========================= */

  mailDetail.innerHTML = `

    <div class="mail-detail-title">
      ${mail.title}
    </div>

    <div class="mail-detail-meta">

      <span>
        寄件者：${mail.sender_name}
      </span>

      <span>
        ${formatMailDate(mail.created_at)}
      </span>

      ${expirationHtml}

    </div>

    <div class="mail-detail-content">
      ${mail.content}
    </div>

    ${attachmentHtml}

  `;


  /* =========================
     🎁 領取信件附件
  ========================= */

  const claimButton =
    mailDetail.querySelector(
      ".mail-claim-button"
    );


  /*
    沒附件、已領取、已過期
    都不綁定領取事件
  */

  if (
    !claimButton ||
    mail.is_claimed ||
    isExpired
  ) {
    return;
  }


  claimButton.addEventListener(
    "click",
    async () => {

      /* 防止連點 */

      claimButton.disabled = true;

      claimButton.textContent =
        "領取中…";


      const {
        data,
        error
      } =
        await caibiSupabase.rpc(
          "claim_mail_attachment",
          {
            p_mail_id: mail.id
          }
        );


      /* ❌ 領取失敗 */

      if (error) {

        console.error(
          "📬 信件附件領取失敗：",
          error
        );


        if (
          error.message?.includes(
            "MAIL_ALREADY_CLAIMED"
          )
        ) {

          await loadPlayerMail();

          alert(
            "📬 這份附件已經領取過囉！"
          );

          return;
        }


        if (
          error.message?.includes(
            "MAIL_EXPIRED"
          )
        ) {

          await loadPlayerMail();

          alert(
            "📬 這封信的附件已經過期了。"
          );

          return;
        }


        claimButton.disabled = false;

        claimButton.textContent =
          "🎁 領取附件";

        alert(
          "附件領取失敗，請稍後再試。"
        );

        return;
      }


      console.log(
        "📬 信件附件領取成功：",
        data
      );


      /* 本地標記已領取 */

      mail.is_claimed = true;


      /* 🔄 同步錢包＋背包 */

      await Promise.all([
        loadBackpackWallet(),
        loadBackpackInventory(),
        loadBackpackClothing(),
        loadBackpackFurniture()
      ]);


      /* 🔄 更新信件畫面 */

      renderMailList();
      renderMailDetail(mail);


      alert(
        `🎁 附件領取成功！\n${attachmentText}`
      );

    }
  );

}


/* =========================
   📮 讀取玩家信件
========================= */

async function loadPlayerMail() {

  mailList.innerHTML = `
    <div class="mail-empty">
      📬
      <strong>信件讀取中…</strong>
    </div>
  `;

  renderMailDetail(null);


  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "📬 信箱：找不到登入狀態",
      sessionError
    );

    mailList.innerHTML = `
      <div class="mail-empty">
        ⚠️
        <strong>無法讀取信箱</strong>
      </div>
    `;

    return;
  }


  const {
    data: mails,
    error: mailError
  } =
    await caibiSupabase
      .from("player_mail")
      .select(`
        id,
        title,
        content,
        sender_name,
        is_read,
        is_claimed,
        attachment_type,
        attachment_key,
        attachment_quantity,
        expires_at,
        created_at
      `)
      .eq(
        "user_id",
        session.user.id
      )
      .order(
        "created_at",
        { ascending: false }
      );


  if (mailError) {

    console.error(
      "📬 信箱：讀取信件失敗",
      mailError
    );

    mailList.innerHTML = `
      <div class="mail-empty">
        ⚠️
        <strong>信件讀取失敗</strong>
        <small>請稍後再試。</small>
      </div>
    `;

    return;
  }


  playerMails =
    mails || [];

  selectedMailId = null;

  renderMailList();
  renderMailDetail(null);

}


/* =========================
   📬 打開信箱
========================= */

mailButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "mail-open"
    );

    mailPage.hidden = false;

    await loadPlayerMail();

  }
);


/* =========================
   ← 返回手機首頁
========================= */

mailBackButton.addEventListener(
  "click",
  () => {

    mailPage.hidden = true;

    gamePhone.classList.remove(
      "mail-open"
    );

    selectedMailId = null;

  }
);

/* =========================
   🎟️ 菜比手機－兌換碼
========================= */

const redeemButton =
  document.querySelector(
    '[data-phone-app="redeem"]'
  );

const redeemPage =
  document.getElementById(
    "redeemPage"
  );

const redeemBackButton =
  document.getElementById(
    "redeemBackButton"
  );

const redeemCodeInput =
  document.getElementById(
    "redeemCodeInput"
  );

const redeemSubmitButton =
  document.getElementById(
    "redeemSubmitButton"
  );

const redeemMessage =
  document.getElementById(
    "redeemMessage"
  );


/* =========================
   🎟️ 打開兌換碼
========================= */

redeemButton.addEventListener(
  "click",
  () => {

    gamePhone.classList.add(
      "redeem-open"
    );

    redeemPage.hidden = false;

    redeemCodeInput.value = "";

    redeemMessage.textContent = "";

    redeemCodeInput.focus();

  }
);


/* =========================
   ← 返回手機首頁
========================= */

redeemBackButton.addEventListener(
  "click",
  () => {

    redeemPage.hidden = true;

    gamePhone.classList.remove(
      "redeem-open"
    );

    redeemCodeInput.value = "";

    redeemMessage.textContent = "";

  }
);


/* =========================
   🎁 送出兌換碼
========================= */

async function submitRedeemCode() {

  const code =
    redeemCodeInput.value.trim();

  if (!code) {

    redeemMessage.textContent =
      "請先輸入兌換碼。";

    return;
  }


  /* 防止連續狂點 */

  redeemSubmitButton.disabled = true;

  redeemSubmitButton.textContent =
    "兌換中…";

  redeemMessage.textContent = "";


  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "redeem_code",
      {
        p_code: code
      }
    );


  /* ❌ 兌換失敗 */

  if (error) {

    console.error(
      "🎟️ 兌換碼失敗：",
      error
    );


    if (
      error.message?.includes(
        "已經兌換過"
      )
    ) {

      redeemMessage.textContent =
        "🎟️ 這組兌換碼已經領取過囉！";

    } else if (
      error.message?.includes(
        "已達兌換上限"
      )
    ) {

      redeemMessage.textContent =
        "😢 這組兌換碼已經被領完了。";

    } else if (
      error.message?.includes(
        "無效或已過期"
      )
    ) {

      redeemMessage.textContent =
        "❌ 兌換碼不存在或已經過期。";

    } else {

      redeemMessage.textContent =
        "❌ 兌換失敗，請稍後再試。";

    }


    redeemSubmitButton.disabled = false;

    redeemSubmitButton.textContent =
      "🎟️ 立即兌換";

    return;
  }


  /* =========================
     ✅ 兌換成功
  ========================= */

  console.log(
    "🎟️ 兌換成功：",
    data
  );


  const rewards = [];

  if (data.diamonds > 0) {

    rewards.push(
      `💎 鑽石 ×${data.diamonds}`
    );

  }

  if (data.gold_beans > 0) {

    rewards.push(
      `🫘 金豆 ×${data.gold_beans}`
    );

  }


  redeemMessage.textContent =
    `🎉 ${data.name}兌換成功！`;


  /* 🔄 同步玩家錢包 */

  await loadBackpackWallet();


  alert(
    `🎉 ${data.name}兌換成功！\n\n${rewards.join("\n")}`
  );


  redeemCodeInput.value = "";

  redeemSubmitButton.disabled = false;

  redeemSubmitButton.textContent =
    "🎟️ 立即兌換";

}


/* 🎟️ 點擊兌換 */

redeemSubmitButton.addEventListener(
  "click",
  submitRedeemCode
);


/* ⌨️ 輸入框按 Enter 也能兌換 */

redeemCodeInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    submitRedeemCode();

  }
);

/* =========================
   📮 菜比手機－官方管理中心
========================= */

const adminPage =
  document.getElementById("adminPage");

const adminBackButton =
  document.getElementById("adminBackButton");

const adminButton =
  document.getElementById("adminPhoneButton");

/* 📮 開啟官方管理 */

adminButton?.addEventListener("click", async () => {

  // 每次進入都重新驗證管理員身分
  const { data: isAdmin, error } =
    await caibiSupabase.rpc("is_caibi_admin");

  if (error || isAdmin !== true) {
    alert("⛔ 只有菜比官方管理員可以進入。");
    return;
  }

  gamePhone.classList.add("admin-open");
  adminPage.hidden = false;

});

/* ← 返回手機首頁 */

adminBackButton?.addEventListener("click", () => {

  adminPage.hidden = true;
  gamePhone.classList.remove("admin-open");

});

/* =========================
   💌 官方管理－寄信頁面
========================= */

const adminMailButton =
  document.getElementById("adminMailButton");

const adminMailPage =
  document.getElementById("adminMailPage");

const adminMailBackButton =
  document.getElementById("adminMailBackButton");

/* 💌 開啟寄信表單 */

adminMailButton?.addEventListener("click", async () => {

  adminPage.hidden = true;

  gamePhone.classList.add("admin-mail-open");

  adminMailPage.hidden = false;
  await loadAdminMailPlayers();

});

/* ← 返回官方管理中心 */

adminMailBackButton?.addEventListener("click", () => {

  adminMailPage.hidden = true;

  gamePhone.classList.remove("admin-mail-open");

  adminPage.hidden = false;

});

/* =========================
   👤 官方寄信－收件玩家列表
========================= */

const adminMailPlayerSearch =
  document.getElementById("adminMailPlayerSearch");

const adminMailPlayerList =
  document.getElementById("adminMailPlayerList");

const adminMailSelectedPlayer =
  document.getElementById("adminMailSelectedPlayer");

const adminMailUsername =
  document.getElementById("adminMailUsername");

let adminMailPlayers = [];

/* 📋 收件玩家下拉選單 */

const adminMailPlayerToggle =
  document.getElementById("adminMailPlayerToggle");

const adminMailPlayerDropdownContent =
  document.getElementById("adminMailPlayerDropdownContent");

const adminMailPlayerToggleText =
  document.getElementById("adminMailPlayerToggleText");

function closeAdminMailPlayerDropdown() {
  adminMailPlayerDropdownContent.hidden = true;
  adminMailPlayerToggle.setAttribute("aria-expanded", "false");
}

adminMailPlayerToggle?.addEventListener("click", () => {
  const willOpen = adminMailPlayerDropdownContent.hidden;

  adminMailPlayerDropdownContent.hidden = !willOpen;
  adminMailPlayerToggle.setAttribute(
    "aria-expanded",
    String(willOpen)
  );

  if (willOpen) {
    adminMailPlayerSearch.focus();
  }
});

/* 點擊選單外面，自動收起 */
document.addEventListener("pointerdown", (event) => {
  const dropdown =
    document.getElementById("adminMailPlayerDropdown");

  if (dropdown && !dropdown.contains(event.target)) {
    closeAdminMailPlayerDropdown();
  }
});

/* 📋 顯示玩家列表 */

function renderAdminMailPlayers() {

  if (!adminMailPlayerList) return;

  adminMailPlayerList.replaceChildren();

  const keyword =
    (adminMailPlayerSearch?.value || "")
      .trim()
      .toLowerCase();

  const filteredPlayers =
    adminMailPlayers.filter(player => {

      const username =
        (player.username || "").toLowerCase();

      const displayName =
        (player.display_name || "").toLowerCase();

      return username.includes(keyword) ||
        displayName.includes(keyword);

    });

  if (filteredPlayers.length === 0) {

    adminMailPlayerList.textContent =
      "🔍 找不到符合的玩家";

    return;
  }

  for (const player of filteredPlayers) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className = "admin-mail-player-option";

    button.textContent =
      `${player.username}｜${player.display_name || "未設定暱稱"}`;

    if (adminMailUsername?.value === player.username) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {

  adminMailUsername.value = player.username;

  const playerLabel =
    `${player.username}｜${player.display_name || "未設定暱稱"}`;

  adminMailSelectedPlayer.textContent =
    `✅ 已選擇：${playerLabel}`;

  adminMailPlayerToggleText.textContent =
    playerLabel;

  closeAdminMailPlayerDropdown();

  renderAdminMailPlayers();

});

    adminMailPlayerList.appendChild(button);

  }

}


/* 🔄 從資料庫讀取玩家 */

async function loadAdminMailPlayers() {

  if (!adminMailPlayerList) return;

  adminMailPlayerList.textContent =
    "📋 正在讀取玩家列表……";

  const { data, error } =
    await caibiSupabase.rpc("caibi_list_players");

  if (error) {

    console.error("📮 玩家列表讀取失敗：", error);

    adminMailPlayerList.textContent =
      "⚠️ 玩家列表讀取失敗";

    return;
  }

  adminMailPlayers = (data || []).filter(
    player => !["cai", "abc"].includes(player.username)
  );

  renderAdminMailPlayers();

}


/* 🔍 搜尋時即時篩選 */

adminMailPlayerSearch?.addEventListener(
  "input",
  renderAdminMailPlayers
);

/* =========================
   💌 官方寄信－正式送出
========================= */

const adminMailForm =
  document.getElementById("adminMailForm");

const adminMailSubmitButton =
  document.getElementById("adminMailSubmitButton");

const adminMailMessage =
  document.getElementById("adminMailMessage");

let adminMailSending = false;

adminMailForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  // 防止重複寄送
  if (adminMailSending) return;

  const username = adminMailUsername.value.trim();

  const sender =
    document.getElementById("adminMailSender").value.trim();

  const reason =
    document.getElementById("adminMailReason").value.trim();

  const title =
    document.getElementById("adminMailTitle").value.trim();

  const content =
    document.getElementById("adminMailContent").value.trim();

  const reward =
    document.getElementById("adminMailReward").value;

  const quantityText =
    document.getElementById("adminMailQuantity").value.trim();

  const expiry =
    document.getElementById("adminMailExpiry").value;

  adminMailMessage.textContent = "";

  // 必填欄位
  if (!username || !sender || !reason || !title) {
    adminMailMessage.textContent =
      "⚠️ 請選擇收件玩家，並填寫寄件者、原因與標題。";
    return;
  }

  // 附件數量檢查
  let quantity = null;

  if (reward) {
    quantity = Number(quantityText);

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      adminMailMessage.textContent =
        "⚠️ 選擇附件後，請填寫正確的獎勵數量。";
      return;
    }
  } else if (quantityText !== "") {
    adminMailMessage.textContent =
      "⚠️ 有填寫獎勵數量時，請選擇附件類型。";
    return;
  }

  // 有效期限：未填則不限制
  let expiresAt = null;

  if (expiry) {
    const expiryDate = new Date(expiry);

    if (
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      adminMailMessage.textContent =
        "⚠️ 有效期限必須是未來的日期時間。";
      return;
    }

    expiresAt = expiryDate.toISOString();
  }

  // 寄送前再次確認
  const rewardLabel =
    reward === "diamonds"
      ? `💎 鑽石 ×${quantity}`
      : reward === "gold_beans"
        ? `🫘 金豆 ×${quantity}`
        : "無附件";

  const confirmed = confirm(
    `📮 確定寄送官方信件？\n\n` +
    `收件玩家：${username}\n` +
    `信件標題：${title}\n` +
    `附件：${rewardLabel}\n\n` +
    `寄出後會立即建立玩家信件與寄送紀錄。`
  );

  if (!confirmed) return;

  adminMailSending = true;
  adminMailSubmitButton.disabled = true;
  adminMailSubmitButton.textContent = "📮 寄送中……";
  adminMailMessage.textContent = "正在寄送官方信件……";

  try {

    const { data, error } =
      await caibiSupabase.rpc("caibi_send_mail", {
        p_username: username,
        p_sender_name: sender,
        p_title: title,
        p_content: content,
        p_reward_key: reward || null,
        p_quantity: quantity,
        p_expires_at: expiresAt,
        p_reason: reason
      });

    if (error) throw error;

    console.log("💌 官方寄信成功：", data);

    adminMailMessage.textContent =
      `✅ 已成功寄送給 ${username}！`;

    // 清空已完成的表單
    adminMailForm.reset();

    adminMailUsername.value = "";

    adminMailSelectedPlayer.textContent =
      "尚未選擇收件玩家";

    adminMailPlayerToggleText.textContent =
      "請點擊選擇收件玩家";

    closeAdminMailPlayerDropdown();

    renderAdminMailPlayers();

  } catch (error) {

    console.error("💌 官方寄信失敗：", error);

    adminMailMessage.textContent =
      "❌ 寄送失敗，請查看瀏覽器 Console 錯誤訊息。";

  } finally {

    adminMailSending = false;
    adminMailSubmitButton.disabled = false;
    adminMailSubmitButton.textContent = "📮 確認寄送";

  }

});

/* =========================
   📋 官方管理－寄信紀錄頁面
========================= */

const adminMailLogsButton =
  document.getElementById("adminMailLogsButton");

const adminMailLogsPage =
  document.getElementById("adminMailLogsPage");

const adminMailLogsBackButton =
  document.getElementById("adminMailLogsBackButton");

/* 📋 開啟寄信紀錄 */

adminMailLogsButton?.addEventListener("click", async () => {

  adminPage.hidden = true;

  gamePhone.classList.remove("admin-open");
  gamePhone.classList.add("admin-mail-logs-open");

  if (adminMailLogsPage) {
    adminMailLogsPage.hidden = false;
  }

  await loadAdminMailLogs();

});

/* ← 返回官方管理中心 */

adminMailLogsBackButton?.addEventListener("click", () => {

  if (adminMailLogsPage) {
    adminMailLogsPage.hidden = true;
  }

  gamePhone.classList.remove("admin-mail-logs-open");
  gamePhone.classList.add("admin-open");

  adminPage.hidden = false;

});


/* =========================
   📋 官方寄信紀錄－讀取資料
========================= */

const adminMailLogsSearch =
  document.getElementById("adminMailLogsSearch");

const adminMailLogsCount =
  document.getElementById("adminMailLogsCount");

const adminMailLogsList =
  document.getElementById("adminMailLogsList");

let adminMailLogs = [];

async function loadAdminMailLogs() {

  adminMailLogsList.textContent =
    "📋 正在讀取寄信紀錄……";

  adminMailLogsCount.textContent =
    "正在載入……";

  const { data: isAdmin, error: adminError } =
    await caibiSupabase.rpc("is_caibi_admin");

  if (adminError || isAdmin !== true) {
    adminMailLogsList.textContent =
      "⛔ 沒有權限查看寄信紀錄";
    adminMailLogsCount.textContent = "";
    return;
  }

  
const { data, error } =
  await caibiSupabase.rpc("caibi_list_mail_logs");


  if (error) {
    console.error("📋 寄信紀錄讀取失敗：", error);

    adminMailLogsList.textContent =
      "❌ 寄信紀錄讀取失敗";

    adminMailLogsCount.textContent = "";
    return;
  }

  adminMailLogs = data || [];

  console.log(
    "📋 官方寄信紀錄：",
    adminMailLogs
  );

    renderAdminMailLogs();
}


/* =========================
   📋 官方寄信紀錄－顯示卡片
========================= */

function renderAdminMailLogs() {

  if (!adminMailLogsList) return;

  adminMailLogsList.replaceChildren();

  const keyword =
    (adminMailLogsSearch?.value || "")
      .trim()
      .toLowerCase();

  const filteredLogs = adminMailLogs.filter(log => {

    const searchText = [
      log.admin_username,
      log.recipient_username,
      log.recipient_display_name,
      log.sender_name,
      log.title,
      log.reason
    ].join(" ").toLowerCase();

    return searchText.includes(keyword);
  });

  adminMailLogsCount.textContent =
    keyword
      ? `找到 ${filteredLogs.length} 筆／共 ${adminMailLogs.length} 筆寄信紀錄`
      : `共 ${adminMailLogs.length} 筆寄信紀錄`;

  if (filteredLogs.length === 0) {
    adminMailLogsList.textContent =
      keyword
        ? "🔍 找不到符合的寄信紀錄"
        : "📭 目前沒有寄信紀錄";
    return;
  }

  const formatDate = value => {

    if (!value) return "無期限";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "日期資料異常";
    }

    return date.toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  for (const log of filteredLogs) {

    const card = document.createElement("article");
    card.className = "admin-mail-log-card";

    const addLine = (label, value) => {

      const line = document.createElement("div");
      line.className = "admin-mail-log-line";

      const name = document.createElement("strong");
      name.textContent = `${label}：`;

      const text = document.createElement("span");
      text.textContent = value ?? "—";

      line.append(name, text);
      card.appendChild(line);
    };

    const reward =
      log.reward_key === "diamonds"
        ? `💎 鑽石 ×${log.reward_quantity}`
        : log.reward_key === "gold_beans"
          ? `🫘 金豆 ×${log.reward_quantity}`
          : log.reward_key
            ? `${log.reward_key} ×${log.reward_quantity ?? 0}`
            : "無附件";

    const recipient =
      log.recipient_username
        ? `${log.recipient_username}（${log.recipient_display_name || "未設定暱稱"}）`
        : "未知玩家";

    addLine("✉️ 標題", log.title);
    addLine("📮 寄送管理員", log.admin_username);
    addLine("👤 收件玩家", recipient);
    addLine("🏷️ 寄件者名稱", log.sender_name);
    addLine("📝 寄送原因", log.reason);
    addLine("💬 信件內容", log.content || "無內容");
    addLine("🎁 附件", reward);
    addLine("📅 寄送時間", formatDate(log.sent_at));
    addLine("⏰ 有效期限", formatDate(log.expires_at));

    adminMailLogsList.appendChild(card);
  }
}

/* 🔍 即時搜尋寄信紀錄 */

adminMailLogsSearch?.addEventListener(
  "input",
  renderAdminMailLogs
);


/* =========================
   🎟️ 官方管理－兌換碼管理頁面
========================= */

const adminRedeemButton =
  document.getElementById("adminRedeemButton");

const adminRedeemPage =
  document.getElementById("adminRedeemPage");

const adminRedeemBackButton =
  document.getElementById("adminRedeemBackButton");

/* 🎟️ 開啟官方兌換碼管理 */

adminRedeemButton?.addEventListener("click", async () => {

  // 再次驗證管理員身分
  const { data: isAdmin, error } =
    await caibiSupabase.rpc("is_caibi_admin");

  if (error || isAdmin !== true) {
    alert("⛔ 只有菜比官方管理員可以使用。");
    return;
  }

  if (!adminRedeemPage) {
    console.error("找不到官方兌換碼管理頁面");
    return;
  }

  adminPage.hidden = true;

  gamePhone.classList.remove("admin-open");
  gamePhone.classList.add("admin-redeem-open");

  
  adminRedeemPage.hidden = false;

  // 🎟️ 開啟管理頁面時讀取兌換碼
  await loadAdminRedeemCodes();

});


/* ← 返回官方管理中心 */

adminRedeemBackButton?.addEventListener("click", () => {

  if (adminRedeemPage) {
    adminRedeemPage.hidden = true;
  }

  gamePhone.classList.remove("admin-redeem-open");
  gamePhone.classList.add("admin-open");

  adminPage.hidden = false;

});


/* =========================
   🎟️ 官方兌換碼－讀取列表
========================= */

const adminRedeemList =
  document.getElementById("adminRedeemList");


const adminRedeemListCount =
  document.getElementById("adminRedeemListCount");

/* 🔍 官方兌換碼搜尋 */
const adminRedeemSearch =
  document.getElementById("adminRedeemSearch");

let adminRedeemCodes = [];

adminRedeemSearch?.addEventListener("input", () => {
  renderAdminRedeemCodes();
});

async function loadAdminRedeemCodes() {


  if (!adminRedeemList || !adminRedeemListCount) {
    console.error("找不到官方兌換碼列表容器");
    return;
  }

  adminRedeemList.textContent = "🎟️ 正在讀取兌換碼……";
  adminRedeemListCount.textContent = "正在載入……";

  const { data, error } =
    await caibiSupabase.rpc("caibi_list_redeem_codes");

  if (error) {
    console.error("🎟️ 兌換碼列表讀取失敗：", error);
    adminRedeemList.textContent = "❌ 兌換碼讀取失敗";
    adminRedeemListCount.textContent = "";
    return;
  }

  
adminRedeemCodes = data || [];

renderAdminRedeemCodes();
}

/* 🔍 篩選並顯示官方兌換碼 */
function renderAdminRedeemCodes() {

  const keyword =
    (adminRedeemSearch?.value || "")
      .trim()
      .toLowerCase();

  const codes = adminRedeemCodes.filter(item => {
    const searchText =
      `${item.code || ""} ${item.name || ""}`.toLowerCase();

    return searchText.includes(keyword);
  });

  adminRedeemListCount.textContent = keyword
    ? `找到 ${codes.length} 組／共 ${adminRedeemCodes.length} 組兌換碼`
    : `共 ${adminRedeemCodes.length} 組兌換碼`;


  adminRedeemList.replaceChildren();

  if (codes.length === 0) {
    adminRedeemList.textContent = "📭 目前沒有兌換碼";
    return;
  }

  for (const item of codes) {

    const card = document.createElement("article");
    card.className = "admin-redeem-card";

    const addLine = (label, value) => {
      const line = document.createElement("div");
      line.className = "admin-redeem-line";

      const title = document.createElement("strong");
      title.textContent = `${label}：`;

      const content = document.createElement("span");
      content.textContent = String(value ?? "—");

      line.append(title, content);
      card.appendChild(line);
    };

    
    const reward =
      item.reward_key === "diamonds"
        ? `💎 鑽石 ×${item.reward_quantity}`
        : item.reward_key === "gold_beans"
          ? `🫘 金豆 ×${item.reward_quantity}`
          : `${item.reward_key ?? "未知獎勵"} ×${item.reward_quantity ?? 0}`;

    const formatDate = (value, emptyText) => {
      if (!value) return emptyText;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "日期資料異常";
      }

      return date.toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    };

    

/* 🎟️ 兌換碼標題＋狀態標籤 */
const codeHeader = document.createElement("div");
codeHeader.className = "admin-redeem-code-header";

const codeTitle = document.createElement("h3");
codeTitle.className = "admin-redeem-code-title";
codeTitle.textContent = `🎟️ ${item.code}`;

const statusBadge = document.createElement("span");
statusBadge.className = item.is_active
  ? "admin-redeem-status is-active"
  : "admin-redeem-status is-inactive";

statusBadge.textContent = item.is_active
  ? "🟢 啟用中"
  : "🔴 已停用";

codeHeader.append(codeTitle, statusBadge);
card.appendChild(codeHeader);


    
addLine("📝 禮包名稱", item.name);
addLine("🎁 獎勵", reward);

/* 👥 兌換次數進度條 */
const redeemedCount = Number(item.redeemed_count ?? 0);
const maxRedemptions = item.max_redemptions == null
  ? null
  : Number(item.max_redemptions);

const progressSection = document.createElement("div");
progressSection.className = "admin-redeem-progress";

const progressLabel = document.createElement("div");
progressLabel.className = "admin-redeem-progress-label";

if (maxRedemptions === null) {
  progressLabel.textContent =
    `👥 已兌換 ${redeemedCount} 次／不限量`;
} else {
  progressLabel.textContent =
    `👥 兌換進度：${redeemedCount}／${maxRedemptions}`;

  const progressTrack = document.createElement("div");
  progressTrack.className = "admin-redeem-progress-track";

  const progressFill = document.createElement("div");
  progressFill.className = "admin-redeem-progress-fill";

  const percentage = maxRedemptions > 0
    ? Math.min(100, Math.max(0, redeemedCount / maxRedemptions * 100))
    : 0;

  progressFill.style.width = `${percentage}%`;

  progressTrack.appendChild(progressFill);
  progressSection.appendChild(progressTrack);

  if (redeemedCount >= maxRedemptions) {
    progressSection.classList.add("is-full");

    const fullMessage = document.createElement("div");
    fullMessage.className = "admin-redeem-progress-full";
    fullMessage.textContent = "🎟️ 已達兌換上限";

    progressSection.appendChild(fullMessage);
  }
}

progressSection.prepend(progressLabel);
card.appendChild(progressSection);

    addLine("📅 開始時間", formatDate(item.starts_at, "立即生效"));
    addLine("⏰ 到期時間", formatDate(item.expires_at, "永久有效"));
    addLine("🗓️ 建立時間", formatDate(item.created_at, "—"));

/* 🔴🟢 兌換碼啟用／停用按鈕 */
const toggleButton = document.createElement("button");

toggleButton.type = "button";
toggleButton.className = "admin-redeem-toggle-button";

toggleButton.textContent = item.is_active
  ? "🔴 停用兌換碼"
  : "🟢 重新啟用";

toggleButton.addEventListener("click", async () => {

  const nextActive = !item.is_active;

  const confirmed = confirm(
    `確定要${nextActive ? "重新啟用" : "停用"}兌換碼「${item.code}」嗎？`
  );

  if (!confirmed) return;

  toggleButton.disabled = true;
  toggleButton.textContent = "⏳ 處理中……";

  const { error } = await caibiSupabase.rpc(
    "caibi_set_redeem_code_active",
    {
      p_code_id: item.id,
      p_is_active: nextActive
    }
  );

  if (error) {
    console.error("🎟️ 修改兌換碼狀態失敗：", error);
    alert("❌ 修改失敗，請查看 Console。");
    toggleButton.disabled = false;
    toggleButton.textContent = item.is_active
      ? "🔴 停用兌換碼"
      : "🟢 重新啟用";
    return;
  }

  await loadAdminRedeemCodes();

});

card.appendChild(toggleButton);

adminRedeemList.appendChild(card);
  }
}

/* =========================
   🎟️ 官方管理－建立兌換碼
========================= */

const adminRedeemForm =
  document.getElementById("adminRedeemForm");

const adminRedeemSubmitButton =
  document.getElementById("adminRedeemSubmitButton");

const adminRedeemMessage =
  document.getElementById("adminRedeemMessage");

let adminRedeemCreating = false;

adminRedeemForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  // 防止重複建立
  if (adminRedeemCreating) return;

  const code =
    document.getElementById("adminRedeemCode").value.trim().toUpperCase();

  const name =
    document.getElementById("adminRedeemName").value.trim();

  const reward =
    document.getElementById("adminRedeemReward").value;

  const quantity =
    Number(document.getElementById("adminRedeemQuantity").value);

  const maxText =
    document.getElementById("adminRedeemMax").value.trim();

  const startText =
    document.getElementById("adminRedeemStart").value;

  const expiryText =
    document.getElementById("adminRedeemExpiry").value;

  adminRedeemMessage.textContent = "";

  // 🎟️ 基本檢查
  if (!code || !name) {
    adminRedeemMessage.textContent =
      "⚠️ 請填寫兌換碼及禮包名稱。";
    return;
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    adminRedeemMessage.textContent =
      "⚠️ 獎勵數量必須是大於 0 的整數。";
    return;
  }

  // 👥 全服兌換次數
  let maxRedemptions = null;

  if (maxText !== "") {
    maxRedemptions = Number(maxText);

    if (
      !Number.isSafeInteger(maxRedemptions) ||
      maxRedemptions <= 0
    ) {
      adminRedeemMessage.textContent =
        "⚠️ 兌換上限必須是大於 0 的整數。";
      return;
    }
  }

  // ⏰ 日期轉換為 Supabase 可使用的格式
  const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("日期格式不正確");
    }

    return date.toISOString();
  };

  let startsAt;
  let expiresAt;

  try {
    startsAt = parseDate(startText);
    expiresAt = parseDate(expiryText);
  } catch (error) {
    adminRedeemMessage.textContent =
      "⚠️ 請檢查開始與到期時間。";
    return;
  }

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    adminRedeemMessage.textContent =
      "⚠️ 到期時間必須晚於現在。";
    return;
  }

  if (
    startsAt &&
    expiresAt &&
    new Date(expiresAt) <= new Date(startsAt)
  ) {
    adminRedeemMessage.textContent =
      "⚠️ 到期時間必須晚於開始時間。";
    return;
  }

  const rewardText =
    reward === "diamonds"
      ? `💎 鑽石 ×${quantity}`
      : `🫘 金豆 ×${quantity}`;

  // 📋 建立前再次確認
  const confirmed = confirm(
    `🎟️ 確定建立官方兌換碼？\n\n` +
    `兌換碼：${code}\n` +
    `禮包名稱：${name}\n` +
    `獎勵：${rewardText}\n` +
    `全服上限：${maxRedemptions ?? "不限"}\n` +
    `開始時間：${startText || "立即生效"}\n` +
    `到期時間：${expiryText || "永久有效"}`
  );

  if (!confirmed) return;

  adminRedeemCreating = true;
  adminRedeemSubmitButton.disabled = true;
  adminRedeemSubmitButton.textContent = "🎟️ 建立中……";
  adminRedeemMessage.textContent = "正在建立兌換碼……";

  try {

    const { data, error } =
      await caibiSupabase.rpc("caibi_create_redeem_code", {
        p_code: code,
        p_name: name,
        p_reward_key: reward,
        p_quantity: quantity,
        p_max_redemptions: maxRedemptions,
        p_starts_at: startsAt,
        p_expires_at: expiresAt
      });

    if (error) throw error;

    console.log("🎟️ 官方兌換碼建立成功，ID：", data);

    
adminRedeemMessage.textContent =
  `✅ 兌換碼 ${code} 建立成功！`;

adminRedeemForm.reset();

/* 🔄 建立成功後，自動更新兌換碼列表 */
await loadAdminRedeemCodes();


  } catch (error) {

    console.error("🎟️ 官方兌換碼建立失敗：", error);

    adminRedeemMessage.textContent =
      error.message?.includes("已經存在")
        ? "⚠️ 這組兌換碼已經存在，請換一組。"
        : "❌ 建立失敗，請查看瀏覽器 Console。";

  } finally {

    adminRedeemCreating = false;
    adminRedeemSubmitButton.disabled = false;
    adminRedeemSubmitButton.textContent = "🎟️ 建立兌換碼";

  }

});

/* =========================
   📊 官方管理－兌換紀錄頁面
========================= */

const adminRedeemLogsButton =
  document.getElementById("adminRedeemLogsButton");

const adminRedeemLogsPage =
  document.getElementById("adminRedeemLogsPage");

const adminRedeemLogsBackButton =
  document.getElementById("adminRedeemLogsBackButton");

/* 📊 開啟兌換紀錄 */

adminRedeemLogsButton?.addEventListener("click", async () => {

  const { data: isAdmin, error } =
    await caibiSupabase.rpc("is_caibi_admin");

  if (error || isAdmin !== true) {
    alert("⛔ 只有菜比官方管理員可以查看。");
    return;
  }

  if (!adminRedeemLogsPage) {
    console.error("找不到官方兌換紀錄頁面");
    return;
  }

  adminPage.hidden = true;

  gamePhone.classList.remove("admin-open");
  gamePhone.classList.add("admin-redeem-logs-open");

  adminRedeemLogsPage.hidden = false;
  await loadAdminRedeemLogs();
  
});

/* ← 返回官方管理中心 */

adminRedeemLogsBackButton?.addEventListener("click", () => {

  adminRedeemLogsPage.hidden = true;

  gamePhone.classList.remove("admin-redeem-logs-open");
  gamePhone.classList.add("admin-open");

  adminPage.hidden = false;

});


/* =========================
   📊 官方兌換紀錄－讀取與顯示
========================= */

const adminRedeemLogsSearch =
  document.getElementById("adminRedeemLogsSearch");

const adminRedeemLogsCount =
  document.getElementById("adminRedeemLogsCount");

const adminRedeemLogsList =
  document.getElementById("adminRedeemLogsList");

let adminRedeemLogs = [];

async function loadAdminRedeemLogs() {

  if (!adminRedeemLogsList || !adminRedeemLogsCount) return;

  adminRedeemLogsList.textContent = "📊 正在讀取兌換紀錄……";
  adminRedeemLogsCount.textContent = "正在載入……";

  const { data, error } =
    await caibiSupabase.rpc("caibi_list_redeem_logs");

  if (error) {
    console.error("📊 兌換紀錄讀取失敗：", error);
    adminRedeemLogsList.textContent = "❌ 兌換紀錄讀取失敗";
    adminRedeemLogsCount.textContent = "";
    return;
  }

  const grouped = new Map();

  for (const row of data || []) {

    if (!grouped.has(row.history_id)) {
      grouped.set(row.history_id, {
        ...row,
        rewards: []
      });
    }

    if (row.reward_key) {
      const reward =
        row.reward_key === "diamonds"
          ? `💎 鑽石 ×${row.quantity}`
          : row.reward_key === "gold_beans"
            ? `🫘 金豆 ×${row.quantity}`
            : `${row.reward_key} ×${row.quantity}`;

      grouped.get(row.history_id).rewards.push(reward);
    }
  }

  adminRedeemLogs = [...grouped.values()];

  renderAdminRedeemLogs();
}

function renderAdminRedeemLogs() {

  if (!adminRedeemLogsList || !adminRedeemLogsCount) return;

  const keyword =
    (adminRedeemLogsSearch?.value || "")
      .trim()
      .toLowerCase();

  const filtered = adminRedeemLogs.filter(log =>
    [
      log.display_name,
      log.username,
      log.code,
      log.gift_name
    ].join(" ").toLowerCase().includes(keyword)
  );

  adminRedeemLogsCount.textContent =
    keyword
      ? `找到 ${filtered.length} 筆／共 ${adminRedeemLogs.length} 筆兌換紀錄`
      : `共 ${adminRedeemLogs.length} 筆兌換紀錄`;

  adminRedeemLogsList.replaceChildren();

  if (filtered.length === 0) {
    adminRedeemLogsList.textContent =
      keyword
        ? "🔍 找不到符合的兌換紀錄"
        : "📭 目前沒有兌換紀錄";
    return;
  }

  for (const log of filtered) {

    const card = document.createElement("article");
    card.className = "admin-redeem-card";

    const addLine = (label, value) => {
      const line = document.createElement("div");
      line.className = "admin-redeem-line";

      const title = document.createElement("strong");
      title.textContent = `${label}：`;

      const content = document.createElement("span");
      content.textContent = String(value ?? "—");

      line.append(title, content);
      card.appendChild(line);
    };

    const date = new Date(log.redeemed_at);

    const formattedDate = Number.isNaN(date.getTime())
      ? "日期資料異常"
      : date.toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });

    addLine(
      "👤 玩家",
      `${log.display_name || "未設定暱稱"}（${log.username || "未知帳號"}）`
    );

    addLine("🎟️ 兌換碼", log.code);
    addLine("📝 禮包名稱", log.gift_name);
    addLine("🎁 獲得獎勵", log.rewards.join("、") || "無獎勵資料");
    addLine("📅 兌換時間", formattedDate);

    adminRedeemLogsList.appendChild(card);
  }
}

adminRedeemLogsSearch?.addEventListener(
  "input",
  renderAdminRedeemLogs
);

/* =========================
   🎰 前往全畫面抽獎
========================= */

const gachaButton =
  document.querySelector(
    '[data-phone-app="gacha"]'
  );

gachaButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "../assets/images/gacha/index.html";

  }
);

/* =========================
   🚀 啟動 1F
========================= */

checkHouseAccess();

/* =========================
   🎮 玩家移動
   鍵盤 + 點擊 / 觸控
========================= */

const livingRoom =
  document.getElementById("livingRoom");


let playerX = 50;
let playerY = 68;

const MOVE_SPEED = 0.6;

/* =========================
   🚧 客廳障礙物
========================= */

const obstacles = [

  /* 🗄️ 左側靠牆櫃 */
{
  left: 8,
  right: 15,
  top: 30,
  bottom: 57
},

  /* 📚 左上書櫃 */
  {
    left: 27,
    right: 38,
    top: 13,
    bottom: 29
  },

  /* 🛋️ 中央長沙發 */
  {
    left: 39,
    right: 58,
    top: 27,
    bottom: 36
  },

  /* ☕ 中央茶几 */
  {
    left: 40,
    right: 55,
    top: 38,
    bottom: 47
  },

  /* 🪑 右側單人椅 */
  {
    left: 57,
    right: 66,
    top: 31,
    bottom: 43
  },

  /* 🔥 壁爐 */
  {
    left: 61,
    right: 72,
    top: 18,
    bottom: 33
  },

  /* 🗄️ 右側靠牆櫃 */
{
  left: 85,
  right: 91,
  top: 30,
  bottom: 57
},

  /* 🗄️ 左下長櫃 */
  {
    left: 8,
    right: 30,
    top: 75,
    bottom: 88
  },

  /* 🪴 左側入口桌 */
  {
    left: 31,
    right: 45,
    top: 79,
    bottom: 94
  },

  /* 🚪 下方大門 */
  {
    left: 46,
    right: 58,
    top: 79,
    bottom: 96
  },

  /* 🪴 右側入口桌 */
  {
    left: 59,
    right: 73,
    top: 79,
    bottom: 94
  },

  /* 🗄️ 右下家具 */
  {
    left: 76,
    right: 89,
    top: 66,
    bottom: 88
  }

];

function isBlocked(x, y) {

  /* 👣 腳底碰撞盒 */
  const feetLeft = x - 2;
  const feetRight = x + 2;

  const feetTop = y;
  const feetBottom = y + 2;

  return obstacles.some((obstacle) => {

    return (
      feetRight >= obstacle.left &&
      feetLeft <= obstacle.right &&
      feetBottom >= obstacle.top &&
      feetTop <= obstacle.bottom
    );

  });
}

/* 點擊移動的目的地 */
let targetX = null;
let targetY = null;

const pressedKeys = new Set();


/* =========================
   ⌨️ WASD / 方向鍵
========================= */

window.addEventListener("keydown", (event) => {

  /* ⌨️ 正在輸入文字時，禁止人物移動 */
  const target = event.target;

  if (
    target instanceof Element &&
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
    )
  ) {
    pressedKeys.clear();
    return;
  }

  /* 📱 菜比手機開啟時，禁止人物移動 */
  if (gamePhonePanel.classList.contains("is-open")) {
    pressedKeys.clear();
    return;
  }

  const key = event.key.toLowerCase();

  const moveKeys = [
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright"
  ];

  if (!moveKeys.includes(key)) {
    return;
  }

  event.preventDefault();

  /* 鍵盤操作時取消自動走路 */
  targetX = null;
  targetY = null;

  pressedKeys.add(key);
});


window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key.toLowerCase());
});


/* =========================
   🖱️ 點擊 / 📱 觸控移動
========================= */

livingRoom.addEventListener("pointerdown", (event) => {

  /* 點到按鈕時不要移動 */
  if (
    event.target.closest("button") ||
    event.target.closest(".player-info")
  ) {
    return;
  }

  const rect =
    livingRoom.getBoundingClientRect();

  /* 把點擊位置換成百分比座標 */
  targetX =
    ((event.clientX - rect.left) / rect.width) * 100;

  targetY =
    ((event.clientY - rect.top) / rect.height) * 100;


  /* 暫時限制在場景範圍 */
 targetX =
  Math.max(15, Math.min(85, targetX));

targetY =
  Math.max(43, Math.min(86, targetY));
});


/* =========================
   🚶 每幀更新玩家位置
========================= */

function movePlayer() {

  /* ---------- 先記住目前位置 ---------- */

  let nextX = playerX;
  let nextY = playerY;


  /* ---------- ⌨️ 鍵盤 ---------- */

  if (
    pressedKeys.has("w") ||
    pressedKeys.has("arrowup")
  ) {
    nextY -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("s") ||
    pressedKeys.has("arrowdown")
  ) {
    nextY += MOVE_SPEED;
  }

  if (
    pressedKeys.has("a") ||
    pressedKeys.has("arrowleft")
  ) {
    nextX -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("d") ||
    pressedKeys.has("arrowright")
  ) {
    nextX += MOVE_SPEED;
  }


  /* ---------- 🖱️ 點擊 / 📱 觸控自動走路 ---------- */

  if (
    targetX !== null &&
    targetY !== null
  ) {

    const dx = targetX - playerX;
    const dy = targetY - playerY;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance < MOVE_SPEED) {

      nextX = targetX;
      nextY = targetY;

      targetX = null;
      targetY = null;

    } else {

      nextX =
        playerX + (dx / distance) * MOVE_SPEED;

      nextY =
        playerY + (dy / distance) * MOVE_SPEED;
    }
  }


  /* ---------- 🪵 客廳外圍邊界 ---------- */

 nextX =
  Math.max(15, Math.min(85, nextX));

  nextY =
    Math.max(43, Math.min(86, nextY));


  /* ---------- 🚧 障礙物碰撞 ---------- */

  if (!isBlocked(nextX, nextY)) {

    playerX = nextX;
    playerY = nextY;

  } else {

    /* 點擊走路撞到障礙物就停止 */
    targetX = null;
    targetY = null;
  }


  /* ---------- 🎮 更新角色位置 ---------- */

  playerCharacter.style.left =
    `${playerX}%`;

  playerCharacter.style.top =
    `${playerY}%`;


  requestAnimationFrame(movePlayer);
}

movePlayer();