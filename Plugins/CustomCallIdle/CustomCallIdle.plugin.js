/**
 * @name CustomCallIdle
 * @author Mom's Spaggeti
 * @description Describe the basic information. Maybe a support server link.
 * @version 1.0
 * @authorId 51512151151651
 * @website https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUXbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXDSBwkJhwoBhyohjO8%3D
 * @source https://github.com/Kasir984/CustomCallIdle
 */

class SettingsMgr {
  constructor() {
    this.settings = {
      enabled: false,
      mode: "disconnect", // extend, mute, deafen, both, disconnect, disable
      timeoutMinutes: 3, // Default to 3 minutes, same as Discord's default idle timeout
    };
    this.loadSettings();
  }

  saveSettings() {
    BdApi.Data.save("CustomCallIdle", "settings", this.settings);
  }

  loadSettings() {
    const saved = BdApi.Data.load("CustomCallIdle", "settings");
    if (saved) {
      this.settings = Object.assign(this.settings, saved);
    }
  }
}

module.exports = class CustomCallIdle {
  getName() {
    return "Custom Call Idle Actions";
  }
  getDescription() {
    return "Customize what happens when you go idle in a voice call.";
  }
  getVersion() {
    return "1.0";
  }
  getAuthor() {
    return "Mom's Spaggeti";
  }

  constructor() {
    this.settingsMgr = new SettingsMgr();
    this.voiceActions = null;
  }

  start() {
    if (this.settingsMgr.settings.enabled) {
      console.log("[CustomCallIdle] Plugin is enabled. Starting...");
      try {
        // Get VoiceActions module
        this.voiceActions = BdApi.Webpack.getModule(
          (m) => m?.toggleSelfMute && m?.toggleSelfDeaf,
        );
        if (!this.voiceActions) {
          console.error("[CustomCallIdle] Failed to find VoiceActions module");
        }

        // Patch the handleIdleUpdate function
        const ChannelCallModule = BdApi.Webpack.getModule(
          (m) => m?.handleIdleUpdate,
        );
        if (!ChannelCallModule || !ChannelCallModule.handleIdleUpdate) {
          console.error("[CustomCallIdle] Failed to find ChannelCallModule");
          return;
        }

        this.original = ChannelCallModule.handleIdleUpdate;
        const self = this;
        ChannelCallModule.handleIdleUpdate = function (...args) {
          self.handleCustomIdle(this);
          return self.original.apply(this, args);
        };

        console.log("[CustomCallIdle] Patched handleIdleUpdate successfully");
      } catch (e) {
        console.error("[CustomCallIdle] Error in start():", e);
      }
    } else {
      console.log("[CustomCallIdle] Plugin is disabled. Not patching.");
    }
  }

  stop() {
    try {
      // Restore original function
      const ChannelCallModule = BdApi.Webpack.getModule(
        (m) => m?.handleIdleUpdate,
      );
      if (ChannelCallModule && this.original) {
        ChannelCallModule.handleIdleUpdate = this.original;
      }
      console.log("[CustomCallIdle] Restored original handleIdleUpdate");
    } catch (e) {
      console.error("[CustomCallIdle] Error in stop():", e);
    }
  }

  handleCustomIdle(context) {
    const mode = this.settingsMgr.settings.mode;
    const timeout = this.settingsMgr.settings.timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds

    console.log(
      `[CustomCallIdle] Handling idle with mode: ${mode} and timeout: ${timeout}ms`,
    );

    if (!this.voiceActions) {
      console.error("[CustomCallIdle] VoiceActions module not available");
      return;
    }

    switch (mode) {
      case "extend":
        // Extend the idle timeout by resetting it with the new timeout value
        if (context.idleTimeout) {
          context.idleTimeout.start(timeout);
        }
        break;
      case "mute":
        // Mute the user
        this.voiceActions.toggleSelfMute();
        break;
      case "deafen":
        // Deafen the user
        this.voiceActions.toggleSelfDeaf();
        break;
      case "both":
        // Mute and deafen the user
        this.voiceActions.toggleSelfMute();
        this.voiceActions.toggleSelfDeaf();
        break;
      case "disconnect":
        // Disconnect the user from the call
        if (this.voiceActions.leaveCall) {
          this.voiceActions.leaveCall();
        }
        break;
      case "disable":
        // Do nothing, effectively disabling idle actions
        break;
      default:
        console.warn(`[CustomCallIdle] Unknown mode: ${mode}`);
    }
  }

  getSettingsPanel() {
    // Use Discord's dark theme colors
    let bgColor = "#2f3136"; // Discord's dark background color
    let inputBgColor = "#202225"; // Darker background for inputs

    try {
      // Try to get background color from Discord's theme elements
      const darkBg =
        document.querySelector('[class*="theme-dark"]') ||
        document.querySelector('[class*="contentRegion"]');
      if (darkBg) {
        const computedBg = window.getComputedStyle(darkBg).backgroundColor;
        if (computedBg && computedBg !== "rgba(0, 0, 0, 0)") {
          bgColor = computedBg;
        }
      }
    } catch (e) {
      console.warn("[CustomCallIdle] Could not get background color:", e);
    }

    // Create the settings panel
    const panel = document.createElement("div");
    panel.style.padding = "10px";
    panel.style.backgroundColor = bgColor;
    panel.style.borderRadius = "8px";

    // Mode Select
    const modeLabel = document.createElement("label");
    modeLabel.textContent = "Select Idle Action: ";
    modeLabel.style.display = "block";
    modeLabel.style.color = "#fff";
    modeLabel.style.marginBottom = "10px";
    modeLabel.style.fontSize = "14px";
    modeLabel.style.fontWeight = "bold";

    // Timeout Input
    const timeoutLabel = document.createElement("label");
    timeoutLabel.textContent = "Idle Timeout (minutes): ";
    timeoutLabel.style.display = "block";
    timeoutLabel.style.color = "#fff";
    timeoutLabel.style.marginBottom = "15px";
    timeoutLabel.style.fontSize = "14px";
    timeoutLabel.style.fontWeight = "bold";

    const timeoutInput = document.createElement("input");
    timeoutInput.type = "number";
    timeoutInput.value = this.settingsMgr.settings.timeoutMinutes;
    timeoutInput.style.marginLeft = "10px";
    timeoutInput.style.padding = "5px";
    timeoutInput.style.width = "80px";
    timeoutInput.style.backgroundColor = inputBgColor;
    timeoutInput.style.color = "#dcddde";
    timeoutInput.style.border = "1px solid #202225";
    timeoutInput.style.borderRadius = "3px";
    timeoutInput.addEventListener("change", (e) => {
      this.settingsMgr.settings.timeoutMinutes = parseInt(e.target.value) || 3;
      this.settingsMgr.saveSettings();
    });
    timeoutLabel.appendChild(timeoutInput);

    // Create the select element for modes
    const modeSelect = document.createElement("select");
    modeSelect.textContent = "Select Mode";
    modeSelect.style.display = "block";
    modeSelect.style.color = "#dcddde";
    modeSelect.style.backgroundColor = inputBgColor;
    modeSelect.style.border = "1px solid #202225";
    modeSelect.style.borderRadius = "3px";
    modeSelect.style.padding = "5px";
    modeSelect.style.marginBottom = "10px";
    modeSelect.style.fontWeight = "bold";
    const modes = [
      { value: "extend", label: "Extend Idle Time" },
      { value: "mute", label: "Mute User" },
      { value: "deafen", label: "Deafen User" },
      { value: "both", label: "Mute + Deafen User" },
      { value: "disconnect", label: "Disconnect User" },
      { value: "disable", label: "Disable Idle Actions (No Disconnect)" },
    ];
    modes.forEach((mode) => {
      const option = document.createElement("option");
      option.value = mode.value;
      option.textContent = mode.label;
      option.style.backgroundColor = inputBgColor;
      option.style.color = "#dcddde";
      if (this.settingsMgr.settings.mode === mode.value) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
    });
    modeSelect.addEventListener("change", (e) => {
      this.settingsMgr.settings.mode = e.target.value;
      this.settingsMgr.saveSettings();
    });

    panel.appendChild(timeoutLabel);
    panel.appendChild(modeLabel);
    panel.appendChild(modeSelect);

    return panel;
  }
};
