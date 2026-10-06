/* =========================
   🌾 菜比之家｜後院農場
========================= */

const backyard =
  document.getElementById("backyard");

const backyardMapLayer =
  document.getElementById("backyardMapLayer");

const playerCharacter =
  document.getElementById("playerCharacter");

const bakeryEntrance =
  document.getElementById("bakeryEntrance");

/* =========================
   🌱 六塊農田＋種植選單
========================= */

const farmPlots =
  document.querySelectorAll(".farm-plot");

const plantModal =
  document.getElementById("plantModal");

const plantModalTitle =
  document.getElementById("plantModalTitle");

const closePlantModal =
  document.getElementById("closePlantModal");

const cancelPlant =
  document.getElementById("cancelPlant");

let selectedPlotId = null;

const seedButtons =
  document.querySelectorAll(
    ".seed-option[data-seed]"
  );

let currentUserId = null;

let farmStateTimer = null;
let playerFarmData = [];

/* =========================
   🌱 施肥選單
========================= */

const fertilizerModal =
  document.getElementById(
    "fertilizerModal"
  );

const fertilizerModalTitle =
  document.getElementById(
    "fertilizerModalTitle"
  );

const fertilizerRemainingTime =
  document.getElementById(
    "fertilizerRemainingTime"
  );

const useFertilizerButton =
  document.getElementById(
    "useFertilizerButton"
  );

const closeFertilizerModal =
  document.getElementById(
    "closeFertilizerModal"
  );

const cancelFertilizer =
  document.getElementById(
    "cancelFertilizer"
  );

let selectedFertilizerPlotId = null;

/* =========================
   🐄🐔 畜牧系統
========================= */

const cowAnimal =
  document.getElementById("cowAnimal");

const chickenAnimal =
  document.getElementById("chickenAnimal");

const livestockModal =
  document.getElementById("livestockModal");

const livestockTitle =
  document.getElementById("livestockTitle");

const livestockStatus =
  document.getElementById("livestockStatus");

const livestockTimer =
  document.getElementById("livestockTimer");

const livestockRemainingTime =
  document.getElementById(
    "livestockRemainingTime"
  );

const livestockActionButton =
  document.getElementById(
    "livestockActionButton"
  );

const livestockActionIcon =
  document.getElementById(
    "livestockActionIcon"
  );

const livestockActionText =
  document.getElementById(
    "livestockActionText"
  );

const closeLivestockModal =
  document.getElementById(
    "closeLivestockModal"
  );

const cancelLivestock =
  document.getElementById(
    "cancelLivestock"
  );

let selectedAnimalKey = null;

let playerLivestockData = [];

let livestockTimerInterval = null;


const livestockConfig = {

  cow: {
    title: "🐄 牛牛",
    feedIcon: "🌾",
    feedText: "餵食小麥 ×2",
    productIcon: "🥛",
    productName: "牛奶"
  },

  chicken: {
    title: "🐔 雞雞",
    feedIcon: "🌽",
    feedText: "餵食玉米 ×1",
    productIcon: "🥚",
    productName: "雞蛋"
  }

};

/* 🌱 打開施肥視窗 */

function openFertilizerModal(
  plotNumber
) {

  const farmData =
    playerFarmData.find(
      item =>
        item.plot_number ===
        plotNumber
    );


  if (
    !farmData ||
    !farmData.ready_at
  ) {
    return;
  }


  selectedFertilizerPlotId =
    plotNumber;


  fertilizerModalTitle.textContent =
    `🌱 第 ${plotNumber} 塊農田`;


  const readyTime =
    new Date(
      farmData.ready_at
    ).getTime();

  const remainingMs =
    Math.max(
      0,
      readyTime - Date.now()
    );

  const remainingSeconds =
    Math.ceil(
      remainingMs / 1000
    );

  const minutes =
    Math.floor(
      remainingSeconds / 60
    );

  const seconds =
    remainingSeconds % 60;


  fertilizerRemainingTime.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  /* 🌱 本輪是否已經施肥 */

  if (farmData.fertilized) {

    useFertilizerButton.disabled =
      true;

    useFertilizerButton.innerHTML =
      `
        <span class="seed-icon">🌱</span>
        <span class="seed-name">
          本輪已施肥
        </span>
      `;

  } else {

    useFertilizerButton.disabled =
      false;

    useFertilizerButton.innerHTML =
      `
        <span class="seed-icon">🌱</span>
        <span class="seed-name">
          使用肥料 ×1
        </span>
      `;

  }

  fertilizerModal.classList.add(
    "is-open"
  );

  fertilizerModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


/* ❌ 關閉施肥視窗 */

function hideFertilizerModal() {

  fertilizerModal.classList.remove(
    "is-open"
  );

  fertilizerModal.setAttribute(
    "aria-hidden",
    "true"
  );

  selectedFertilizerPlotId = null;
}


/* ❌ 右上角 × */

closeFertilizerModal.addEventListener(
  "click",
  hideFertilizerModal
);


/* ❌ 取消 */

cancelFertilizer.addEventListener(
  "click",
  hideFertilizerModal
);


/* 🌑 點背景關閉 */

fertilizerModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      fertilizerModal
    ) {
      hideFertilizerModal();
    }

  }
);

