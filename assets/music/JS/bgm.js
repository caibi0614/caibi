/* ==================================================
   🎵 菜比 CAIBI｜共用背景音樂系統
================================================== */

(() => {

  const STORAGE_MUTED =
    "caibi_bgm_muted";

  const STORAGE_VOLUME =
    "caibi_bgm_volume";


  /* =========================
     🎵 取得頁面指定的 BGM
  ========================= */

  const bgmPath =
    document.body.dataset.bgm;

  if (!bgmPath) {
    return;
  }


  /* =========================
     🔊 建立播放器
  ========================= */

  const bgm =
    new Audio(bgmPath);

  bgm.loop = true;
  bgm.preload = "auto";


  /* =========================
     💾 讀取玩家設定
  ========================= */

  const savedVolumeRaw =
  localStorage.getItem(
    STORAGE_VOLUME
  );

const savedVolume =
  savedVolumeRaw !== null
    ? Number(savedVolumeRaw)
    : null;


bgm.volume =
  savedVolume !== null &&
  Number.isFinite(savedVolume)
    ? Math.min(
        1,
        Math.max(0, savedVolume)
      )
    : 0.35;


  bgm.muted =
    localStorage.getItem(
      STORAGE_MUTED
    ) === "true";


  /* =========================
     ▶️ 嘗試播放
  ========================= */

  async function playBgm() {

    if (bgm.muted) {
      return;
    }

    try {

      await bgm.play();

      removeFirstInteractionListeners();

    } catch {

      /*
        瀏覽器可能禁止自動播放。
        等玩家第一次點擊／觸碰／按鍵後再播放。
      */

    }

  }


  /* =========================
     👆 第一次互動後播放
  ========================= */

  function handleFirstInteraction() {

    playBgm();

  }


  function addFirstInteractionListeners() {

    document.addEventListener(
      "pointerdown",
      handleFirstInteraction,
      { once: true }
    );

    document.addEventListener(
      "keydown",
      handleFirstInteraction,
      { once: true }
    );

  }


  function removeFirstInteractionListeners() {

    document.removeEventListener(
      "pointerdown",
      handleFirstInteraction
    );

    document.removeEventListener(
      "keydown",
      handleFirstInteraction
    );

  }


  addFirstInteractionListeners();
  playBgm();


  /* =========================
     🎛️ 對外控制
  ========================= */

  window.caibiBgm = {

    play() {
      return playBgm();
    },


    pause() {
      bgm.pause();
    },


    setMuted(value) {

      bgm.muted =
        Boolean(value);

      localStorage.setItem(
        STORAGE_MUTED,
        String(bgm.muted)
      );

      if (!bgm.muted) {
        playBgm();
      }

    },


    toggleMuted() {

      this.setMuted(
        !bgm.muted
      );

      return bgm.muted;

    },


    setVolume(value) {

      const volume =
        Math.min(
          1,
          Math.max(
            0,
            Number(value)
          )
        );

      bgm.volume =
        Number.isFinite(volume)
          ? volume
          : 0.35;

      localStorage.setItem(
        STORAGE_VOLUME,
        String(bgm.volume)
      );

    },


    getMuted() {
      return bgm.muted;
    },


    getVolume() {
      return bgm.volume;
    },


    getAudio() {
      return bgm;
    }

  };

})();