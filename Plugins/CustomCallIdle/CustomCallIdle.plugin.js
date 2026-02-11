/**
 * @name CustomCallIdle
 * @author Mom's Spaggeti
 * @authorId 768501659130658846
 * @description Customize what happens when DM call idle triggers (Extend, Mute, Deafen, Mute+Deafen, Disconnect, Disable) with a test button
 * @version 1.1.0
 */

module.exports = class CustomCallIdle {
    getName() { return "CustomCallIdle"; }
    getAuthor() { return ".spagget"; }
    getDescription() { return "Customize what happens when DM call idle triggers"; }
    getVersion() { return "1.1.0"; }

    constructor() {
        this.settings = {
            mode: "extend",
            timeoutMinutes: 30
        };
        this.loadSettings();
    }

    loadSettings() {
        const saved = BdApi.Data.load("CustomCallIdle", "settings");
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    }

    saveSettings() {
        BdApi.Data.save("CustomCallIdle", "settings", this.settings);
    }

    load() {}

    start() {
        console.log("[CustomCallIdle] Starting plugin...");
        try {
            // Patch the handleIdleUpdate function
            const ChannelCallModule = BdApi.Webpack.getModule((m) => m?.handleIdleUpdate);
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
    }

    stop() {
        try {
            // Restore original function
            const ChannelCallModule = BdApi.Webpack.getModule((m) => m?.handleIdleUpdate);
            if (ChannelCallModule && this.original) {
                ChannelCallModule.handleIdleUpdate = this.original;
                console.log("[CustomCallIdle] Restored original handleIdleUpdate");
            }

        } catch (e) {
            console.error("[CustomCallIdle] Error in stop():", e);
        }
    }


    getSettingsPanel() {
        // Get the actual computed background color from Discord's theme
        const bodyBg = window.getComputedStyle(document.querySelector("body")).backgroundColor;
        const bgColor = bodyBg || "#36393f"; // Fallback to Discord's dark default
        
        const panel = document.createElement("div");
        panel.style.padding = "15px";
        panel.style.backgroundColor = bgColor;
        panel.style.borderRadius = "5px";
        
        // Mode selector
        const modeLabel = document.createElement("label");
        modeLabel.textContent = "Idle Action Mode: ";
        modeLabel.style.display = "block";
        modeLabel.style.color = "#fff";
        modeLabel.style.marginBottom = "10px";
        modeLabel.style.fontWeight = "bold";
        
        const modeSelect = document.createElement("select");
        modeSelect.style.marginLeft = "10px";
        modeSelect.style.padding = "5px";
        modeSelect.style.backgroundColor = "#202225";
        modeSelect.style.color = "#fff";
        modeSelect.style.border = "1px solid #40444b";
        modeSelect.style.borderRadius = "3px";
        const modes = ["extend", "mute", "deafen", "both", "disconnect", "disable"];
        modes.forEach(mode => {
            const option = document.createElement("option");
            option.value = mode;
            option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
            option.selected = this.settings.mode === mode;
            modeSelect.appendChild(option);
        });
        modeSelect.addEventListener("change", (e) => {
            this.settings.mode = e.target.value;
            this.saveSettings();
        });
        modeLabel.appendChild(modeSelect);
        
        // Timeout input
        const timeoutLabel = document.createElement("label");
        timeoutLabel.textContent = "Timeout (minutes): ";
        timeoutLabel.style.display = "block";
        timeoutLabel.style.color = "#fff";
        timeoutLabel.style.marginTop = "15px";
        timeoutLabel.style.fontWeight = "bold";
        
        const timeoutInput = document.createElement("input");
        timeoutInput.type = "number";
        timeoutInput.value = this.settings.timeoutMinutes;
        timeoutInput.style.marginLeft = "10px";
        timeoutInput.style.padding = "5px";
        timeoutInput.style.width = "80px";
        timeoutInput.style.backgroundColor = "#202225";
        timeoutInput.style.color = "#fff";
        timeoutInput.style.border = "1px solid #40444b";
        timeoutInput.style.borderRadius = "3px";
        timeoutInput.addEventListener("change", (e) => {
            this.settings.timeoutMinutes = parseInt(e.target.value) || 30;
            this.saveSettings();
        });
        timeoutLabel.appendChild(timeoutInput);
        
        panel.appendChild(modeLabel);
        panel.appendChild(timeoutLabel);
        
        return panel;
    }

    handleCustomIdle(ctx) {
        const { mode, timeoutMinutes } = this.settings;
        
        // Get VoiceActions on demand
        const VoiceActions = BdApi.Webpack.getByKeys("toggleSelfMute") || 
                            BdApi.Webpack.getByKeys("setSelfMute");
        
        if (!VoiceActions) {
            console.error("[CustomCallIdle] VoiceActions module not loaded");
            return;
        }

        switch (mode) {
            case "extend":
                const ms = timeoutMinutes * 60 * 1000;
                if (ctx.idleTimeout && ctx.idleTimeout.start) ctx.idleTimeout.start(ms);
                break;

            case "mute":
                if (VoiceActions.toggleSelfMute) VoiceActions.toggleSelfMute();
                break;
            case "deafen":
                if (VoiceActions.toggleSelfDeaf) VoiceActions.toggleSelfDeaf();
                break;
            case "both":
                if (VoiceActions.toggleSelfMute) VoiceActions.toggleSelfMute();
                if (VoiceActions.toggleSelfDeaf) VoiceActions.toggleSelfDeaf();
                break;
            case "disconnect":
                if (VoiceActions.disconnect) VoiceActions.disconnect();
                break;
            case "disable":
                // Do nothing
                break;
        }
    }

};