/* =========================
   🌱 使用肥料
========================= */

async function fertilizeFarmPlot() {

  if (
    !selectedFertilizerPlotId ||
    !currentUserId
  ) {
    return;
  }


  const plotNumber =
    Number(
      selectedFertilizerPlotId
    );


  /* 🌱 防止連續點擊 */
  useFertilizerButton.disabled =
    true;

  const originalText =
    useFertilizerButton.textContent;


  useFertilizerButton.textContent =
    "施肥中…";


  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "fertilize_farm_plot",
      {
        p_plot_number:
          plotNumber
      }
    );


  useFertilizerButton.disabled =
    false;

  useFertilizerButton.textContent =
    originalText;


  /* ❌ 施肥失敗 */
  if (error) {

    console.error(
      "🌱 施肥失敗：",
      error
    );


    if (
      error.message?.includes(
        "NOT_ENOUGH_FERTILIZER"
      )
    ) {

      alert(
        "🌱 肥料不足！可至烘焙房使用廚餘製作肥料。"
      );

    } else if (
      error.message?.includes(
        "ALREADY_FERTILIZED"
      )
    ) {

      alert(
        "🌱 這一輪已經施過肥了！"
      );

    } else if (
      error.message?.includes(
        "CROP_ALREADY_READY"
      )
    ) {

      alert(
        "🌾 作物已經成熟，不需要施肥！"
      );

    } else if (
      error.message?.includes(
        "NO_CROP"
      )
    ) {

      alert(
        "🌱 這塊田目前沒有作物！"
      );

    } else {

      alert(
        "🌱 施肥失敗，請再試一次！"
      );

    }

    return;
  }


  console.log(
    "🌱 施肥成功：",
    data
  );


  hideFertilizerModal();


  /* 🌾 重新取得 ready_at，
     畫面會立即套用減半後的時間 */
  await loadFarmState();


  alert(
    "🌱 施肥成功！剩餘生長時間已減半。"
  );
}


/* 🌱 點擊使用肥料 */

useFertilizerButton.addEventListener(
  "click",
  fertilizeFarmPlot
);

/* 🌱 開啟種植選單 */

function openPlantModal(plotId) {

  selectedPlotId = plotId;

  plantModalTitle.textContent =
    `🌱 第 ${plotId} 塊農田`;

  plantModal.classList.add("is-open");

  plantModal.setAttribute(
    "aria-hidden",
    "false"
  );
}


/* ❌ 關閉種植選單 */

function hidePlantModal() {

  plantModal.classList.remove("is-open");

  plantModal.setAttribute(
    "aria-hidden",
    "true"
  );

  selectedPlotId = null;
}


/* 🌱 點擊六塊農田 */

farmPlots.forEach((plot) => {

  plot.addEventListener(
    "pointerdown",
    (event) => {
      event.stopPropagation();
    }
  );

  plot.addEventListener(
    "click",
    async (event) => {

      event.stopPropagation();

      const plotNumber =
        Number(plot.dataset.plotId);


      /* 🌾 已成熟 → 收成 */

      if (
        plot.classList.contains(
          "is-ready"
        )
      ) {

        await harvestFarmPlot(
          plotNumber
        );

        return;
      }


      /* 🌱 生長中 → 開啟施肥視窗 */

if (
  plot.classList.contains(
    "is-growing"
  )
) {

  openFertilizerModal(
    plotNumber
  );

  return;
}


      /* 🟫 空田 → 開啟種植視窗 */

      openPlantModal(
        plotNumber
      );
    }
  );
});

