# CustomCallIdle

A BetterDiscord plugin that customizes what happens when the DM call idle timer triggers.

## Description

CustomCallIdle gives you full control over Discord's call idle behavior. Instead of being automatically disconnected after being idle in a DM call, you can choose from multiple actions including extending the timeout, muting/deafening yourself, or disabling the idle behavior entirely.

## Features

- **Multiple Idle Actions**: Choose how Discord should handle inactivity in DM calls
- **Customizable Timeout**: Set your preferred idle timeout duration in minutes
- **Easy Configuration**: Simple settings panel integrated into BetterDiscord

## Available Modes

- **Extend**: Extends the idle timeout by your configured duration (default: 30 minutes)
- **Mute**: Automatically mutes your microphone when idle triggers
- **Deafen**: Automatically deafens you when idle triggers
- **Both**: Mutes and deafens you simultaneously
- **Disconnect**: Disconnects you from the call (default Discord behavior)
- **Disable**: Does nothing, effectively disabling the idle timeout action

## Installation

1. Make sure you have [BetterDiscord](https://betterdiscord.app/) installed
2. Download `CustomCallIdle.plugin.js`
3. Place the file in your BetterDiscord plugins folder:
   - **Windows**: `%appdata%\BetterDiscord\plugins`
   - **macOS**: `~/Library/Application Support/BetterDiscord/plugins`
   - **Linux**: `~/.config/BetterDiscord/plugins`
4. Enable the plugin in Discord Settings → Plugins

## Configuration

1. Go to Discord Settings → Plugins
2. Click the settings icon next to CustomCallIdle
3. Configure your preferences:
   - **Idle Action Mode**: Select your preferred action from the dropdown
   - **Timeout (minutes)**: Set the duration for the timeout extension (applicable when using "Extend" mode)

## Version

Current Version: **1.1.0**

## Author

- **Author**: Mom's Spaggeti (.spagget)
- **Author ID**: 768501659130658846

## License

This plugin is provided as-is for use with BetterDiscord.

## Support

If you encounter any issues or have suggestions, please report them to me.