/* ❌ 右上角 × */

closePlantModal.addEventListener(
  "click",
  hidePlantModal
);


/* ❌ 取消 */

cancelPlant.addEventListener(
  "click",
  hidePlantModal
);


/* 🌑 點黑色背景關閉 */

plantModal.addEventListener(
  "click",
  (event) => {

    if (event.target === plantModal) {
      hidePlantModal();
    }
  }
);

/* =========================
   🌱 種植農作物
========================= */

async function plantCrop(
  cropKey,
  seedButton
) {

  if (
    !selectedPlotId ||
    !currentUserId
  ) {
    return;
  }

  const plotNumber =
    Number(selectedPlotId);


  /* 🌱 防止連續點擊 */

  seedButtons.forEach(
    button => {
      button.disabled = true;
    }
  );


  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "plant_farm_crop",
      {
        p_plot_number:
          plotNumber,

        p_crop_key:
          cropKey
      }
    );


  seedButtons.forEach(
    button => {
      button.disabled = false;
    }
  );


  /* ❌ 種植失敗 */

  if (error) {

    console.error(
      "🌱 種植失敗：",
      error
    );


    if (
      error.message?.includes(
        "NOT_ENOUGH_SEEDS"
      )
    ) {

      const cropName =
        cropKey === "corn"
          ? "玉米"
          : "小麥";

      alert(
        `🌱 ${cropName}種子不足！請先到商店購買。`
      );

    } else if (
      error.message?.includes(
        "PLOT_OCCUPIED"
      )
    ) {

      alert(
        "🌱 這塊田已經有作物了！"
      );

    } else {

      alert(
        "🌱 種植失敗，請再試一次！"
      );
    }

    return;
  }


  console.log(
    "🌱 種植成功：",
    data
  );


  hidePlantModal();

  await loadFarmState();
}


/* 🌾🌽 點擊種子 */

seedButtons.forEach(
  (seedButton) => {

    seedButton.addEventListener(
      "click",
      () => {

        const cropKey =
          seedButton.dataset.seed;

        plantCrop(
          cropKey,
          seedButton
        );
      }
    );
  }
);

/* =========================
   🌱 農田狀態顯示
========================= */

async function loadFarmState() {

  if (!currentUserId) {
    return;
  }

  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_farm_plots")
      .select(`
  plot_number,
  crop_id,
  planted_at,
  ready_at,
  fertilized,
  crop_items (
    name,
    emoji
  )
`)
      .eq(
        "owner_user_id",
        currentUserId
      );


  if (error) {

    console.error(
      "讀取農田狀態失敗：",
      error
    );

    return;
  }


  playerFarmData =
    data || [];

  renderFarmState();


  if (farmStateTimer) {
    clearInterval(farmStateTimer);
  }


  farmStateTimer =
    setInterval(
      renderFarmState,
      1000
    );
}


/* 🌾 更新六塊田畫面 */

function renderFarmState() {

  const now =
    Date.now();


  farmPlots.forEach((plot) => {

    const plotNumber =
      Number(
        plot.dataset.plotId
      );

    const status =
      plot.querySelector(
        ".farm-status"
      );


    if (!status) {
      return;
    }


    const farmData =
      playerFarmData.find(
        item =>
          item.plot_number ===
          plotNumber
      );


    /* 🟫 空田 */

    if (
      !farmData ||
      !farmData.crop_id ||
      !farmData.ready_at
    ) {

      plot.classList.remove(
        "is-growing",
        "is-ready"
      );

      status.textContent = "";

      return;
    }


    const readyTime =
      new Date(
        farmData.ready_at
      ).getTime();

    const remainingMs =
      readyTime - now;


    /* 🌾 已成熟 */

    if (remainingMs <= 0) {

      plot.classList.remove(
        "is-growing"
      );

      plot.classList.add(
        "is-ready"
      );

      const emoji =
        farmData.crop_items?.emoji ||
        "🌾";

      status.innerHTML =
        `${emoji}<br>可收成！`;

      return;
    }


    /* 🌱 生長中 */

    plot.classList.remove(
      "is-ready"
    );

    plot.classList.add(
      "is-growing"
    );


    const remainingSeconds =
      Math.ceil(
        remainingMs / 1000
      );

    const minutes =
      Math.floor(
        remainingSeconds / 60
      );

    const seconds =
      remainingSeconds % 60;

    const timeText =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    status.innerHTML =
      `🌱<br>${timeText}`;
  });
}

/* =========================
   🌾 收成農作物
========================= */

async function harvestFarmPlot(
  plotNumber
) {

  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "harvest_farm_plot",
      {
        p_plot_number:
          plotNumber
      }
    );


  if (error) {

    console.error(
      "收成失敗：",
      error
    );

    alert(
      "🌱 收成失敗，請再試一次！"
    );

    return;
  }


  const cropName =
    data?.crop_name ||
    "農作物";

  const quantity =
    data?.harvest_quantity ||
    1;


  alert(
    `🌾 收成 ${cropName} ×${quantity}！`
  );


  await loadFarmState();
}

/* =========================
   🐄🐔 讀取畜牧狀態
========================= */

async function loadLivestockState() {

  if (!currentUserId) {
    return;
  }

  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_livestock")
      .select(`
        animal_key,
        status,
        production_started_at,
        production_ready_at
      `)
      .eq(
        "user_id",
        currentUserId
      );


  if (error) {

    console.error(
      "🐄🐔 讀取畜牧狀態失敗：",
      error
    );

    return;
  }


  playerLivestockData =
    data || [];


  if (selectedAnimalKey) {
    renderLivestockModal();
  }
}


/* =========================
   🐄🐔 打開互動視窗
========================= */

function openLivestockModal(
  animalKey
) {

  selectedAnimalKey =
    animalKey;

  renderLivestockModal();

  livestockModal.classList.add(
    "is-open"
  );

  livestockModal.setAttribute(
    "aria-hidden",
    "false"
  );


  if (livestockTimerInterval) {
    clearInterval(
      livestockTimerInterval
    );
  }

  livestockTimerInterval =
    setInterval(
      renderLivestockModal,
      1000
    );
}


/* =========================
   🐄🐔 關閉互動視窗
========================= */

function hideLivestockModal() {

  livestockModal.classList.remove(
    "is-open"
  );

  livestockModal.setAttribute(
    "aria-hidden",
    "true"
  );

  selectedAnimalKey = null;

  if (livestockTimerInterval) {

    clearInterval(
      livestockTimerInterval
    );

    livestockTimerInterval = null;
  }
}


/* =========================
   🐄🐔 更新視窗內容
========================= */

function renderLivestockModal() {

  if (!selectedAnimalKey) {
    return;
  }


  const config =
    livestockConfig[
      selectedAnimalKey
    ];

  if (!config) {
    return;
  }


  livestockTitle.textContent =
    config.title;


  const livestockData =
    playerLivestockData.find(
      item =>
        item.animal_key ===
        selectedAnimalKey
    );


  /* 🍽️ 空閒 */

  if (
    !livestockData ||
    livestockData.status === "idle" ||
    !livestockData.production_ready_at
  ) {

    livestockStatus.textContent =
      "肚子餓餓～";

    livestockTimer.hidden =
      true;

    livestockActionButton.disabled =
      false;

    livestockActionIcon.textContent =
      config.feedIcon;

    livestockActionText.textContent =
      config.feedText;

    livestockActionButton.dataset.action =
      "feed";

    return;
  }


  const readyTime =
    new Date(
      livestockData.production_ready_at
    ).getTime();

  const remainingMs =
    readyTime - Date.now();


  /* 🥛🥚 生產完成 */

  if (remainingMs <= 0) {

    livestockStatus.textContent =
      `${config.productIcon} ${config.productName}準備好了！`;

    livestockTimer.hidden =
      true;

    livestockActionButton.disabled =
      false;

    livestockActionIcon.textContent =
      config.productIcon;

    livestockActionText.textContent =
      `收取${config.productName} ×1`;

    livestockActionButton.dataset.action =
      "collect";

    return;
  }


  /* ⏰ 生產中 */

  const remainingSeconds =
    Math.ceil(
      remainingMs / 1000
    );

  const minutes =
    Math.floor(
      remainingSeconds / 60
    );

  const seconds =
    remainingSeconds % 60;


  livestockStatus.textContent =
    `${config.productIcon} ${config.productName}生產中～`;

  livestockTimer.hidden =
    false;

  livestockRemainingTime.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  livestockActionButton.disabled =
    true;

  livestockActionIcon.textContent =
    "⏰";

  livestockActionText.textContent =
    "努力生產中…";

  livestockActionButton.dataset.action =
    "producing";
}


/* =========================
   🍽️ 餵食動物
========================= */

async function feedLivestock() {

  if (!selectedAnimalKey) {
    return;
  }


  livestockActionButton.disabled =
    true;

  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "feed_livestock",
      {
        p_animal_key:
          selectedAnimalKey
      }
    );


  if (error) {

    console.error(
      "🍽️ 餵食失敗：",
      error
    );


    if (
      error.message?.includes(
        "NOT_ENOUGH_FEED"
      )
    ) {

      const config =
        livestockConfig[
          selectedAnimalKey
        ];

      alert(
        `${config.feedIcon} 飼料不足！`
      );

    } else if (
      error.message?.includes(
        "ANIMAL_BUSY"
      )
    ) {

      alert(
        "🐄🐔 還在生產中，不能重複餵食！"
      );

    } else {

      alert(
        "🍽️ 餵食失敗，請再試一次！"
      );
    }


    livestockActionButton.disabled =
      false;

    return;
  }


  console.log(
    "🍽️ 餵食成功：",
    data
  );


  await loadLivestockState();
}


/* =========================
   🥛🥚 收取產品
========================= */

async function collectLivestock() {

  if (!selectedAnimalKey) {
    return;
  }


  const animalKey =
    selectedAnimalKey;

  const config =
    livestockConfig[
      animalKey
    ];


  livestockActionButton.disabled =
    true;


  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "collect_livestock",
      {
        p_animal_key:
          animalKey
      }
    );


  if (error) {

    console.error(
      "🥛🥚 收取失敗：",
      error
    );


    if (
      error.message?.includes(
        "NOT_READY"
      )
    ) {

      alert(
        "⏰ 還沒生產完成喔！"
      );

    } else {

      alert(
        "🥛🥚 收取失敗，請再試一次！"
      );
    }


    livestockActionButton.disabled =
      false;

    return;
  }


  console.log(
    "🥛🥚 收取成功：",
    data
  );


  await loadLivestockState();


  alert(
    `${config.productIcon} 收取${config.productName} ×1！`
  );
}


/* =========================
   🐄🐔 動物點擊
========================= */

cowAnimal.addEventListener(
  "pointerdown",
  event => {
    event.stopPropagation();
  }
);

chickenAnimal.addEventListener(
  "pointerdown",
  event => {
    event.stopPropagation();
  }
);


cowAnimal.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    openLivestockModal(
      "cow"
    );
  }
);


chickenAnimal.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    openLivestockModal(
      "chicken"
    );
  }
);


/* 🍽️ / 🥛🥚 共用按鈕 */

livestockActionButton.addEventListener(
  "click",
  async () => {

    const action =
      livestockActionButton
        .dataset.action;


    if (action === "feed") {

      await feedLivestock();

    } else if (
      action === "collect"
    ) {

      await collectLivestock();
    }
  }
);


/* ❌ 關閉 */

closeLivestockModal.addEventListener(
  "click",
  hideLivestockModal
);

cancelLivestock.addEventListener(
  "click",
  hideLivestockModal
);


/* 🌑 點背景關閉 */

livestockModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      livestockModal
    ) {

      hideLivestockModal();
    }
  }
);

/* =========================
   🚶 玩家移動資料
========================= */

let playerX = 50;
let playerY = 70;

const MOVE_SPEED = 0.6;

const pressedKeys = new Set();

/* =========================
   🖱️ 點擊／觸控移動資料
========================= */

let targetX = null;
let targetY = null;

const CLICK_MOVE_SPEED = 0.8;

/* =========================
   👆 點擊／觸控設定目的地
========================= */

backyard.addEventListener(
  "pointerdown",
  (event) => {

    /* 點到門時，不觸發人物移動 */
    if (
      event.target.closest(
        ".bakery-entrance"
      )
    ) {
      return;
    }

    const rect =
      backyardMapLayer.getBoundingClientRect();

    /* 點在 16:9 地圖外就不處理 */
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    const clickedX =
      ((event.clientX - rect.left) /
        rect.width) * 100;

    const clickedY =
      ((event.clientY - rect.top) /
        rect.height) * 100;

    /* 只有可走區才能設定目的地 */
    if (
      !isBackyardWalkable(
        clickedX,
        clickedY
      )
    ) {
      return;
    }

    targetX = clickedX;
    targetY = clickedY;
  }
);

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

window.addEventListener(
  "keydown",
  (event) => {

    const key =
      event.key.toLowerCase();

    if (
      key === "w" ||
      key === "a" ||
      key === "s" ||
      key === "d" ||
      key.startsWith("arrow")
    ) 
    
    event.preventDefault();
pressedKeys.add(key);

/* 手動控制時，取消點擊自動移動 */
targetX = null;
targetY = null;

  }
);


window.addEventListener(
  "keyup",
  (event) => {

    pressedKeys.delete(
      event.key.toLowerCase()
    );
  }
);


/* =========================
   🎮 移動循環
========================= */

/* =========================
   🌿 後院可行走區域
========================= */

const backyardWalkAreas = [

  /* 🌱 中央主要草地 */
  {
    left: 30,
    right: 72,
    top: 24,
    bottom: 73
  },

  /* 🚪 上方｜通往烘焙房 */
  {
    left: 43,
    right: 61,
    top: 19,
    bottom: 35
  },

  /* 🌿 左側草地延伸 */
  {
    left: 36,
    right: 42,
    top: 38,
    bottom: 62
  },

  /* 🌼 下方｜花拱門前 */
  {
    left: 37,
    right: 69,
    top: 61,
    bottom: 76
  },

  /* 🪵 左下木平台 */
  {
    left: 6,
    right: 25,
    top: 60,
    bottom: 77
  },

  /* 🪵 木平台連接草地 */
  {
    left: 20,
    right: 38,
    top: 62,
    bottom: 72
  }
];


function isBackyardWalkable(x, y) {

  return backyardWalkAreas.some(
    (area) => {

      return (
        x >= area.left &&
        x <= area.right &&
        y >= area.top &&
        y <= area.bottom
      );
    }
  );
}

/* =========================
   🎮 玩家移動循環
========================= */

function movePlayer() {

  let dx = 0;
  let dy = 0;

  /* =========================
   🖱️ 點擊／觸控自動移動
========================= */

if (
  targetX !== null &&
  targetY !== null
) {

  const distanceX =
    targetX - playerX;

  const distanceY =
    targetY - playerY;

  const distance =
    Math.hypot(
      distanceX,
      distanceY
    );

  /* 已經走到目的地 */
  if (distance < CLICK_MOVE_SPEED) {

    playerX = targetX;
    playerY = targetY;

    targetX = null;
    targetY = null;

  } else {

    dx =
      (distanceX / distance) *
      CLICK_MOVE_SPEED;

    dy =
      (distanceY / distance) *
      CLICK_MOVE_SPEED;
  }
}

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

 const nextX = playerX + dx;
 const nextY = playerY + dy;

/* ↔️ 左右移動 */
if (
  isBackyardWalkable(nextX, playerY)
) {
  playerX = nextX;
}

/* ↕️ 上下移動 */
if (
  isBackyardWalkable(playerX, nextY)
) {
  playerY = nextY;
}

  updatePlayerPosition();

  requestAnimationFrame(movePlayer);
}

/* =========================
   🚪 返回烘焙房
========================= */

bakeryEntrance.addEventListener(
  "click",
  () => {
    window.location.href = "../bakery/index.html";
  }
);

/* =========================
   🔐 檢查會員身分＋載入角色
========================= */

async function checkBackyardAccess() {

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

currentUserId =
  session.user.id;

await Promise.all([
  loadFarmState(),
  loadLivestockState()
]);

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


  /* 🧍 全部載完才顯示 */

  playerCharacter.style.display =
    "block";


  console.log(
    "👗 後院分層角色載入完成",
    equipment
  );
}

/* =========================
   🚀 啟動後院農場
========================= */

updatePlayerPosition();
movePlayer();

checkBackyardAccess();